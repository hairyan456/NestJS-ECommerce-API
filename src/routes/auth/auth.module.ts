import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { RolesService } from './roles.service';
import { AuthRepository } from './auth.repo';
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo';

@Module({
  providers: [AuthService, RolesService, AuthRepository, SharedUserRepository],
  controllers: [AuthController],
})
export class AuthModule {}
