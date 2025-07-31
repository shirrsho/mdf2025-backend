import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../schema';

export class UserPaginationResponse<T> {
  @ApiProperty({ isArray: true, type: User })
  data: T[];

  @ApiProperty({ example: 2 })
  count: number;
}
