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
import { Registration, RegistrationDocument } from '../schema';
import {
  CreateRegistrationDto,
  UpdateRegistrationDto,
  QueryRegistrationDto,
} from '../dtos';
import { OptionDto } from '@/modules/dto';

@Injectable()
export class RegistrationCrudService extends BaseService<RegistrationCrudService> {
  constructor(
    @InjectModel(Registration.name)
    private readonly registrationModel: Model<RegistrationDocument>,
  ) {
    super(RegistrationCrudService.name);
  }

  buildRegistrationWhereClause(query: QueryRegistrationDto): Record<string, any> {
    const { participantId, minTotal, maxTotal, createdAfter, createdBefore } =
      query;

    const whereClause: Record<string, any> = {};

    if (participantId) {
      whereClause.participantId = participantId;
    }

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

  async count(queryParams: QueryRegistrationDto): Promise<number> {
    const query = this.buildRegistrationWhereClause(queryParams);
    return this.registrationModel.countDocuments(query).exec();
  }

  async save(registration: RegistrationDocument) {
    return registration.save();
  }

  async options(): Promise<OptionDto[]> {
    const registrations = await this.registrationModel
      .find()
      .select('participantId webinarId registrationDate')
      .populate('participantId', 'name')
      .exec();
    return registrations.map((registration) => ({
      label: `Registration by ${(registration.participantId as any)?.name || 'Unknown'} - ${registration.registrationDate.toDateString()}`,
      value: registration._id,
    }));
  }

  async create(
    createRegistrationDto: CreateRegistrationDto,
  ): Promise<RegistrationDocument> {
    try {
      const registration = await this.registrationModel.create(createRegistrationDto);
      return registration.save();
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
    queryParams: QueryRegistrationDto,
  ): Promise<PaginationResponse<RegistrationDocument>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryParams;

    const skip = ((page > 1 ? page : 1) - 1) * (limit > 0 ? limit : 10);

    const whereClause = this.buildRegistrationWhereClause(queryParams);

    const sortOptions: any = { [sortBy]: sortOrder === 'ASC' ? 1 : -1 };

    const [registrations, count] = await Promise.all([
      this.registrationModel
        .find(whereClause)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.registrationModel.countDocuments(whereClause).exec(),
    ]);

    return {
      data: registrations,
      count,
    };
  }

  async findAllPublic(
    queryParams: QueryRegistrationDto,
  ): Promise<PaginationResponse<RegistrationDocument>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryParams;

    const skip = ((page > 1 ? page : 1) - 1) * (limit > 0 ? limit : 10);

    const whereClause = this.buildRegistrationWhereClause(queryParams);

    const sortOptions: any = { [sortBy]: sortOrder === 'ASC' ? 1 : -1 };

    const [registrations, count] = await Promise.all([
      this.registrationModel
        .find(whereClause)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.registrationModel.countDocuments(whereClause).exec(),
    ]);

    return {
      data: registrations,
      count,
    };
  }

  async findById(id: string): Promise<RegistrationDocument> {
    const registration = await this.registrationModel.findById(id).exec();
    if (!registration) {
      throw new NotFoundException('Registration not found');
    }
    return registration;
  }

  async findByIdPublic(id: string): Promise<RegistrationDocument> {
    const registration = await this.registrationModel.findById(id).exec();
    if (!registration) {
      throw new NotFoundException('Registration not found');
    }
    return registration;
  }

  async update(
    id: string,
    updateRegistrationDto: UpdateRegistrationDto,
  ): Promise<RegistrationDocument> {
    try {
      const updatedRegistration = await this.registrationModel
        .findByIdAndUpdate(id, updateRegistrationDto, { new: true })
        .exec();
      if (!updatedRegistration) {
        throw new NotFoundException('Registration not found');
      }
      return updatedRegistration;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Name already exists');
      }
      throw new HttpException(error?.message, error?.status ?? 500, {
        cause: error,
      });
    }
  }

  async delete(id: string): Promise<RegistrationDocument> {
    const deletedRegistration = await this.registrationModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedRegistration) {
      throw new NotFoundException('Registration not found');
    }
    return deletedRegistration;
  }
}
