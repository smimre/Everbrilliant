import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map(data => {
        // Remove null/undefined values from responses
        if (data && typeof data === 'object') {
          return JSON.parse(JSON.stringify(data, (_, v) => v === undefined ? null : v));
        }
        return data;
      })
    );
  }
}
