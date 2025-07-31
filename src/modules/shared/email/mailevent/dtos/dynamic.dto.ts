import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class DynamicDto {
  @ApiProperty({
    required: false,
    example: {
      query: {
        select: { name: true },
        where: { email: 'hniqbal01@gmail.com' },
        page: 1,
        limit: 10,
      },
    },
  })
  @IsOptional()
  query: any;
}
