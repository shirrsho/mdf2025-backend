import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from '@/modules/base';
import { ErrorLogging, ErrorLoggingDocument } from '../schema';

@Injectable()
export class ErrorLoggingGeneralService extends BaseService<ErrorLoggingGeneralService> {
  constructor(
    @InjectModel(ErrorLogging.name)
    private readonly errorLoggingModel: Model<ErrorLoggingDocument>,
  ) {
    super(ErrorLoggingGeneralService.name);
  }

  async createErrorLog(errorLog: ErrorLogging) {
    const newErrorLog = new this.errorLoggingModel(errorLog);
    return await newErrorLog.save();
  }
}
