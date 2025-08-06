import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRegistrationDto {
  @ApiProperty({
    required: true,
    example: 'Shirsho',
    description: 'Name of the registration',
  })
  @IsNotEmpty({ message: 'Name cannot be empty or whitespace' })
  @IsString()
  readonly registrationName: string;
}
