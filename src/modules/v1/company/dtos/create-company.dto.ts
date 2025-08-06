import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsUrl, IsEnum } from 'class-validator';
import { CompanySize } from '@/modules/enum';

export class CreateCompanyDto {
  @ApiProperty({
    required: true,
    example: 'Tech Corp Ltd',
    description: 'Name of the company',
  })
  @IsNotEmpty({ message: 'Name cannot be empty or whitespace' })
  @IsString()
  readonly name: string;

  @ApiProperty({
    required: true,
    example: 'Leading technology solutions provider',
    description: 'Company description',
  })
  @IsNotEmpty({ message: 'Description cannot be empty' })
  @IsString()
  readonly description: string;

  @ApiProperty({
    required: true,
    example: 'Technology',
    description: 'Company industry',
  })
  @IsNotEmpty({ message: 'Industry cannot be empty' })
  @IsString()
  readonly industry: string;

  @ApiProperty({
    required: true,
    example: 'Dhaka, Bangladesh',
    description: 'Company location',
  })
  @IsNotEmpty({ message: 'Location cannot be empty' })
  @IsString()
  readonly location: string;

  @ApiProperty({
    required: true,
    example: 'https://techcorp.com',
    description: 'Company website',
  })
  @IsNotEmpty({ message: 'Website cannot be empty' })
  @IsUrl()
  readonly website: string;

  @ApiProperty({
    required: false,
    example: 'https://techcorp.com/logo.png',
    description: 'Company logo URL',
  })
  @IsOptional()
  @IsUrl()
  readonly logoUrl?: string;

  @ApiProperty({
    required: true,
    example: 'medium',
    description: 'Company size',
    enum: CompanySize,
  })
  @IsNotEmpty({ message: 'Size cannot be empty' })
  @IsEnum(CompanySize)
  readonly size: CompanySize;

  @ApiProperty({
    required: false,
    example: '+8801234567890',
    description: 'Company contact number',
  })
  @IsOptional()
  @IsString()
  readonly contactNumber?: string;

  @ApiProperty({
    required: false,
    example: 'contact@techcorp.com',
    description: 'Company contact email',
  })
  @IsOptional()
  @IsString()
  readonly contactEmail?: string;
}
