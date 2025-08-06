import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateJobDto {
  @ApiProperty({
    required: true,
    example: 'Shirsho',
    description: 'Name of the job',
  })
  @IsNotEmpty({ message: 'Name cannot be empty or whitespace' })
  @IsString()
  readonly jobName: string;
}
