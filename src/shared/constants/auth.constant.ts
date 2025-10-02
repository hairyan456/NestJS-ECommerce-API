export const REQUEST_USER_KEY = 'user';

export const AuthType = {
  Bearer: 'Bearer',
  None: 'None',
  APIKey: 'APIKey',
} as const;

export type TAuthType = (typeof AuthType)[keyof typeof AuthType];

export const ConditionGuard = {
  And: 'And',
  Or: 'Or',
} as const;

export type TConditionGuard = (typeof ConditionGuard)[keyof typeof ConditionGuard];

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  BLOCKED: 'BLOCKED',
} as const;

export const TypeOfVerificationCode = {
  REGISTER: 'REGISTER',
  FORGOT_PASSWORD: 'FORGOT_PASSWORD',
} as const;
