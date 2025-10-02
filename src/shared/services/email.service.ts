import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import envConfig from 'src/shared/config';
import fs from 'fs';
import path from 'path';

const otpTemplate = fs.readFileSync(path.resolve('src/shared/email-templates/otp.html'), {
  encoding: 'utf-8',
});

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY);
  }

  async sendOTP(payload: { email: string; code: string }) {
    const subject = 'Mã OTP';
    return await this.resend.emails.send({
      from: 'ECommerce <onboarding@resend.dev>',
      to: [payload.email], // do môi trường Sandbox chỉ gửi được tới email mà mình đăng ký Resend
      subject,
      html: otpTemplate.replaceAll('{{subject}}', subject).replaceAll('{{code}}', payload.code),
    });
  }
}
