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
import { JobCrudService } from '../providers';
import { Job } from '../schema';
import {
  CreateJobDto,
  UpdateJobDto,
  JobPaginationResponse,
  QueryJobDto,
} from '../dtos';
import { OptionDto } from '@/modules/dto';

@ApiTags('v1/job')
@Controller({ path: 'job', version: '1' })
export class JobCrudController extends BaseController {
  constructor(private readonly jobService: JobCrudService) {
    super();
  }

  @Get('count')
  @UseGuards(AccessTokenGuard, RolePermissionGuard)
  @ApiOperation({
    summary: 'Get job count',
    description:
      'Retrieve the total count of job based on query parameters.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Job count retrieved successfully.',
    schema: {
      type: 'number',
      example: 10,
    },
  })
  @ApiCustomBadRequestResponse('Invalid query parameters.')
  @ApiCustomForbiddenResponse()
  async count(@Query() queryParams: QueryJobDto): Promise<number> {
    return await this.jobService.count(queryParams);
  }

  @Get('option')
  @ApiOperation({
    summary: 'Get all job options',
    description: 'Retrive all job options.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Job options retrived successfully.',
    type: [OptionDto],
  })
  @ApiCustomBadRequestResponse('Invalid request')
  async options(): Promise<OptionDto[]> {
    return await this.jobService.options();
  }

  @Get('public')
  @ApiOperation({
    summary: 'Get all public jobs',
    description: 'Retrive all public jobs based on query parameters.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Jobs retrived successfully.',
    type: JobPaginationResponse,
  })
  @ApiCustomBadRequestResponse('Invalid query parameters')
  async findAllPublic(
    @Query() queryParams: QueryJobDto,
  ): Promise<PaginationResponse<Job>> {
    return await this.jobService.findAllPublic(queryParams);
  }

  @Get()
  @UseGuards(AccessTokenGuard, RolePermissionGuard)
  @ApiOperation({
    summary: 'Get all jobs',
    description: 'Retrive all jobs based on query parameters.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Jobs retrived successfully.',
    type: JobPaginationResponse,
  })
  @ApiCustomBadRequestResponse('Invalid query parameters')
  @ApiCustomForbiddenResponse()
  async findAll(
    @Query() queryParams: QueryJobDto,
  ): Promise<PaginationResponse<Job>> {
    return await this.jobService.findAll(queryParams);
  }

  @Get('public/:id')
  @ApiOperation({
    summary: 'Get public job by ID',
    description: 'Retrive a job by ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Job retrived successfully.',
    type: Job,
  })
  @ApiCustomBadRequestResponse('Invalid job id')
  @ApiCustomNotFoundResponse('Job not found')
  @ApiParam({ name: 'id', description: 'Job ID' })
  async findByIdPublic(@Param('id') id: string): Promise<Job> {
    const job = await this.jobService.findByIdPublic(id);
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    return job;
  }

  @Get(':id')
  @UseGuards(AccessTokenGuard, RolePermissionGuard)
  @ApiOperation({
    summary: 'Get job by ID',
    description: 'Retrive a job by ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Job retrived successfully.',
    type: Job,
  })
  @ApiCustomBadRequestResponse('Invalid job id')
  @ApiCustomNotFoundResponse('Job not found')
  @ApiCustomForbiddenResponse()
  @ApiParam({ name: 'id', description: 'Job ID' })
  async findById(@MongoIdParam('id') id: string): Promise<Job> {
    const job = await this.jobService.findById(id);
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    return job;
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new job',
    description: 'Create a new job if mandatory fields are present',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Job created successfully.',
    type: Job,
  })
  @ApiCustomBadRequestResponse('Invalid input')
  @ApiBody({ type: CreateJobDto })
  async create(
    @Body() createJobDto: CreateJobDto,
  ): Promise<Job> {
    return await this.jobService.create(createJobDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update job by ID',
    description: 'Update job by ID from given fields',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Job updated successfully.',
    type: Job,
  })
  @ApiCustomBadRequestResponse('Invalid input')
  @ApiCustomNotFoundResponse()
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiBody({ type: UpdateJobDto })
  async update(
    @MongoIdParam('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
  ): Promise<Job> {
    const updatedJob = await this.jobService.update(
      id,
      updateJobDto,
    );
    if (!updatedJob) {
      throw new NotFoundException('Job not found');
    }
    return updatedJob;
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard, RolePermissionGuard)
  @ApiOperation({
    summary: 'Delete job by ID',
    description: 'Delete job by ID if present',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Job deleted successfully.',
    type: Job,
  })
  @ApiCustomBadRequestResponse('Invalid id')
  @ApiCustomNotFoundResponse()
  @ApiCustomForbiddenResponse()
  @ApiParam({ name: 'id', description: 'Job ID' })
  async delete(@MongoIdParam('id') id: string): Promise<Job> {
    const deletedJob = await this.jobService.delete(id);
    if (!deletedJob) {
      throw new NotFoundException('Job not found');
    }
    return deletedJob;
  }
}
