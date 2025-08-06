import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateRegistrationDto {
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
    example: '507f1f77bcf86cd799439012',
    description: 'Webinar ID reference',
  })
  @IsNotEmpty({ message: 'Webinar ID cannot be empty' })
  @IsString()
  readonly webinarId: string;

  @ApiProperty({
    required: false,
    example: '2025-08-06T10:00:00Z',
    description: 'Registration date',
  })
  @IsOptional()
  @IsDateString()
  readonly registrationDate?: string;
}
