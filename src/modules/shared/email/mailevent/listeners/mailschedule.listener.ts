import { MailEventNames } from '@/modules/enum';
import { MailScheduleEvent } from '@/modules/events';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailEventsGeneralService } from '../providers';

@Injectable()
export class MailScheduleListener {
  constructor(private readonly mailEventService: MailEventsGeneralService) {}

  @OnEvent(MailEventNames.SCHEDULE)
  async handleMailSendEvent(event: MailScheduleEvent) {
    await this.mailEventService.handleScheduleMail(event);
  }
}
