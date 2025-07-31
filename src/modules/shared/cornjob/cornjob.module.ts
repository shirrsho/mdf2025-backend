import { Module } from '@nestjs/common';
import { CornJobService } from './cornjob.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [],
  providers: [CornJobService],
})
export class CornJobModule {}
