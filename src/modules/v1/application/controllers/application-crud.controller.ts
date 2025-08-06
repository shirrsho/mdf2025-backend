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
import { ApplicationCrudService } from '../providers';
import { Application } from '../schema';
import {
  CreateApplicationDto,
  UpdateApplicationDto,
  ApplicationPaginationResponse,
  QueryApplicationDto,
} from '../dtos';
import { OptionDto } from '@/modules/dto';

@ApiTags('v1/application')
@Controller({ path: 'application', version: '1' })
export class ApplicationCrudController extends BaseController {
  constructor(private readonly applicationService: ApplicationCrudService) {
    super();
  }

  @Get('count')
  @UseGuards(AccessTokenGuard, RolePermissionGuard)
  @ApiOperation({
    summary: 'Get application count',
    description:
      'Retrieve the total count of application based on query parameters.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Application count retrieved successfully.',
    schema: {
      type: 'number',
      example: 10,
    },
  })
  @ApiCustomBadRequestResponse('Invalid query parameters.')
  @ApiCustomForbiddenResponse()
  async count(@Query() queryParams: QueryApplicationDto): Promise<number> {
    return await this.applicationService.count(queryParams);
  }

  @Get('option')
  @ApiOperation({
    summary: 'Get all application options',
    description: 'Retrive all application options.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Application options retrived successfully.',
    type: [OptionDto],
  })
  @ApiCustomBadRequestResponse('Invalid request')
  async options(): Promise<OptionDto[]> {
    return await this.applicationService.options();
  }

  @Get('public')
  @ApiOperation({
    summary: 'Get all public applications',
    description: 'Retrive all public applications based on query parameters.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Applications retrived successfully.',
    type: ApplicationPaginationResponse,
  })
  @ApiCustomBadRequestResponse('Invalid query parameters')
  async findAllPublic(
    @Query() queryParams: QueryApplicationDto,
  ): Promise<PaginationResponse<Application>> {
    return await this.applicationService.findAllPublic(queryParams);
  }

  @Get()
  @UseGuards(AccessTokenGuard, RolePermissionGuard)
  @ApiOperation({
    summary: 'Get all applications',
    description: 'Retrive all applications based on query parameters.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Applications retrived successfully.',
    type: ApplicationPaginationResponse,
  })
  @ApiCustomBadRequestResponse('Invalid query parameters')
  @ApiCustomForbiddenResponse()
  async findAll(
    @Query() queryParams: QueryApplicationDto,
  ): Promise<PaginationResponse<Application>> {
    return await this.applicationService.findAll(queryParams);
  }

  @Get('public/:id')
  @ApiOperation({
    summary: 'Get public application by ID',
    description: 'Retrive a application by ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Application retrived successfully.',
    type: Application,
  })
  @ApiCustomBadRequestResponse('Invalid application id')
  @ApiCustomNotFoundResponse('Application not found')
  @ApiParam({ name: 'id', description: 'Application ID' })
  async findByIdPublic(@Param('id') id: string): Promise<Application> {
    const application = await this.applicationService.findByIdPublic(id);
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    return application;
  }

  @Get(':id')
  @UseGuards(AccessTokenGuard, RolePermissionGuard)
  @ApiOperation({
    summary: 'Get application by ID',
    description: 'Retrive a application by ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Application retrived successfully.',
    type: Application,
  })
  @ApiCustomBadRequestResponse('Invalid application id')
  @ApiCustomNotFoundResponse('Application not found')
  @ApiCustomForbiddenResponse()
  @ApiParam({ name: 'id', description: 'Application ID' })
  async findById(@MongoIdParam('id') id: string): Promise<Application> {
    const application = await this.applicationService.findById(id);
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    return application;
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new application',
    description: 'Create a new application if mandatory fields are present',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Application created successfully.',
    type: Application,
  })
  @ApiCustomBadRequestResponse('Invalid input')
  @ApiBody({ type: CreateApplicationDto })
  async create(
    @Body() createApplicationDto: CreateApplicationDto,
  ): Promise<Application> {
    return await this.applicationService.create(createApplicationDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update application by ID',
    description: 'Update application by ID from given fields',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Application updated successfully.',
    type: Application,
  })
  @ApiCustomBadRequestResponse('Invalid input')
  @ApiCustomNotFoundResponse()
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiBody({ type: UpdateApplicationDto })
  async update(
    @MongoIdParam('id') id: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
  ): Promise<Application> {
    const updatedApplication = await this.applicationService.update(
      id,
      updateApplicationDto,
    );
    if (!updatedApplication) {
      throw new NotFoundException('Application not found');
    }
    return updatedApplication;
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard, RolePermissionGuard)
  @ApiOperation({
    summary: 'Delete application by ID',
    description: 'Delete application by ID if present',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Application deleted successfully.',
    type: Application,
  })
  @ApiCustomBadRequestResponse('Invalid id')
  @ApiCustomNotFoundResponse()
  @ApiCustomForbiddenResponse()
  @ApiParam({ name: 'id', description: 'Application ID' })
  async delete(@MongoIdParam('id') id: string): Promise<Application> {
    const deletedApplication = await this.applicationService.delete(id);
    if (!deletedApplication) {
      throw new NotFoundException('Application not found');
    }
    return deletedApplication;
  }
}
