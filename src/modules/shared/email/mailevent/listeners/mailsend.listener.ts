import { MailEventNames } from '@/modules/enum';
import { MailSendEvent } from '@/modules/events';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailEventsGeneralService } from '../providers';

@Injectable()
export class MailSendListener {
  constructor(private readonly mailEventService: MailEventsGeneralService) {}

  @OnEvent(MailEventNames.SEND)
  async handleMailSendEvent(event: MailSendEvent) {
    await this.mailEventService.handleSendMail(event);
  }
}
