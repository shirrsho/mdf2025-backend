import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length, NotContains } from 'class-validator';

export class ChangePasswordAuthDto {
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
    message: 'New password cannot be empty or whitespace',
  })
  @NotContains(' ', {
    message: 'New password cannot be empty or whitespace',
  })
  @Length(6, 100, {
    message: 'New password must be between 6 and 100 characters long',
  })
  readonly newpassword: string;

  @ApiProperty({
    required: true,
    example: '123456',
  })
  @IsNotEmpty({
    message: 'Password cannot be empty or whitespace',
  })
  @NotContains(' ', {
    message: 'Password cannot be empty or whitespace',
  })
  @Length(6, 100, {
    message: 'Password must be between 6 and 100 characters long',
  })
  readonly password: string;
}
