import { TypeOfVerificationCode } from 'src/shared/constants/auth.constant';
import { UserSchema } from 'src/shared/models/shared-user.model';
import z from 'zod';

// REGISTER
export const RegisterBodySchema = UserSchema.pick({
  email: true,
  password: true,
  name: true,
  phoneNumber: true,
})
  .extend({
    confirmPassword: z.string().min(6).max(100),
    code: z.string().length(6),
  })
  .strict() // không cho phép thêm các field khác ngoài schema đã khai báo
  // chỉ nên dùng strict() ở Request DTO, không nên dùng ở Response DTO
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password and confirm password must match',
        path: ['confirmPassword'],
      });
    }
  });

export const RegisterResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
});

// OTP CODE
export const VerificationCodeSchema = z.object({
  id: z.number(),
  email: z.string().email({ message: 'Email không hợp lệ' }),
  code: z.string().length(6, { message: 'Mã xác minh gồm 6 ký tự' }),
  type: z.enum([
    TypeOfVerificationCode.FORGOT_PASSWORD,
    TypeOfVerificationCode.REGISTER,
    TypeOfVerificationCode.LOGIN,
    TypeOfVerificationCode.DISABLE_2FA,
  ]),
  expiresAt: z.date(),
  createdAt: z.date(),
});

export const SendOTPBodySchema = VerificationCodeSchema.pick({
  email: true,
  type: true,
}).strict();

// LOGIN
export const LoginBodySchema = UserSchema.pick({
  email: true,
  password: true,
})
  .extend({
    totpCode: z.string().length(6).optional(), // 2FA code
    code: z.string().length(6).optional(), // Email OTP code
  })
  .strict()
  .superRefine(({ totpCode, code }, ctx) => {
    const message = 'Bạn chỉ nên cung cấp mã xác thực 2FA hoặc OTP. Không đồng thời cả 2.';
    // Nếu cả 2 cùng có hoặc cùng không có giá trị thì báo lỗi.
    // Yêu cầu chỉ được cung cấp đúng 1 trong 2: totpCode hoặc code.
    // "&&" để phòng trường hợp người dùng chưa bật xác thực 2FA
    if (totpCode !== undefined && code !== undefined) {
      ctx.addIssue({
        path: ['totpCode'],
        message,
        code: 'custom',
      });
      ctx.addIssue({
        path: ['code'],
        message,
        code: 'custom',
      });
    }
  });

export const LoginResSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

// REFRESH TOKEN
export const RefreshTokenSchema = z.object({
  token: z.string(),
  userId: z.number(),
  deviceId: z.number(),
  expiresAt: z.date(),
  createdAt: z.date(),
});

export const RefreshTokenBodySchema = z
  .object({
    refreshToken: z.string(),
  })
  .strict();

export const RefreshTokenResSchema = LoginResSchema;

// DEVICE
export const DeviceSchema = z.object({
  id: z.number(),
  userId: z.number(),
  userAgent: z.string(),
  ip: z.string(),
  lastActive: z.date(),
  createdAt: z.date(),
  isActive: z.boolean(),
});

// ROLE
export const RoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  isActive: z.boolean(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// LOGOUT
export const LogoutBodySchema = RefreshTokenBodySchema;

// GOOGLE
export const GoogleAuthStateSchema = DeviceSchema.pick({
  userAgent: true,
  ip: true,
});

export const GetAuthorizationUrlResSchema = z.object({
  url: z.string().url(),
});

// FORGOT PASSWORD
export const ForgotPasswordBodySchema = z
  .object({
    email: z.string().email(),
    code: z.string().length(6),
    newPassword: z.string().min(6).max(100),
    confirmNewPassword: z.string().min(6).max(100),
  })
  .strict()
  .superRefine(({ confirmNewPassword, newPassword }, ctx) => {
    if (confirmNewPassword !== newPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Mật khẩu và mật khẩu xác nhận phải giống nhau',
        path: ['confirmNewPassword'],
      });
    }
  });

//  2FA
export const DisableTwoFactorBodySchema = z
  .object({
    totpCode: z.string().length(6).optional(),
    code: z.string().length(6).optional(),
  })
  .strict()
  .superRefine(({ totpCode, code }, ctx) => {
    const message = 'Bạn phải cung cấp mã xác thực 2FA hoặc OTP. Không cung cấp đồng thời cả 2.';
    // Nếu cả 2 cùng có hoặc cùng không có giá trị thì báo lỗi.
    // Yêu cầu chỉ được cung cấp đúng 1 trong 2: totpCode hoặc code.
    if ((totpCode !== undefined) === (code !== undefined)) {
      ctx.addIssue({
        path: ['totpCode'],
        message,
        code: 'custom',
      });
      ctx.addIssue({
        path: ['code'],
        message,
        code: 'custom',
      });
    }
  });

export const TwoFactorSetupResSchema = z.object({
  secret: z.string(),
  uri: z.string(),
});

// TYPES
export type RegisterBodyType = z.infer<typeof RegisterBodySchema>;
export type RegisterResType = z.infer<typeof RegisterResSchema>;

export type VerificationCodeType = z.infer<typeof VerificationCodeSchema>;
export type SendOTPBodyType = z.infer<typeof SendOTPBodySchema>;

export type LoginBodyType = z.infer<typeof LoginBodySchema>;
export type LoginResType = z.infer<typeof LoginResSchema>;

export type RefreshTokenType = z.infer<typeof RefreshTokenSchema>;
export type RefreshTokenBodyType = z.infer<typeof RefreshTokenBodySchema>;
export type RefreshTokenResType = LoginResType;

export type DeviceType = z.infer<typeof DeviceSchema>;

export type RoleType = z.infer<typeof RoleSchema>;

export type LogoutBodyType = RefreshTokenBodyType;

export type GoogleAuthStateType = z.infer<typeof GoogleAuthStateSchema>;
export type GetAuthorizationUrlResType = z.infer<typeof GetAuthorizationUrlResSchema>;

export type ForgotPasswordBodyType = z.infer<typeof ForgotPasswordBodySchema>;

export type DisableTwoFactorBodyType = z.infer<typeof DisableTwoFactorBodySchema>;
export type TwoFactorSetupResType = z.infer<typeof TwoFactorSetupResSchema>;
