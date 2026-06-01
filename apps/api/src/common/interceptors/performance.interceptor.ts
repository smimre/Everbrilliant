import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

const SLOW_THRESHOLD_MS = 500;

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Performance');

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = ctx.switchToHttp().getRequest();
    const start = Date.now();
    const label = `${req.method} ${req.url}`;

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - start;
        const cacheHit = req.cacheHit ? ' [CACHE HIT]' : '';

        if (ms > SLOW_THRESHOLD_MS) {
          this.logger.warn(`🐢 SLOW ${label} — ${ms}ms${cacheHit}`);
        } else if (process.env.NODE_ENV !== 'production') {
          this.logger.debug(`⚡ ${label} — ${ms}ms${cacheHit}`);
        }
      })
    );
  }
}
