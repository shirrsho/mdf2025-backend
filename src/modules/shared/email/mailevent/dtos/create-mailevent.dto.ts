import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateMaileventDto {
  @ApiProperty({
    required: true,
    example: 'example mailevent field',
  })
  @IsNotEmpty({
    message: 'mailevent field cannot be empty or whitespace',
  })
  readonly name: string;
}
