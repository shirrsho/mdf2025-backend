import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MailAutomationCurdService } from '../providers';
import { MailAutomation } from '../schema';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateMailAutomationDto,
  UpdateMailAutomationDto,
  DynamicDto,
  MailAutomationPaginationResponse,
} from '../dtos';
import { AccessTokenGuard } from '@/modules/shared/auth/guards';
import { PaginationResponse } from '@/modules/utils';
import {
  ApiCustomBadRequestResponse,
  ApiCustomNotFoundResponse,
} from '@/modules/decorator';

@ApiBearerAuth()
@ApiTags('v1/mail-automation', 'v1/mail-blueprint')
@Controller({ path: 'mail-automation', version: '1' })
export class MailAutomationCurdController {
  constructor(
    private readonly mailAutomationService: MailAutomationCurdService,
  ) {}

  @Get('public')
  @ApiOperation({ summary: 'Get all public mail automations' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mail Automation retrived successfully.',
    type: MailAutomationPaginationResponse,
  })
  @ApiCustomBadRequestResponse('Invalid query parameters')
  @ApiQuery({ type: DynamicDto })
  async findAllPublic(
    @Query() queryParams: DynamicDto,
  ): Promise<PaginationResponse<MailAutomation>> {
    return await this.mailAutomationService.findAllPublic(queryParams);
  }

  @Get()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Get all mail automations' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mail Automation retrived successfully.',
    type: MailAutomationPaginationResponse,
  })
  @ApiCustomBadRequestResponse('Invalid query parameters')
  @ApiQuery({ type: DynamicDto })
  async findAll(
    @Query() queryParams: DynamicDto,
  ): Promise<PaginationResponse<MailAutomation>> {
    return await this.mailAutomationService.findAll(queryParams);
  }

  @Get('public/:id')
  @ApiOperation({ summary: 'Get public mailAutomation by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mail Automation retrived successfully.',
    type: MailAutomation,
  })
  @ApiCustomBadRequestResponse('Invalid id')
  @ApiCustomNotFoundResponse()
  @ApiParam({ name: 'id', description: 'MailAutomation ID' })
  async findByIdPublic(@Param('id') id: string): Promise<MailAutomation> {
    const mailAutomation = await this.mailAutomationService.findByIdPublic(id);
    if (!mailAutomation) {
      throw new NotFoundException('MailAutomation not found');
    }
    return mailAutomation;
  }

  @Get(':id')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Get mailAutomation by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mail Automation retrived successfully.',
    type: MailAutomation,
  })
  @ApiCustomBadRequestResponse('Invalid id')
  @ApiCustomNotFoundResponse()
  @ApiParam({ name: 'id', description: 'MailAutomation ID' })
  async findById(@Param('id') id: string): Promise<MailAutomation> {
    const mailAutomation = await this.mailAutomationService.findById(id);
    if (!mailAutomation) {
      throw new NotFoundException('MailAutomation not found');
    }
    return mailAutomation;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new mailAutomation' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Mail Automation created successfully.',
    type: MailAutomation,
  })
  @ApiCustomBadRequestResponse('Invalid input')
  @ApiBody({ type: CreateMailAutomationDto })
  async create(
    @Body() createMailAutomationDto: CreateMailAutomationDto,
  ): Promise<MailAutomation> {
    return await this.mailAutomationService.create(createMailAutomationDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update mailAutomation by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mail Automation updated successfully.',
    type: MailAutomation,
  })
  @ApiCustomBadRequestResponse('Invalid input')
  @ApiCustomNotFoundResponse()
  @ApiParam({ name: 'id', description: 'MailAutomation ID' })
  @ApiBody({ type: UpdateMailAutomationDto })
  async update(
    @Param('id') id: string,
    @Body() updateMailAutomationDto: UpdateMailAutomationDto,
  ): Promise<MailAutomation> {
    const updatedMailAutomation = await this.mailAutomationService.update(
      id,
      updateMailAutomationDto,
    );
    if (!updatedMailAutomation) {
      throw new NotFoundException('MailAutomation not found');
    }
    return updatedMailAutomation;
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Delete mailAutomation by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mail Automation deleted successfully.',
    type: MailAutomation,
  })
  @ApiCustomBadRequestResponse('Invalid id')
  @ApiCustomNotFoundResponse()
  @ApiParam({ name: 'id', description: 'MailAutomation ID' })
  async delete(@Param('id') id: string): Promise<MailAutomation> {
    const deletedMailAutomation = await this.mailAutomationService.delete(id);
    if (!deletedMailAutomation) {
      throw new NotFoundException('MailAutomation not found');
    }
    return deletedMailAutomation;
  }
}
