import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class EmailAuthDto {
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
}
