import { ConflictException, Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { HashingService } from 'src/shared/services/hashing.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { TokenService } from 'src/shared/services/token.service';
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers';
import { RolesService } from './roles.service';
import { RegisterBodyDTO } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenService,
    private readonly roleService: RolesService,
  ) {}

  async register(body: RegisterBodyDTO) {
    try {
      const clientRoleId = await this.roleService.getClientRoleId();
      const hashedPassword = await this.hashingService.hashPassword(body.password);
      const user = await this.prismaService.user.create({
        data: {
          email: body.email,
          password: hashedPassword,
          name: body.name,
          phoneNumber: body.phoneNumber,
          roleId: clientRoleId,
        },
        omit: {
          password: true,
          totpSecret: true,
        },
      });
      return user;
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async login(body: any) {
    const user = await this.prismaService.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      throw new UnauthorizedException('Account does not exist');
    }

    const isPasswordValid = await this.hashingService.comparePassword(body.password, user.password);
    if (!isPasswordValid) {
      throw new UnprocessableEntityException([{ field: 'password', error: 'Password is incorrect' }]);
    }

    const tokens = await this.generateTokens({ userId: user.id });
    return tokens;
  }

  async generateTokens(payload: { userId: number }) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken(payload),
      this.tokenService.signRefreshToken(payload),
    ]);

    // lưu refresh token vào database
    const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken);
    await this.prismaService.refreshToken.create({
      data: {
        token: refreshToken,
        userId: payload.userId,
        expiresAt: new Date(decodedRefreshToken.exp * 1000),
      },
    });
    return { accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string) {
    try {
      // 1. kiểm tra refresh token có hợp lệ không
      const { userId } = await this.tokenService.verifyRefreshToken(refreshToken);
      // 2. kiểm tra refresh token có trong db không (quăng lỗi nếu ko có)
      await this.prismaService.refreshToken.findUniqueOrThrow({ where: { token: refreshToken } });
      // 3. xóa refresh token cũ
      await this.prismaService.refreshToken.delete({ where: { token: refreshToken } });
      // 4. tạo mới access token và refresh token
      const tokens = await this.generateTokens({ userId });
      return tokens;
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new UnauthorizedException('Refresh token not found in database');
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string) {
    try {
      // 1. kiểm tra refresh token có hợp lệ không
      const { userId } = await this.tokenService.verifyRefreshToken(refreshToken);
      // 2. xóa refresh token trong db (quăng lỗi nếu ko có)
      if (userId) await this.prismaService.refreshToken.delete({ where: { token: refreshToken } });
      return { message: 'Logout successfully' };
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new UnauthorizedException('Refresh token not found in database');
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
