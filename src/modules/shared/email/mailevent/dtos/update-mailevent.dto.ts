import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateMaileventDto {
  @ApiProperty({
    required: true,
    example: 'Batman',
  })
  @IsNotEmpty({
    message: 'mailevent cannot be empty or whitespace',
  })
  readonly mailevent?: string;
}
