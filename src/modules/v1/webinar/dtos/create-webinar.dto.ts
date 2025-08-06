import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum, IsDateString, IsUrl } from 'class-validator';
import { WebinarStatus } from '@/modules/enum';

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
  readonly hostId: string;

  @ApiProperty({
    required: true,
    example: '2025-08-15T14:00:00Z',
    description: 'Webinar scheduled date and time',
  })
  @IsNotEmpty({ message: 'Scheduled date cannot be empty' })
  @IsDateString()
  readonly scheduledDate: string;

  @ApiProperty({
    required: true,
    example: 90,
    description: 'Duration in minutes',
  })
  @IsNotEmpty({ message: 'Duration cannot be empty' })
  @IsNumber()
  readonly duration: number;

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
    example: 'scheduled',
    description: 'Webinar status',
    enum: WebinarStatus,
    default: WebinarStatus.SCHEDULED,
  })
  @IsOptional()
  @IsEnum(WebinarStatus)
  readonly status?: WebinarStatus;

  @ApiProperty({
    required: false,
    example: 'https://company.com/webinar-banner.jpg',
    description: 'Webinar banner image URL',
  })
  @IsOptional()
  @IsUrl()
  readonly bannerUrl?: string;
}
