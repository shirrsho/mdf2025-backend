import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateWebinarDto {
  @ApiProperty({
    required: true,
    example: 'Shirsho',
    description: 'Name of the webinar',
  })
  @IsNotEmpty({ message: 'Name cannot be empty or whitespace' })
  @IsString()
  readonly webinarName: string;
}
