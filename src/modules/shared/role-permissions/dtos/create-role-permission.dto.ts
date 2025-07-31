import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRolePermissionDto {
  @ApiProperty({
    required: true,
    example: 'example image field',
  })
  @IsNotEmpty({
    message: 'image field cannot be empty or whitespace',
  })
  readonly roleName: string;

  @ApiProperty({
    required: false,
    example: ['example image field'],
  })
  @IsOptional()
  @IsArray()
  readonly permissionList: string[];
}
