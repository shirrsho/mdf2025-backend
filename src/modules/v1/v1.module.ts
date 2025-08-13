import { DatabaseModule } from '@/modules/shared';
import { Module } from '@nestjs/common';

import { UserModule } from './user';
import { TemplateModule } from './template';
import { NotificationModule } from './notification';
import { ApplicationModule } from './application';
import { CompanyModule } from './company';
import { JobModule } from './job';
import { PaymentModule } from '../shared/payment';
import { RegistrationModule } from './registration';
import { WebinarModule } from './webinar';
import { TimeslotModule } from './timeslot';

@Module({
  imports: [
    UserModule,
    DatabaseModule,
    TemplateModule,
    NotificationModule,
    ApplicationModule,
    CompanyModule,
    JobModule,
    PaymentModule,
    RegistrationModule,
    WebinarModule,
    TimeslotModule,
  ],
})
export class V1Module {}
