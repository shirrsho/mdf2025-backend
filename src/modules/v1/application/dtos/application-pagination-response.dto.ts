import { ApiProperty } from '@nestjs/swagger';
import { Application } from '../schema';

export class ApplicationPaginationResponse<T> {
  @ApiProperty({ isArray: true, type: Application })
  data: T[];

  @ApiProperty({ example: 2 })
  count: number;
}
