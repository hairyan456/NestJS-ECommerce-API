import * as OTPAuth from 'otpauth';
import envConfig from '../config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TwoFactorAuthService {
  private createTOTP(email: string, secret?: string): OTPAuth.TOTP {
    return new OTPAuth.TOTP({
      issuer: envConfig.APP_NAME,
      label: email,
      algorithm: 'SHA1',
      digits: 6, // Length of the generated tokens.
      period: 30, // Interval of time for which a token is valid, in seconds.
      secret: secret || new OTPAuth.Secret(),
    });
  }

  generateTOTPSecret(email: string): {
    secret: string;
    uri: string;
  } {
    const totp = this.createTOTP(email);
    return {
      secret: totp.secret.base32,
      uri: totp.toString(),
    };
  }

  verifyOTP({ email, token, secret }: { email: string; token: string; secret?: string }): boolean {
    const totp = this.createTOTP(email, secret);
    const delta = totp.validate({ token, window: 1 });
    return delta !== null; // true if token is valid
  }
}
