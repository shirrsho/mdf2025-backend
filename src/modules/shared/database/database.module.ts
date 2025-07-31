import { Module } from '@nestjs/common';
import { MongooseModule } from './mongoose/mongoose.module';

@Module({
  imports: [MongooseModule],
  exports: [DatabaseModule],
})
export class DatabaseModule {}
