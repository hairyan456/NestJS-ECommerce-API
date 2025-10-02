import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { HashingService } from 'src/shared/services/hashing.service';
import { generateOTP, isUniqueConstraintPrismaError } from 'src/shared/helpers';
import { RolesService } from './roles.service';
import { RegisterBodyType, SendOTPBodyType } from './auth.model';
import { AuthRepository } from './auth.repo';
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo';
import envConfig from 'src/shared/config';
import { addMilliseconds } from 'date-fns';
import ms from 'ms';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    // private readonly tokenService: TokenService,
    private readonly roleService: RolesService,

    private readonly authRepository: AuthRepository,
    private readonly sharedUserRepository: SharedUserRepository,
  ) {}

  async register(body: RegisterBodyType) {
    try {
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

  async sendOTP(body: SendOTPBodyType) {
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
    const verificationCode = await this.authRepository.createVerificationCode({
      email: body.email,
      type: body.type,
      code: otpCode,
      expiresAt: addMilliseconds(new Date(), ms(envConfig.OTP_EXPIRES_IN)),
    });

    return verificationCode;
  }

  // async login(body: any) {
  //   const user = await this.prismaService.user.findUnique({
  //     where: { email: body.email },
  //   });

  //   if (!user) {
  //     throw new UnauthorizedException('Account does not exist');
  //   }

  //   const isPasswordValid = await this.hashingService.comparePassword(body.password, user.password);
  //   if (!isPasswordValid) {
  //     throw new UnprocessableEntityException([{ field: 'password', error: 'Password is incorrect' }]);
  //   }

  //   const tokens = await this.generateTokens({ userId: user.id });
  //   return tokens;
  // }

  // async generateTokens(payload: { userId: number }) {
  //   const [accessToken, refreshToken] = await Promise.all([
  //     this.tokenService.signAccessToken(payload),
  //     this.tokenService.signRefreshToken(payload),
  //   ]);

  //   // lưu refresh token vào database
  //   const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken);
  //   await this.prismaService.refreshToken.create({
  //     data: {
  //       token: refreshToken,
  //       userId: payload.userId,
  //       expiresAt: new Date(decodedRefreshToken.exp * 1000),
  //     },
  //   });
  //   return { accessToken, refreshToken };
  // }

  // async refreshToken(refreshToken: string) {
  //   try {
  //     // 1. kiểm tra refresh token có hợp lệ không
  //     const { userId } = await this.tokenService.verifyRefreshToken(refreshToken);
  //     // 2. kiểm tra refresh token có trong db không (quăng lỗi nếu ko có)
  //     await this.prismaService.refreshToken.findUniqueOrThrow({ where: { token: refreshToken } });
  //     // 3. xóa refresh token cũ
  //     await this.prismaService.refreshToken.delete({ where: { token: refreshToken } });
  //     // 4. tạo mới access token và refresh token
  //     const tokens = await this.generateTokens({ userId });
  //     return tokens;
  //   } catch (error) {
  //     if (isNotFoundPrismaError(error)) {
  //       throw new UnauthorizedException('Refresh token not found in database');
  //     }
  //     throw new UnauthorizedException('Invalid refresh token');
  //   }
  // }

  // async logout(refreshToken: string) {
  //   try {
  //     // 1. kiểm tra refresh token có hợp lệ không
  //     const { userId } = await this.tokenService.verifyRefreshToken(refreshToken);
  //     // 2. xóa refresh token trong db (quăng lỗi nếu ko có)
  //     if (userId) await this.prismaService.refreshToken.delete({ where: { token: refreshToken } });
  //     return { message: 'Logout successfully' };
  //   } catch (error) {
  //     if (isNotFoundPrismaError(error)) {
  //       throw new UnauthorizedException('Refresh token not found in database');
  //     }
  //     throw new UnauthorizedException('Invalid refresh token');
  //   }
  // }
}
