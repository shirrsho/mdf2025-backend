import { DatabaseModule } from '@/modules/shared';
import { Module } from '@nestjs/common';

import { UserModule } from './user';
import { TemplateModule } from './template';
import { NotificationModule } from './notification';

@Module({
  imports: [UserModule, DatabaseModule, TemplateModule, NotificationModule],
})
export class V1Module {}
