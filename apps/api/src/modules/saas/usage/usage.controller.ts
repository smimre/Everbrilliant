import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UsageService } from './usage.service';
import { JwtAuthGuard } from '../../auth/auth.guard';

@Controller('saas/usage')
@UseGuards(JwtAuthGuard)
export class UsageController {
  constructor(private usage: UsageService) {}

  @Get()
  getUsage(@Req() req: any) {
    return this.usage.getUsageWithLimits(req.user.companyId);
  }

  @Get('raw')
  getRaw(@Req() req: any) {
    return this.usage.getCurrentUsage(req.user.companyId);
  }
}
