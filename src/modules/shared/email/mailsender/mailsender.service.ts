import {
  ConflictException,
  HttpException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Mail } from './dtos';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { CreateMailCredDTO } from './dtos/mail-cred.dto';
import { ConfigService } from '@nestjs/config';
import { MailCred, MailCredDocument } from './schemas/mail-cred.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { MailerService } from '@nestjs-modules/mailer';
import { EncryptionService } from '@/modules/shared/encryption/encryption.service';

@Injectable()
export class MailsenderService {
  logger = new Logger('RedisQueue');
  private applogo: string;
  private applink: string;
  private appname: string;
  private primaryColor: string;
  private year: string;
  private backendaddress: string;

  private defaultTransporterName: string;
  private defaultSmtpFrom: string;

  constructor(
    @InjectQueue('email') private emailQueue: Queue,
    private readonly mailerService: MailerService,
    private encryptionService: EncryptionService,
    private configService: ConfigService,
    @InjectModel(MailCred.name)
    private readonly mailModel: Model<MailCredDocument>,
  ) {
    this.init();
  }

  private async init() {
    try {
      await this.delay(1000, 1);
      await this.updateDefaultTransporter();
      await this.addAllTransporter();
      this.appname = this.configService.get('APP_NAME');
      this.applink = this.configService.get('FRONTEND_URL');
      this.applogo = this.configService.get('APP_LOGO');
      this.primaryColor = this.configService.get('APP_PRIMARY_COLOR');
      this.backendaddress = this.configService.get('BACKEND_ADDRESS');
      this.year = new Date().getFullYear().toString();
      this.checkQueueAvailability();
    } catch (e) {
      this.logger.error(e);
    }
  }

  private checkQueueAvailability(): void {
    if (this.emailQueue.client.status === 'ready') {
      this.logger.log('Redis is ready');
    } else {
      throw new Error('Redis not available');
    }
  }

