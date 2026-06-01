import { Controller, Get, UseGuards } from '@nestjs/common';
import { CacheService } from '../../cache/cache.service';
import { EventsGateway } from '../../gateway/events.gateway';
import { JwtAuthGuard, RequirePermissions } from '../auth/auth.guard';

@Controller('admin/performance')
@UseGuards(JwtAuthGuard)
export class PerformanceController {
  constructor(private cache: CacheService, private gateway: EventsGateway) {}

  @Get('stats')
  async getStats() {
    const [cacheStats, wsStats] = await Promise.all([
      this.cache.getStats(),
      Promise.resolve(this.gateway.getStats()),
    ]);
    return {
      cache: cacheStats, websocket: wsStats,
      memory: process.memoryUsage(), uptime: process.uptime(),
    };
  }

  @Get('cache/clear')
  async clearCache() {
    await this.cache.delPattern('*');
    return { success: true };
  }
}
