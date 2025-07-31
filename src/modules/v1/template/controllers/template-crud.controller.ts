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
import { TemplateCrudService } from '../providers';
import { Template } from '../schema';
import {
  CreateTemplateDto,
  UpdateTemplateDto,
  TemplatePaginationResponse,
  QueryTemplateDto,
} from '../dtos';
import { OptionDto } from '@/modules/dto';

@ApiTags('v1/template')
@Controller({ path: 'template', version: '1' })
export class TemplateCrudController extends BaseController {
  constructor(private readonly templateService: TemplateCrudService) {
    super();
  }

  @Get('count')
  @UseGuards(AccessTokenGuard, RolePermissionGuard)
  @ApiOperation({
    summary: 'Get template count',
    description:
      'Retrieve the total count of template based on query parameters.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Template count retrieved successfully.',
    schema: {
      type: 'number',
      example: 10,
    },
  })
  @ApiCustomBadRequestResponse('Invalid query parameters.')
  @ApiCustomForbiddenResponse()
  async count(@Query() queryParams: QueryTemplateDto): Promise<number> {
    return await this.templateService.count(queryParams);
  }

  @Get('option')
  @ApiOperation({
    summary: 'Get all template options',
    description: 'Retrive all template options.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Template options retrived successfully.',
    type: [OptionDto],
  })
  @ApiCustomBadRequestResponse('Invalid request')
  async options(): Promise<OptionDto[]> {
    return await this.templateService.options();
  }

  @Get('public')
  @ApiOperation({
    summary: 'Get all public templates',
    description: 'Retrive all public templates based on query parameters.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Templates retrived successfully.',
    type: TemplatePaginationResponse,
  })
  @ApiCustomBadRequestResponse('Invalid query parameters')
  async findAllPublic(
    @Query() queryParams: QueryTemplateDto,
  ): Promise<PaginationResponse<Template>> {
    return await this.templateService.findAllPublic(queryParams);
  }

  @Get()
  @UseGuards(AccessTokenGuard, RolePermissionGuard)
  @ApiOperation({
    summary: 'Get all templates',
    description: 'Retrive all templates based on query parameters.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Templates retrived successfully.',
    type: TemplatePaginationResponse,
  })
  @ApiCustomBadRequestResponse('Invalid query parameters')
  @ApiCustomForbiddenResponse()
  async findAll(
    @Query() queryParams: QueryTemplateDto,
  ): Promise<PaginationResponse<Template>> {
    return await this.templateService.findAll(queryParams);
  }

  @Get('public/:id')
  @ApiOperation({
    summary: 'Get public template by ID',
    description: 'Retrive a template by ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Template retrived successfully.',
    type: Template,
  })
  @ApiCustomBadRequestResponse('Invalid template id')
  @ApiCustomNotFoundResponse('Template not found')
  @ApiParam({ name: 'id', description: 'Template ID' })
  async findByIdPublic(@Param('id') id: string): Promise<Template> {
    const template = await this.templateService.findByIdPublic(id);
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    return template;
  }

  @Get(':id')
  @UseGuards(AccessTokenGuard, RolePermissionGuard)
  @ApiOperation({
    summary: 'Get template by ID',
    description: 'Retrive a template by ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Template retrived successfully.',
    type: Template,
  })
  @ApiCustomBadRequestResponse('Invalid template id')
  @ApiCustomNotFoundResponse('Template not found')
  @ApiCustomForbiddenResponse()
  @ApiParam({ name: 'id', description: 'Template ID' })
  async findById(@MongoIdParam('id') id: string): Promise<Template> {
    const template = await this.templateService.findById(id);
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    return template;
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new template',
    description: 'Create a new template if mandatory fields are present',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Template created successfully.',
    type: Template,
  })
  @ApiCustomBadRequestResponse('Invalid input')
  @ApiBody({ type: CreateTemplateDto })
  async create(
    @Body() createTemplateDto: CreateTemplateDto,
  ): Promise<Template> {
    return await this.templateService.create(createTemplateDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update template by ID',
    description: 'Update template by ID from given fields',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Template updated successfully.',
    type: Template,
  })
  @ApiCustomBadRequestResponse('Invalid input')
  @ApiCustomNotFoundResponse()
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiBody({ type: UpdateTemplateDto })
  async update(
    @MongoIdParam('id') id: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ): Promise<Template> {
    const updatedTemplate = await this.templateService.update(
      id,
      updateTemplateDto,
    );
    if (!updatedTemplate) {
      throw new NotFoundException('Template not found');
    }
    return updatedTemplate;
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard, RolePermissionGuard)
  @ApiOperation({
    summary: 'Delete template by ID',
    description: 'Delete template by ID if present',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Template deleted successfully.',
    type: Template,
  })
  @ApiCustomBadRequestResponse('Invalid id')
  @ApiCustomNotFoundResponse()
  @ApiCustomForbiddenResponse()
  @ApiParam({ name: 'id', description: 'Template ID' })
  async delete(@MongoIdParam('id') id: string): Promise<Template> {
    const deletedTemplate = await this.templateService.delete(id);
    if (!deletedTemplate) {
      throw new NotFoundException('Template not found');
    }
    return deletedTemplate;
  }
}
