import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
import { ExceptionResponse } from '../dto';

export function ApiCustomBadRequestResponse(description = 'Bad Request') {
  return applyDecorators(
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description,
      type: ExceptionResponse,
    }),
  );
}
