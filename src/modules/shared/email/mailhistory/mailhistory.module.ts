import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MailHistory, MailHistorySchema } from './schema';
import * as providers from './providers';
import * as controller from './controllers';
import { MailBlueprintModule } from '../mail-blueprint';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MailHistory.name, schema: MailHistorySchema },
    ]),
    MailBlueprintModule,
  ],
  providers: Object.values(providers),
  controllers: Object.values(controller),
  exports: [providers.MailHistoryGeneralService],
})
export class MailHistoryModule {}
