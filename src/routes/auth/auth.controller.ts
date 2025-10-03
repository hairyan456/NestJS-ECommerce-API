import { Body, Controller, HttpCode, HttpStatus, Ip, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginBodyDTO,
  LoginResDTO,
  RefreshTokenBodyDTO,
  RefreshTokenResDTO,
  RegisterBodyDTO,
  RegisterResDTO,
  SendOTPBodyDTO,
} from './auth.dto';
import { ZodSerializerDto } from 'nestjs-zod';
import { UserAgent } from 'src/shared/decorators/user-agent.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @ZodSerializerDto(RegisterResDTO)
  async handleRegister(@Body() body: RegisterBodyDTO) {
    return await this.authService.register(body);
  }

  @Post('/otp')
  handleSendOTP(@Body() body: SendOTPBodyDTO) {
    return this.authService.sendOTP(body);
  }

  @Post('/login')
  @ZodSerializerDto(LoginResDTO)
  async handleLogin(@Body() body: LoginBodyDTO, @UserAgent() userAgent: string, @Ip() ip: string) {
    return await this.authService.login({ ...body, userAgent, ip });
  }

  @Post('/refresh-token')
  // @UseGuards(AuthGuard) // guard cần truyền access token mới được phép truy cập vào route này
  @ZodSerializerDto(RefreshTokenResDTO)
  @HttpCode(HttpStatus.OK)
  async handleRefreshToken(@Body() body: RefreshTokenBodyDTO, @UserAgent() userAgent: string, @Ip() ip: string) {
    return await this.authService.refreshToken({ refreshToken: body.refreshToken, userAgent, ip });
  }

  // @Post('/logout')
  // @HttpCode(HttpStatus.OK)
  // async handleLogout(@Body() body: any) {
  //   return await this.authService.logout(body.refreshToken);
  // }
}
