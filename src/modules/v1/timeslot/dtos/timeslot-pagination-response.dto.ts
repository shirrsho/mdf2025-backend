import { ApiProperty } from '@nestjs/swagger';
import { Timeslot } from '../schema';

export class TimeslotPaginationResponse<T> {
  @ApiProperty({ isArray: true, type: Timeslot })
  data: T[];

  @ApiProperty({ example: 2 })
  count: number;
}
