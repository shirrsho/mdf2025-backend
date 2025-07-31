import { ApiProperty } from '@nestjs/swagger';
import { Template } from '../schema';

export class TemplatePaginationResponse<T> {
  @ApiProperty({ isArray: true, type: Template })
  data: T[];

  @ApiProperty({ example: 2 })
  count: number;
}
