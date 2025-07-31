import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BaseController } from '@/modules/base';
import { Role } from '@/modules/enum';
import { PaginationResponse } from '@/modules/utils';
import { ExceptionResponse } from '@/modules/dto';
import { AccessTokenGuard, RoleGuard } from '@/modules/shared/auth/guards';
import { IdempotencyService } from '@/modules/shared/idempotency';
import {
  ApiCustomBadRequestResponse,
  HasRoles,
  ReqUser,
} from '@/modules/decorator';
import {
  CreateUserDto,
  UpdateUserDto,
  DynamicDto,
  UserPaginationResponse,
} from '../dtos';
import { UserCurdService } from '../providers';
import { User, UserDocument } from '../schema';

@ApiTags('v1/user')
@Controller({ path: 'user', version: '1' })
export class UserCurdController extends BaseController {
  constructor(
    private readonly userService: UserCurdService,
    private readonly idempotencyService: IdempotencyService,
  ) {
    super();
  }

  @Get('count')
  @ApiOperation({
    summary: 'Get user count',
    description: 'Retrieve the total count of users based on query parameters.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User count retrieved successfully.',
    schema: {
      type: 'number',
      example: 10,
    },
  })
  @ApiCustomBadRequestResponse('Invalid query parameters.')
  @ApiQuery({ type: DynamicDto })
  async count(@Query() queryParams: DynamicDto): Promise<number> {
    return await this.userService.count(queryParams);
  }

  @Get('options')
  @UseGuards(AccessTokenGuard, RoleGuard)
  @HasRoles(Role.ADMIN, Role.USER)
  @ApiOperation({
    summary: 'Get user options',
    description: 'Fetch user options based on query parameters.',
  })
  @ApiQuery({ type: DynamicDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User options retrieved successfully.',
    schema: {
      type: 'object',
      example: [
        {
          label: 'user.name',
          value: 'user._id',
          imageUrl: 'user.imageUrl',
          description: 'user.description',
        },
      ],
    },
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied.',
    type: ExceptionResponse,
  })
  @ApiCustomBadRequestResponse('Invalid query parameters.')
  async options(@Query() queryParams: DynamicDto) {
    return await this.userService.options(queryParams);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve a paginated list of all users.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Users retrieved successfully.',
    type: UserPaginationResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid query parameters.',
    type: ExceptionResponse,
  })
  @ApiQuery({ type: DynamicDto })
  async findAll(
    @Query() queryParams: DynamicDto,
  ): Promise<PaginationResponse<User>> {
    return await this.userService.findAll(queryParams);
  }

  @Get(':id')
  @UseGuards(AccessTokenGuard, RoleGuard)
  @HasRoles(Role.ADMIN, Role.USER)
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve a user by their unique ID.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User retrieved successfully.',
    type: User,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found.',
    type: ExceptionResponse,
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  async findById(@Param('id') id: string): Promise<User> {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Post()
  @UseGuards(AccessTokenGuard, RoleGuard)
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Create a new user in the system.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created successfully.',
    type: User,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid data provided.',
    type: ExceptionResponse,
  })
  @ApiBody({ type: CreateUserDto })
  async create(
    @Body() createUserDto: CreateUserDto,
    @Req() request: Request,
  ): Promise<User> {
    const ret = await this.idempotencyService.processNewRequest(request.body);
    if (ret.isNewId) {
      try {
        const res = await this.userService.create(createUserDto);
        await this.idempotencyService.saveToRedis(ret.hash, res);
        return res;
      } catch (err) {
        await this.idempotencyService.removeFromRedis(ret.hash);
        throw err;
      }
    } else {
      console.log('from redis');
      return ret;
    }
  }

  @Put(':id')
  @UseGuards(AccessTokenGuard, RoleGuard)
  @HasRoles(Role.ADMIN, Role.USER)
  @ApiOperation({
    summary: 'Update user by ID',
    description: 'Update an existing user by their ID.',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User updated successfully.',
    type: User,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found.',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User verification failed.',
    type: ExceptionResponse,
  })
  @ApiBody({ type: UpdateUserDto })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @ReqUser() user: UserDocument,
  ): Promise<User> {
    if (user._id.toHexString() !== id) {
      throw new NotFoundException('User not verified');
    }
    const updatedUser = await this.userService.update(id, updateUserDto);
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return updatedUser;
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard, RoleGuard)
  @HasRoles(Role.ADMIN, Role.USER)
  @ApiOperation({
    summary: 'Delete user by ID',
    description: 'Delete a user by their unique ID.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User deleted successfully.',
    type: User,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found.',
    type: ExceptionResponse,
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  async delete(@Param('id') id: string): Promise<User> {
    const deletedUser = await this.userService.delete(id);
    if (!deletedUser) {
      throw new NotFoundException('User not found');
    }
    return deletedUser;
  }
}
