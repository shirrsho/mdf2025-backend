import { ApiProperty } from '@nestjs/swagger';
import { MailAutomation } from '../../schema';

export class MailAutomationPaginationResponse<T> {
  @ApiProperty({ isArray: true, type: MailAutomation })
  data: T[];

  @ApiProperty({ example: 2 })
  count: number;
}
