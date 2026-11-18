import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './routes/auth/auth.module';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import CustomZodValidationPipe from './shared/pipes/custom-zod-validation.pipe';
import { ZodSerializerInterceptor } from 'nestjs-zod';
import { HttpExceptionFilter } from './shared/filters/http-exception-filter';
import { LanguageModule } from './routes/language/language.module';
import { PermissionModule } from './routes/permission/permission.module';
import { RoleModule } from './routes/role/role.module';
import { ProfileModule } from 'src/routes/profile/profile.module';
import { UserModule } from 'src/routes/user/user.module';
import { MediaModule } from 'src/routes/media/media.module';
import { BrandModule } from 'src/routes/brand/brand.module';
import { BrandTranslationModule } from 'src/routes/brand/brand-translation/brand-translation.module';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import path from 'path';

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.resolve('src/i18n/'),
        watch: true,
      },
      // Resolvers for i18n
      resolvers: [{ use: QueryResolver, options: ['lang'] }, AcceptLanguageResolver],
      // Output path for generated types (tạo gợi ý)
      typesOutputPath: path.resolve('src/generated/i18n.generated.ts'),
    }),
    SharedModule,
    AuthModule,
    LanguageModule,
    PermissionModule,
    RoleModule,
    ProfileModule,
    UserModule,
    MediaModule,
    BrandModule,
    BrandTranslationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global Zod validation pipe
    {
      provide: APP_PIPE,
      useClass: CustomZodValidationPipe,
    },
    // Global Zod serialization interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    // Global HTTP exception filter (khi có exception throw ra thì sẽ được bắt bởi filter này)
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
