import { Global, Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { HashingService } from './services/hashing.service';
import { TokenService } from './services/token.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './guards/auth.guard';
import { APIKeyGuard } from './guards/api-key.guard';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationGuard } from './guards/authentication.guard';
import { EmailService } from './services/email.service';
import { SharedUserRepository } from './repositories/shared-user.repo';
import { SharedRoleRepository } from 'src/shared/repositories/shared-role.repo';

@Global()
@Module({
  imports: [JwtModule],
  providers: [
    PrismaService,
    HashingService,
    TokenService,
    EmailService,
    AuthGuard,
    APIKeyGuard,
    SharedUserRepository,
    SharedRoleRepository,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
  ],
  exports: [PrismaService, HashingService, TokenService, EmailService, SharedUserRepository, SharedRoleRepository],
})
export class SharedModule {}
