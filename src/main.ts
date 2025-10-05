import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import envConfig from './shared/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    credentials: true, // cho phép Client - Server trao đổi qua cookies
  });

  await app.listen(envConfig.PORT);
}
bootstrap();
