import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  Length,
  NotContains,
} from 'class-validator';

export class VerifyEmailAuthDto {
  @ApiProperty({
    required: true,
    example: 'hniqbal01@gmail.com',
  })
  @IsNotEmpty({
    message: 'Email cannot be empty or whitespace',
  })
  @IsEmail(
    {},
    {
      message: 'Email should be email',
    },
  )
  readonly email: string;

  @ApiProperty({
    required: true,
    example: '123456',
  })
  @IsNotEmpty({
    message: 'Otp cannot be empty or whitespace',
  })
  @NotContains(' ', {
    message: 'Otp cannot be empty or whitespace',
  })
  @Length(6, 6, {
    message: 'Otp must be 6 characters long',
  })
  readonly otp: string;

  @ApiProperty({
    required: true,
    example: false,
  })
  @IsBoolean({
    message: 'Removeotp should be boolean',
  })
  @IsNotEmpty({
    message: 'Removeotp cannot be empty or whitespace',
  })
  readonly removeotp: boolean;
}
