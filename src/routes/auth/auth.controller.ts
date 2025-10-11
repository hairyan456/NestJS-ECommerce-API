import { Body, Controller, Get, HttpCode, HttpStatus, Ip, Post, Query, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ForgotPasswordBodyDTO,
  GetAuthorizationUrlResDTO,
  LoginBodyDTO,
  LoginResDTO,
  LogoutBodyDTO,
  RefreshTokenBodyDTO,
  RefreshTokenResDTO,
  RegisterBodyDTO,
  RegisterResDTO,
  SendOTPBodyDTO,
  TwoFactorSetupResDTO,
} from './auth.dto';
import { ZodSerializerDto } from 'nestjs-zod';
import { UserAgent } from 'src/shared/decorators/user-agent.decorator';
import { MessageResDTO } from 'src/shared/dtos/response.dto';
import { Public } from 'src/shared/decorators/auth.decorator';
import { GoogleService } from './google.service';
import type { Response } from 'express';
import envConfig from 'src/shared/config';
import { EmptyBodyDTO } from 'src/shared/dtos/request.dto';
import { User } from 'src/shared/decorators/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleService: GoogleService,
  ) {}

  @Post('/register')
  @Public() // mặc định guard là AuthGuard (Bearer token)
  @ZodSerializerDto(RegisterResDTO)
  handleRegister(@Body() body: RegisterBodyDTO) {
    return this.authService.register(body);
  }

  @Post('/otp')
  @Public()
  handleSendOTP(@Body() body: SendOTPBodyDTO) {
    return this.authService.sendOTP(body);
  }

  @Post('/login')
  @Public()
  @ZodSerializerDto(LoginResDTO)
  handleLogin(@Body() body: LoginBodyDTO, @UserAgent() userAgent: string, @Ip() ip: string) {
    return this.authService.login({ ...body, userAgent, ip });
  }

  @Post('/refresh-token')
  @Public()
  @ZodSerializerDto(RefreshTokenResDTO)
  @HttpCode(HttpStatus.OK)
  handleRefreshToken(@Body() body: RefreshTokenBodyDTO, @UserAgent() userAgent: string, @Ip() ip: string) {
    return this.authService.refreshToken({ refreshToken: body.refreshToken, userAgent, ip });
  }

  @Post('/logout')
  @ZodSerializerDto(MessageResDTO)
  @HttpCode(HttpStatus.OK)
  handleLogout(@Body() body: LogoutBodyDTO) {
    return this.authService.logout(body.refreshToken);
  }

  @Get('/google-link')
  @Public()
  @ZodSerializerDto(GetAuthorizationUrlResDTO)
  handleGetAuthorizationUrl(@UserAgent() userAgent: string, @Ip() ip: string) {
    return this.googleService.getAuthorizationUrl({ userAgent, ip });
  }

  @Get('/google/callback')
  @Public()
  async handleRedirectGoogleCallback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
    try {
      const data = await this.googleService.redirectGoogleCallback({ code, state });
      return res.redirect(
        `${envConfig.GOOGLE_CLIENT_REDIRECT_URI}?accessToken=${data.accessToken}&refreshToken=${data.refreshToken}`,
      );
    } catch (error) {
      const errMessage =
        error instanceof Error
          ? error.message
          : 'Đã xảy ra lỗi khi đăng nhập bằng Google. Vui lòng thử lại bằng cách khác.';
      return res.redirect(`${envConfig.GOOGLE_CLIENT_REDIRECT_URI}?errorMessage=${errMessage}`);
    }
  }

  @Post('/forgot-password')
  @Public()
  @ZodSerializerDto(MessageResDTO)
  handleForgotPassword(@Body() body: ForgotPasswordBodyDTO) {
    return this.authService.forgotPassword(body);
  }

  @Post('/2fa/setup')
  @ZodSerializerDto(TwoFactorSetupResDTO)
  handleSetupTwoFactorAuth(@Body() _: EmptyBodyDTO, @User('userId') userId: number) {
    return this.authService.setupTwoFactorAuth(userId);
  }
}
