import { ApiProperty } from '@nestjs/swagger';
import { MailHistory } from '../schema';

export class PromotionPaginationResponse<T> {
  @ApiProperty({ isArray: true, type: MailHistory })
  data: T[];

  @ApiProperty({ example: 2 })
  count: number;
}
