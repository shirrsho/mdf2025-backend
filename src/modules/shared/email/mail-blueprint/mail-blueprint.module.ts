import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  MailAutomation,
  MailAutomationSchema,
  MailBlueprint,
  MailBlueprintSchema,
} from './schema';

import * as providers from './providers';
import * as controller from './controllers';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MailBlueprint.name, schema: MailBlueprintSchema },
      { name: MailAutomation.name, schema: MailAutomationSchema },
    ]),
  ],
  providers: Object.values(providers),
  controllers: Object.values(controller),
  exports: [providers.MailBlueprintGeneralService],
})
export class MailBlueprintModule {}
