import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ExceptionResponse } from '../dto';
import { ErrorLoggingGeneralService } from '../shared/error-logging/providers';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(
    private readonly errorLoggingService: ErrorLoggingGeneralService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? (exception.getStatus() ?? HttpStatus.INTERNAL_SERVER_ERROR)
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()['message'] || exception.message
        : 'An unexpected error occurred';

    const errorResponse = new ExceptionResponse({
      statusCode: status,
      error:
        exception instanceof HttpException
          ? exception.message
          : 'Internal Server Error',
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `HTTP Status: ${status} | Error Message: ${message} | Method: ${request.method} | Path: ${request.url}`,
        exception instanceof Error ? exception.stack : '',
      );
      this.errorLoggingService.createErrorLog({
        message: message,
        statusCode: status,
        method: request.method,
        path: request.url,
        stack: exception instanceof Error ? exception.stack : '',
      });
    } else {
      this.logger.warn(
        `HTTP Status: ${status} | Error Message: ${message} | Method: ${request.method} | Path: ${request.url}`,
      );
      this.errorLoggingService.createErrorLog({
        message: Array.isArray(message) ? message.join(', ') : message,
        statusCode: status,
        method: request.method,
        path: request.url,
      });
    }
    response.status(status).json(errorResponse);
  }
}
