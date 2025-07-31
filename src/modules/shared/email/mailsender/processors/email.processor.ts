import { MailerService } from '@nestjs-modules/mailer';
import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Job } from 'bull';
import { Mail } from '../dtos';
import { Logger } from '@nestjs/common';
import { MailHistoryGeneralService } from '../../mailhistory';
import { SentMailStatus } from '@/modules/enum';

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly mailService: MailerService,
    private readonly mailHistoryService: MailHistoryGeneralService,
  ) {
    this.logger.log('EmailProcessor');
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(
      `Processing job ${job.id} of type ${job.name}. Data: ${JSON.stringify(
        job.data,
      )}`,
    );
    this.mailHistoryService.updateHistoryStatus(
      job.id,
      SentMailStatus.PROCESSING,
    );
  }

  @OnQueueCompleted()
  async onComplete(job: Job, result: any) {
    this.logger.debug(
      `Completed job ${job.id} of type ${job.name}. Result: ${JSON.stringify(
        result,
      )}`,
    );
    await this.mailHistoryService.updateHistoryStatus(
      job.id,
      SentMailStatus.COMPLETED,
    );
  }

  @OnQueueFailed()
  async onFailed(job: Job<any>, error: any) {
    this.logger.error(
      `Failed job ${job.id} of type ${job.name}: ${error.message}`,
      error.stack,
    );
    await this.mailHistoryService.updateHistoryStatus(
      job.id,
      SentMailStatus.FAILED,
    );
  }

  @Process('welcome')
  async sendWelcomeEmail(job: Job<Mail>) {
    const { data } = job.data;
    await this.mailService.sendMail({
      ...data,
      template: 'welcome',
      transporterName: data.transporterName,
      context: data,
      from: `"${data.transporterName}" <${data.smtpFrom}>`,
    });
  }

  @Process('registration-otp')
  async sendRegistrationOtp(job: Job<Mail>) {
    const { data } = job.data;
    await this.mailService.sendMail({
      ...data,
      template: 'registration-otp',
      transporterName: data.transporterName,
      context: data,
      from: `"${data.transporterName}" <${data.smtpFrom}>`,
    });
  }

  @Process('forgot-password-otp')
  async sendForgotPasswordOtp(job: Job<Mail>) {
    const { data } = job.data;
    await this.mailService.sendMail({
      ...data,
      template: 'forgot-password-otp',
      transporterName: data.transporterName,
      context: data,
      from: `"${data.transporterName}" <${data.smtpFrom}>`,
    });
  }

  @Process('admin-new-user')
  async sendAdminNewUser(job: Job<Mail>) {
    const { data } = job.data;
    await this.mailService.sendMail({
      ...data,
      template: 'admin-new-user',
      transporterName: data.transporterName,
      context: data,
      from: `"${data.transporterName}" <${data.smtpFrom}>`,
    });
  }

  @Process('payment-confirmation')
  async sendPaymentConfirmation(job: Job<Mail>) {
    const { data } = job.data;
    await this.mailService.sendMail({
      ...data,
      template: 'payment-confirmation',
      transporterName: data.transporterName,
      context: data,
      from: `"${data.transporterName}" <${data.smtpFrom}>`,
    });
  }

  @Process('blueprint')
  async blueprintMail(job: Job<Mail>) {
    const { data } = job.data;
    await this.mailService.sendMail({
      ...data,
      template: 'blueprint',
      transporterName: data.transporterName,
      context: data,
      from: `"${data.transporterName}" <${data.smtpFrom}>`,
    });
    return { jobId: job.id };
  }
}
