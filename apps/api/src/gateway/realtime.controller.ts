import { Controller, Get, UseGuards } from '@nestjs/common';
import { RealtimeService } from './realtime.service';
import { JwtAuthGuard, RequirePermissions } from '../modules/auth/auth.guard';

@Controller('realtime')
@UseGuards(JwtAuthGuard)
export class RealtimeController {
  constructor(private realtime: RealtimeService) {}

  @Get('stats')
  @RequirePermissions('admin_full')
  getStats() {
    return this.realtime.getRealtimeStats();
  }
}
