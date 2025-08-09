import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Company, CompanySchema } from './schema';

import * as providers from './providers';
import * as controller from './controllers';
import { UserModule } from '../user';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Company.name, schema: CompanySchema },
    ]),
    UserModule
  ],
  providers: Object.values(providers),
  controllers: Object.values(controller),
  exports: [],
})
export class CompanyModule {}
