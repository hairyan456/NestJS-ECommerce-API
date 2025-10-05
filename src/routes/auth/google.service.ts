import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import envConfig from 'src/shared/config';
import { GetAuthorizationUrlResType, GoogleAuthStateType } from './auth.model';
import { AuthRepository } from './auth.repo';
import { HashingService } from 'src/shared/services/hashing.service';
import { RolesService } from './roles.service';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleService {
  private oauth2Client: OAuth2Client;

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly hashingService: HashingService,
    private readonly roleService: RolesService,
    private readonly authService: AuthService,
  ) {
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

  async redirectGoogleCallback({ code, state }: { code: string; state: string }): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      let userAgent = 'Unknown';
      let ip = 'Unknown';
      // 1. Lấy state từ URL
      try {
        if (state) {
          const clientInfo = JSON.parse(Buffer.from(state, 'base64').toString()) as GoogleAuthStateType;
          userAgent = clientInfo.userAgent;
          ip = clientInfo.ip;
        }
      } catch (error) {
        console.error('Error parsing state:', error);
      }
      // 2. Dùng code để lấy token
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);

      // 3. Lấy thông tin Google user
      const oauth2 = google.oauth2({
        auth: this.oauth2Client,
        version: 'v2',
      });
      const { data } = await oauth2.userinfo.get();
      if (!data.email) {
        throw new Error('Không thể lấy thông tin người dùng từ Google');
      }

      let user = await this.authRepository.findUniqueUserIncludeRole({ email: data.email });
      // nếu không tìm thấy user -> người dùng mới -> đăng ký tài khoản mới
      if (!user) {
        const clientRoleId = await this.roleService.getClientRoleId();
        const randomPassword = uuidv4();
        const hashedPassword = await this.hashingService.hashPassword(randomPassword as string);
        user = await this.authRepository.createUserIncludeRole({
          email: data.email,
          name: data.name ?? '',
          password: hashedPassword,
          roleId: clientRoleId,
          phoneNumber: '',
          avatar: data.picture ?? null,
        });
      }

      // 4. Tạo record Device mới (thiết bị đang Login)
      const device = await this.authRepository.createDevice({
        userId: user.id,
        userAgent,
        ip,
      });

      const authTokens = await this.authService.generateTokens({
        userId: user.id,
        deviceId: device.id,
        roleId: user.roleId,
        roleName: user.role.name,
      });
      return authTokens;
    } catch (error) {
      console.error('Error in googleCallback:', error);
      throw error;
    }
  }
}
