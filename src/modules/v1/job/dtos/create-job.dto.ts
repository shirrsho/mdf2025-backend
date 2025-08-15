import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum, IsDateString, IsArray } from 'class-validator';
import { JobType, ExperienceLevel, JobStatus } from '@/modules/enum';

export class CreateJobDto {
  @ApiProperty({
    required: true,
    example: 'Senior Software Developer',
    description: 'Job title',
  })
  @IsNotEmpty({ message: 'Title cannot be empty or whitespace' })
  @IsString()
  readonly title: string;

  @ApiProperty({
    required: true,
    example: 'We are looking for an experienced software developer...',
    description: 'Job description',
  })
  @IsNotEmpty({ message: 'Description cannot be empty' })
  @IsString()
  readonly description: string;

  @ApiProperty({
    required: true,
    example: '507f1f77bcf86cd799439011',
    description: 'Company ID reference',
  })
  @IsNotEmpty({ message: 'Company ID cannot be empty' })
  @IsString()
  readonly company: string;

  @ApiProperty({
    required: true,
    example: 'Dhaka, Bangladesh',
    description: 'Job location',
  })
  @IsNotEmpty({ message: 'Location cannot be empty' })
  @IsString()
  readonly location: string;

  @ApiProperty({
    required: true,
    example: 'full_time',
    description: 'Job type',
    enum: JobType,
  })
  @IsNotEmpty({ message: 'Job type cannot be empty' })
  @IsEnum(JobType)
  readonly type: JobType;

  @ApiProperty({
    required: true,
    example: 'senior',
    description: 'Experience level required',
    enum: ExperienceLevel,
  })
  @IsNotEmpty({ message: 'Experience level cannot be empty' })
  @IsEnum(ExperienceLevel)
  readonly experienceLevel: ExperienceLevel;

  @ApiProperty({
    required: false,
    example: 80000,
    description: 'Minimum salary',
  })
  @IsOptional()
  @IsNumber()
  readonly salaryMin?: number;

  @ApiProperty({
    required: false,
    example: 120000,
    description: 'Maximum salary',
  })
  @IsOptional()
  @IsNumber()
  readonly salaryMax?: number;

  @ApiProperty({
    required: false,
    example: 'BDT',
    description: 'Salary currency',
  })
  @IsOptional()
  @IsString()
  readonly currency?: string;

  @ApiProperty({
    required: true,
    example: ['JavaScript', 'Node.js', 'React'],
    description: 'Required skills',
    type: [String],
  })
  @IsNotEmpty({ message: 'Skills cannot be empty' })
  @IsArray()
  @IsString({ each: true })
  readonly skills: string[];

  @ApiProperty({
    required: true,
    example: ['Bachelor degree in Computer Science', '3+ years experience'],
    description: 'Job requirements',
    type: [String],
  })
  @IsNotEmpty({ message: 'Requirements cannot be empty' })
  @IsArray()
  @IsString({ each: true })
  readonly requirements: string[];

  @ApiProperty({
    required: false,
    example: ['Health insurance', 'Flexible working hours'],
    description: 'Job benefits',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly benefits?: string[];

  @ApiProperty({
    required: true,
    example: '2025-12-31T23:59:59Z',
    description: 'Application deadline',
  })
  @IsNotEmpty({ message: 'Application deadline cannot be empty' })
  @IsDateString()
  readonly applicationDeadline: string;

  @ApiProperty({
    required: false,
    example: 'open',
    description: 'Job status',
    enum: JobStatus,
    default: JobStatus.OPEN,
  })
  @IsOptional()
  @IsEnum(JobStatus)
  readonly status?: JobStatus;
}
