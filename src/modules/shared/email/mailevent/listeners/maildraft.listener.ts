import { MailEventNames } from '@/modules/enum';
import { MailDraftEvent, MailDraftSendEvent } from '@/modules/events';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailEventsGeneralService } from '../providers';

@Injectable()
export class MailDraftListener {
  constructor(private readonly mailEventService: MailEventsGeneralService) {}

  @OnEvent(MailEventNames.DRAFT)
  async handleMailDraftEvent(event: MailDraftEvent) {
    await this.mailEventService.handleDraftMail(event);
  }

  @OnEvent(MailEventNames.DRAFT_SEND)
  async handleMailDraftSendEvent(event: MailDraftSendEvent) {
    await this.mailEventService.handleSendDraftMail(event.resourceId);
  }
}
