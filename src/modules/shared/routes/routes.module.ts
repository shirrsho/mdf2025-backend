import { Module } from '@nestjs/common';

import * as providers from './providers';
import * as controller from './controllers';
import { MongooseModule } from '@nestjs/mongoose';
import { Routes, RoutesSchema } from './schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Routes.name, schema: RoutesSchema }]),
  ],
  providers: Object.values(providers),
  controllers: Object.values(controller),
  exports: [providers.RoutesGeneralService],
})
export class RoutesModule {}
