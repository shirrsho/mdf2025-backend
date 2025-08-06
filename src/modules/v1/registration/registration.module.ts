import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Registration, RegistrationSchema } from './schema';

import * as providers from './providers';
import * as controller from './controllers';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Registration.name, schema: RegistrationSchema },
    ]),
  ],
  providers: Object.values(providers),
  controllers: Object.values(controller),
  exports: [],
})
export class RegistrationModule {}
