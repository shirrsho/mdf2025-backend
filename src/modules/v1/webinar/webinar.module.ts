import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Webinar, WebinarSchema } from './schema';

import * as providers from './providers';
import * as controller from './controllers';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Webinar.name, schema: WebinarSchema },
    ]),
  ],
  providers: Object.values(providers),
  controllers: Object.values(controller),
  exports: [],
})
export class WebinarModule {}
