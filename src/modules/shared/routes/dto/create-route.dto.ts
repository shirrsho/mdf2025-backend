import { ApiProperty } from '@nestjs/swagger';
import { PathSource } from '@/modules/enum';

import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRouteDto {
  @ApiProperty({ required: false, description: 'method name', example: 'get' })
  @IsString()
  @IsOptional()
  methode: string;

  @ApiProperty({ required: false, description: 'path name', example: '/user' })
  @IsString()
  @IsNotEmpty()
  path: string;

  @ApiProperty({
    required: false,
    description: 'source type',
    enum: PathSource,
    example: PathSource.FRONTEND,
  })
  @IsEnum(PathSource)
  @IsNotEmpty()
  source: PathSource;

  permissionName?: string;
}
