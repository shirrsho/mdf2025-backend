import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BaseController } from '@/modules/base';
import { RoutesGeneralService } from '../providers';
import { ApiCustomBadRequestResponse } from '@/modules/decorator';
import { Routes } from '../schema';
import { CreateRouteDto } from '../dto';
import { AccessTokenGuard, RolePermissionGuard } from '../../auth';

@ApiTags('v1/routes')
@Controller({ path: 'routes', version: '1' })
export class RoutesGeneralController extends BaseController {
  constructor(private readonly routerService: RoutesGeneralService) {
    super();
  }

  @Get('seed')
  @ApiOperation({
    summary: 'Seed new route name',
    description: 'Seed new route name',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Routes registered successfully',
    schema: {
      example: {
        message: 'Frontend routes seeded successfully',
      },
    },
  })
  @ApiCustomBadRequestResponse('Invalid request')
  async frontendSeed() {
    return this.routerService.frontendSeed();
  }

  @Get()
  @UseGuards(AccessTokenGuard, RolePermissionGuard)
  @ApiOperation({
    summary: 'Get all route',
    description: 'Get all route',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Routes registered successfully',
    type: Routes,
  })
  @ApiCustomBadRequestResponse('Invalid request')
  async getAll() {
    return this.routerService.getAll();
  }

  @Post('add')
  @ApiOperation({
    summary: 'Register new route name',
    description: 'Register new route name',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Route registered successfully',
    type: Routes,
  })
  @ApiCustomBadRequestResponse('Invalid input')
  async addNew(@Body() createRouteDto: CreateRouteDto) {
    return this.routerService.addNew(createRouteDto);
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh paths',
    description: 'Create all paths',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Path refreshed successfully.',
    schema: {
      example: {
        message: 'Path refreshed successfully',
      },
    },
  })
  @ApiCustomBadRequestResponse('Invalid input')
  async root(@Request() req: ExpressRequest) {
    return this.routerService.refresh(req);
  }
}
