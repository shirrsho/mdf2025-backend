import { ApiProperty } from '@nestjs/swagger';
import { Webinar } from '../schema';

export class WebinarPaginationResponse<T> {
  @ApiProperty({ isArray: true, type: Webinar })
  data: T[];

  @ApiProperty({ example: 2 })
  count: number;
}
