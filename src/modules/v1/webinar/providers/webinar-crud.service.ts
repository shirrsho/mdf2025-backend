import {
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaginationResponse } from '@/modules/utils';
import { BaseService } from '@/modules/base';
import { Webinar, WebinarDocument } from '../schema';
import {
  CreateWebinarDto,
  UpdateWebinarDto,
  QueryWebinarDto,
} from '../dtos';
import { OptionDto } from '@/modules/dto';
import { WebinarValidationService } from './webinar-validation.service';
import { WebinarStatus } from '@/modules/enum';

@Injectable()
export class WebinarCrudService extends BaseService<WebinarDocument> {
  constructor(
    @InjectModel(Webinar.name)
    private readonly webinarModel: Model<WebinarDocument>,
    private readonly webinarValidationService: WebinarValidationService,
  ) {
    super(WebinarCrudService.name);
  }

  buildWebinarWhereClause(query: QueryWebinarDto): Record<string, any> {
    const { title, timeslot, minTotal, maxTotal, createdAfter, createdBefore } =
      query;

    const whereClause: Record<string, any> = {};

    // String filters (regex search)
    const stringFilters = { title };
    Object.entries(stringFilters).forEach(([key, value]) => {
      if (value) {
        whereClause[key] = { $regex: value, $options: 'i' };
      }
    });

    // Exact match filters
    if (timeslot) {
      whereClause.timeslot = timeslot;
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

  async count(queryParams: QueryWebinarDto): Promise<number> {
    const query = this.buildWebinarWhereClause(queryParams);
    return this.webinarModel.countDocuments(query).exec();
  }

  async save(webinar: WebinarDocument) {
    return webinar.save();
  }

  async options(): Promise<OptionDto[]> {
    const webinars = await this.webinarModel
      .find()
      .select('title')
      .exec();
    return webinars.map((webinar) => ({
      label: webinar.title,
      value: webinar._id,
    }));
  }

  async create(
    createWebinarDto: CreateWebinarDto,
  ): Promise<WebinarDocument> {
    try {
      // Validate duration
      const validDuration = this.webinarValidationService.validateWebinarDuration(
        createWebinarDto.duration,
      );

      // Validate scheduling and overlap
      const actualStartTime = await this.webinarValidationService.validateWebinarScheduling(
        createWebinarDto.timeslot,
        validDuration,
        createWebinarDto.scheduledStartTime,
      );

      const webinar = await this.webinarModel.create({
        ...createWebinarDto,
        duration: validDuration,
        scheduledStartTime: actualStartTime,
      });
      return webinar.save();
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
    queryParams: QueryWebinarDto,
  ): Promise<PaginationResponse<WebinarDocument>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryParams;

    const skip = ((page > 1 ? page : 1) - 1) * (limit > 0 ? limit : 10);

    const whereClause = this.buildWebinarWhereClause(queryParams);

    const sortOptions: any = { [sortBy]: sortOrder === 'ASC' ? 1 : -1 };

    const [webinars, count] = await Promise.all([
      this.webinarModel
        .find(whereClause)
        .populate('timeslot', 'timeslotName startTime endTime description slug')
        .populate('host', 'name description industry location website logoUrl size contactEmail contactNumber slug')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.webinarModel.countDocuments(whereClause).exec(),
    ]);

    return {
      data: webinars,
      count,
    };
  }

  async findAllPublic(
    queryParams: QueryWebinarDto,
  ): Promise<PaginationResponse<WebinarDocument>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryParams;

    const skip = ((page > 1 ? page : 1) - 1) * (limit > 0 ? limit : 10);

    const whereClause = this.buildWebinarWhereClause(queryParams);

    const sortOptions: any = { [sortBy]: sortOrder === 'ASC' ? 1 : -1 };

    const [webinars, count] = await Promise.all([
      this.webinarModel
        .find(whereClause)
        .populate('timeslot', 'timeslotName startTime endTime description slug')
        .populate('host', 'name description industry location website logoUrl size contactEmail contactNumber slug')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.webinarModel.countDocuments(whereClause).exec(),
    ]);

    return {
      data: webinars,
      count,
    };
  }

  async findById(id: string): Promise<WebinarDocument> {
    const webinar = await this.webinarModel
      .findById(id)
      .populate('timeslot', 'timeslotName startTime endTime description slug')
      .populate('host', 'name description industry location website logoUrl size contactEmail contactNumber slug')
      .exec();
    if (!webinar) {
      throw new NotFoundException('Webinar not found');
    }
    return webinar;
  }

  async findByIdPublic(id: string): Promise<WebinarDocument> {
    const webinar = await this.webinarModel
      .findById(id)
      .populate('timeslot', 'timeslotName startTime endTime description slug')
      .populate('host', 'name description industry location website logoUrl size contactEmail contactNumber slug')
      .exec();
    if (!webinar) {
      throw new NotFoundException('Webinar not found');
    }
    return webinar;
  }

  async update(
    id: string,
    updateWebinarDto: UpdateWebinarDto,
  ): Promise<WebinarDocument> {
    try {
      const existingWebinar = await this.findById(id);
      
      // Log status change to cancelled - this will free up the timeslot
      if (updateWebinarDto.status === WebinarStatus.CANCELLED && 
          existingWebinar.status !== WebinarStatus.CANCELLED) {
        this.logInfo(`Webinar ${id} status changed to CANCELLED. Timeslot ${existingWebinar.timeslot} will be freed for new bookings.`);
      }

      // If duration, timeslot, or scheduledStartTime is being updated, validate
      if (updateWebinarDto.duration || updateWebinarDto.timeslot || updateWebinarDto.scheduledStartTime) {
        const newDuration = updateWebinarDto.duration 
          ? this.webinarValidationService.validateWebinarDuration(updateWebinarDto.duration)
          : existingWebinar.duration;
        
        const newTimeslotId = updateWebinarDto.timeslot || existingWebinar.timeslot;
        const newScheduledStartTime = updateWebinarDto.scheduledStartTime || existingWebinar.scheduledStartTime;

        const actualStartTime = await this.webinarValidationService.validateWebinarScheduling(
          newTimeslotId.toString(),
          newDuration,
          newScheduledStartTime,
          id, // Exclude current webinar from overlap check
        );

        // Create a new update object with validated duration and start time
        const validatedUpdateDto = {
          ...updateWebinarDto,
          duration: newDuration,
          scheduledStartTime: actualStartTime,
        };

        const updatedWebinar = await this.webinarModel
          .findByIdAndUpdate(id, validatedUpdateDto, { new: true })
          .exec();
        if (!updatedWebinar) {
          throw new NotFoundException('Webinar not found');
        }
        return updatedWebinar;
      }

      const updatedWebinar = await this.webinarModel
        .findByIdAndUpdate(id, updateWebinarDto, { new: true })
        .exec();
      if (!updatedWebinar) {
        throw new NotFoundException('Webinar not found');
      }
      return updatedWebinar;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Name already exists');
      }
      throw new HttpException(error?.message, error?.status ?? 500, {
        cause: error,
      });
    }
  }

  async delete(id: string): Promise<WebinarDocument> {
    const webinarToDelete = await this.findById(id);
    
    // Log deletion - this will automatically free up the timeslot
    this.logInfo(`Deleting webinar ${id}. Timeslot ${webinarToDelete.timeslot} will be freed for new bookings.`);
    
    const deletedWebinar = await this.webinarModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedWebinar) {
      throw new NotFoundException('Webinar not found');
    }
    
    this.logInfo(`Webinar ${id} successfully deleted. Timeslot is now available for new bookings.`);
    return deletedWebinar;
  }
}
