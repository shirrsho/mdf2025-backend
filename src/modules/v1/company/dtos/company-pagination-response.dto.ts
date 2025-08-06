import { ApiProperty } from '@nestjs/swagger';
import { Company } from '../schema';

export class CompanyPaginationResponse<T> {
  @ApiProperty({ isArray: true, type: Company })
  data: T[];

  @ApiProperty({ example: 2 })
  count: number;
}
