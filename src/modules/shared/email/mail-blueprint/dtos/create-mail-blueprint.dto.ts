import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMailBlueprintDto {
  @ApiProperty({
    required: true,
    example: 'Blueprint name',
  })
  @IsNotEmpty({
    message: 'Name cannot be empty or whitespace',
  })
  @IsString()
  readonly name: string;

  @ApiProperty({
    required: true,
    example: 'Blueprint name',
  })
  @IsOptional()
  @IsString()
  readonly resourceName: string;

  @ApiProperty({
    required: true,
    example: 'Shirsho {{placeholder}}',
  })
  @IsNotEmpty({
    message: 'Body cannot be empty or whitespace',
  })
  @IsString()
  bodyContent: string;

  @ApiProperty({
    required: true,
    example: 'Shirsho {{placeholder}}',
  })
  @IsNotEmpty({
    message: 'Subject cannot be empty or whitespace',
  })
  @IsString()
  subjectContent: string;

  placeholders: string[];
}
