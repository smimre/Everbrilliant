import {
  Controller, Get, Post, Patch, Body, Param, Query,
  Req, UseGuards, HttpCode, HttpStatus, NotFoundException,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { PlansService } from '../plans/plans.service';
import { JwtAuthGuard, Public } from '../../auth/auth.guard';

@Controller('saas')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(
    private billing: BillingService,
    private plans: PlansService,
  ) {}

  // ── Public: list plans ────────────────────────────────────
  @Get('plans')
  @Public()
  getPlans(@Query('lang') lang = 'en') {
    return this.plans.getPublicPlans(lang);
  }

  // ── My subscription ──────────────────────────────────────
  @Get('subscription')
  async getSubscription(@Req() req: any) {
    const sub = await this.billing.getSubscription(req.user.companyId);
    if (sub === null) throw new NotFoundException('No active subscription');
    return sub;
  }

  // ── Start trial ──────────────────────────────────────────
  @Post('trial')
  startTrial(@Req() req: any, @Body() dto: { planId: string }) {
    return this.billing.startTrial(req.user.companyId, dto.planId);
  }

  // ── Upgrade/downgrade ────────────────────────────────────
  @Post('upgrade')
  upgradePlan(@Req() req: any, @Body() dto: { planId: string; cycle?: 'MONTHLY' | 'ANNUAL'; paymentRef?: string }) {
    return this.billing.changePlan(req.user.companyId, dto.planId, dto.cycle || 'MONTHLY', dto.paymentRef);
  }

  // ── Cancel ───────────────────────────────────────────────
  @Post('cancel')
  @HttpCode(HttpStatus.OK)
  cancelSubscription(@Req() req: any, @Body() dto: { reason?: string }) {
    return this.billing.cancelSubscription(req.user.companyId, dto.reason);
  }

  // ── Renew ────────────────────────────────────────────────
  @Post('renew')
  renewSubscription(@Req() req: any, @Body() dto: { paymentRef: string }) {
    return this.billing.renewSubscription(req.user.companyId, dto.paymentRef);
  }

  // ── Billing history ──────────────────────────────────────
  @Get('billing-history')
  getBillingHistory(@Req() req: any, @Query('page') page = 1, @Query('limit') limit = 10) {
    return this.billing.getBillingHistory(req.user.companyId, +page, +limit);
  }
}
