import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsUrl, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWebinarDto {
  @ApiProperty({
    required: true,
    example: 'Career Development in Tech Industry',
    description: 'Webinar title',
  })
  @IsNotEmpty({ message: 'Title cannot be empty or whitespace' })
  @IsString()
  readonly title: string;

  @ApiProperty({
    required: true,
    example: 'Join us for an insightful discussion on career development...',
    description: 'Webinar description',
  })
  @IsNotEmpty({ message: 'Description cannot be empty' })
  @IsString()
  readonly description: string;

  @ApiProperty({
    required: true,
    example: '507f1f77bcf86cd799439011',
    description: 'Host company ID reference',
  })
  @IsNotEmpty({ message: 'Host ID cannot be empty' })
  @IsString()
  readonly host: string;

  @ApiProperty({
    required: true,
    example: '507f1f77bcf86cd799439012',
    description: 'Timeslot ID reference',
  })
  @IsNotEmpty({ message: 'Timeslot ID cannot be empty' })
  @IsString()
  readonly timeslot: string;

  @ApiProperty({
    required: true,
    example: 60,
    description: 'Duration of the webinar in minutes',
    type: Number,
    minimum: 1,
  })
  @IsNotEmpty({ message: 'Duration cannot be empty' })
  @IsNumber({}, { message: 'Duration must be a number' })
  @Min(1, { message: 'Duration must be at least 1 minute' })
  readonly duration: number;

  @ApiProperty({
    required: false,
    example: '2025-08-15T14:00:00Z',
    description: 'Specific start time within the timeslot (optional, defaults to timeslot start time)',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  readonly scheduledStartTime?: Date;

  @ApiProperty({
    required: false,
    example: 100,
    description: 'Maximum number of participants',
  })
  @IsOptional()
  @IsNumber()
  readonly maxParticipants?: number;

  @ApiProperty({
    required: false,
    example: 'https://zoom.us/j/123456789',
    description: 'Meeting link for the webinar',
  })
  @IsOptional()
  @IsUrl()
  readonly meetingLink?: string;

  @ApiProperty({
    required: false,
    example: 'Technology',
    description: 'Webinar category/topic',
  })
  @IsOptional()
  @IsString()
  readonly category?: string;

  @ApiProperty({
    required: false,
    example: 'https://company.com/webinar-banner.jpg',
    description: 'Webinar banner image URL',
  })
  @IsOptional()
  @IsUrl()
  readonly bannerUrl?: string;
}
