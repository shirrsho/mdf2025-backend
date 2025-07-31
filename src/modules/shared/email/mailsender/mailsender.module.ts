import { Module } from '@nestjs/common';
import { MailsenderService } from './mailsender.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { EmailProcessor } from './processors/email.processor';
import { MailCred, MailSchema } from './schemas/mail-cred.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { MailSenderController } from './mailsender.controller';
import { MailHistoryModule } from '../mailhistory';
import { EncryptionModule } from '@/modules/shared/encryption';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MailCred.name, schema: MailSchema }]),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get('SMTP_HOST'),
          port: parseInt(configService.get('SMTP_PORT')),
          secure: false, // true for 465, false for other ports
          auth: {
            user: configService.get('SMTP_USER'),
            pass: configService.get('SMTP_PASSWORD'),
          },
        },
        defaults: {
          from: `"${configService.get('APP_NAME')}" <${configService.get('SMTP_MAIL_FROM')}>`,
        },
        template: {
          dir: __dirname + '/templates',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: +configService.get<number>('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'email',
    }),
    EncryptionModule,
    MailHistoryModule,
  ],
  providers: [MailsenderService, EmailProcessor],
  controllers: [MailSenderController],
  exports: [MailsenderService],
})
export class MailsenderModule {}
