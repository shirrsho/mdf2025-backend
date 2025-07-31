import { Module } from '@nestjs/common';
import { V1Module } from './v1/v1.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [SharedModule, V1Module],
})
export class ModulesModule {}
