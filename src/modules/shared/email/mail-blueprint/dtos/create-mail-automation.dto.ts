import { PlaceholderResource } from '@/modules/enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMailAutomationDto {
  @ApiPropertyOptional({
    required: true,
    example: 'Shirsho',
    description: 'Name of the mail automation optional',
  })
  @IsOptional()
  @IsString()
  readonly name: string;

  @ApiProperty({
    required: true,
    enum: PlaceholderResource,
    example: PlaceholderResource.COURSE,
  })
  @IsNotEmpty({
    message: 'ResourceName cannot be empty or whitespace',
  })
  @IsString()
  resourceName: string;

  @ApiProperty({
    required: true,
    example: 'mongo id',
  })
  @IsNotEmpty({
    message: 'blueprint id cannot be empty or whitespace',
  })
  @IsString()
  bluePrintId: string;
}
