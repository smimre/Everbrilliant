// ══════════════════════════════════════════════════════════════
// Optimized Prisma Service
// — Query logging
// — Slow query detection
// — Connection pooling
// ══════════════════════════════════════════════════════════════
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const SLOW_QUERY_MS = 500;

@Injectable()
export class OptimizedPrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('Prisma');

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development'
        ? [{ emit: 'event', level: 'query' }, 'warn', 'error']
        : ['warn', 'error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    // Log slow queries in development
    if (process.env.NODE_ENV === 'development') {
      (this as any).$on('query', (e: { query: string; duration: number; params: string }) => {
        if (e.duration > SLOW_QUERY_MS) {
          this.logger.warn(`🐢 Slow query (${e.duration}ms): ${e.query.slice(0, 100)}`);
        }
      });
    }
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('✅ Prisma connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /** Wrap query with metrics */
  async timed<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      const ms = Date.now() - start;
      if (ms > SLOW_QUERY_MS) {
        this.logger.warn(`🐢 Slow operation "${name}": ${ms}ms`);
      }
      return result;
    } catch (err) {
      this.logger.error(`Error in "${name}":`, (err as Error).message);
      throw err;
    }
  }

  /** Paginate helper */
  async paginate<T>(
    model: string,
    where: Record<string, unknown>,
    orderBy: Record<string, unknown>,
    page: number,
    limit: number,
    include?: Record<string, unknown>,
  ): Promise<{ data: T[]; total: number; page: number; limit: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      (this as any)[model].findMany({ where, orderBy, skip, take: limit, include }),
      (this as any)[model].count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /** Soft delete helper */
  async softDelete(model: string, id: string | number) {
    return (this as any)[model].update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /** Bulk insert with conflict handling */
  async upsertMany<T>(
    model: string,
    items: T[],
    uniqueField: string,
  ): Promise<void> {
    const ops = items.map((item: any) =>
      (this as any)[model].upsert({
        where: { [uniqueField]: item[uniqueField] },
        create: item,
        update: item,
      })
    );
    await this.$transaction(ops);
  }
}
