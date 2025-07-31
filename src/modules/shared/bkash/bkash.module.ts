import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BkashService } from './bkash.service';
import { config } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      envFilePath: `.env`,
    }),
  ],
  providers: [BkashService],
  controllers: [],
  exports: [BkashService],
})
export class BkashModule {}
