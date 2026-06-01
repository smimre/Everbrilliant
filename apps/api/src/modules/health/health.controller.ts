import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../../cache/cache.service';
import { Public } from '../auth/auth.guard';

@Controller('health')
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  @Get()
  @Public()
  async check() {
    const start = Date.now();
    const checks: Record<string, any> = { status: 'ok', timestamp: new Date().toISOString() };

    // DB check
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = { status: 'ok' };
    } catch (err) {
      checks.database = { status: 'error', message: (err as Error).message };
      checks.status = 'degraded';
    }

    // Redis check
    try {
      const cacheStats = await this.cache.getStats();
      checks.cache = { status: cacheStats.available ? 'ok' : 'unavailable' };
    } catch {
      checks.cache = { status: 'unavailable' };
    }

    checks.uptime  = Math.floor(process.uptime());
    checks.latency = Date.now() - start;
    checks.memory  = {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    };
    checks.version = process.env.VERSION || '1.0.0';

    return checks;
  }
}
