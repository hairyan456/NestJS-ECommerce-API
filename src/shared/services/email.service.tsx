import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import envConfig from 'src/shared/config';
import React from 'react';
import OTPEmail from 'emails/otp-component';
// import { render } from '@react-email/render';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY);
  }

  async sendOTP(payload: { email: string; code: string }) {
    const subject = 'Mã OTP';
    // const html = await render(<OTPEmail validationCode={payload.code} title={subject} />, { pretty: true });

    return await this.resend.emails.send({
      from: 'ECommerce <no-reply@careernest.click>',
      to: [payload.email], // do môi trường Sandbox chỉ gửi được tới email mà mình đăng ký Resend
      subject,
      react: <OTPEmail validationCode={payload.code} title={subject} />,
      // html,
    });
  }
}
