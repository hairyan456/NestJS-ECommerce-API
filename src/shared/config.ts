import z from 'zod';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load file .env
dotenv.config({ path: path.resolve('.env') });

// kiểm tra xem tồn tại .env chưa
if (!fs.existsSync(path.resolve('.env'))) {
  console.log('Không tìm thấy file .env');
  process.exit(1);
}

const configSchema = z.object({
  DATABASE_URL: z.string().min(1, { message: 'DATABASE_URL là bắt buộc' }),
  PORT: z.string().min(1, { message: 'PORT là bắt buộc' }),
  ACCESS_TOKEN_SECRET: z.string().min(1, { message: 'ACCESS_TOKEN_SECRET là bắt buộc' }),
  ACCESS_TOKEN_EXPIRES_IN: z.string().min(1, { message: 'ACCESS_TOKEN_EXPIRES_IN là bắt buộc' }),
  REFRESH_TOKEN_EXPIRES_IN: z.string().min(1, { message: 'REFRESH_TOKEN_EXPIRES_IN là bắt buộc' }),
  REFRESH_TOKEN_SECRET: z.string().min(1, { message: 'REFRESH_TOKEN_SECRET là bắt buộc' }),
  SECRET_API_KEY: z.string().min(1, { message: 'SECRET_API_KEY là bắt buộc' }),
  ADMIN_NAME: z.string(),
  ADMIN_EMAIL: z.string(),
  ADMIN_PASSWORD: z.string(),
  ADMIN_PHONE_NUMBER: z.string(),
  OTP_EXPIRES_IN: z.string().min(1, { message: 'OTP_EXPIRES_IN là bắt buộc' }),
  RESEND_API_KEY: z.string().min(1, { message: 'RESEND_API_KEY là bắt buộc' }),
});

const configServer = configSchema.safeParse(process.env);

if (!configServer.success) {
  console.log('Các giá trị khai báo trong file .env không hợp lệ');
  console.error(configServer.error);
  process.exit(1);
}

const envConfig = configServer.data;
export default envConfig;
