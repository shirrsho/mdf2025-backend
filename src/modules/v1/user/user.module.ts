import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema';

import * as providers from './providers';
import * as controller from './controllers';
import { TempMail, TempMailSchema } from './schema/tempmail.schema';
import { IdempotencyModule } from '@/modules/shared/idempotency';
import {
  RolePermission,
  RolePermissionSchema,
} from '@/modules/shared/role-permissions/schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: TempMail.name, schema: TempMailSchema },
      { name: RolePermission.name, schema: RolePermissionSchema },
    ]),
    IdempotencyModule,
  ],
  providers: Object.values(providers),
  controllers: Object.values(controller),
  exports: [
    providers.UserGeneralService,
    providers.UserCurdService,
    providers.UserInternalService,
  ],
})
export class UserModule {}
