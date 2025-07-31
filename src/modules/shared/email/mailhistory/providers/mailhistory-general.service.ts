import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MailHistory, MailHistoryDocument } from '../schema';
import { Model, Types } from 'mongoose';
import { BaseService } from '@/modules/base';
import { CreateMailHistoryDto } from '../dtos';
import { SentMailStatus } from '@/modules/enum';

@Injectable()
export class MailHistoryGeneralService extends BaseService<MailHistoryGeneralService> {
  constructor(
    @InjectModel(MailHistory.name)
    private readonly mailhistoryModel: Model<MailHistoryDocument>,
  ) {
    super(MailHistoryGeneralService.name);
  }

  async createHistory(mailHistory: CreateMailHistoryDto) {
    try {
      const {
        recepitentEmail,
        resourceId,
        resourceName,
        tag,
        status,
        blueprint,
        placeValues,
        cc,
        bcc,
        priority,
        scheduleTime,
        ...rest
      } = mailHistory;

      const historyDocument = {
        recepitentEmail,
        resourceId,
        resourceName,
        tag,
        status,
        blueprint,
        placeValues,
        cc,
        bcc,
        priority,
        scheduleTime,
        rest,
      };

      const history = await this.mailhistoryModel.create(historyDocument);
      return await history.save();
    } catch (error) {
      this.logError('Error creating mail history:', error);
    }
  }

  async getScheduledMailHistory() {
    const now = new Date();
    const scheduledMails = await this.mailhistoryModel
      .find({
        status: SentMailStatus.SCHEDULED,
        scheduleTime: { $lte: now },
      })
      .sort({ scheduleTime: 1 })
      .limit(Number(process.env.MAIL_LIMIT_PER_MINUTE) || 5);
    const ids = scheduledMails.map((mail) => mail._id);

    if (ids.length === 0) return [];

    await this.mailhistoryModel.updateMany(
      { _id: { $in: ids } },
      { $set: { status: SentMailStatus.QUEUED } },
    );

    return scheduledMails;
  }

  async updateHistoryStatus(id: string | number, status: SentMailStatus) {
    if (!id) {
      this.logError('History id is required');
      return;
    }
    if (!Types.ObjectId.isValid(id)) {
      this.logError(`Invalid id format: ${id}`);
      return;
    }
    const history = await this.mailhistoryModel.findById(id);
    if (!history) {
      this.logError('History not found');
      return;
    }
    history.status = status;
    if (status === SentMailStatus.COMPLETED) {
      history.sentTimes.push(new Date());
    }
    return await history.save();
  }

  async updateMailOpened(id: string) {
    const history = await this.mailhistoryModel.findById(id);
    if (!history) {
      this.logError('History not found');
      return;
    }
    history.isOpened = true;
    history.openTimes.push(new Date());
    return await history.save();
  }

  async getHistoryByResourceId(resourceId: string, tag?: string) {
    const history = await this.mailhistoryModel.find({
      resourceId: resourceId,
      tag: tag,
    });
    return history;
  }

  async getHistoryById(id: string) {
    const history = await this.mailhistoryModel.findById(id);
    return history;
  }

  async logControllerError(error) {
    this.logError('Controller error:', error);
  }

  async getEmailStat(email: string) {
    const stats = await this.mailhistoryModel.aggregate([
      { $match: { recepitentEmail: email } },
      {
        $group: {
          _id: null,
          sentCount: {
            $sum: {
              $cond: [{ $eq: ['$status', SentMailStatus.COMPLETED] }, 1, 0],
            },
          },
          openedCount: {
            $sum: { $cond: ['$isOpened', 1, 0] },
          },
          clickedCount: {
            $sum: { $cond: ['$isClicked', 1, 0] },
          },
          queuedCount: {
            $sum: {
              $cond: [{ $eq: ['$status', SentMailStatus.QUEUED] }, 1, 0],
            },
          },
          scheduledCount: {
            $sum: {
              $cond: [{ $eq: ['$status', SentMailStatus.SCHEDULED] }, 1, 0],
            },
          },
        },
      },
    ]);
    return stats.length > 0
      ? {
          sentCount: stats[0].sentCount,
          openedCount: stats[0].openedCount,
          clickedCount: stats[0].clickedCount,
          queuedCount: stats[0].queuedCount,
          scheduledCount: stats[0].scheduledCount,
        }
      : {
          sentCount: 0,
          openedCount: 0,
          clickedCount: 0,
          queuedCount: 0,
          scheduledCount: 0,
        };
  }
}
