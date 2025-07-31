import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class VerifyUserDto {
  @ApiProperty({
    required: true,
    example: 'false',
  })
  @IsOptional()
  @IsBoolean()
  readonly isverified?: boolean;
}
