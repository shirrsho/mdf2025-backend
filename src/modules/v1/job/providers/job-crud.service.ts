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
import { Job, JobDocument } from '../schema';
import {
  CreateJobDto,
  UpdateJobDto,
  QueryJobDto,
} from '../dtos';
import { OptionDto } from '@/modules/dto';

@Injectable()
export class JobCrudService extends BaseService<JobCrudService> {
  constructor(
    @InjectModel(Job.name)
    private readonly jobModel: Model<JobDocument>,
  ) {
    super(JobCrudService.name);
  }

  buildJobWhereClause(query: QueryJobDto): Record<string, any> {
    const { title, companyId, minTotal, maxTotal, createdAfter, createdBefore } =
      query;

    const whereClause: Record<string, any> = {};

    const exactFilters = { companyId };
    Object.entries(exactFilters).forEach(([key, value]) => {
      if (value) {
        whereClause[key] = value;
      }
    });

    const stringFilters = { title };
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

  async count(queryParams: QueryJobDto): Promise<number> {
    const query = this.buildJobWhereClause(queryParams);
    return this.jobModel.countDocuments(query).exec();
  }

  async save(job: JobDocument) {
    return job.save();
  }

  async options(): Promise<OptionDto[]> {
    const jobs = await this.jobModel
      .find()
      .select('title')
      .exec();
    return jobs.map((job) => ({
      label: job.title,
      value: job._id,
    }));
  }

  async create(
    createJobDto: CreateJobDto,
  ): Promise<JobDocument> {
    try {
      const job = await this.jobModel.create(createJobDto);
      return job.save();
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
    queryParams: QueryJobDto,
  ): Promise<PaginationResponse<JobDocument>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryParams;

    const skip = ((page > 1 ? page : 1) - 1) * (limit > 0 ? limit : 10);

    const whereClause = this.buildJobWhereClause(queryParams);

    const sortOptions: any = { [sortBy]: sortOrder === 'ASC' ? 1 : -1 };

    const [jobs, count] = await Promise.all([
      this.jobModel
        .find(whereClause)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.jobModel.countDocuments(whereClause).exec(),
    ]);

    return {
      data: jobs,
      count,
    };
  }

  async findAllPublic(
    queryParams: QueryJobDto,
  ): Promise<PaginationResponse<JobDocument>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryParams;

    const skip = ((page > 1 ? page : 1) - 1) * (limit > 0 ? limit : 10);

    const whereClause = this.buildJobWhereClause(queryParams);

    const sortOptions: any = { [sortBy]: sortOrder === 'ASC' ? 1 : -1 };

    const [jobs, count] = await Promise.all([
      this.jobModel
        .find(whereClause)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.jobModel.countDocuments(whereClause).exec(),
    ]);

    return {
      data: jobs,
      count,
    };
  }

  async findById(id: string): Promise<JobDocument> {
    const job = await this.jobModel.findById(id).exec();
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    return job;
  }

  async findByIdPublic(id: string): Promise<JobDocument> {
    const job = await this.jobModel.findById(id).exec();
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    return job;
  }

  async update(
    id: string,
    updateJobDto: UpdateJobDto,
  ): Promise<JobDocument> {
    try {
      const updatedJob = await this.jobModel
        .findByIdAndUpdate(id, updateJobDto, { new: true })
        .exec();
      if (!updatedJob) {
        throw new NotFoundException('Job not found');
      }
      return updatedJob;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Name already exists');
      }
      throw new HttpException(error?.message, error?.status ?? 500, {
        cause: error,
      });
    }
  }

  async delete(id: string): Promise<JobDocument> {
    const deletedJob = await this.jobModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedJob) {
      throw new NotFoundException('Job not found');
    }
    return deletedJob;
  }
}
