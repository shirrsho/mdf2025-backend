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
  ApiQuery,
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
import { WebinarCrudService, WebinarValidationService } from '../providers';
import { Webinar } from '../schema';
import {
  CreateWebinarDto,
  UpdateWebinarDto,
  WebinarPaginationResponse,
  QueryWebinarDto,
} from '../dtos';
import { OptionDto } from '@/modules/dto';
import { WebinarStatus } from '@/modules/enum';

@ApiTags('v1/webinar')
@Controller({ path: 'webinar', version: '1' })
export class WebinarCrudController extends BaseController {
  constructor(
    private readonly webinarService: WebinarCrudService,
    private readonly webinarValidationService: WebinarValidationService,
  ) {
    super();
  }

  @Get('count')
  @UseGuards(AccessTokenGuard, RolePermissionGuard)
  @ApiOperation({
    summary: 'Get webinar count',
    description:
      'Retrieve the total count of webinar based on query parameters.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Webinar count retrieved successfully.',
    schema: {
      type: 'number',
      example: 10,
    },
  })
  @ApiCustomBadRequestResponse('Invalid query parameters.')
  @ApiCustomForbiddenResponse()
  async count(@Query() queryParams: QueryWebinarDto): Promise<number> {
    return await this.webinarService.count(queryParams);
  }

  @Get('option')
  @ApiOperation({
    summary: 'Get all webinar options',
    description: 'Retrive all webinar options.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Webinar options retrived successfully.',
    type: [OptionDto],
  })
  @ApiCustomBadRequestResponse('Invalid request')
  async options(): Promise<OptionDto[]> {
    return await this.webinarService.options();
  }

  @Get('available-slots/:timeslotId')
  @ApiOperation({
    summary: 'Get available time slots within a timeslot',
    description: 'Find available time slots within a specific timeslot for a given webinar duration.',
  })
  @ApiParam({ 
    name: 'timeslotId', 
    description: 'Timeslot ID to check for availability',
    type: 'string'
  })
  @ApiQuery({
    name: 'duration',
    description: 'Webinar duration in minutes',
    type: Number,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Available time slots retrieved successfully.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          startTime: { type: 'string', format: 'date-time' },
          endTime: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiCustomBadRequestResponse('Invalid timeslot ID or duration')
  @ApiCustomNotFoundResponse('Timeslot not found')
  async getAvailableSlots(
    @MongoIdParam('timeslotId') timeslotId: string,
    @Query('duration') duration: number,
  ): Promise<{ startTime: Date; endTime: Date }[]> {
    const validDuration = this.webinarValidationService.validateWebinarDuration(duration);
    return await this.webinarValidationService.findAvailableTimeSlots(
      timeslotId,
      validDuration,
    );
  }

  @Get('public')
  @ApiOperation({
    summary: 'Get all public webinars',
    description: 'Retrive all public webinars based on query parameters.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Webinars retrived successfully.',
    type: WebinarPaginationResponse,
  })
  @ApiCustomBadRequestResponse('Invalid query parameters')
  async findAllPublic(
    @Query() queryParams: QueryWebinarDto,
  ): Promise<PaginationResponse<Webinar>> {
    return await this.webinarService.findAllPublic(queryParams);
  }

  @Get()
  @UseGuards(AccessTokenGuard, RolePermissionGuard)
  @ApiOperation({
    summary: 'Get all webinars',
    description: 'Retrive all webinars based on query parameters.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Webinars retrived successfully.',
    type: WebinarPaginationResponse,
  })
  @ApiCustomBadRequestResponse('Invalid query parameters')
  @ApiCustomForbiddenResponse()
  async findAll(
    @Query() queryParams: QueryWebinarDto,
  ): Promise<PaginationResponse<Webinar>> {
    return await this.webinarService.findAll(queryParams);
  }

  @Get('public/:id')
  @ApiOperation({
    summary: 'Get public webinar by ID',
    description: 'Retrive a webinar by ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Webinar retrived successfully.',
    type: Webinar,
  })
  @ApiCustomBadRequestResponse('Invalid webinar id')
  @ApiCustomNotFoundResponse('Webinar not found')
  @ApiParam({ name: 'id', description: 'Webinar ID' })
  async findByIdPublic(@Param('id') id: string): Promise<Webinar> {
    const webinar = await this.webinarService.findByIdPublic(id);
    if (!webinar) {
      throw new NotFoundException('Webinar not found');
    }
    return webinar;
  }

  @Get(':id')
  @UseGuards(AccessTokenGuard, RolePermissionGuard)
  @ApiOperation({
    summary: 'Get webinar by ID',
    description: 'Retrive a webinar by ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Webinar retrived successfully.',
    type: Webinar,
  })
  @ApiCustomBadRequestResponse('Invalid webinar id')
  @ApiCustomNotFoundResponse('Webinar not found')
  @ApiCustomForbiddenResponse()
  @ApiParam({ name: 'id', description: 'Webinar ID' })
  async findById(@MongoIdParam('id') id: string): Promise<Webinar> {
    const webinar = await this.webinarService.findById(id);
    if (!webinar) {
      throw new NotFoundException('Webinar not found');
    }
    return webinar;
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new webinar',
    description: 'Create a new webinar if mandatory fields are present',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Webinar created successfully.',
    type: Webinar,
  })
  @ApiCustomBadRequestResponse('Invalid input')
  @ApiBody({ type: CreateWebinarDto })
  async create(
    @Body() createWebinarDto: CreateWebinarDto,
  ): Promise<Webinar> {
    return await this.webinarService.create(createWebinarDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update webinar by ID',
    description: 'Update webinar by ID from given fields',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Webinar updated successfully.',
    type: Webinar,
  })
  @ApiCustomBadRequestResponse('Invalid input')
  @ApiCustomNotFoundResponse()
  @ApiParam({ name: 'id', description: 'Webinar ID' })
  @ApiBody({ type: UpdateWebinarDto })
  async update(
    @MongoIdParam('id') id: string,
    @Body() updateWebinarDto: UpdateWebinarDto,
  ): Promise<Webinar> {
    const updatedWebinar = await this.webinarService.update(
      id,
      updateWebinarDto,
    );
    if (!updatedWebinar) {
      throw new NotFoundException('Webinar not found');
    }
    return updatedWebinar;
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard, RolePermissionGuard)
  @ApiOperation({
    summary: 'Delete webinar by ID',
    description: 'Delete webinar by ID if present',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Webinar deleted successfully.',
    type: Webinar,
  })
  @ApiCustomBadRequestResponse('Invalid id')
  @ApiCustomNotFoundResponse()
  @ApiCustomForbiddenResponse()
  @ApiParam({ name: 'id', description: 'Webinar ID' })
  async delete(@MongoIdParam('id') id: string): Promise<Webinar> {
    const deletedWebinar = await this.webinarService.delete(id);
    if (!deletedWebinar) {
      throw new NotFoundException('Webinar not found');
    }
    return deletedWebinar;
  }
}
