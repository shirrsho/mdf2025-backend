import {
  Controller,
  Get,
  HttpStatus,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AccessTokenGuard } from '@/modules/shared';
import { BaseController } from '@/modules/base';
import {
  ApiCustomBadRequestResponse,
  ApiCustomNotFoundResponse,
  MongoIdParam,
  ReqUser,
} from '@/modules/decorator';
import { UserDocument } from '../../user/schema';
import { NotificationGeneralService } from '../providers';
import { Notification } from '../schema';
import { DynamicDto, NotificationPaginationResponse } from '../dtos';

@ApiTags('v1/notification')
@Controller({ path: 'notification', version: '1' })
export class NotificationGeneralController extends BaseController {
  constructor(
    private readonly notificationService: NotificationGeneralService,
  ) {
    super();
  }

  @Get('count')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Get total notification count' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification count retrieved successfully.',
    schema: {
      type: 'number',
      example: 10,
    },
  })
  @ApiCustomBadRequestResponse('Invalid query parameters.')
  @ApiQuery({ type: DynamicDto })
  async count(
    @Query() queryParams: DynamicDto,
    @ReqUser() user: UserDocument,
  ): Promise<number> {
    return await this.notificationService.count(queryParams, user.id);
  }

  @Get()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({
    summary: 'Get all notifications',
    description: 'Retrive all notification based on query parameters.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notifications retrived successfully.',
    type: NotificationPaginationResponse,
  })
  @ApiCustomBadRequestResponse('Invalid query parameters')
  @ApiQuery({ type: DynamicDto })
  async findAll(
    @Query() queryParams: DynamicDto,
    @ReqUser() user,
  ): Promise<NotificationPaginationResponse<Notification>> {
    return this.notificationService.findAll(queryParams, user.id);
  }

  @Patch(':id/read')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification marked as read successfully.',
    type: Notification,
  })
  @ApiCustomBadRequestResponse('Invalid notification id')
  @ApiCustomNotFoundResponse('Notification not found')
  @ApiParam({ name: 'id', description: 'Notification ID' })
  async markAsRead(@MongoIdParam('id') id: string): Promise<Notification> {
    return this.notificationService.markAsRead(id);
  }
}
