import { Module } from '@nestjs/common';
import * as providers from './providers';
import * as controller from './controllers';
import * as listener from './listeners';
import { MailHistoryModule } from '../mailhistory';
import { MailBlueprintModule } from '../mail-blueprint';
import { MailsenderModule } from '../mailsender';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    MailHistoryModule,
    MailBlueprintModule,
    MailsenderModule,
    ScheduleModule.forRoot(),
  ],
  providers: [...Object.values(providers), ...Object.values(listener)],
  controllers: Object.values(controller),
})
export class MailEventModule {}
