import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger as NestLogger, ValidationPipe } from '@nestjs/common';
import { middleware } from './app.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });
  const configService = app.get<ConfigService>(ConfigService);
  app.setGlobalPrefix('api');

  middleware(app);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(+configService.get('PORT'));
  const url = await app.getUrl();
  NestLogger.log('Application is running on:' + url, 'Bootstrap');
}

bootstrap();
