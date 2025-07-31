import { Global, Module } from '@nestjs/common';

import * as providers from './providers';
import * as controller from './controllers';
import { MongooseModule } from '@nestjs/mongoose';
import { ErrorLogging, ErrorLoggingSchema } from './schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ErrorLogging.name, schema: ErrorLoggingSchema },
    ]),
  ],
  providers: Object.values(providers),
  controllers: Object.values(controller),
  exports: [providers.ErrorLoggingGeneralService],
})
export class ErrorLoggingModule {}
