import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
import { ExceptionResponse } from '../dto';

export function ApiCustomForbiddenResponse(description = 'Not permitted') {
  return applyDecorators(
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description,
      type: ExceptionResponse,
    }),
  );
}
