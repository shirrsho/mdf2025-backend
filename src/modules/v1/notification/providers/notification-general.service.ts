import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { buildWhereBuilder } from '@/modules/utils';
import { Notification, NotificationDocument } from '../schema';
import { DynamicDto, NotificationPaginationResponse } from '../dtos';

@Injectable()
export class NotificationGeneralService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async createNotification(
    userId: string,
    message: string,
    url?: string,
  ): Promise<Notification> {
    const notification = new this.notificationModel({
      userId,
      message,
      url,
    });
    return notification.save();
  }

  async findAll(
    queryParams: DynamicDto,
    userId: string,
  ): Promise<NotificationPaginationResponse<NotificationDocument>> {
    const {
      select = {},
      where = {},
      page = 1,
      limit = 10,
      sort = 'newest',
    } = queryParams?.query || {};
    const skip = ((page > 1 ? page : 1) - 1) * (limit > 0 ? limit : 1);
    const whereClause = buildWhereBuilder(where);

    const notificationPromise = this.notificationModel
      .find({ ...whereClause, userId })
      .select(select)
      .sort({ createdAt: sort === 'newest' ? -1 : 1 })
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 })
      .exec();
    const countPromise = this.notificationModel
      .countDocuments({ ...whereClause, userId })
      .exec();
    const unReadCountPromise = this.notificationModel.countDocuments({
      ...whereClause,
      userId,
      isRead: false,
    });
    const [notifications, count, unreadCount] = await Promise.all([
      notificationPromise,
      countPromise,
      unReadCountPromise,
    ]);
    return { data: notifications, count, unreadCount };
  }

  async count(queryParams: DynamicDto, userId: string): Promise<number> {
    const { where = {} } = queryParams?.query || {};
    return this.notificationModel.countDocuments({ ...where, userId }).exec();
  }

  async findAllUnread(userId: string): Promise<Notification[]> {
    return this.notificationModel.find({ userId, isRead: false }).exec();
  }

  async markAsRead(id: string): Promise<Notification | null> {
    const notification = await this.notificationModel.findById(id).exec();
    if (notification) {
      notification.isRead = true;
      return notification.save();
    }
    return null;
  }
}
