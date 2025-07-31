import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsDate,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { SentMailStatus } from '@/modules/enum';

export class QueryMailHistoryDto {
  @ApiPropertyOptional({
    description: 'Search by email (partial match)',
  })
  @IsOptional()
  @IsString()
  recepitentEmail?: string;

  @ApiPropertyOptional({
    description: 'Search by resource name (partial match)',
  })
  @IsOptional()
  @IsString()
  resourceName?: string;

  @ApiPropertyOptional({
    description: 'Search by status',
    enum: SentMailStatus,
    example: SentMailStatus.SENT,
  })
  @IsOptional()
  @IsEnum(SentMailStatus)
  status: SentMailStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isOpened?: boolean | null;

  @ApiPropertyOptional({
    description: 'Created after this date',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  scheduledAfter?: Date;

  @ApiPropertyOptional({
    description: 'Created before this date',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  scheduledBefore?: Date;

  @ApiPropertyOptional({
    description: 'Opened after this date',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  openedAfter?: Date;

  @ApiPropertyOptional({
    description: 'Opened before this date',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  openedBefore?: Date;

  @ApiPropertyOptional({
    description: 'Sent after this date',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  sentAfter?: Date;

  @ApiPropertyOptional({
    description: 'Sent before this date',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  sentBefore?: Date;

  @ApiPropertyOptional({
    description: 'Created after this date',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  createdAfter?: Date;

  @ApiPropertyOptional({
    description: 'Created before this date',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  createdBefore?: Date;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Sort by field name (e.g., createdAt, totalSentMail)',
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
