import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { PaymentStatus } from '@/modules/enum';

export class CreatePaymentDto {
  @ApiProperty({
    required: true,
    example: '507f1f77bcf86cd799439011',
    description: 'Participant ID reference',
  })
  @IsNotEmpty({ message: 'Participant ID cannot be empty' })
  @IsString()
  readonly participantId: string;

  @ApiProperty({
    required: true,
    example: 500,
    description: 'Payment amount',
  })
  @IsNotEmpty({ message: 'Amount cannot be empty' })
  @IsNumber()
  readonly amount: number;

  @ApiProperty({
    required: false,
    example: 'BDT',
    description: 'Payment currency',
    default: 'BDT',
  })
  @IsOptional()
  @IsString()
  readonly currency?: string;

  @ApiProperty({
    required: false,
    example: '2025-08-06T10:00:00Z',
    description: 'Payment date',
  })
  @IsOptional()
  @IsDateString()
  readonly paymentDate?: string;

  @ApiProperty({
    required: true,
    example: 'completed',
    description: 'Payment status',
    enum: PaymentStatus,
  })
  @IsNotEmpty({ message: 'Status cannot be empty' })
  @IsEnum(PaymentStatus)
  readonly status: PaymentStatus;

  @ApiProperty({
    required: true,
    example: 'TXN123456789',
    description: 'Unique transaction ID from payment gateway',
  })
  @IsNotEmpty({ message: 'Transaction ID cannot be empty' })
  @IsString()
  readonly transactionId: string;
}
