import { Module } from '@nestjs/common';

import * as providers from './providers';
import * as controller from './controllers';
import { MulterModule } from '@nestjs/platform-express';
import { MongooseModule } from '@nestjs/mongoose';
import { Image, ImageSchema } from './schema';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
    MongooseModule.forFeature([{ name: Image.name, schema: ImageSchema }]),
  ],
  providers: Object.values(providers),
  controllers: Object.values(controller),
  exports: [providers.ImagesGeneralService],
})
export class ImageModule {}
