import { ApiProperty } from '@nestjs/swagger';
import { Job } from '../schema';

export class JobPaginationResponse<T> {
  @ApiProperty({ isArray: true, type: Job })
  data: T[];

  @ApiProperty({ example: 2 })
  count: number;
}
