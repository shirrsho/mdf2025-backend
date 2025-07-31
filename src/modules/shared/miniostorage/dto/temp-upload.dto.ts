import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class TempUploadDto {
  @ApiProperty({
    required: true,
    example: false,
  })
  @IsOptional()
  readonly isTemp: boolean = false;
}
