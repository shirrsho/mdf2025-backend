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
import { TimeslotCrudService } from '../providers';
import { Timeslot } from '../schema';
import {
  CreateTimeslotDto,
  UpdateTimeslotDto,
  TimeslotPaginationResponse,
  QueryTimeslotDto,
} from '../dtos';
import { OptionDto } from '@/modules/dto';

@ApiTags('v1/timeslot')
@Controller({ path: 'timeslot', version: '1' })
export class TimeslotCrudController extends BaseController {
  constructor(private readonly timeslotService: TimeslotCrudService) {
    super();
  }

  @Get('available')
  @ApiOperation({
    summary: 'Get all timeslots',
    description: 'Retrieve all timeslots.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Timeslots retrieved successfully.',
    type: [Timeslot],
  })
  @ApiCustomBadRequestResponse('Invalid request')
  async getAvailableTimeslots(): Promise<Timeslot[]> {
    const result = await this.timeslotService.findAllPublic({});
    return result.data;
  }

  @Get('count')
  @UseGuards(AccessTokenGuard, RolePermissionGuard)
  @ApiOperation({
    summary: 'Get timeslot count',
    description:
      'Retrieve the total count of timeslot based on query parameters.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Timeslot count retrieved successfully.',
    schema: {
      type: 'number',
      example: 10,
    },
  })
  @ApiCustomBadRequestResponse('Invalid query parameters.')
  @ApiCustomForbiddenResponse()
  async count(@Query() queryParams: QueryTimeslotDto): Promise<number> {
    return await this.timeslotService.count(queryParams);
  }

  @Get('option')
  @ApiOperation({
    summary: 'Get all timeslot options',
    description: 'Retrive all timeslot options.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Timeslot options retrived successfully.',
    type: [OptionDto],
  })
  @ApiCustomBadRequestResponse('Invalid request')
  async options(): Promise<OptionDto[]> {
    return await this.timeslotService.options();
  }

  @Get('public')
  @ApiOperation({
    summary: 'Get all public timeslots',
    description: 'Retrive all public timeslots based on query parameters.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Timeslots retrived successfully.',
    type: TimeslotPaginationResponse,
  })
  @ApiCustomBadRequestResponse('Invalid query parameters')
  async findAllPublic(
    @Query() queryParams: QueryTimeslotDto,
  ): Promise<PaginationResponse<Timeslot>> {
    return await this.timeslotService.findAllPublic(queryParams);
  }

  @Get()
  @UseGuards(AccessTokenGuard, RolePermissionGuard)
  @ApiOperation({
    summary: 'Get all timeslots',
    description: 'Retrive all timeslots based on query parameters.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Timeslots retrived successfully.',
    type: TimeslotPaginationResponse,
  })
  @ApiCustomBadRequestResponse('Invalid query parameters')
  @ApiCustomForbiddenResponse()
  async findAll(
    @Query() queryParams: QueryTimeslotDto,
  ): Promise<PaginationResponse<Timeslot>> {
    return await this.timeslotService.findAll(queryParams);
  }

  @Get('public/:id')
  @ApiOperation({
    summary: 'Get public timeslot by ID',
    description: 'Retrive a timeslot by ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Timeslot retrived successfully.',
    type: Timeslot,
  })
  @ApiCustomBadRequestResponse('Invalid timeslot id')
  @ApiCustomNotFoundResponse('Timeslot not found')
  @ApiParam({ name: 'id', description: 'Timeslot ID' })
  async findByIdPublic(@Param('id') id: string): Promise<Timeslot> {
    const timeslot = await this.timeslotService.findByIdPublic(id);
    if (!timeslot) {
      throw new NotFoundException('Timeslot not found');
    }
    return timeslot;
  }

  @Get(':id')
  @UseGuards(AccessTokenGuard, RolePermissionGuard)
  @ApiOperation({
    summary: 'Get timeslot by ID',
    description: 'Retrive a timeslot by ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Timeslot retrived successfully.',
    type: Timeslot,
  })
  @ApiCustomBadRequestResponse('Invalid timeslot id')
  @ApiCustomNotFoundResponse('Timeslot not found')
  @ApiCustomForbiddenResponse()
  @ApiParam({ name: 'id', description: 'Timeslot ID' })
  async findById(@MongoIdParam('id') id: string): Promise<Timeslot> {
    const timeslot = await this.timeslotService.findById(id);
    if (!timeslot) {
      throw new NotFoundException('Timeslot not found');
    }
    return timeslot;
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new timeslot',
    description: 'Create a new timeslot if mandatory fields are present',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Timeslot created successfully.',
    type: Timeslot,
  })
  @ApiCustomBadRequestResponse('Invalid input')
  @ApiBody({ type: CreateTimeslotDto })
  async create(
    @Body() createTimeslotDto: CreateTimeslotDto,
  ): Promise<Timeslot> {
    return await this.timeslotService.create(createTimeslotDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update timeslot by ID',
    description: 'Update timeslot by ID from given fields',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Timeslot updated successfully.',
    type: Timeslot,
  })
  @ApiCustomBadRequestResponse('Invalid input')
  @ApiCustomNotFoundResponse()
  @ApiParam({ name: 'id', description: 'Timeslot ID' })
  @ApiBody({ type: UpdateTimeslotDto })
  async update(
    @MongoIdParam('id') id: string,
    @Body() updateTimeslotDto: UpdateTimeslotDto,
  ): Promise<Timeslot> {
    const updatedTimeslot = await this.timeslotService.update(
      id,
      updateTimeslotDto,
    );
    if (!updatedTimeslot) {
      throw new NotFoundException('Timeslot not found');
    }
    return updatedTimeslot;
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard, RolePermissionGuard)
  @ApiOperation({
    summary: 'Delete timeslot by ID',
    description: 'Delete timeslot by ID if present',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Timeslot deleted successfully.',
    type: Timeslot,
  })
  @ApiCustomBadRequestResponse('Invalid id')
  @ApiCustomNotFoundResponse()
  @ApiCustomForbiddenResponse()
  @ApiParam({ name: 'id', description: 'Timeslot ID' })
  async delete(@MongoIdParam('id') id: string): Promise<Timeslot> {
    const deletedTimeslot = await this.timeslotService.delete(id);
    if (!deletedTimeslot) {
      throw new NotFoundException('Timeslot not found');
    }
    return deletedTimeslot;
  }
}
