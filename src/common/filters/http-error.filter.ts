import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpErrorFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: unknown =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    if (typeof message === 'object' && message !== null) {
      message = (message as { message?: unknown }).message ?? message;
    }

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `Unexpected error: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
      );
      message = 'Internal server error';
    }

    response.status(status).json({
      statusCode: status,
      message,
      path: request.originalUrl,
      timestamp: new Date().toISOString(),
    });
  }
}
