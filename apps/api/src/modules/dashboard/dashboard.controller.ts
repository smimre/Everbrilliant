import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private dashboard: DashboardService) {}

  @Get('stats')
  getStats(@Req() r: any) {
    return this.dashboard.getStats(r.user.companyId);
  }
}
