import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryWebinarDto {
  @ApiPropertyOptional({
    description: 'Search by webinar name (partial match)',
  })
  @IsOptional()
  @IsString()
  webinarName?: string;

  @ApiPropertyOptional({ description: 'Minimum total' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minTotal?: number;

  @ApiPropertyOptional({ description: 'Maximum total' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxTotal?: number;

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
