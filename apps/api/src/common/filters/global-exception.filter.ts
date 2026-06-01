// ══════════════════════════════════════════════════════════════
// Global Exception Filter
// ══════════════════════════════════════════════════════════════
import {
  ExceptionFilter, Catch, ArgumentsHost, HttpException,
  HttpStatus, Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'InternalServerError';

    // HTTP exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      message = typeof body === 'string' ? body :
        (body as any).message || exception.message;
      error = exception.constructor.name;
    }

    // Prisma errors
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          status = HttpStatus.CONFLICT;
          message = `Duplicate ${(exception.meta?.target as string[])?.join(', ')}`;
          error = 'DuplicateEntry';
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'Record not found';
          error = 'NotFound';
          break;
        case 'P2003':
          status = HttpStatus.BAD_REQUEST;
          message = 'Foreign key constraint failed';
          error = 'ConstraintViolation';
          break;
        default:
          status = HttpStatus.BAD_REQUEST;
          message = `Database error (${exception.code})`;
          error = 'DatabaseError';
      }
    }

    else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid data provided';
      error = 'ValidationError';
    }

    // Log server errors
    if (status >= 500) {
      this.logger.error(
        `${req.method} ${req.url} → ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    res.status(status).json({
      statusCode: status,
      error,
      message: Array.isArray(message) ? message[0] : message,
      path: req.url,
      timestamp: new Date().toISOString(),
    });
  }
}
