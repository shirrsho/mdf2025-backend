import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({
    required: true,
    example: 'Shirsho',
    description: 'Name of the payment',
  })
  @IsNotEmpty({ message: 'Name cannot be empty or whitespace' })
  @IsString()
  readonly paymentName: string;
}
