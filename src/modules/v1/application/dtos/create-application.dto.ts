import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty({
    required: true,
    example: 'Shirsho',
    description: 'Name of the application',
  })
  @IsNotEmpty({ message: 'Name cannot be empty or whitespace' })
  @IsString()
  readonly applicationName: string;
}
