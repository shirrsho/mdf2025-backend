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
import { Template, TemplateDocument } from '../schema';
import {
  CreateTemplateDto,
  UpdateTemplateDto,
  QueryTemplateDto,
} from '../dtos';
import { OptionDto } from '@/modules/dto';

@Injectable()
export class TemplateCrudService extends BaseService<TemplateCrudService> {
  constructor(
    @InjectModel(Template.name)
    private readonly templateModel: Model<TemplateDocument>,
  ) {
    super(TemplateCrudService.name);
  }

  buildTemplateWhereClause(query: QueryTemplateDto): Record<string, any> {
    const { templateName, minTotal, maxTotal, createdAfter, createdBefore } =
      query;

    const whereClause: Record<string, any> = {};

    const stringFilters = { templateName };
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

  async count(queryParams: QueryTemplateDto): Promise<number> {
    const query = this.buildTemplateWhereClause(queryParams);
    return this.templateModel.countDocuments(query).exec();
  }

  async save(template: TemplateDocument) {
    return template.save();
  }

  async options(): Promise<OptionDto[]> {
    const templates = await this.templateModel
      .find()
      .select('templateName')
      .exec();
    return templates.map((template) => ({
      label: template.templateName,
      value: template._id,
    }));
  }

  async create(
    createTemplateDto: CreateTemplateDto,
  ): Promise<TemplateDocument> {
    try {
      const template = await this.templateModel.create(createTemplateDto);
      return template.save();
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
    queryParams: QueryTemplateDto,
  ): Promise<PaginationResponse<TemplateDocument>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryParams;

    const skip = ((page > 1 ? page : 1) - 1) * (limit > 0 ? limit : 10);

    const whereClause = this.buildTemplateWhereClause(queryParams);

    const sortOptions: any = { [sortBy]: sortOrder === 'ASC' ? 1 : -1 };

    const [templates, count] = await Promise.all([
      this.templateModel
        .find(whereClause)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.templateModel.countDocuments(whereClause).exec(),
    ]);

    return {
      data: templates,
      count,
    };
  }

  async findAllPublic(
    queryParams: QueryTemplateDto,
  ): Promise<PaginationResponse<TemplateDocument>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryParams;

    const skip = ((page > 1 ? page : 1) - 1) * (limit > 0 ? limit : 10);

    const whereClause = this.buildTemplateWhereClause(queryParams);

    const sortOptions: any = { [sortBy]: sortOrder === 'ASC' ? 1 : -1 };

    const [templates, count] = await Promise.all([
      this.templateModel
        .find(whereClause)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.templateModel.countDocuments(whereClause).exec(),
    ]);

    return {
      data: templates,
      count,
    };
  }

  async findById(id: string): Promise<TemplateDocument> {
    const template = await this.templateModel.findById(id).exec();
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    return template;
  }

  async findByIdPublic(id: string): Promise<TemplateDocument> {
    const template = await this.templateModel.findById(id).exec();
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    return template;
  }

  async update(
    id: string,
    updateTemplateDto: UpdateTemplateDto,
  ): Promise<TemplateDocument> {
    try {
      const updatedTemplate = await this.templateModel
        .findByIdAndUpdate(id, updateTemplateDto, { new: true })
        .exec();
      if (!updatedTemplate) {
        throw new NotFoundException('Template not found');
      }
      return updatedTemplate;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Name already exists');
      }
      throw new HttpException(error?.message, error?.status ?? 500, {
        cause: error,
      });
    }
  }

  async delete(id: string): Promise<TemplateDocument> {
    const deletedTemplate = await this.templateModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedTemplate) {
      throw new NotFoundException('Template not found');
    }
    return deletedTemplate;
  }
}
