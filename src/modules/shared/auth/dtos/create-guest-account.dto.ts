import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length, NotContains } from 'class-validator';

export class CreateGuestAccountDto {
  @ApiProperty({
    required: true,
    example: 'hniqbal01@gmail.com',
  })
  @IsNotEmpty({
    message: 'Email cannot be empty or whitespace',
  })
  readonly accountType: string;

  @ApiProperty({
    required: true,
    example: '11ece8be27491e39b6f940c18fa339ce4d2c9dadd94064898035e16ec27e7f76',
  })
  @IsNotEmpty({
    message: 'Key cannot be empty or whitespace',
  })
  @NotContains(' ', {
    message: 'Key cannot be empty or whitespace',
  })
  @Length(64, 64, {
    message: 'Key must be 32 characters long',
  })
  readonly key: string;
}
