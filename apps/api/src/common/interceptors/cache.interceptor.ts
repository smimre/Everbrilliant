// ══════════════════════════════════════════════════════════════
// Cache Interceptor — decorator-based caching
// ══════════════════════════════════════════════════════════════
import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of, tap } from 'rxjs';
import { CacheService } from '../../cache/cache.service';

export const CACHE_KEY_META   = 'cache_key';
export const CACHE_TTL_META   = 'cache_ttl';
export const CACHE_SKIP_META  = 'cache_skip';

export const Cached    = (key: string, ttl = 60) => SetMetadata(CACHE_KEY_META, { key, ttl });
export const NoCache   = () => SetMetadata(CACHE_SKIP_META, true);

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(private cache: CacheService, private reflector: Reflector) {}

  async intercept(ctx: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const req = ctx.switchToHttp().getRequest();

    // Only cache GET requests
    if (req.method !== 'GET') return next.handle();

    // Check NoCache decorator
    const skip = this.reflector.get<boolean>(CACHE_SKIP_META, ctx.getHandler());
    if (skip) return next.handle();

    const meta = this.reflector.get<{ key: string; ttl: number }>(CACHE_KEY_META, ctx.getHandler());
    if (!meta) return next.handle();

    // Build dynamic cache key
    const companyId = req.user?.companyId || 'anon';
    const query = JSON.stringify(req.query);
    const cacheKey = `${meta.key}:${companyId}:${Buffer.from(query).toString('base64').slice(0, 20)}`;

    const cached = await this.cache.get(cacheKey);
    if (cached !== null) {
      req.cacheHit = true;
      return of(cached);
    }

    return next.handle().pipe(
      tap(async (data) => {
        await this.cache.set(cacheKey, data, meta.ttl);
      })
    );
  }
}
