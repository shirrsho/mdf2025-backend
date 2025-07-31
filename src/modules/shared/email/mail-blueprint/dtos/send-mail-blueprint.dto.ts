import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendMailBlueprintDto {
  @ApiProperty({
    required: true,
    example: 'mongo id',
  })
  @IsNotEmpty({
    message: 'blue print cannot be empty or whitespace',
  })
  @IsString()
  readonly id: string;

  @ApiProperty({
    required: true,
    example: ['hniqbal01@gmail.com'],
  })
  @IsNotEmpty({
    message: 'Name cannot be empty or whitespace',
  })
  readonly to: string[];

  @ApiPropertyOptional({
    required: true,
    example: ['hniqbal01@gmail.com', 'hniqbal01@gmail.com'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly cc?: string[];

  @ApiPropertyOptional({
    required: true,
    example: ['hniqbal01@gmail.com', 'hniqbal01@gmail.com'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly bcc?: string[];

  @ApiProperty({
    type: Object,
    description:
      'JSON object with placeholders and their values. can be a nested json',
    example: {
      adifferent_placeholder: 'Shirsho',
      placeholderwithspace: '<h1>ExampleCorp</h1>',
    },
  })
  @IsOptional()
  readonly placeData: any;
}
