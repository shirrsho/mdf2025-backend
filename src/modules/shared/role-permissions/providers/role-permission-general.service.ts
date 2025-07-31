import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RolePermission, RolePermissionDocument } from '../schema';

@Injectable()
export class RolePermissionGeneralService {
  constructor(
    @InjectModel(RolePermission.name)
    private readonly rolePermissionModel: Model<RolePermissionDocument>,
  ) {}

  async getPermissionListFromRole(role: string) {
    const rolePermission = await this.rolePermissionModel
      .findOne({ roleName: role })
      .exec();
    return rolePermission.permissionList;
  }
}
