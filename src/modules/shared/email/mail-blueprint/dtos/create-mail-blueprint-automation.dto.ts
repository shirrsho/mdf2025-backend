import { PlaceholderResource } from '@/modules/enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMailBlueprintAutomationDto {
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

  bluePrintId: string;
  placeholders: string[];
}
