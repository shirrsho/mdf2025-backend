import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Length, NotContains } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    required: true,
    example: 'Shirsho',
  })
  @IsOptional()
  readonly name?: string;

  @ApiProperty({
    required: true,
    example: 'Shirsho',
  })
  @IsOptional()
  readonly imageUrl?: string;

  @ApiProperty({
    required: true,
    example: 'Shirsho',
  })
  @IsOptional()
  readonly description?: string;

  @ApiProperty({
    required: true,
    example: 'Shirsho',
  })
  @IsOptional()
  readonly phone?: string;

  @ApiProperty({
    required: true,
    example: '123456',
  })
  @IsOptional()
  @NotContains(' ', {
    message: 'Password cannot be empty or whitespace',
  })
  @Length(6, 100, {
    message: 'Password must be between 6 and 100 characters long',
  })
  password: string;
}
