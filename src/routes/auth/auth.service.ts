import { Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { HashingService } from 'src/shared/services/hashing.service';
import { generateOTP, isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers';
import { RolesService } from './roles.service';
import { LoginBodyType, RefreshTokenBodyType, RegisterBodyType, SendOTPBodyType } from './auth.model';
import { AuthRepository } from './auth.repo';
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo';
import envConfig from 'src/shared/config';
import { addMilliseconds } from 'date-fns';
import ms from 'ms';
import { TypeOfVerificationCode } from 'src/shared/constants/auth.constant';
import { EmailService } from 'src/shared/services/email.service';
import { TokenService } from 'src/shared/services/token.service';
import { IAccessTokenPayloadCreate } from 'src/shared/types/jwt.type';
import { MessageResType } from 'src/shared/models/shared-response.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
    private readonly roleService: RolesService,
    private readonly emailService: EmailService,

    private readonly authRepository: AuthRepository,
    private readonly sharedUserRepository: SharedUserRepository,
  ) {}

  async register(body: RegisterBodyType) {
    try {
      // kiểm tra xem OTP đã được gửi qua mail chưa:
      const verificationCode = await this.authRepository.findUniqueVerificationCode({
        email: body.email,
        code: body.code,
        type: TypeOfVerificationCode.REGISTER,
      });
      // nếu không tồn tại OTP
      if (!verificationCode) {
        throw new UnprocessableEntityException([
          {
            message: 'Mã OTP không hợp lệ',
            path: 'code',
          },
        ]);
      }
      // nếu có OTP nhưng đã hết hạn
      if (verificationCode.expiresAt < new Date()) {
        throw new UnprocessableEntityException([
          {
            message: 'Mã OTP đã hết hạn',
            path: 'code',
          },
        ]);
      }

      const clientRoleId = await this.roleService.getClientRoleId();
      const hashedPassword = await this.hashingService.hashPassword(body.password);
      return await this.authRepository.createUser({
        email: body.email,
        name: body.name,
        phoneNumber: body.phoneNumber,
        password: hashedPassword,
        roleId: clientRoleId,
      });
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        // throw new ConflictException('Email already exists');
        throw new UnprocessableEntityException([
          {
            path: 'email',
            message: 'Email này đã tồn tại',
          },
        ]);
      }
      throw error;
    }
  }

  async sendOTP(body: SendOTPBodyType): Promise<MessageResType> {
    // 1. kiểm tra Email đã tồn tại hay chưa
    const findUser = await this.sharedUserRepository.findUnique({ email: body.email });
    if (findUser) {
      throw new UnprocessableEntityException([
        {
          path: 'email',
          message: 'Email này đã tồn tại',
        },
      ]);
    }
    // 2. Tạo mã OTP
    const otpCode = generateOTP();
    await this.authRepository.createVerificationCode({
      email: body.email,
      type: body.type,
      code: otpCode,
      expiresAt: addMilliseconds(new Date(), Number(ms(envConfig.OTP_EXPIRES_IN))),
    });

    // 3. Gửi mã OTP qua mail
    const { error } = await this.emailService.sendOTP({
      email: body.email,
      code: otpCode,
    });
    if (error) {
      console.log(error);
      throw new UnprocessableEntityException([
        {
          message: 'Gửi mã OTP thất bại',
          path: 'code',
        },
      ]);
    }
    // return verificationCode;
    return { message: 'Gửi mã OTP thành công' };
  }

  async login(body: LoginBodyType & { userAgent: string; ip: string }) {
    console.log(body.ip);
    const user = await this.authRepository.findUniqueUserIncludeRole({
      // trả về role object trong data user
      email: body.email,
    });

    if (!user) {
      throw new UnprocessableEntityException([
        {
          message: 'Email không tồn tại',
          path: 'email',
        },
      ]);
    }

    const isPasswordValid = await this.hashingService.comparePassword(body.password, user.password);
    if (!isPasswordValid) {
      throw new UnprocessableEntityException([{ field: 'password', error: 'Mật khẩu không chính xác' }]);
    }

    // Tạo record Device mới (thiết bị đang Login)
    const device = await this.authRepository.createDevice({
      userId: user.id,
      userAgent: body.userAgent,
      ip: body.ip,
    });

    const tokens = await this.generateTokens({
      userId: user.id,
      deviceId: device.id,
      roleId: user.roleId,
      roleName: user.role.name,
    });
    return tokens;
  }

  async generateTokens({ userId, deviceId, roleId, roleName }: IAccessTokenPayloadCreate) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({ userId, deviceId, roleId, roleName }),
      this.tokenService.signRefreshToken({ userId }),
    ]);

    // lưu refresh token vào database
    const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken);
    await this.authRepository.createRefreshToken({
      token: refreshToken,
      userId,
      expiresAt: new Date(decodedRefreshToken.exp * 1000),
      deviceId,
    });

    return { accessToken, refreshToken };
  }

  async refreshToken({ refreshToken, userAgent, ip }: RefreshTokenBodyType & { userAgent: string; ip: string }) {
    try {
      // 1. kiểm tra refresh token có hợp lệ không
      const { userId } = await this.tokenService.verifyRefreshToken(refreshToken);
      // 2. kiểm tra refresh token có trong db không (quăng lỗi nếu ko có)
      const findRefreshToken = await this.authRepository.findUniqueRefreshTokenIncludeUserRole({ token: refreshToken });
      // 3. Cập nhật Device theo userAgent, IP mới
      const {
        deviceId,
        user: { roleId, name: roleName },
      } = findRefreshToken;
      const $updateDevice = this.authRepository.updateDevice(deviceId, {
        ip,
        userAgent,
      });
      // 4. xóa refresh token cũ
      const $deleteRefreshToken = this.authRepository.deleteRefreshToken({ token: refreshToken });
      // 5. tạo mới access token và refresh token
      const $tokens = this.generateTokens({ userId, roleId, roleName, deviceId });
      const [, , tokens] = await Promise.all([$updateDevice, $deleteRefreshToken, $tokens]);
      return tokens;
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new UnauthorizedException('Refresh token không tìm thấy trong database');
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string): Promise<MessageResType> {
    try {
      // 1. kiểm tra refresh token có hợp lệ không
      await this.tokenService.verifyRefreshToken(refreshToken);
      // 2. xóa refresh token trong db (quăng lỗi nếu ko có)
      const deletedRefreshToken = await this.authRepository.deleteRefreshToken({ token: refreshToken });
      // 3. Cập nhật Device là đã logout khỏi thiết bị
      await this.authRepository.updateDevice(deletedRefreshToken.deviceId, {
        isActive: false,
      });
      return { message: 'Đăng xuất thành công' };
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new UnauthorizedException('Refresh token không tìm thấy trong database.');
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
