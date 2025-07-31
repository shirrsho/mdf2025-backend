import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BaseController } from '@/modules/base';
import { RolePermissionCrudService } from '../providers';
import { OptionDto } from '@/modules/dto';
import {
  ApiCustomBadRequestResponse,
  ApiCustomNotFoundResponse,
  HasRoles,
  MongoIdParam,
  ReqUser,
} from '@/modules/decorator';
import {
  AccessTokenGuard,
  AccessTokenOptionalGuard,
  RoleGuard,
} from '../../auth';
import { Role } from '@/modules/enum';
import { RolePermission } from '../schema';
import { CreateRolePermissionDto, UpdateRolePermissionDto } from '../dtos';

@ApiTags('v1/role-permission')
@Controller({ path: 'role-permission', version: '1' })
export class RolePermissionCrudController extends BaseController {
  constructor(
    private readonly rolePermissionService: RolePermissionCrudService,
  ) {
    super();
  }

  @Get('name-option')
  @ApiOperation({
    summary: 'Get all role options name',
    description: 'Retrive all role options name.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role options retrived successfully.',
    type: [OptionDto],
  })
  @ApiCustomBadRequestResponse('Invalid request')
  async nameOptions(): Promise<OptionDto[]> {
    return await this.rolePermissionService.nameOptions();
  }

  @Get('option')
  @ApiOperation({
    summary: 'Get all role options',
    description: 'Retrive all role options.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role options retrived successfully.',
    type: [OptionDto],
  })
  @ApiCustomBadRequestResponse('Invalid request')
  async options(): Promise<OptionDto[]> {
    return await this.rolePermissionService.options();
  }

  @Get('refresh-admin')
  @ApiOperation({
    summary: 'Refresh admin permissions',
    description: 'Add all permissions to admin',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role updated successfully.',
  })
  @ApiCustomBadRequestResponse('Invalid request')
  async refresh() {
    return await this.rolePermissionService.updateAdminRole();
  }

  @UseGuards(AccessTokenOptionalGuard)
  @Get('user-frontend-permission')
  @ApiOperation({
    summary: 'Get user permissions',
    description: 'Get user frontend permissions',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fetched successfully.',
  })
  @ApiCustomBadRequestResponse('Invalid request')
  async userFrontendPermissions(@ReqUser() user) {
    return await this.rolePermissionService.userFrontendPermissions(
      user?.rolePermission,
    );
  }

  @Get()
  @UseGuards(AccessTokenGuard, RoleGuard)
  @HasRoles(Role.ADMIN)
  @ApiOperation({
    summary: 'Get all role',
    description: 'Retrive all role',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role retrived successfully.',
    type: [RolePermission],
  })
  async findAll() {
    return await this.rolePermissionService.findAll();
  }

  @Get(':id')
  @UseGuards(AccessTokenGuard, RoleGuard)
  @HasRoles(Role.ADMIN)
  @ApiOperation({
    summary: 'Get role by ID',
    description: 'Retrive a role by ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role retrived successfully.',
    type: RolePermission,
  })
  @ApiCustomBadRequestResponse('Invalid role id')
  @ApiCustomNotFoundResponse('Role not found')
  @ApiParam({ name: 'id', description: 'Role ID' })
  async findById(@MongoIdParam('id') id: string): Promise<RolePermission> {
    const template = await this.rolePermissionService.findById(id);
    if (!template) {
      throw new NotFoundException('Role not found');
    }
    return template;
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new role',
    description: 'Create a new role if mandatory fields are present',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Role created successfully.',
    type: RolePermission,
  })
  @ApiCustomBadRequestResponse('Invalid input')
  @ApiBody({ type: CreateRolePermissionDto })
  async create(
    @Body() createRolePermissionDto: CreateRolePermissionDto,
  ): Promise<RolePermission> {
    return await this.rolePermissionService.create(createRolePermissionDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update role by ID',
    description: 'Update role by ID from given fields',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Role updated successfully.',
    type: RolePermission,
  })
  @ApiCustomBadRequestResponse('Invalid input')
  @ApiCustomNotFoundResponse()
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiBody({ type: UpdateRolePermissionDto })
  async update(
    @MongoIdParam('id') id: string,
    @Body() updateRolePermissionDto: UpdateRolePermissionDto,
  ): Promise<RolePermission> {
    const updatedRolePermission = await this.rolePermissionService.update(
      id,
      updateRolePermissionDto,
    );
    if (!updatedRolePermission) {
      throw new NotFoundException('Role not found');
    }
    return updatedRolePermission;
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard, RoleGuard)
  @HasRoles(Role.ADMIN)
  @ApiOperation({
    summary: 'Delete role by ID',
    description: 'Delete role by ID if present',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role deleted successfully.',
    type: RolePermission,
  })
  @ApiCustomBadRequestResponse('Invalid id')
  @ApiCustomNotFoundResponse()
  @ApiParam({ name: 'id', description: 'Role ID' })
  async delete(@MongoIdParam('id') id: string): Promise<RolePermission> {
    const deletedRolePermission = await this.rolePermissionService.delete(id);
    if (!deletedRolePermission) {
      throw new NotFoundException('Role not found');
    }
    return deletedRolePermission;
  }
}