  private delay(t: number, val: any) {
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve(val);
      }, t);
    });
  }

  async sendBlueprintEmail(data: Mail) {
    if (!data?.transporterName) {
      data.transporterName = this.defaultTransporterName;
      data.smtpFrom = this.defaultSmtpFrom;
    }
    const mailCred = await this.mailModel.findOne({
      transporterName: data.transporterName,
    });
    data.smtpFrom = mailCred.smtpFrom;
    data.applogo = this.applogo;
    data.applink = this.applink;
    data.appname = this.appname;
    data.primaryColor = this.primaryColor;
    data.year = this.year;
    data.tracing = `${this.backendaddress}/api/mailhistory/tracking-pixel/${data.jobId}`;
    const job = await this.emailQueue.add(
      'blueprint',
      { data },
      { jobId: data.jobId, priority: data.priority },
    );
    return { jobId: job.id };
  }

  async sendRegistrationOtp(data: Mail) {
    if (!data?.transporterName) {
      data.transporterName = this.defaultTransporterName;
      data.smtpFrom = this.defaultSmtpFrom;
    }
    data.appname = this.appname;
    data.year = this.year;
    data.subject = `Registration OTP For ${this.appname}`;
    const job = await this.emailQueue.add(
      'registration-otp',
      { data },
      { jobId: data.jobId, priority: data.priority },
    );
    return { jobId: job.id };
  }

  async sendForgotPasswordOtp(data: Mail) {
    if (!data?.transporterName) {
      data.transporterName = this.defaultTransporterName;
      data.smtpFrom = this.defaultSmtpFrom;
    }
    data.appname = this.appname;
    data.year = this.year;
    data.subject = `Reset Password For ${this.appname}`;
    const job = await this.emailQueue.add(
      'forgot-password-otp',
      { data },
      { jobId: data.jobId, priority: data.priority },
    );
    return { jobId: job.id };
  }

  async sendAdminNewUser(data: Mail) {
    if (!data?.transporterName) {
      data.transporterName = this.defaultTransporterName;
      data.smtpFrom = this.defaultSmtpFrom;
    }
    data.appname = this.appname;
    data.year = this.year;
    data.subject = `New User By Admin of ${this.appname}`;
    const job = await this.emailQueue.add(
      'admin-new-user',
      { data },
      { jobId: data.jobId, priority: data.priority },
    );
    return { jobId: job.id };
  }

  async sendPaymentConfirmation(data: Mail) {
    if (!data?.transporterName) {
      data.transporterName = this.defaultTransporterName;
      data.smtpFrom = this.defaultSmtpFrom;
    }
    data.appname = this.appname;
    data.year = this.year;
    data.subject = `Payment Confirmation`;
    const job = await this.emailQueue.add(
      'payment-confirmation',
      { data },
      { jobId: data.jobId, priority: data.priority },
    );
    return { jobId: job.id };
  }

  async sendWelcome(data: Mail) {
    if (!data?.transporterName) {
      data.transporterName = this.defaultTransporterName;
    }
    if (!data?.smtpFrom) {
      data.smtpFrom = this.defaultSmtpFrom;
    }
    data.appname = this.appname;
    data.year = this.year;
    data.subject = `Welcome to ${this.appname}`;
    const job = await this.emailQueue.add(
      'welcome',
      { data },
      { jobId: data.jobId, priority: data.priority },
    );
    return { jobId: job.id };
  }

  async sendTestMail(name, transportName, jobid, smtpFrom) {
    return await this.sendWelcome({
      to: 'hniqbal01@gmail.com',
      transporterName: transportName,
      jobId: jobid,
      name: name,
      priority: 1,
      smtpFrom,
    });
  }

  async create(createCredsDto: CreateMailCredDTO) {
    try {
      const cred = await this.mailModel.create(createCredsDto);
      cred.smtpPassword = this.encryptionService.encrypt(
        createCredsDto.smtpPassword,
      );
      return cred.save();
    } catch (error) {
      if (error?.code === 11000) {
        throw new ConflictException('Name already exists');
      }
      throw new HttpException(error?.message, error?.status ?? 500, {
        cause: error,
      });
    }
  }

  async delete(id: string) {
    const cred = await this.mailModel.findByIdAndDelete(id);
    return cred;
  }

  async getAll() {
    const creds = await this.mailModel.find();
    const decryptedCreds = creds.map((cred) => {
      const decrypted = cred.toObject();
      decrypted.smtpPassword = this.encryptionService.decrypt(
        cred.smtpPassword,
      );
      return decrypted;
    });
    return { data: decryptedCreds, count: decryptedCreds.length };
  }

  async getAsOption() {
    const creds = await this.mailModel.find();
    const options = creds.map((cred) => {
      return { label: cred.transporterName, value: cred.transporterName };
    });
    return options;
  }

  async setAsDefault(id: string) {
    await this.mailModel.updateMany({}, { $set: { isDefault: false } });
    const defaultCred = await this.mailModel.findByIdAndUpdate(
      id,
      { $set: { isDefault: true } },
      { new: true },
    );
    await this.updateDefaultTransporter();
    return defaultCred;
  }

  async getDefaultTransporter() {
    const transporter = await this.mailModel.findOne({ isDefault: true });
    if (transporter) {
      transporter.smtpPassword = this.encryptionService.decrypt(
        transporter.smtpPassword,
      );
      return transporter;
    }
  }

  async updateDefaultTransporter() {
    const creds = await this.getDefaultTransporter();
    if (creds) {
      this.defaultTransporterName = creds.transporterName;
      this.defaultSmtpFrom = creds.smtpFrom;
      this.mailerService.addTransporter(creds.transporterName, {
        host: creds.smtpHost,
        port: creds.smtpPort,
        auth: {
          user: creds.smtpUser,
          pass: creds.smtpPassword,
        },
      });
    }
  }

  async addAllTransporter() {
    const creds = await this.mailModel.find();
    creds.forEach((cred) => {
      cred.smtpPassword = this.encryptionService.decrypt(cred.smtpPassword);
      this.mailerService.addTransporter(cred.transporterName, {
        host: cred.smtpHost,
        port: cred.smtpPort,
        auth: {
          user: cred.smtpUser,
          pass: cred.smtpPassword,
        },
      });
    });
  }
}
