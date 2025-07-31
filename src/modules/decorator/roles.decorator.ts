import { SetMetadata } from '@nestjs/common';
import { Role } from '@/modules/enum';

export const HasRoles = (...roles: Role[]) => SetMetadata('roles', roles);
