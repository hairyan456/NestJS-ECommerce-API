import { SetMetadata } from '@nestjs/common';
import { ConditionGuard, TAuthType, TConditionGuard } from '../constants/auth.constant';

export const AUTH_TYPE_KEY = 'authType';

export type AuthTypeDecoratorPayload = { authTypes: TAuthType[]; options: { condition: TConditionGuard } };

export const Auth = (authTypes: TAuthType[], options?: { condition: TConditionGuard }) => {
  return SetMetadata(AUTH_TYPE_KEY, { authTypes, options: options ?? { condition: ConditionGuard.And } });
};
