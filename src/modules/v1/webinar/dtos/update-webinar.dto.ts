import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { CreateWebinarDto } from './create-webinar.dto';
import { WebinarStatus } from '@/modules/enum';

export class UpdateWebinarDto extends PartialType(CreateWebinarDto) {
  @ApiProperty({
    required: false,
    example: 'active',
    description: 'Webinar status - can only be changed during updates',
    enum: WebinarStatus,
  })
  @IsOptional()
  @IsEnum(WebinarStatus)
  readonly status?: WebinarStatus;
}
