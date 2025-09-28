import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ITokenPayload } from '../types/jwt.type';

// decorator tự động gán user vào req.user
export const User = createParamDecorator((field: keyof ITokenPayload | undefined, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();
  const user: ITokenPayload | undefined = request.user;
  return field ? user?.[field] : user;
});
