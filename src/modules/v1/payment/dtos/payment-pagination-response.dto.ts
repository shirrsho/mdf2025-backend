import { ApiProperty } from '@nestjs/swagger';
import { Payment } from '../schema';

export class PaymentPaginationResponse<T> {
  @ApiProperty({ isArray: true, type: Payment })
  data: T[];

  @ApiProperty({ example: 2 })
  count: number;
}
