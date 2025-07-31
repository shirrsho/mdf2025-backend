import { Module } from '@nestjs/common';
import { RediscacheService } from './rediscache.service';

@Module({
  providers: [RediscacheService],
  exports: [RediscacheService],
})
export class RediscacheModule {}
