import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MailAutomation, MailAutomationDocument } from '../schema';
import { Model } from 'mongoose';
import {
  SendMailBlueprintDto,
  CreateMailAutomationDto,
  CreateMailBlueprintAutomationDto,
} from '../dtos';
import { flattenObject } from '@/modules/utils';
import { MailBlueprintCurdService } from './mail-blueprint-curd.service';

@Injectable()
export class MailBlueprintGeneralService {
  constructor(
    @InjectModel(MailAutomation.name)
    private readonly mailAutomationModel: Model<MailAutomationDocument>,
    private readonly mailBlueprintCrudService: MailBlueprintCurdService,
  ) {}

  async getBlueprintById(id: string) {
    return await this.mailBlueprintCrudService.findById(id);
  }

  async getBlueprintByName(name: string) {
    return await this.mailBlueprintCrudService.findByName(name);
  }

  async getBlueprintByNameOrId(name?: string, id?: string) {
    if (name) {
      return await this.getBlueprintByName(name);
    } else if (id) {
      return await this.getBlueprintById(id);
    } else {
      throw new NotFoundException('Blueprint not found');
    }
  }

  async sendAutomatedEmail(
    data: any,
    resourceName: string,
    to: string[],
    cc?: string[],
    bcc?: string[],
  ) {
    const mailAutomation = await this.mailAutomationModel
      .findOne({ resourceName: resourceName })
      .exec();
    if (!mailAutomation) {
      throw new NotFoundException('Mail Automation not found');
    }

    this.sendBlueprintMail({
      id: mailAutomation.bluePrintId,
      to: to,
      cc: cc,
      bcc: bcc,
      placeData: data,
    });
  }

  async addMailAutomationWithTemplate(
    mailAutomationDto: CreateMailBlueprintAutomationDto,
  ) {
    const mailAutomation = await this.mailAutomationModel
      .findOne({ resourceName: mailAutomationDto.resourceName })
      .exec();

    const bluePrint = await this.mailBlueprintCrudService.create({
      name: mailAutomationDto.name,
      resourceName: mailAutomationDto.resourceName,
      subjectContent: mailAutomationDto.subjectContent,
      bodyContent: mailAutomationDto.bodyContent,
      placeholders: mailAutomationDto.placeholders,
    });
    if (!mailAutomation) {
      mailAutomationDto.bluePrintId = bluePrint._id.toHexString();
      return await this.mailAutomationModel.create(mailAutomationDto);
    } else {
      mailAutomation.bluePrintId = bluePrint._id.toHexString();
      return await mailAutomation.save();
    }
  }

  async createOrUpdateAutomatedMail(
    mailAutomationDto: CreateMailAutomationDto,
  ) {
    const mailAutomation = await this.mailAutomationModel
      .findOne({ resourceName: mailAutomationDto.resourceName })
      .exec();
    if (!mailAutomation) {
      return await this.mailAutomationModel.create(mailAutomationDto);
    } else {
      mailAutomation.bluePrintId = mailAutomationDto.bluePrintId;
      return await mailAutomation.save();
    }
  }

  async sendBlueprintMail(sendMailBlueprintDto: SendMailBlueprintDto) {
    const bluePrint = await this.mailBlueprintCrudService.findById(
      sendMailBlueprintDto.id,
    );

    let subject = bluePrint.subjectContent;
    let body = bluePrint.bodyContent;

    const data = flattenObject(sendMailBlueprintDto.placeData);

    const missingPlaceholders = bluePrint.placeholders.filter(
      (placeholder) => !(placeholder in data),
    );

    if (missingPlaceholders.length > 0) {
      throw new HttpException(
        `Missing placeholders: ${missingPlaceholders.join(', ')}`,
        400,
      );
    }

    for (const key in data) {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(placeholder, data[key]);
      body = body.replace(placeholder, data[key]);
    }

    const sendMailPromise = [];

    sendMailBlueprintDto.to.map((to) => {
      sendMailPromise.push(
        to,
        // this.mailSenderService.sendBlueprintEmail({
        // to: to,
        // cc: sendMailBlueprintDto.cc,
        // bcc: sendMailBlueprintDto.bcc,
        //   subject: subject,
        //   text: body,
        // }),
      );
    });

    await Promise.all(sendMailPromise);
    return 'done';
  }

  async sendPromotionalMail(to: string[], placeData: any, blueprintId: string) {
    return await this.sendBlueprintMail({
      id: blueprintId,
      to: to,
      placeData: placeData,
    });
  }
}
