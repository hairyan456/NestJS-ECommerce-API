import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import envConfig from 'src/shared/config';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY);
  }

  async sendOTP(payload: { email: string; code: string }) {
    return await this.resend.emails.send({
      from: 'ECommerce <onboarding@resend.dev>',
      to: ['hairyan789@gmail.com'], // do môi trường Sandbox chỉ gửi được tới email mà mình đăng ký Resend
      subject: 'Mã OTP',
      html: `<strong>${payload.code}</strong>`,
    });
  }
}
