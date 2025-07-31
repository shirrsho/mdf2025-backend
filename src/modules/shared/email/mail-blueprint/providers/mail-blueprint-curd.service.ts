import {
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MailBlueprint, MailBlueprintDocument } from '../schema';
import { Model } from 'mongoose';
import {
  CreateMailBlueprintDto,
  UpdateMailBlueprintDto,
  DynamicDto,
} from '../dtos';
import { PaginationResponse, buildWhereBuilder } from '@/modules/utils';
import { OptionDto } from '@/modules/dto';
import { MailResourceName } from '@/modules/enum';

@Injectable()
export class MailBlueprintCurdService {
  constructor(
    @InjectModel(MailBlueprint.name)
    private readonly mailBlueprintModel: Model<MailBlueprintDocument>,
  ) {}

  async count(
    queryParams: DynamicDto = { query: { where: {} } },
  ): Promise<number> {
    return this.mailBlueprintModel
      .countDocuments(queryParams.query?.where)
      .exec();
  }

  async save(mailBlueprint: MailBlueprintDocument) {
    return mailBlueprint.save();
  }

  async options(): Promise<OptionDto[]> {
    const blueprints = await this.mailBlueprintModel
      .find()
      .select('name')
      .exec();
    return blueprints.map((blueprint) => ({
      label: blueprint.name,
      value: blueprint._id,
    }));
  }

  async promotionOptions(): Promise<OptionDto[]> {
    const blueprints = await this.mailBlueprintModel
      .find({
        resourceName: MailResourceName.PROMOTION,
      })
      .select('name')
      .exec();
    return blueprints.map((blueprint) => ({
      label: blueprint.name,
      value: blueprint._id,
    }));
  }

  async create(
    createMailBlueprintDto: CreateMailBlueprintDto,
  ): Promise<MailBlueprintDocument> {
    try {
      const placeholderRegex = /{{\s*([\w\s]+)\s*}}/g;

      const subject = createMailBlueprintDto.subjectContent.replace(
        placeholderRegex,
        (_, p1) => `{{${p1.replace(/\s+/g, '')}}}`,
      );
      const body = createMailBlueprintDto.bodyContent.replace(
        placeholderRegex,
        (_, p1) => `{{${p1.replace(/\s+/g, '')}}}`,
      );
      const placeholders = [
        ...new Set([
          ...[...subject.matchAll(placeholderRegex)].map((match) =>
            match[1].replace(/\s+/g, ''),
          ),
          ...[...body.matchAll(placeholderRegex)].map((match) =>
            match[1].replace(/\s+/g, ''),
          ),
        ]),
      ];

      const mailBlueprint = await this.mailBlueprintModel.create({
        name: createMailBlueprintDto.name,
        subjectContent: subject,
        bodyContent: body,
        placeholders: placeholders,
      });
      if (createMailBlueprintDto.resourceName) {
        mailBlueprint.resourceName = createMailBlueprintDto.resourceName;
      }
      return mailBlueprint.save();
    } catch (error) {
      if (error) {
        if (error?.code === 11000) {
          throw new ConflictException('Blueprint already exists');
        }
        throw new HttpException(error?.message, error?.status);
      }
    }
  }

  async findAll(
    queryParams: DynamicDto,
  ): Promise<PaginationResponse<MailBlueprintDocument>> {
    const {
      select = {},
      where = {},
      page = 1,
      limit = 10,
      sort = 'newest',
    } = queryParams?.query || {};
    const skip = ((page > 1 ? page : 1) - 1) * (limit > 0 ? limit : 1);
    const whereClause = buildWhereBuilder(where);
    const mailBlueprints = await this.mailBlueprintModel
      .find(whereClause)
      .select(select)
      .sort({ createdAt: sort === 'newest' ? -1 : 1 })
      .limit(limit)
      .skip(skip)
      .exec();
    const count = await this.mailBlueprintModel
      .countDocuments(whereClause)
      .exec();
    return {
      data: mailBlueprints,
      count,
    };
  }

  async findAllPublic(
    queryParams: DynamicDto,
  ): Promise<PaginationResponse<MailBlueprintDocument>> {
    const {
      select = {},
      where = {},
      page = 1,
      limit = 10,
      sort = 'newest',
    } = queryParams?.query || {};
    const skip = ((page > 1 ? page : 1) - 1) * (limit > 0 ? limit : 1);
    const whereClause = buildWhereBuilder(where);
    const mailBlueprints = await this.mailBlueprintModel
      .find({ ...whereClause })
      .select(select)
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: sort === 'newest' ? -1 : 1 })
      .exec();
    const count = await this.mailBlueprintModel
      .countDocuments({ ...whereClause })
      .exec();
    return { data: mailBlueprints, count };
  }

  async findById(id: string): Promise<MailBlueprintDocument> {
    const mailBlueprint = await this.mailBlueprintModel.findById(id).exec();
    if (!mailBlueprint) {
      throw new NotFoundException('MailBlueprint not found');
    }
    return mailBlueprint;
  }
  async findByName(name: string): Promise<MailBlueprintDocument> {
    const mailBlueprint = await this.mailBlueprintModel
      .findOne({ name: name })
      .exec();
    if (!mailBlueprint) {
      throw new NotFoundException('MailBlueprint not found');
    }
    return mailBlueprint;
  }

  async findByIdPublic(id: string): Promise<MailBlueprintDocument> {
    const mailBlueprint = await this.mailBlueprintModel.findById(id).exec();
    if (!mailBlueprint) {
      throw new NotFoundException('MailBlueprint not found');
    }
    return mailBlueprint;
  }

  async update(
    id: string,
    updateMailBlueprintDto: UpdateMailBlueprintDto,
  ): Promise<MailBlueprintDocument> {
    const updatedMailBlueprint = await this.mailBlueprintModel
      .findById(id)
      .exec();
    if (!updatedMailBlueprint) {
      throw new NotFoundException('MailBlueprint not found');
    }
    const placeholderRegex = /{{\s*([\w\s]+)\s*}}/g;
    const subject = updateMailBlueprintDto.subjectContent.replace(
      placeholderRegex,
      (_, p1) => `{{${p1.replace(/\s+/g, '')}}}`,
    );
    const body = updateMailBlueprintDto.bodyContent.replace(
      placeholderRegex,
      (_, p1) => `{{${p1.replace(/\s+/g, '')}}}`,
    );
    const placeholders = [
      ...new Set([
        ...[...subject.matchAll(placeholderRegex)].map((match) =>
          match[1].replace(/\s+/g, ''),
        ),
        ...[...body.matchAll(placeholderRegex)].map((match) =>
          match[1].replace(/\s+/g, ''),
        ),
      ]),
    ];
    updatedMailBlueprint.bodyContent = body;
    updatedMailBlueprint.subjectContent = subject;
    updatedMailBlueprint.placeholders = placeholders;
    return updatedMailBlueprint.save();
  }

  async delete(id: string): Promise<MailBlueprintDocument> {
    const deletedMailBlueprint = await this.mailBlueprintModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedMailBlueprint) {
      throw new NotFoundException('MailBlueprint not found');
    }
    return deletedMailBlueprint;
  }
}
