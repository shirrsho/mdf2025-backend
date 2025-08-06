import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Application, ApplicationSchema } from './schema';

import * as providers from './providers';
import * as controller from './controllers';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Application.name, schema: ApplicationSchema },
    ]),
  ],
  providers: Object.values(providers),
  controllers: Object.values(controller),
  exports: [],
})
export class ApplicationModule {}
