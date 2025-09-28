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

export type TConditionGuard =
  (typeof ConditionGuard)[keyof typeof ConditionGuard];
