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
import { Application, ApplicationDocument } from '../schema';
import {
  CreateApplicationDto,
  UpdateApplicationDto,
  QueryApplicationDto,
} from '../dtos';
import { OptionDto } from '@/modules/dto';

@Injectable()
export class ApplicationCrudService extends BaseService<ApplicationCrudService> {
  constructor(
    @InjectModel(Application.name)
    private readonly applicationModel: Model<ApplicationDocument>,
  ) {
    super(ApplicationCrudService.name);
  }

  buildApplicationWhereClause(query: QueryApplicationDto): Record<string, any> {
    const { applicationName, minTotal, maxTotal, createdAfter, createdBefore } =
      query;

    const whereClause: Record<string, any> = {};

    const stringFilters = { applicationName };
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

  async count(queryParams: QueryApplicationDto): Promise<number> {
    const query = this.buildApplicationWhereClause(queryParams);
    return this.applicationModel.countDocuments(query).exec();
  }

  async save(application: ApplicationDocument) {
    return application.save();
  }

  async options(): Promise<OptionDto[]> {
    const applications = await this.applicationModel
      .find()
      .select('applicationName')
      .exec();
    return applications.map((application) => ({
      label: application.applicationName,
      value: application._id,
    }));
  }

  async create(
    createApplicationDto: CreateApplicationDto,
  ): Promise<ApplicationDocument> {
    try {
      const application = await this.applicationModel.create(createApplicationDto);
      return application.save();
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
    queryParams: QueryApplicationDto,
  ): Promise<PaginationResponse<ApplicationDocument>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryParams;

    const skip = ((page > 1 ? page : 1) - 1) * (limit > 0 ? limit : 10);

    const whereClause = this.buildApplicationWhereClause(queryParams);

    const sortOptions: any = { [sortBy]: sortOrder === 'ASC' ? 1 : -1 };

    const [applications, count] = await Promise.all([
      this.applicationModel
        .find(whereClause)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.applicationModel.countDocuments(whereClause).exec(),
    ]);

    return {
      data: applications,
      count,
    };
  }

  async findAllPublic(
    queryParams: QueryApplicationDto,
  ): Promise<PaginationResponse<ApplicationDocument>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryParams;

    const skip = ((page > 1 ? page : 1) - 1) * (limit > 0 ? limit : 10);

    const whereClause = this.buildApplicationWhereClause(queryParams);

    const sortOptions: any = { [sortBy]: sortOrder === 'ASC' ? 1 : -1 };

    const [applications, count] = await Promise.all([
      this.applicationModel
        .find(whereClause)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.applicationModel.countDocuments(whereClause).exec(),
    ]);

    return {
      data: applications,
      count,
    };
  }

  async findById(id: string): Promise<ApplicationDocument> {
    const application = await this.applicationModel.findById(id).exec();
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    return application;
  }

  async findByIdPublic(id: string): Promise<ApplicationDocument> {
    const application = await this.applicationModel.findById(id).exec();
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    return application;
  }

  async update(
    id: string,
    updateApplicationDto: UpdateApplicationDto,
  ): Promise<ApplicationDocument> {
    try {
      const updatedApplication = await this.applicationModel
        .findByIdAndUpdate(id, updateApplicationDto, { new: true })
        .exec();
      if (!updatedApplication) {
        throw new NotFoundException('Application not found');
      }
      return updatedApplication;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Name already exists');
      }
      throw new HttpException(error?.message, error?.status ?? 500, {
        cause: error,
      });
    }
  }

  async delete(id: string): Promise<ApplicationDocument> {
    const deletedApplication = await this.applicationModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedApplication) {
      throw new NotFoundException('Application not found');
    }
    return deletedApplication;
  }
}
