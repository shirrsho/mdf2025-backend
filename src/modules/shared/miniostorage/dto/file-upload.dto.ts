import { IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadFileDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'File to upload',
  })
  file: any;

  @ApiPropertyOptional({
    required: true,
    example: false,
  })
  @IsOptional()
  readonly isTemp: boolean = false;

  // Optional properties can be added as needed
}
