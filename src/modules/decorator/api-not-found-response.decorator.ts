import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
import { ExceptionResponse } from '../dto';

export function ApiCustomNotFoundResponse(description = 'Not found') {
  return applyDecorators(
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description,
      type: ExceptionResponse,
    }),
  );
}
