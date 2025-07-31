import { Module } from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule as mongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    mongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>(
          'MONGODB_URI',
          'mongodb://localhost:27017/shirsho',
        ),
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [mongooseModule],
})
export class MongooseModule {}
