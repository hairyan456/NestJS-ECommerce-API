import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import envConfig from 'src/shared/config';
import { GetAuthorizationUrlResType, GoogleAuthStateType } from './auth.model';

@Injectable()
export class GoogleService {
  private oauth2Client: OAuth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      envConfig.GOOGLE_CLIENT_ID,
      envConfig.GOOGLE_CLIENT_SECRET,
      envConfig.GOOGLE_REDIRECT_URI,
    );
  }

  /**
   * Mục đích của việc tạo link này là để chuyển hướng (redirect) người dùng sang trang đăng nhập của Google và yêu
   * cầu họ cấp quyền cho ứng dụng của bạn.
   */
  getAuthorizationUrl({ userAgent, ip }: GoogleAuthStateType): GetAuthorizationUrlResType {
    // phạm vi quyền truy cập thông tin user bạn yêu cầu từ Google.
    const scope = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ];
    // Chuyển object sang String base64 an toàn bỏ lên URL
    const stateString = Buffer.from(JSON.stringify({ userAgent, ip })).toString('base64');
    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope,
      include_granted_scopes: true,
      state: stateString,
    });
    return { url };
  }
}
