import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaginationResponse, buildWhereBuilder } from '@/modules/utils';
import {
  DynamicDto,
  CreateMailAutomationDto,
  UpdateMailAutomationDto,
} from '../dtos';
import { MailAutomation, MailAutomationDocument } from '../schema';
import { MailBlueprintCurdService } from './mail-blueprint-curd.service';

@Injectable()
export class MailAutomationCurdService {
  constructor(
    @InjectModel(MailAutomation.name)
    private readonly mailAutomationModel: Model<MailAutomationDocument>,
    private readonly mailBluprintService: MailBlueprintCurdService,
  ) {}

  async count(
    queryParams: DynamicDto = { query: { where: {} } },
  ): Promise<number> {
    return this.mailAutomationModel
      .countDocuments(queryParams.query?.where)
      .exec();
  }

  async save(mailAutomation: MailAutomationDocument) {
    return mailAutomation.save();
  }

  async create(
    createMailAutomationDto: CreateMailAutomationDto,
  ): Promise<MailAutomationDocument> {
    const mailAutomation = await this.mailAutomationModel.create(
      createMailAutomationDto,
    );
    return mailAutomation.save();
  }

  async findAll(
    queryParams: DynamicDto,
  ): Promise<PaginationResponse<MailAutomationDocument>> {
    const {
      select = {},
      where = {},
      page = 1,
      limit = 10,
      sort = 'newest',
    } = queryParams?.query || {};
    const skip = ((page > 1 ? page : 1) - 1) * (limit > 0 ? limit : 1);
    const whereClause = buildWhereBuilder(where);
    const mailAutomations = await this.mailAutomationModel
      .find(whereClause)
      .select(select)
      .sort({ createdAt: sort === 'newest' ? -1 : 1 })
      .limit(limit)
      .skip(skip)
      .exec();
    const count = await this.mailAutomationModel
      .countDocuments(whereClause)
      .exec();
    return {
      data: mailAutomations,
      count,
    };
  }

  async findAllPublic(
    queryParams: DynamicDto,
  ): Promise<PaginationResponse<MailAutomationDocument>> {
    const {
      select = {},
      where = {},
      page = 1,
      limit = 10,
      sort = 'newest',
    } = queryParams?.query || {};
    const skip = ((page > 1 ? page : 1) - 1) * (limit > 0 ? limit : 1);
    const whereClause = buildWhereBuilder(where);
    const mailAutomations = await this.mailAutomationModel
      .find({ ...whereClause })
      .select(select)
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: sort === 'newest' ? -1 : 1 })
      .exec();
    const count = await this.mailAutomationModel
      .countDocuments({ ...whereClause })
      .exec();
    return { data: mailAutomations, count };
  }

  async findById(id: string): Promise<MailAutomationDocument> {
    const mailAutomation = await this.mailAutomationModel.findById(id).exec();
    if (!mailAutomation) {
      throw new NotFoundException('Mail Automation not found');
    }
    return mailAutomation;
  }

  async findByIdPublic(id: string): Promise<MailAutomationDocument> {
    const mailAutomation = await this.mailAutomationModel.findById(id).exec();
    if (!mailAutomation) {
      throw new NotFoundException('Mail Automation not found');
    }
    return mailAutomation;
  }

  async update(
    id: string,
    updateMailAutomationtDto: UpdateMailAutomationDto,
  ): Promise<MailAutomationDocument> {
    const updatedMailAutomation = await this.mailAutomationModel
      .findByIdAndUpdate(id, updateMailAutomationtDto, { new: true })
      .exec();
    if (!updatedMailAutomation) {
      throw new NotFoundException('Mail Automation not found');
    }
    return updatedMailAutomation;
  }

  async delete(id: string): Promise<MailAutomationDocument> {
    const deletedMailAutomation = await this.mailAutomationModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedMailAutomation) {
      throw new NotFoundException('Mail Automation not found');
    }
    await this.mailBluprintService.delete(deletedMailAutomation.bluePrintId);
    return deletedMailAutomation;
  }
}
