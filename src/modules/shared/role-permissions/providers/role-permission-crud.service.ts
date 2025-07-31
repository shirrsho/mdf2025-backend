import {
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from '@/modules/base';
import { RolePermission, RolePermissionDocument } from '../schema';
import { OptionDto } from '@/modules/dto';
import { CreateRolePermissionDto, UpdateRolePermissionDto } from '../dtos';
import { RoutesGeneralService } from '../../routes/providers';

@Injectable()
export class RolePermissionCrudService extends BaseService<RolePermissionCrudService> {
  constructor(
    @InjectModel(RolePermission.name)
    private readonly rolePermissionModel: Model<RolePermissionDocument>,
    private readonly routeService: RoutesGeneralService,
  ) {
    super(RolePermissionCrudService.name);
    this.init();
  }

  private async createAdminRole(permissions: string[]) {
    const adminRole = await this.rolePermissionModel.create({
      roleName: 'admin',
      permissionList: permissions,
    });
    return adminRole.save();
  }

  private async createUserRole(permissions: string[]) {
    const userRole = await this.rolePermissionModel.create({
      roleName: 'user',
      permissionList: permissions,
    });
    return userRole.save();
  }

  private async createGuestRole(permissions: string[]) {
    const userRole = await this.rolePermissionModel.create({
      roleName: 'guest',
      permissionList: permissions,
    });
    return userRole.save();
  }

  private async createTemporaryRole(permissions: string[]) {
    const userRole = await this.rolePermissionModel.create({
      roleName: 'temporary',
      permissionList: permissions,
    });
    return userRole.save();
  }

  async updateAdminRole() {
    const permissions = await this.routeService.getAllPermissionsName();
    const paths = await this.routeService.getAllFrontendPath();
    const adminRole = await this.rolePermissionModel
      .findOne({ roleName: 'admin' })
      .exec();
    adminRole.permissionList = permissions;
    adminRole.frontendPath = paths;
    return adminRole.save();
  }

  async init() {
    try {
      await this.seed();
      await this.updateAdminRole();
    } catch (e) {
      this.logger.error(e);
    }
  }

  async seed() {
    const roleCount = await this.rolePermissionModel.countDocuments();
    if (roleCount > 0) {
      return;
    }
    const permissions = await this.routeService.getAllPermissionsName();
    const adminRole = await this.rolePermissionModel
      .findOne({ roleName: 'admin' })
      .exec();
    if (!adminRole) {
      await this.createAdminRole(permissions);
    }
    const userRole = await this.rolePermissionModel
      .findOne({ roleName: 'user' })
      .exec();
    if (!userRole) {
      await this.createUserRole([]);
    }
    const gusetRole = await this.rolePermissionModel
      .findOne({ roleName: 'guest' })
      .exec();
    if (!gusetRole) {
      await this.createGuestRole([]);
    }
    const temporaryRole = await this.rolePermissionModel
      .findOne({ roleName: 'temporary' })
      .exec();
    if (!temporaryRole) {
      await this.createTemporaryRole([]);
    }
    return;
  }

  async options(): Promise<OptionDto[]> {
    const rolePermissions = await this.rolePermissionModel
      .find()
      .select('roleName')
      .exec();
    return rolePermissions.map((rolePermission) => ({
      label: rolePermission.roleName,
      value: rolePermission._id,
    }));
  }

  async nameOptions(): Promise<OptionDto[]> {
    const rolePermissions = await this.rolePermissionModel
      .find()
      .select('roleName')
      .exec();
    return rolePermissions.map((rolePermission) => ({
      label: rolePermission.roleName.toUpperCase(),
      value: rolePermission.roleName,
    }));
  }

  async userFrontendPermissions(rolePermission: string): Promise<string[]> {
    if (!rolePermission) return [];
    const role = await this.rolePermissionModel
      .findOne({ roleName: rolePermission })
      .exec();
    return role.frontendPath;
  }

  async create(
    createRolePermission: CreateRolePermissionDto,
  ): Promise<RolePermissionDocument> {
    try {
      const template =
        await this.rolePermissionModel.create(createRolePermission);
      return template.save();
    } catch (error) {
      if (error) {
        if (error?.code === 11000) {
          throw new ConflictException('Role already exists');
        }
        throw new HttpException(error?.message, error?.status ?? 500, {
          cause: error,
        });
      }
    }
  }

  async findAll() {
    return await this.rolePermissionModel.find().exec();
  }

  async findById(id: string): Promise<RolePermissionDocument> {
    const template = await this.rolePermissionModel.findById(id).exec();
    if (!template) {
      throw new NotFoundException('Role not found');
    }
    return template;
  }

  async update(
    id: string,
    updateRolePermissionDto: UpdateRolePermissionDto,
  ): Promise<RolePermissionDocument> {
    try {
      const updatedRolePermission = await this.rolePermissionModel
        .findByIdAndUpdate(id, updateRolePermissionDto, { new: true })
        .exec();
      if (!updatedRolePermission) {
        throw new NotFoundException('Role not found');
      }
      return updatedRolePermission;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Role already exists');
      }
      throw new HttpException(error?.message, error?.status ?? 500, {
        cause: error,
      });
    }
  }

  async delete(id: string): Promise<RolePermissionDocument> {
    const deletedRolePermission = await this.rolePermissionModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedRolePermission) {
      throw new NotFoundException('Role not found');
    }
    return deletedRolePermission;
  }
}
