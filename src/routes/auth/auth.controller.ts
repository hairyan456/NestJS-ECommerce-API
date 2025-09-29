import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { RegisterBodyDTO, RegisterResDTO } from './auth.dto';
import { ZodSerializerDto } from 'nestjs-zod';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @ZodSerializerDto(RegisterResDTO)
  async handleRegister(@Body() body: RegisterBodyDTO) {
    return await this.authService.register(body);
  }

  @Post('/login')
  async handleLogin(@Body() body: any) {
    return await this.authService.login(body);
  }

  @Post('/refresh-token')
  @UseGuards(AuthGuard) // guard cần truyền access token mới được phép truy cập vào route này
  @HttpCode(HttpStatus.OK)
  async handleRefreshToken(@Body() body: any) {
    return await this.authService.refreshToken(body.refreshToken);
  }

  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  async handleLogout(@Body() body: any) {
    return await this.authService.logout(body.refreshToken);
  }
}
