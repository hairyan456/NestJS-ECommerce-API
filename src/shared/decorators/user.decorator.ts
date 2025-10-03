import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IAccessTokenPayload } from 'src/shared/types/jwt.type';

// decorator tự động gán user vào req.user
export const User = createParamDecorator((field: keyof IAccessTokenPayload | undefined, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();
  const user: IAccessTokenPayload | undefined = request.user;
  return field ? user?.[field] : user;
});
