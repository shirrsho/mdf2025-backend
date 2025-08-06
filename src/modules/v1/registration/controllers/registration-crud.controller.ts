import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AccessTokenGuard, RolePermissionGuard } from '@/modules/shared';
import { PaginationResponse } from '@/modules/utils';
import {
  ApiCustomBadRequestResponse,
  ApiCustomForbiddenResponse,
  ApiCustomNotFoundResponse,
  MongoIdParam,
} from '@/modules/decorator';
import { BaseController } from '@/modules/base';
import { RegistrationCrudService } from '../providers';
import { Registration } from '../schema';
import {
  CreateRegistrationDto,
  UpdateRegistrationDto,
  RegistrationPaginationResponse,
  QueryRegistrationDto,
} from '../dtos';
import { OptionDto } from '@/modules/dto';

@ApiTags('v1/registration')
@Controller({ path: 'registration', version: '1' })
export class RegistrationCrudController extends BaseController {
  constructor(private readonly registrationService: RegistrationCrudService) {
    super();
  }

  @Get('count')
  @UseGuards(AccessTokenGuard, RolePermissionGuard)
  @ApiOperation({
    summary: 'Get registration count',
    description:
      'Retrieve the total count of registration based on query parameters.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Registration count retrieved successfully.',
    schema: {
      type: 'number',
      example: 10,
    },
  })
  @ApiCustomBadRequestResponse('Invalid query parameters.')
  @ApiCustomForbiddenResponse()
  async count(@Query() queryParams: QueryRegistrationDto): Promise<number> {
    return await this.registrationService.count(queryParams);
  }

  @Get('option')
  @ApiOperation({
    summary: 'Get all registration options',
    description: 'Retrive all registration options.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Registration options retrived successfully.',
    type: [OptionDto],
  })
  @ApiCustomBadRequestResponse('Invalid request')
  async options(): Promise<OptionDto[]> {
    return await this.registrationService.options();
  }

  @Get('public')
  @ApiOperation({
    summary: 'Get all public registrations',
    description: 'Retrive all public registrations based on query parameters.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Registrations retrived successfully.',
    type: RegistrationPaginationResponse,
  })
  @ApiCustomBadRequestResponse('Invalid query parameters')
  async findAllPublic(
    @Query() queryParams: QueryRegistrationDto,
  ): Promise<PaginationResponse<Registration>> {
    return await this.registrationService.findAllPublic(queryParams);
  }

  @Get()
  @UseGuards(AccessTokenGuard, RolePermissionGuard)
  @ApiOperation({
    summary: 'Get all registrations',
    description: 'Retrive all registrations based on query parameters.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Registrations retrived successfully.',
    type: RegistrationPaginationResponse,
  })
  @ApiCustomBadRequestResponse('Invalid query parameters')
  @ApiCustomForbiddenResponse()
  async findAll(
    @Query() queryParams: QueryRegistrationDto,
  ): Promise<PaginationResponse<Registration>> {
    return await this.registrationService.findAll(queryParams);
  }

  @Get('public/:id')
  @ApiOperation({
    summary: 'Get public registration by ID',
    description: 'Retrive a registration by ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Registration retrived successfully.',
    type: Registration,
  })
  @ApiCustomBadRequestResponse('Invalid registration id')
  @ApiCustomNotFoundResponse('Registration not found')
  @ApiParam({ name: 'id', description: 'Registration ID' })
  async findByIdPublic(@Param('id') id: string): Promise<Registration> {
    const registration = await this.registrationService.findByIdPublic(id);
    if (!registration) {
      throw new NotFoundException('Registration not found');
    }
    return registration;
  }

  @Get(':id')
  @UseGuards(AccessTokenGuard, RolePermissionGuard)
  @ApiOperation({
    summary: 'Get registration by ID',
    description: 'Retrive a registration by ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Registration retrived successfully.',
    type: Registration,
  })
  @ApiCustomBadRequestResponse('Invalid registration id')
  @ApiCustomNotFoundResponse('Registration not found')
  @ApiCustomForbiddenResponse()
  @ApiParam({ name: 'id', description: 'Registration ID' })
  async findById(@MongoIdParam('id') id: string): Promise<Registration> {
    const registration = await this.registrationService.findById(id);
    if (!registration) {
      throw new NotFoundException('Registration not found');
    }
    return registration;
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new registration',
    description: 'Create a new registration if mandatory fields are present',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Registration created successfully.',
    type: Registration,
  })
  @ApiCustomBadRequestResponse('Invalid input')
  @ApiBody({ type: CreateRegistrationDto })
  async create(
    @Body() createRegistrationDto: CreateRegistrationDto,
  ): Promise<Registration> {
    return await this.registrationService.create(createRegistrationDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update registration by ID',
    description: 'Update registration by ID from given fields',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Registration updated successfully.',
    type: Registration,
  })
  @ApiCustomBadRequestResponse('Invalid input')
  @ApiCustomNotFoundResponse()
  @ApiParam({ name: 'id', description: 'Registration ID' })
  @ApiBody({ type: UpdateRegistrationDto })
  async update(
    @MongoIdParam('id') id: string,
    @Body() updateRegistrationDto: UpdateRegistrationDto,
  ): Promise<Registration> {
    const updatedRegistration = await this.registrationService.update(
      id,
      updateRegistrationDto,
    );
    if (!updatedRegistration) {
      throw new NotFoundException('Registration not found');
    }
    return updatedRegistration;
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard, RolePermissionGuard)
  @ApiOperation({
    summary: 'Delete registration by ID',
    description: 'Delete registration by ID if present',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Registration deleted successfully.',
    type: Registration,
  })
  @ApiCustomBadRequestResponse('Invalid id')
  @ApiCustomNotFoundResponse()
  @ApiCustomForbiddenResponse()
  @ApiParam({ name: 'id', description: 'Registration ID' })
  async delete(@MongoIdParam('id') id: string): Promise<Registration> {
    const deletedRegistration = await this.registrationService.delete(id);
    if (!deletedRegistration) {
      throw new NotFoundException('Registration not found');
    }
    return deletedRegistration;
  }
}
