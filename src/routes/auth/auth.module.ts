import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { RolesService } from './roles.service';
import { AuthRepository } from './auth.repo';
import { GoogleService } from './google.service';
import { TwoFactorAuthService } from 'src/shared/services/2fa.service';

@Module({
  providers: [AuthService, RolesService, GoogleService, AuthRepository, TwoFactorAuthService],
  controllers: [AuthController],
})
export class AuthModule {}
