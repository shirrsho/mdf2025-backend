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
import { Timeslot, TimeslotDocument } from '../schema';
import {
  CreateTimeslotDto,
  UpdateTimeslotDto,
  QueryTimeslotDto,
} from '../dtos';
import { OptionDto } from '@/modules/dto';

@Injectable()
export class TimeslotCrudService extends BaseService<TimeslotCrudService> {
  constructor(
    @InjectModel(Timeslot.name)
    private readonly timeslotModel: Model<TimeslotDocument>,
  ) {
    super(TimeslotCrudService.name);
  }

  buildTimeslotWhereClause(query: QueryTimeslotDto): Record<string, any> {
    const { timeslotName, minTotal, maxTotal, createdAfter, createdBefore } =
      query;

    const whereClause: Record<string, any> = {};

    const stringFilters = { timeslotName };
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

  async count(queryParams: QueryTimeslotDto): Promise<number> {
    const query = this.buildTimeslotWhereClause(queryParams);
    return this.timeslotModel.countDocuments(query).exec();
  }

  async save(timeslot: TimeslotDocument) {
    return timeslot.save();
  }

  async options(): Promise<OptionDto[]> {
    const timeslots = await this.timeslotModel
      .find()
      .select('timeslotName')
      .exec();
    return timeslots.map((timeslot) => ({
      label: timeslot.timeslotName,
      value: timeslot._id,
    }));
  }

  async create(
    createTimeslotDto: CreateTimeslotDto,
  ): Promise<TimeslotDocument> {
    try {
      const timeslot = await this.timeslotModel.create(createTimeslotDto);
      return timeslot.save();
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
    queryParams: QueryTimeslotDto,
  ): Promise<PaginationResponse<TimeslotDocument>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryParams;

    const skip = ((page > 1 ? page : 1) - 1) * (limit > 0 ? limit : 10);

    const whereClause = this.buildTimeslotWhereClause(queryParams);

    const sortOptions: any = { [sortBy]: sortOrder === 'ASC' ? 1 : -1 };

    const [timeslots, count] = await Promise.all([
      this.timeslotModel
        .find(whereClause)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.timeslotModel.countDocuments(whereClause).exec(),
    ]);

    return {
      data: timeslots,
      count,
    };
  }

  async findAllPublic(
    queryParams: QueryTimeslotDto,
  ): Promise<PaginationResponse<TimeslotDocument>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryParams;

    const skip = ((page > 1 ? page : 1) - 1) * (limit > 0 ? limit : 10);

    const whereClause = this.buildTimeslotWhereClause(queryParams);

    const sortOptions: any = { [sortBy]: sortOrder === 'ASC' ? 1 : -1 };

    const [timeslots, count] = await Promise.all([
      this.timeslotModel
        .find(whereClause)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.timeslotModel.countDocuments(whereClause).exec(),
    ]);

    return {
      data: timeslots,
      count,
    };
  }

  async findById(id: string): Promise<TimeslotDocument> {
    const timeslot = await this.timeslotModel.findById(id).exec();
    if (!timeslot) {
      throw new NotFoundException('Timeslot not found');
    }
    return timeslot;
  }

  async findByIdPublic(id: string): Promise<TimeslotDocument> {
    const timeslot = await this.timeslotModel.findById(id).exec();
    if (!timeslot) {
      throw new NotFoundException('Timeslot not found');
    }
    return timeslot;
  }

  async update(
    id: string,
    updateTimeslotDto: UpdateTimeslotDto,
  ): Promise<TimeslotDocument> {
    try {
      const updatedTimeslot = await this.timeslotModel
        .findByIdAndUpdate(id, updateTimeslotDto, { new: true })
        .exec();
      if (!updatedTimeslot) {
        throw new NotFoundException('Timeslot not found');
      }
      return updatedTimeslot;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Name already exists');
      }
      throw new HttpException(error?.message, error?.status ?? 500, {
        cause: error,
      });
    }
  }

  async delete(id: string): Promise<TimeslotDocument> {
    const deletedTimeslot = await this.timeslotModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedTimeslot) {
      throw new NotFoundException('Timeslot not found');
    }
    return deletedTimeslot;
  }
}
