import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schema';
import { Model } from 'mongoose';
import {
  RolePermission,
  RolePermissionDocument,
} from '@/modules/shared/role-permissions/schema';

@Injectable()
export class UserInternalService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(RolePermission.name)
    private readonly rolePermissionModel: Model<RolePermissionDocument>,
  ) {}

  async updateInteraction(
    userId: string,
    resourceId: string,
    resourceType: string,
    interactionType: string,
  ) {
    const user = await this.userModel.findOne({
      _id: userId,
      'interactions.resource': resourceId,
    });

    const newInteraction = {
      resource: resourceId,
      resourceType: resourceType,
      interactionType: interactionType,
    };

    if (user) {
      return this.userModel
        .updateOne(
          {
            _id: userId,
            'interactions.resource': resourceId,
          },
          {
            $set: {
              'interactions.$.interactionType': interactionType,
            },
          },
          { new: true },
        )
        .exec();
    } else {
      return this.userModel
        .findByIdAndUpdate(
          userId,
          { $addToSet: { interactions: newInteraction } },
          { new: true, upsert: true },
        )
        .exec();
    }
  }

  async getPermissionListFromRole(role: string) {
    const rolePermission = await this.rolePermissionModel
      .findOne({ roleName: role })
      .exec();
    return rolePermission.permissionList;
  }
}
