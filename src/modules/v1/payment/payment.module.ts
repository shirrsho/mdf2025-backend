import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './schema';

import * as providers from './providers';
import * as controller from './controllers';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
    ]),
  ],
  providers: Object.values(providers),
  controllers: Object.values(controller),
  exports: [],
})
export class PaymentModule {}
