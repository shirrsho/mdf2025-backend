import { ApiProperty } from '@nestjs/swagger';
import { MailBlueprint } from '../../schema';

export class MailBlueprintPaginationResponse<T> {
  @ApiProperty({ isArray: true, type: MailBlueprint })
  data: T[];

  @ApiProperty({ example: 2 })
  count: number;
}
