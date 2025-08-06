import { ApiProperty } from '@nestjs/swagger';
import { Registration } from '../schema';

export class RegistrationPaginationResponse<T> {
  @ApiProperty({ isArray: true, type: Registration })
  data: T[];

  @ApiProperty({ example: 2 })
  count: number;
}
