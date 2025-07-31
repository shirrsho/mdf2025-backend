import { UserInternalService } from '@/modules/v1/user';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class RolePermissionGuard implements CanActivate {
  constructor(private readonly userService: UserInternalService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const routePath = request.route.path;
    const httpMethod = request.method.toLowerCase();
    const permissionName = `${httpMethod}_${routePath}`;
    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('Not sufficient permission');
    }
    const userRolePermission = user.rolePermission;
    const permissions =
      await this.userService.getPermissionListFromRole(userRolePermission);
    const hasPermission = permissions.includes(permissionName);
    if (!hasPermission) {
      throw new ForbiddenException('Not sufficient permission');
    }
    return hasPermission;
  }
}
