import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SSLCommerzController } from './sslcommerz.controller';
import { SSLCommerzService } from './sslcommerz.service';
import { config } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      envFilePath: `.env`,
    }),
  ],
  providers: [SSLCommerzService],
  controllers: [SSLCommerzController],
  exports: [SSLCommerzService],
})
export class SSLCommerzModule {}
