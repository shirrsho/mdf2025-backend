import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CornJobService {
  private readonly logger = new Logger(CornJobService.name);

  @Cron(CronExpression.EVERY_HOUR)
  async handleExamStatusUpdate() {
    this.logger.debug('Called after one hour');
  }
}
