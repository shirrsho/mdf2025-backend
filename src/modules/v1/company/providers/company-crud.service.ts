import {
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaginationResponse } from '@/modules/utils';
import { BaseService } from '@/modules/base';
import { Company, CompanyDocument } from '../schema';
import {
  CreateCompanyDto,
  UpdateCompanyDto,
  QueryCompanyDto,
} from '../dtos';
import { OptionDto } from '@/modules/dto';

@Injectable()
export class CompanyCrudService extends BaseService<CompanyCrudService> {
  constructor(
    @InjectModel(Company.name)
    private readonly companyModel: Model<CompanyDocument>,
  ) {
    super(CompanyCrudService.name);
  }

  buildCompanyWhereClause(query: QueryCompanyDto): Record<string, any> {
    const { companyName, minTotal, maxTotal, createdAfter, createdBefore } =
      query;

    const whereClause: Record<string, any> = {};

    const stringFilters = { companyName };
    Object.entries(stringFilters).forEach(([key, value]) => {
      if (value) {
        whereClause[key] = { $regex: value, $options: 'i' };
      }
    });

    const numberRangeFields = [
      { field: 'total', min: minTotal, max: maxTotal },
    ];

    numberRangeFields.forEach(({ field, min, max }) => {
      if (min !== undefined || max !== undefined) {
        whereClause[field] = {};
        if (min !== undefined) whereClause[field]['$gte'] = min;
        if (max !== undefined) whereClause[field]['$lte'] = max;
      }
    });

    const dateRangeFields = [
      { field: 'createdAt', min: createdAfter, max: createdBefore },
    ];

    dateRangeFields.forEach(({ field, min, max }) => {
      if (min || max) {
        whereClause[field] = {};
        if (min) whereClause[field]['$gte'] = min;
        if (max) whereClause[field]['$lte'] = max;
      }
    });

    const booleanFilters = {};
    Object.entries(booleanFilters).forEach(([key, value]) => {
      if (value !== undefined) {
        whereClause[key] = value;
      }
    });

    return whereClause;
  }

  async count(queryParams: QueryCompanyDto): Promise<number> {
    const query = this.buildCompanyWhereClause(queryParams);
    return this.companyModel.countDocuments(query).exec();
  }

  async save(company: CompanyDocument) {
    return company.save();
  }

  async options(): Promise<OptionDto[]> {
    const companys = await this.companyModel
      .find()
      .select('companyName')
      .exec();
    return companys.map((company) => ({
      label: company.companyName,
      value: company._id,
    }));
  }

  async create(
    createCompanyDto: CreateCompanyDto,
  ): Promise<CompanyDocument> {
    try {
      const company = await this.companyModel.create(createCompanyDto);
      return company.save();
    } catch (error) {
      if (error?.code === 11000) {
        throw new ConflictException('Name already exists');
      }
      throw new HttpException(error?.message, error?.status ?? 500, {
        cause: error,
      });
    }
  }

  async findAll(
    queryParams: QueryCompanyDto,
  ): Promise<PaginationResponse<CompanyDocument>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryParams;

    const skip = ((page > 1 ? page : 1) - 1) * (limit > 0 ? limit : 10);

    const whereClause = this.buildCompanyWhereClause(queryParams);

    const sortOptions: any = { [sortBy]: sortOrder === 'ASC' ? 1 : -1 };

    const [companys, count] = await Promise.all([
      this.companyModel
        .find(whereClause)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.companyModel.countDocuments(whereClause).exec(),
    ]);

    return {
      data: companys,
      count,
    };
  }

  async findAllPublic(
    queryParams: QueryCompanyDto,
  ): Promise<PaginationResponse<CompanyDocument>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryParams;

    const skip = ((page > 1 ? page : 1) - 1) * (limit > 0 ? limit : 10);

    const whereClause = this.buildCompanyWhereClause(queryParams);

    const sortOptions: any = { [sortBy]: sortOrder === 'ASC' ? 1 : -1 };

    const [companys, count] = await Promise.all([
      this.companyModel
        .find(whereClause)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.companyModel.countDocuments(whereClause).exec(),
    ]);

    return {
      data: companys,
      count,
    };
  }

  async findById(id: string): Promise<CompanyDocument> {
    const company = await this.companyModel.findById(id).exec();
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }

  async findByIdPublic(id: string): Promise<CompanyDocument> {
    const company = await this.companyModel.findById(id).exec();
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }

  async update(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<CompanyDocument> {
    try {
      const updatedCompany = await this.companyModel
        .findByIdAndUpdate(id, updateCompanyDto, { new: true })
        .exec();
      if (!updatedCompany) {
        throw new NotFoundException('Company not found');
      }
      return updatedCompany;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Name already exists');
      }
      throw new HttpException(error?.message, error?.status ?? 500, {
        cause: error,
      });
    }
  }

  async delete(id: string): Promise<CompanyDocument> {
    const deletedCompany = await this.companyModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedCompany) {
      throw new NotFoundException('Company not found');
    }
    return deletedCompany;
  }
}
