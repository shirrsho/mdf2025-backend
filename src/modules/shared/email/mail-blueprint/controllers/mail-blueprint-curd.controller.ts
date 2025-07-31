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
import { MailBlueprintCurdService } from '../providers';
import { MailBlueprint } from '../schema';
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
  CreateMailBlueprintDto,
  UpdateMailBlueprintDto,
  DynamicDto,
  MailBlueprintPaginationResponse,
} from '../dtos';
import { AccessTokenGuard } from '@/modules/shared/auth/guards';
import { PaginationResponse } from '@/modules/utils';
import {
  ApiCustomBadRequestResponse,
  ApiCustomNotFoundResponse,
} from '@/modules/decorator';
import { OptionDto } from '@/modules/dto';

@ApiBearerAuth()
@ApiTags('v1/mail-blueprint')
@Controller({ path: 'mail-blueprint', version: '1' })
export class MailBlueprintCurdController {
  constructor(
    private readonly mailBlueprintService: MailBlueprintCurdService,
  ) {}

  @Get('options')
  @ApiOperation({ summary: 'Get exam options' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mail Blueprints options retrived successfully.',
    type: [OptionDto],
  })
  @ApiCustomBadRequestResponse('Invalid query parameters')
  async options(): Promise<OptionDto[]> {
    return await this.mailBlueprintService.options();
  }

  @Get('promotion-options')
  @ApiOperation({ summary: 'Get exam options' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mail Blueprints options retrived successfully.',
    type: [OptionDto],
  })
  @ApiCustomBadRequestResponse('Invalid query parameters')
  async promotionOptions(): Promise<OptionDto[]> {
    return await this.mailBlueprintService.promotionOptions();
  }

  @Get('public')
  @ApiOperation({ summary: 'Get all public Mail Blueprints' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mail Blueprints retrived successfully.',
    type: MailBlueprintPaginationResponse,
  })
  @ApiCustomBadRequestResponse('Invalid query parameters')
  @ApiQuery({ type: DynamicDto })
  async findAllPublic(
    @Query() queryParams: DynamicDto,
  ): Promise<PaginationResponse<MailBlueprint>> {
    return await this.mailBlueprintService.findAllPublic(queryParams);
  }

  @UseGuards(AccessTokenGuard)
  @Get()
  @ApiOperation({ summary: 'Get all Mail Blueprints' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mail Blueprints retrived successfully.',
    type: MailBlueprintPaginationResponse,
  })
  @ApiCustomBadRequestResponse('Invalid query parameters')
  @ApiQuery({ type: DynamicDto })
  async findAll(
    @Query() queryParams: DynamicDto,
  ): Promise<PaginationResponse<MailBlueprint>> {
    return await this.mailBlueprintService.findAll(queryParams);
  }

  @Get('public/:id')
  @ApiOperation({ summary: 'Get public mailBlueprint by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mail Blueprint retrived successfully.',
    type: MailBlueprint,
  })
  @ApiCustomBadRequestResponse('Invalid id')
  @ApiCustomNotFoundResponse()
  @ApiParam({ name: 'id', description: 'MailBlueprint ID' })
  async findByIdPublic(@Param('id') id: string): Promise<MailBlueprint> {
    const mailBlueprint = await this.mailBlueprintService.findByIdPublic(id);
    if (!mailBlueprint) {
      throw new NotFoundException('MailBlueprint not found');
    }
    return mailBlueprint;
  }

  @Get(':id')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Get mailBlueprint by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mail Blueprint retrived successfully.',
    type: MailBlueprint,
  })
  @ApiCustomBadRequestResponse('Invalid id')
  @ApiCustomNotFoundResponse()
  @ApiParam({ name: 'id', description: 'MailBlueprint ID' })
  async findById(@Param('id') id: string): Promise<MailBlueprint> {
    const mailBlueprint = await this.mailBlueprintService.findById(id);
    if (!mailBlueprint) {
      throw new NotFoundException('MailBlueprint not found');
    }
    return mailBlueprint;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new mailBlueprint' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Mail Blueprint created successfully.',
    type: MailBlueprint,
  })
  @ApiCustomBadRequestResponse('Invalid input')
  @ApiBody({ type: CreateMailBlueprintDto })
  async create(
    @Body() createMailBlueprintDto: CreateMailBlueprintDto,
  ): Promise<MailBlueprint> {
    return await this.mailBlueprintService.create(createMailBlueprintDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update mailBlueprint by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mail Blueprint updated successfully.',
    type: MailBlueprint,
  })
  @ApiCustomBadRequestResponse('Invalid input')
  @ApiCustomNotFoundResponse()
  @ApiParam({ name: 'id', description: 'MailBlueprint ID' })
  @ApiBody({ type: UpdateMailBlueprintDto })
  async update(
    @Param('id') id: string,
    @Body() updateMailBlueprintDto: UpdateMailBlueprintDto,
  ): Promise<MailBlueprint> {
    const updatedMailBlueprint = await this.mailBlueprintService.update(
      id,
      updateMailBlueprintDto,
    );
    if (!updatedMailBlueprint) {
      throw new NotFoundException('MailBlueprint not found');
    }
    return updatedMailBlueprint;
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Delete mailBlueprint by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mail Blueprint deleted successfully.',
    type: MailBlueprint,
  })
  @ApiCustomBadRequestResponse('Invalid id')
  @ApiCustomNotFoundResponse()
  @ApiParam({ name: 'id', description: 'MailBlueprint ID' })
  async delete(@Param('id') id: string): Promise<MailBlueprint> {
    const deletedMailBlueprint = await this.mailBlueprintService.delete(id);
    if (!deletedMailBlueprint) {
      throw new NotFoundException('MailBlueprint not found');
    }
    return deletedMailBlueprint;
  }
}
