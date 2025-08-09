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
  HasRoles,
  MongoIdParam,
  ReqUser,
} from '@/modules/decorator';
import { BaseController } from '@/modules/base';
import { CompanyCrudService } from '../providers';
import { Company } from '../schema';
import {
  CreateCompanyDto,
  UpdateCompanyDto,
  CompanyPaginationResponse,
  QueryCompanyDto,
} from '../dtos';
import { OptionDto } from '@/modules/dto';
import { Role } from '@/modules/enum';
import { UserDocument } from '../../user/schema';

@ApiTags('v1/company')
@Controller({ path: 'company', version: '1' })
export class CompanyCrudController extends BaseController {
  constructor(private readonly companyService: CompanyCrudService) {
    super();
  }

  @Get('count')
  @UseGuards(AccessTokenGuard, RolePermissionGuard)
  @ApiOperation({
    summary: 'Get company count',
    description:
      'Retrieve the total count of company based on query parameters.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Company count retrieved successfully.',
    schema: {
      type: 'number',
      example: 10,
    },
  })
  @ApiCustomBadRequestResponse('Invalid query parameters.')
  @ApiCustomForbiddenResponse()
  async count(@Query() queryParams: QueryCompanyDto): Promise<number> {
    return await this.companyService.count(queryParams);
  }

  @Get('option')
  @ApiOperation({
    summary: 'Get all company options',
    description: 'Retrive all company options.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Company options retrived successfully.',
    type: [OptionDto],
  })
  @ApiCustomBadRequestResponse('Invalid request')
  async options(): Promise<OptionDto[]> {
    return await this.companyService.options();
  }

  @Get('public')
  @ApiOperation({
    summary: 'Get all public companys',
    description: 'Retrive all public companys based on query parameters.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Companys retrived successfully.',
    type: CompanyPaginationResponse,
  })
  @ApiCustomBadRequestResponse('Invalid query parameters')
  async findAllPublic(
    @Query() queryParams: QueryCompanyDto,
  ): Promise<PaginationResponse<Company>> {
    return await this.companyService.findAllPublic(queryParams);
  }

  @Get()
  @UseGuards(AccessTokenGuard, RolePermissionGuard)
  @ApiOperation({
    summary: 'Get all companys',
    description: 'Retrive all companys based on query parameters.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Companys retrived successfully.',
    type: CompanyPaginationResponse,
  })
  @ApiCustomBadRequestResponse('Invalid query parameters')
  @ApiCustomForbiddenResponse()
  async findAll(
    @Query() queryParams: QueryCompanyDto,
  ): Promise<PaginationResponse<Company>> {
    return await this.companyService.findAll(queryParams);
  }

  @Get('public/:id')
  @ApiOperation({
    summary: 'Get public company by ID',
    description: 'Retrive a company by ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Company retrived successfully.',
    type: Company,
  })
  @ApiCustomBadRequestResponse('Invalid company id')
  @ApiCustomNotFoundResponse('Company not found')
  @ApiParam({ name: 'id', description: 'Company ID' })
  async findByIdPublic(@Param('id') id: string): Promise<Company> {
    const company = await this.companyService.findByIdPublic(id);
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }

  @Get(':id')
  @UseGuards(AccessTokenGuard, RolePermissionGuard)
  @ApiOperation({
    summary: 'Get company by ID',
    description: 'Retrive a company by ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Company retrived successfully.',
    type: Company,
  })
  @ApiCustomBadRequestResponse('Invalid company id')
  @ApiCustomNotFoundResponse('Company not found')
  @ApiCustomForbiddenResponse()
  @ApiParam({ name: 'id', description: 'Company ID' })
  async findById(@MongoIdParam('id') id: string): Promise<Company> {
    const company = await this.companyService.findById(id);
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  @HasRoles(Role.ADMIN, Role.COMPANY)
  @ApiOperation({
    summary: 'Create a new company',
    description: 'Create a new company if mandatory fields are present',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Company created successfully.',
    type: Company,
  })
  @ApiCustomBadRequestResponse('Invalid input')
  @ApiBody({ type: CreateCompanyDto })
  async create(
    @Body() createCompanyDto: CreateCompanyDto,
    @ReqUser() user: UserDocument
  ): Promise<Company> {
    return await this.companyService.create(createCompanyDto, user);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update company by ID',
    description: 'Update company by ID from given fields',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Company updated successfully.',
    type: Company,
  })
  @ApiCustomBadRequestResponse('Invalid input')
  @ApiCustomNotFoundResponse()
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiBody({ type: UpdateCompanyDto })
  async update(
    @MongoIdParam('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    const updatedCompany = await this.companyService.update(
      id,
      updateCompanyDto,
    );
    if (!updatedCompany) {
      throw new NotFoundException('Company not found');
    }
    return updatedCompany;
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard, RolePermissionGuard)
  @ApiOperation({
    summary: 'Delete company by ID',
    description: 'Delete company by ID if present',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Company deleted successfully.',
    type: Company,
  })
  @ApiCustomBadRequestResponse('Invalid id')
  @ApiCustomNotFoundResponse()
  @ApiCustomForbiddenResponse()
  @ApiParam({ name: 'id', description: 'Company ID' })
  async delete(@MongoIdParam('id') id: string): Promise<Company> {
    const deletedCompany = await this.companyService.delete(id);
    if (!deletedCompany) {
      throw new NotFoundException('Company not found');
    }
    return deletedCompany;
  }
}
