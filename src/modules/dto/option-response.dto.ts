import { ApiProperty } from '@nestjs/swagger';

export class OptionDto {
  @ApiProperty({ example: 'Bad Request' })
  label: string;

  @ApiProperty({ example: 'Invalid request parameters' })
  value: any;

  constructor(partial: Partial<OptionDto>) {
    Object.assign(this, partial);
  }
}
