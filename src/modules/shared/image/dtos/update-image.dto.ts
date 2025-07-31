import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateImageDto {
  @ApiProperty({
    required: true,
    example: 'Batman',
  })
  @IsNotEmpty({
    message: 'image cannot be empty or whitespace',
  })
  readonly image?: string;
}
