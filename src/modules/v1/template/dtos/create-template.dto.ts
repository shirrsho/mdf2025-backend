import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTemplateDto {
  @ApiProperty({
    required: true,
    example: 'Shirsho',
    description: 'Name of the template',
  })
  @IsNotEmpty({ message: 'Name cannot be empty or whitespace' })
  @IsString()
  readonly templateName: string;
}
