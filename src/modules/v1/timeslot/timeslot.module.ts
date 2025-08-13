import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Timeslot, TimeslotSchema } from './schema';

import * as providers from './providers';
import * as controller from './controllers';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Timeslot.name, schema: TimeslotSchema },
    ]),
  ],
  providers: Object.values(providers),
  controllers: Object.values(controller),
  exports: Object.values(providers),
})
export class TimeslotModule {}
