import { Module } from '@nestjs/common';

import * as providers from './providers';
import * as controllers from './controllers';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  controllers: Object.values(controllers),
  providers: Object.values(providers),
  exports: [providers.NotificationGeneralService],
})
export class NotificationModule {}
