import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTimeslotDto {
  @ApiProperty({
    required: true,
    example: 'Morning Session',
    description: 'Name of the timeslot',
  })
  @IsNotEmpty({ message: 'Name cannot be empty or whitespace' })
  @IsString()
  readonly timeslotName: string;

  @ApiProperty({
    required: true,
    example: '2025-08-15T09:00:00Z',
    description: 'Start time of the timeslot',
  })
  @IsNotEmpty({ message: 'Start time is required' })
  @Type(() => Date)
  @IsDate()
  readonly startTime: Date;

  @ApiProperty({
    required: true,
    example: '2025-08-15T12:00:00Z',
    description: 'End time of the timeslot',
  })
  @IsNotEmpty({ message: 'End time is required' })
  @Type(() => Date)
  @IsDate()
  readonly endTime: Date;

  @ApiProperty({
    required: false,
    example: 'Day 1 timeslot for webinars',
    description: 'Optional description of the timeslot',
  })
  @IsOptional()
  @IsString()
  readonly description?: string;
}
