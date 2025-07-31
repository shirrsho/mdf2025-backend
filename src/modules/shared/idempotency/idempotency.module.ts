import { Module } from '@nestjs/common';
import { IdempotencyService } from './idempotency.service';
import { RediscacheModule } from '../rediscache';

@Module({
  imports: [RediscacheModule],
  providers: [IdempotencyService],
  exports: [IdempotencyService],
})
export class IdempotencyModule {}
