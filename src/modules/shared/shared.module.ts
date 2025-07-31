import { Module } from '@nestjs/common';
import { AuthModule } from './auth';
import { DatabaseModule } from './database';
import { RealtimeModule } from './realtime';
import { ImageModule } from './image';
import { CornJobModule } from './cornjob';
import { RoutesModule } from './routes';
import { IdempotencyModule } from './idempotency';
import { RolePermissionModule } from './role-permissions';
import { EmailModule } from './email';

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    ImageModule,
    CornJobModule,
    RealtimeModule,
    RoutesModule,
    IdempotencyModule,
    RolePermissionModule,
    EmailModule,
  ],
})
export class SharedModule {}
