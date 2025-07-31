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
} from '@nestjs/common';
import { MailhistoryCurdService } from '../providers';
import { MailHistory } from '../schema';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateMailHistoryDto,
  UpdateMailhistoryDto,
  QueryMailHistoryDto,
} from '../dtos';
import {
  AccessTokenGuard,
  RolePermissionGuard,
} from '@/modules/shared/auth/guards';
import { PaginationResponse } from '@/modules/utils';

@ApiTags('v1/mailhistory')
@ApiBearerAuth()
@Controller({ path: 'mailhistory', version: '1' })
export class MailhistoryCurdController {
  constructor(private readonly mailhistoryService: MailhistoryCurdService) {}

  @UseGuards(AccessTokenGuard)
  @Get('count')
  @ApiOperation({ summary: 'Get mailhistory count' })
  async count(@Query() queryParams: QueryMailHistoryDto): Promise<number> {
    return await this.mailhistoryService.count(queryParams);
  }

  @UseGuards(AccessTokenGuard)
  @Get()
  @ApiOperation({ summary: 'Get all mailhistorys' })
  async findAll(
    @Query() queryParams: QueryMailHistoryDto,
  ): Promise<PaginationResponse<MailHistory>> {
    return await this.mailhistoryService.findAll(queryParams);
  }

  @UseGuards(AccessTokenGuard)
  @Get('resource/:id')
  @ApiOperation({ summary: 'Get mailhistories by resource ID' })
  @ApiParam({ name: 'id', description: 'Resource ID' })
  async getHistoryByResourceId(
    @Param('id') id: string,
    @Query() queryParams: QueryMailHistoryDto,
  ): Promise<PaginationResponse<MailHistory>> {
    return await this.mailhistoryService.getHistoryByResourceId(
      id,
      queryParams,
    );
  }

  @UseGuards(AccessTokenGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get mailhistory by ID' })
  @ApiParam({ name: 'id', description: 'MailHistory ID' })
  async findById(@Param('id') id: string): Promise<MailHistory> {
    const mailhistory = await this.mailhistoryService.findById(id);
    if (!mailhistory) {
      throw new NotFoundException('MailHistory not found');
    }
    return mailhistory;
  }

  @UseGuards(AccessTokenGuard, RolePermissionGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new mailhistory' })
  @ApiBody({ type: CreateMailHistoryDto })
  async create(
    @Body() createMailhistoryDto: CreateMailHistoryDto,
  ): Promise<MailHistory> {
    return await this.mailhistoryService.create(createMailhistoryDto);
  }

  @Put(':id')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Update mailhistory by ID' })
  @ApiParam({ name: 'id', description: 'MailHistory ID' })
  @ApiBody({ type: UpdateMailhistoryDto })
  async update(
    @Param('id') id: string,
    @Body() updateMailhistoryDto: UpdateMailhistoryDto,
  ): Promise<MailHistory> {
    const updatedMailhistory = await this.mailhistoryService.update(
      id,
      updateMailhistoryDto,
    );
    if (!updatedMailhistory) {
      throw new NotFoundException('MailHistory not found');
    }
    return updatedMailhistory;
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Delete mailhistory by ID' })
  @ApiParam({ name: 'id', description: 'MailHistory ID' })
  async delete(@Param('id') id: string): Promise<MailHistory> {
    const deletedMailhistory = await this.mailhistoryService.delete(id);
    if (!deletedMailhistory) {
      throw new NotFoundException('MailHistory not found');
    }
    return deletedMailhistory;
  }
}
