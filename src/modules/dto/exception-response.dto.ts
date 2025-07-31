import { ApiProperty } from '@nestjs/swagger';

export class ExceptionResponse {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Bad Request' })
  error: string;

  @ApiProperty({ example: 'Invalid request parameters' })
  message: string;

  @ApiProperty({ example: new Date().toISOString() })
  timestamp: string;

  @ApiProperty({ example: '/api/v1/resource' })
  path: string;

  constructor(partial: Partial<ExceptionResponse>) {
    Object.assign(this, partial);
  }
}
