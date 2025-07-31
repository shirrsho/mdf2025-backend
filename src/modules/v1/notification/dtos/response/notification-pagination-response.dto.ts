import { ApiProperty } from '@nestjs/swagger';
import { Notification } from '../../schema';

export class NotificationPaginationResponse<T> {
  @ApiProperty({ isArray: true, type: Notification })
  data: T[];

  @ApiProperty({ example: 2 })
  count: number;

  @ApiProperty({ example: 2 })
  unreadCount: number;
}
