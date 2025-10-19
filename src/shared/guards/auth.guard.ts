import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { TokenService } from '../services/token.service';
import { REQUEST_USER_KEY } from '../constants/auth.constant';
import { IAccessTokenPayload } from '../types/jwt.type';
import { PrismaService } from '../services/prisma.service';
import { HTTPMethod } from '../constants/role.constant';

// Guard with access token validation
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // Extract & validate access token
    const decodedAccessToken = await this.extractAndValidateToken(request);
    // Check user's permissions
    await this.validateUserPermissions(decodedAccessToken, request);

    return true;
  }

  private extractAccessTokenFromHeader(request: any): string {
    const accessToken = request.headers['authorization']?.split(' ')[1];

    if (!accessToken) {
      throw new UnauthorizedException('Access token is invalid or expired');
    }
    return accessToken;
  }

  private async extractAndValidateToken(request: any): Promise<IAccessTokenPayload> {
    const accessToken = this.extractAccessTokenFromHeader(request);
    try {
      const decodedAccessToken = await this.tokenService.verifyAccessToken(accessToken);
      request[REQUEST_USER_KEY] = decodedAccessToken;
      return decodedAccessToken;
    } catch {
      throw new UnauthorizedException('Access token is invalid or expired');
    }
  }

  private async validateUserPermissions(decodedAccessToken: IAccessTokenPayload, request: any): Promise<void> {
    const roleId: number = decodedAccessToken.roleId;
    const path: string = request?.route?.path; // lấy trong request
    const method = request?.method as keyof typeof HTTPMethod; // lấy trong request

    const role = await this.prismaService.role
      .findUniqueOrThrow({
        where: {
          id: roleId,
          deletedAt: null,
        },
        include: {
          permissions: {
            where: {
              deletedAt: null,
              path,
              method,
            },
          },
        },
      })
      .catch(() => {
        throw new ForbiddenException(`You don't have permission to access this route`);
      });
    const canAccess = role.permissions.length > 0;
    if (!canAccess) {
      throw new ForbiddenException(`You don't have permission to access this route`);
    }
  }
}
