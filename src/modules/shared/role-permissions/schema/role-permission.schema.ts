import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { slugify } from '@/modules/utils';

@Schema({
  timestamps: true,
})
export class RolePermission {
  @Prop({ required: true, unique: true })
  roleName: string;

  @Prop({ required: true, type: [String], default: [] })
  permissionList: string[];

  @Prop({ required: true, type: [String], default: [] })
  frontendPath: string[];
}

export type RolePermissionDocument = HydratedDocument<RolePermission>;
export const RolePermissionSchema =
  SchemaFactory.createForClass(RolePermission);

RolePermissionSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

RolePermissionSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
    delete ret.updatedAt;
    return ret;
  },
});

RolePermissionSchema.pre('save', function (next) {
  if (this.isModified('title') || this.isNew) {
    this.roleName = slugify(this.roleName);
  }
  next();
});

RolePermissionSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as any;
  if (update?.roleName) {
    update.roleName = slugify(update.roleName);
  }
  next();
});
