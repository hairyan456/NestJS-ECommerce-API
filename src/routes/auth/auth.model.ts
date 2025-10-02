import { TypeOfVerificationCode } from 'src/shared/constants/auth.constant';
import { UserSchema } from 'src/shared/models/shared-user.model';
import z from 'zod';

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

export const VerificationCodeSchema = z.object({
  id: z.number(),
  email: z.string().email({ message: 'Email không hợp lệ' }),
  code: z.string().length(6, { message: 'Mã xác minh gồm 6 ký tự' }),
  type: z.enum([TypeOfVerificationCode.FORGOT_PASSWORD, TypeOfVerificationCode.REGISTER]),
  expiresAt: z.date(),
  createdAt: z.date(),
});

export const SendOTPBodySchema = VerificationCodeSchema.pick({
  email: true,
  type: true,
}).strict();

export type RegisterBodyType = z.infer<typeof RegisterBodySchema>;
export type RegisterResType = z.infer<typeof RegisterResSchema>;
export type VerificationCodeType = z.infer<typeof VerificationCodeSchema>;
export type SendOTPBodyType = z.infer<typeof SendOTPBodySchema>;
