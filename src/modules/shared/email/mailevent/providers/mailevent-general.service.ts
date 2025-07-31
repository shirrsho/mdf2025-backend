import { Injectable } from '@nestjs/common';
import { BaseService } from '@/modules/base';
import {
  MailDraftEvent,
  MailScheduleEvent,
  MailSendEvent,
} from '@/modules/events';
import { MailHistoryGeneralService } from '../../mailhistory';
import { MailHistoryDocument } from '../../mailhistory/schema';
import { MailBlueprintGeneralService } from '../../mail-blueprint';
import { flattenObject } from '@/modules/utils';
import { MailsenderService } from '../../mailsender';
import { SentMailStatus } from '@/modules/enum';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class MailEventsGeneralService extends BaseService<MailEventsGeneralService> {
  constructor(
    private readonly mailHistoryService: MailHistoryGeneralService,
    private readonly mailBlueprintService: MailBlueprintGeneralService,
    private readonly mailSenderService: MailsenderService,
  ) {
    super(MailEventsGeneralService.name);
  }

  async handleScheduleMail(event: MailScheduleEvent) {
    if (!event.recepitentEmail) {
      this.logError('No recipient emails provided for MailScheduleEvent');
      return;
    }

    try {
      const commonData = {
        ...event,
        recepitentEmail: event.recepitentEmail,
        resourceId: event.resourceId,
        resourceName: event.resourceName,
        status: SentMailStatus.SCHEDULED,
        scheduleTime: event.scheduleTime,
        blueprint: event.blueprint,
        placeValues: event.placeValues,
        tag: event.tag,
        cc: event.cc,
        bcc: event.bcc,
      };

      await this.mailHistoryService.createHistory(commonData);
      this.logInfo('Mail schedule event processed successfully.');
    } catch (error) {
      this.logError('Error processing mail schedule event:', error);
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleSendScheduleMail() {
    try {
      const historys = await this.mailHistoryService.getScheduledMailHistory();
      if (!historys && historys.length === 0) {
        this.logError('History not found');
        return;
      }
      const sendPromises = historys.map((history) => this.sendMail(history));
      await Promise.all(sendPromises);
      this.logInfo('Mail send event processed successfully.');
    } catch (error) {
      this.logError('Error processing mail send event:', error);
    }
  }

  async handleDraftMail(event: MailDraftEvent) {
    if (!event.recepitentEmails || event.recepitentEmails.length === 0) {
      this.logError('No recipient emails provided for MailDraftEvent');
      return;
    }

    try {
      const commonData = {
        ...event,
        resourceId: event.resourceId,
        resourceName: event.resourceName,
        status: event.status,
        blueprint: event.blueprint,
        placeValues: event.placeValues,
        tag: event.tag,
        cc: event.cc,
        bcc: event.bcc,
      };

      const creationPromises = event.recepitentEmails.map((email) =>
        this.mailHistoryService.createHistory({
          ...commonData,
          recepitentEmail: email,
        }),
      );

      await Promise.all(creationPromises);
      this.logInfo('Mail draft event processed successfully.');
    } catch (error) {
      this.logError('Error processing mail draft event:', error);
    }
  }

  async handleSendDraftMail(resourceId: string, tag?: string) {
    try {
      const historys = await this.mailHistoryService.getHistoryByResourceId(
        resourceId,
        tag,
      );
      if (!historys && historys.length === 0) {
        this.logError('History not found');
        return;
      }
      const sendPromises = historys.map((history) => this.sendMail(history));
      await Promise.all(sendPromises);
      this.logInfo('Mail send event processed successfully.');
    } catch (error) {
      this.logError('Error processing mail send event:', error);
    }
  }

  async handleSendMail(event: MailSendEvent) {
    try {
      const payload = {
        ...event,
        recepitentEmail: event.recepitentEmail,
        resourceId: event.resourceId,
        resourceName: event.resourceName,
        status: event.status,
        blueprint: event.blueprint,
        placeValues: event.placeValues,
        tag: event.tag,
        cc: event.cc,
        bcc: event.bcc,
        priority: event.priority,
      };
      const history = await this.mailHistoryService.createHistory(payload);
      if (event.isPredefined) {
        await this.sendPredefinedMail(event, history);
      } else {
        await this.sendMail(history);
      }
      this.logInfo('Mail send event processed successfully.');
    } catch (error) {
      this.logError('Error processing mail send event:', error);
    }
  }

  async resendMail(id: string) {
    const history = await this.mailHistoryService.getHistoryById(id);
    if (!history) {
      this.logError('History not found');
      return;
    }
    await this.sendMail(history);
  }

  async sendMail(history: MailHistoryDocument) {
    try {
      const bluePrint = await this.mailBlueprintService.getBlueprintByNameOrId(
        history.resourceName,
        history.blueprint,
      );
      if (!bluePrint) {
        this.logError('Blueprint not found');
        await this.mailHistoryService.updateHistoryStatus(
          history._id.toHexString(),
          SentMailStatus.NOTFOUND,
        );
        return;
      }

      let subject = bluePrint.subjectContent;
      let body = bluePrint.bodyContent;

      const data = flattenObject(history.placeValues);

      const missingPlaceholders = bluePrint.placeholders.filter(
        (placeholder) => !(placeholder in data),
      );

      if (missingPlaceholders.length > 0) {
        this.logError(
          `Missing placeholders: ${missingPlaceholders.join(', ')}`,
        );
        await this.mailHistoryService.updateHistoryStatus(
          history._id.toHexString(),
          SentMailStatus.NOTFOUND,
        );
        return;
      }

      for (const key in data) {
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(placeholder, data[key]);
        body = body.replace(placeholder, data[key]);
      }

      await this.mailSenderService.sendBlueprintEmail({
        to: history.recepitentEmail,
        cc: history.cc,
        bcc: history.bcc,
        subject: subject,
        text: body,
        jobId: history._id.toHexString(),
        priority: history.priority,
      });
    } catch (error) {
      await this.mailHistoryService.updateHistoryStatus(
        history._id.toHexString(),
        SentMailStatus.FAILED,
      );
      this.logError('Error sending mail:', error);
    }
  }

  async sendPredefinedMail(event: MailSendEvent, history: MailHistoryDocument) {
    try {
      if (event.mailName === 'registration') {
        await this.mailSenderService.sendRegistrationOtp({
          ...event,
          to: history.recepitentEmail,
          subject: event.subject,
          text: event.text,
          jobId: history._id.toHexString(),
          priority: history.priority,
        });
      } else if (event.mailName === 'forgot-password') {
        await this.mailSenderService.sendForgotPasswordOtp({
          ...event,
          to: history.recepitentEmail,
          subject: event.subject,
          text: event.text,
          jobId: history._id.toHexString(),
          priority: history.priority,
        });
      } else if (event.mailName === 'admin-new-user') {
        await this.mailSenderService.sendAdminNewUser({
          ...event,
          to: history.recepitentEmail,
          subject: event.subject,
          text: event.text,
          jobId: history._id.toHexString(),
          priority: history.priority,
        });
      } else if (event.mailName === 'welcome') {
        await this.mailSenderService.sendWelcome({
          ...event,
          to: history.recepitentEmail,
          subject: event.subject,
          text: event.text,
          jobId: history._id.toHexString(),
          priority: history.priority,
        });
      }
    } catch (error) {
      await this.mailHistoryService.updateHistoryStatus(
        history._id.toHexString(),
        SentMailStatus.FAILED,
      );
      this.logError('Error sending mail:', error);
    }
  }
}
