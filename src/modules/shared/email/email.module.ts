import { Module } from '@nestjs/common';
import { MailBlueprintModule } from './mail-blueprint';
import { MailHistoryModule } from './mailhistory';
import { MailEventModule } from './mailevent';
import { MailsenderModule } from './mailsender';

@Module({
  imports: [
    MailEventModule,
    MailHistoryModule,
    MailBlueprintModule,
    MailsenderModule,
  ],
})
export class EmailModule {}
