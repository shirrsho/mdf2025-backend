import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateImageDto {
  @ApiProperty({
    required: true,
    example: 'example image field',
  })
  @IsNotEmpty({
    message: 'image field cannot be empty or whitespace',
  })
  readonly name: string;
}
