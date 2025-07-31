import {
  Body,
  Controller,
  HttpStatus,
  NotFoundException,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@/modules/enum';
import {
  ApiCustomBadRequestResponse,
  ApiCustomNotFoundResponse,
  HasRoles,
  MongoIdParam,
} from '@/modules/decorator';
import { BaseController } from '@/modules/base';
import { AccessTokenGuard, RoleGuard } from '@/modules/shared/auth/guards';
import { CreateUserDto, UpdateUserDto, VerifyUserDto } from '../dtos';
import { UserGeneralService } from '../providers';
import { User } from '../schema';

@ApiTags('v1/user')
@Controller({ path: 'user', version: '1' })
export class UserGeneralController extends BaseController {
  constructor(private readonly userService: UserGeneralService) {
    super();
  }

  @Put('verify/:id')
  @UseGuards(AccessTokenGuard, RoleGuard)
  @HasRoles(Role.ADMIN)
  @ApiOperation({ summary: 'Update user by ID by admin' })
  @ApiOperation({
    summary: 'Update user by ID',
    description: 'Update user by ID from given fields',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User updated successfully.',
    type: User,
  })
  @ApiCustomBadRequestResponse('Invalid input')
  @ApiCustomNotFoundResponse()
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: VerifyUserDto })
  async verifyUser(
    @MongoIdParam('id') id: string,
    @Body() updateUserDto: VerifyUserDto,
  ): Promise<User> {
    const updatedUser = await this.userService.verifyUserByAdmin(
      id,
      updateUserDto,
    );
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return updatedUser;
  }

  @Post('adduser')
  @UseGuards(AccessTokenGuard, RoleGuard)
  @HasRoles(Role.ADMIN)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created successfully.',
    type: User,
  })
  @ApiOperation({ summary: 'Create a new user by admin' })
  @ApiCustomBadRequestResponse('Invalid input')
  @ApiBody({ type: CreateUserDto })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.userService.addUser(createUserDto);
  }

  @Put('adduser/:id')
  @UseGuards(AccessTokenGuard, RoleGuard)
  @HasRoles(Role.ADMIN)
  @ApiOperation({ summary: 'Update user by ID by admin' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User role and status added successfully.',
    type: User,
  })
  @ApiCustomBadRequestResponse('Invalid input')
  @ApiCustomNotFoundResponse()
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  async update(
    @MongoIdParam('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const updatedUser = await this.userService.updateUserByAdmin(
      id,
      updateUserDto,
    );
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return updatedUser;
  }
}
