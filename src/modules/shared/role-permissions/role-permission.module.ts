import { Module } from '@nestjs/common';

import * as providers from './providers';
import * as controller from './controllers';
import { MongooseModule } from '@nestjs/mongoose';
import { RolePermission, RolePermissionSchema } from './schema';
import { RoutesModule } from '../routes';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RolePermission.name, schema: RolePermissionSchema },
    ]),
    RoutesModule,
  ],
  providers: Object.values(providers),
  controllers: Object.values(controller),
  exports: [providers.RolePermissionGeneralService],
})
export class RolePermissionModule {}
