import type { INestApplication } from '@nestjs/common';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { setupSwagger } from './modules/docs';
import express from 'express';

export function middleware(app: INestApplication): INestApplication {
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.urlencoded({ extended: false }));
  app.use(compression());
  app.use(cookieParser());

  setupSwagger(app);
  if (!isProduction) {
  }

  app.enableCors({
    credentials: true,
    origin: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  });

  return app;
}
