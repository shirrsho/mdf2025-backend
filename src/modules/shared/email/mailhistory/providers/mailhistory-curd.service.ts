import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MailHistory, MailHistoryDocument } from '../schema';
import { Model } from 'mongoose';
import {
  CreateMailHistoryDto,
  UpdateMailhistoryDto,
  QueryMailHistoryDto,
} from '../dtos';
import { flattenObject, PaginationResponse } from '@/modules/utils';
import { MailBlueprintGeneralService } from '../../mail-blueprint';

@Injectable()
export class MailhistoryCurdService {
  constructor(
    @InjectModel(MailHistory.name)
    private readonly mailhistoryModel: Model<MailHistoryDocument>,
    private readonly mailBluePrintService: MailBlueprintGeneralService,
  ) {}

  buildMailHistoryWhereClause(query: QueryMailHistoryDto): Record<string, any> {
    const {
      recepitentEmail,
      resourceName,
      status,
      isOpened,
      scheduledAfter,
      scheduledBefore,
      openedAfter,
      openedBefore,
      sentAfter,
      sentBefore,
      createdAfter,
      createdBefore,
    } = query;

    const whereClause: Record<string, any> = {};

    const stringFilters = { recepitentEmail, resourceName, status };
    Object.entries(stringFilters).forEach(([key, value]) => {
      if (value) {
        whereClause[key] = { $regex: value, $options: 'i' };
      }
    });

    const numberRangeFields = [
      // { field: 'total', min: minTotal, max: maxTotal },
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
      { field: 'scheduleTime', min: scheduledAfter, max: scheduledBefore },
      { field: 'openTimes', min: openedAfter, max: openedBefore },
      { field: 'sentTimes', min: sentAfter, max: sentBefore },
    ];

    dateRangeFields.forEach(({ field, min, max }) => {
      if (min || max) {
        whereClause[field] = {};
        if (min) whereClause[field]['$gte'] = min;
        if (max) whereClause[field]['$lte'] = max;
      }
    });

    const booleanFilters = { isOpened };
    Object.entries(booleanFilters).forEach(([key, value]) => {
      if (value !== undefined) {
        whereClause[key] = value;
      }
    });

    return whereClause;
  }

  async count(queryParams: QueryMailHistoryDto): Promise<number> {
    const query = this.buildMailHistoryWhereClause(queryParams);
    return this.mailhistoryModel.countDocuments(query).exec();
  }

  async save(mailhistory: MailHistoryDocument) {
    return mailhistory.save();
  }

  async create(
    createMailhistoryDto: CreateMailHistoryDto,
  ): Promise<MailHistoryDocument> {
    const mailhistory =
      await this.mailhistoryModel.create(createMailhistoryDto);
    return mailhistory.save();
  }

  async findAll(
    queryParams: QueryMailHistoryDto,
  ): Promise<PaginationResponse<MailHistoryDocument>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryParams;

    const skip = ((page > 1 ? page : 1) - 1) * (limit > 0 ? limit : 10);

    const whereClause = this.buildMailHistoryWhereClause(queryParams);

    const sortOptions: any = { [sortBy]: sortOrder === 'ASC' ? 1 : -1 };

    const [mailhistories, count] = await Promise.all([
      this.mailhistoryModel
        .find(whereClause)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.mailhistoryModel.countDocuments(whereClause).exec(),
    ]);

    return {
      data: mailhistories,
      count,
    };
  }

  async findById(id: string): Promise<MailHistoryDocument> {
    const mailhistory = await this.mailhistoryModel.findById(id).exec();
    if (!mailhistory) {
      throw new NotFoundException('MailHistory not found');
    }

    const mailBluePrint =
      await this.mailBluePrintService.getBlueprintByNameOrId(
        mailhistory.resourceName,
        mailhistory.blueprint,
      );
    if (!mailBluePrint) {
      throw new NotFoundException('MailHistory not found');
    }
    if (!mailhistory.subject) {
      let subject = mailBluePrint.subjectContent;
      let body = mailBluePrint.bodyContent;

      const data = flattenObject(mailhistory.placeValues);

      for (const key in data) {
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(placeholder, data[key]);
        body = body.replace(placeholder, data[key]);
      }
      mailhistory.body = body;
      mailhistory.subject = subject;
      await mailhistory.save();
    }
    return mailhistory;
  }

  async update(
    id: string,
    updateMailhistoryDto: UpdateMailhistoryDto,
  ): Promise<MailHistoryDocument> {
    const updatedMailhistory = await this.mailhistoryModel
      .findByIdAndUpdate(id, updateMailhistoryDto, { new: true })
      .exec();
    if (!updatedMailhistory) {
      throw new NotFoundException('MailHistory not found');
    }
    return updatedMailhistory;
  }

  async delete(id: string): Promise<MailHistoryDocument> {
    const deletedMailhistory = await this.mailhistoryModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedMailhistory) {
      throw new NotFoundException('MailHistory not found');
    }
    return deletedMailhistory;
  }

  async getHistoryByResourceId(
    resourceId: string,
    queryParams: QueryMailHistoryDto,
  ) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryParams;

    const skip = ((page > 1 ? page : 1) - 1) * (limit > 0 ? limit : 10);

    const whereClause = this.buildMailHistoryWhereClause(queryParams);
    whereClause.resourceId = resourceId;

    const sortOptions: any = { [sortBy]: sortOrder === 'ASC' ? 1 : -1 };

    const [mailhistories, count] = await Promise.all([
      this.mailhistoryModel
        .find(whereClause)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.mailhistoryModel.countDocuments(whereClause).exec(),
    ]);

    return {
      data: mailhistories,
      count,
    };
  }
}
