import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, HttpException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AUTH_TYPE_KEY, AuthTypeDecoratorPayload } from '../decorators/auth.decorator';
import { AuthGuard } from './auth.guard';
import { APIKeyGuard } from './api-key.guard';
import { AuthType, ConditionGuard } from '../constants/auth.constant';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private readonly authTypeGuardMap: Record<string, CanActivate>;

  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AuthGuard,
    private readonly apiKeyGuard: APIKeyGuard,
  ) {
    this.authTypeGuardMap = {
      [AuthType.Bearer]: this.accessTokenGuard,
      [AuthType.APIKey]: this.apiKeyGuard,
      [AuthType.None]: { canActivate: () => true },
    };
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypeValue = this.getAuthTypeValue(context);
    const guards = authTypeValue.authTypes.map((type) => this.authTypeGuardMap[type]);
    return authTypeValue.options.condition === ConditionGuard.Or
      ? this.handleOrCondition(guards, context)
      : this.handleAndCondition(guards, context);
  }

  private getAuthTypeValue(context: ExecutionContext): AuthTypeDecoratorPayload {
    const authTypeValue = this.reflector.getAllAndOverride<AuthTypeDecoratorPayload | undefined>(AUTH_TYPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) ?? { authTypes: [AuthType.Bearer], options: { condition: ConditionGuard.And } };
    return authTypeValue;
  }

  private async handleOrCondition(guards: CanActivate[], context: ExecutionContext) {
    let lastError: any = null;

    // Duyệt qua hết các guard, nếu chỉ cần có 1 guard pass thì return true
    for (const guard of guards) {
      try {
        if (await guard.canActivate(context)) return true;
      } catch (error) {
        lastError = error;
      }
    }
    if (lastError instanceof HttpException) {
      throw lastError;
    }
    throw new UnauthorizedException();
  }

  private async handleAndCondition(guards: CanActivate[], context: ExecutionContext) {
    // Duyệt qua hết các guard, nếu mọi guard đều pass thì return true
    for (const guard of guards) {
      try {
        if (!(await guard.canActivate(context))) {
          throw new UnauthorizedException();
        }
      } catch (error) {
        if (error instanceof HttpException) {
          throw error;
        }
        throw new UnauthorizedException();
      }
    }
    return true;
  }
}
