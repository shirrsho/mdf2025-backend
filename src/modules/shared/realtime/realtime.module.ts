import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { RealtimeService } from './realtime.service';
import { AuthModule } from '../auth';

@Module({
  imports: [AuthModule],
  providers: [RealtimeGateway, RealtimeService],
})
export class RealtimeModule {}
