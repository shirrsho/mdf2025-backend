import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateMailCredDTO {
  @ApiProperty({ example: 'transporter1' })
  @IsNotEmpty({
    message: 'Host cannot be empty or whitespace',
  })
  transporterName: string;

  @ApiProperty({ example: 'smtp.gmail.com' })
  @IsNotEmpty({
    message: 'Host cannot be empty or whitespace',
  })
  smtpHost: string;

  @ApiProperty({ example: '587' })
  @IsNotEmpty({
    message: 'Port cannot be empty or whitespace',
  })
  smtpPort: string;

  @ApiProperty({ example: 'hniqbal01@gmail.com' })
  @IsNotEmpty({
    message: 'User mail cannot be empty or whitespace',
  })
  smtpFrom: string;

  @ApiProperty({ example: 'hniqbal01@gmail.com' })
  @IsNotEmpty({
    message: 'From mail cannot be empty or whitespace',
  })
  smtpUser: string;

  @ApiProperty({ example: 'sagcxykxiwfecvtc' })
  @IsNotEmpty({
    message: 'password cannot be empty or whitespace',
  })
  smtpPassword: string;
}
