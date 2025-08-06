import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApplicationStatus } from '@/modules/enum';

export class CreateApplicationDto {
  @ApiProperty({
    required: true,
    example: '507f1f77bcf86cd799439011',
    description: 'Participant ID reference',
  })
  @IsNotEmpty({ message: 'Participant ID cannot be empty' })
  @IsString()
  readonly participantId: string;

  @ApiProperty({
    required: true,
    example: '507f1f77bcf86cd799439012',
    description: 'Job ID reference',
  })
  @IsNotEmpty({ message: 'Job ID cannot be empty' })
  @IsString()
  readonly jobId: string;

  @ApiProperty({
    required: true,
    example: '507f1f77bcf86cd799439013',
    description: 'Company ID reference (denormalized)',
  })
  @IsNotEmpty({ message: 'Company ID cannot be empty' })
  @IsString()
  readonly companyId: string;

  @ApiProperty({
    required: false,
    example: '2025-08-06T10:00:00Z',
    description: 'Application date',
  })
  @IsOptional()
  @IsDateString()
  readonly applicationDate?: string;

  @ApiProperty({
    required: false,
    example: 'pending',
    description: 'Application status',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  readonly status?: ApplicationStatus;
}
