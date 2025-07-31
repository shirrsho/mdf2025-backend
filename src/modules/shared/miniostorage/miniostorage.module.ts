import { Module } from '@nestjs/common';
import { MiniostorageService } from './miniostorage.service';
import { MiniostorageController } from './miniostorage.controller';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  providers: [MiniostorageService],
  controllers: [MiniostorageController],
})
export class MiniostorageModule {}
