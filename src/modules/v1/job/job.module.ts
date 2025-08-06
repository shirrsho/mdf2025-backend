import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Job, JobSchema } from './schema';

import * as providers from './providers';
import * as controller from './controllers';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Job.name, schema: JobSchema },
    ]),
  ],
  providers: Object.values(providers),
  controllers: Object.values(controller),
  exports: [],
})
export class JobModule {}
