// ══════════════════════════════════════════════════════════════
// EVERBRILLIANT SaaS — Billing + Subscription Service
// ══════════════════════════════════════════════════════════════
import {
  Injectable, BadRequestException, NotFoundException,
  ForbiddenException, Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CacheService } from '../../../cache/cache.service';
import { PlansService } from '../plans/plans.service';
import type { PlanLimits, PlanFeatures } from '../plans/plans.service';

export interface SubscriptionInfo {
  id: string;
  status: string;
  plan: {
    name: string;
    nameFa?: string;
    tier: string;
    limits: PlanLimits;
    features: PlanFeatures;
  };
  currentPeriodEnd: Date;
  trialEndsAt?: Date;
  daysLeft: number;
  isTrialing: boolean;
  isActive: boolean;
  autoRenew: boolean;
}

@Injectable()
export class BillingService {
  private readonly logger = new Logger('BillingService');

  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
    private plans: PlansService,
  ) {}

  // ── Get subscription for a company ─────────────────────────
  async getSubscription(companyId: number): Promise<SubscriptionInfo | null> {
    const cacheKey = `sub:${companyId}`;
    return this.cache.getOrSet(cacheKey, async () => {
      const sub = await this.prisma.subscription.findUnique({
        where: { companyId },
        include: { plan: true },
      });
      if (!sub) return null;
      return this.formatSubscription(sub);
    }, this.cache.TTL.MEDIUM);
  }

  private formatSubscription(sub: any): SubscriptionInfo {
    const now = new Date();
    const end = new Date(sub.currentPeriodEnd);
    const daysLeft = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86_400_000));
    return {
      id: sub.id,
      status: sub.status,
      plan: {
        name: sub.plan.name,
        nameFa: sub.plan.nameFa,
        tier: sub.plan.tier,
        limits: (sub.customLimits ?? sub.plan.limits) as PlanLimits,
        features: sub.plan.features as PlanFeatures,
      },
      currentPeriodEnd: sub.currentPeriodEnd,
      trialEndsAt: sub.trialEndsAt,
      daysLeft,
      isTrialing: sub.status === 'TRIALING',
      isActive: ['TRIALING', 'ACTIVE'].includes(sub.status),
      autoRenew: sub.autoRenew,
    };
  }

  // ── Create free subscription on company registration ────────
  async createFreeSubscription(companyId: number) {
    const freePlan = await this.plans.getDefaultPlan();
    if (!freePlan) throw new Error('Default plan not found');

    const now = new Date();
    const periodEnd = new Date(now.getTime() + 365 * 86_400_000); // 1 year

    return this.prisma.subscription.create({
      data: {
        companyId,
        planId: freePlan.id,
        status: 'ACTIVE',
        billingCycle: 'ANNUAL',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        autoRenew: false,
      },
    });
  }

  // ── Start trial ─────────────────────────────────────────────
  async startTrial(companyId: number, planId: string) {
    const plan = await this.plans.getPlanById(planId);
    if (!plan || !plan.trialDays) throw new BadRequestException('Plan has no trial');

    const existing = await this.prisma.subscription.findUnique({ where: { companyId } });
    if (existing && existing.status !== 'CANCELLED') {
      throw new BadRequestException('Already has a subscription');
    }

    const now = new Date();
    const trialEnd = new Date(now.getTime() + plan.trialDays * 86_400_000);
    const periodEnd = new Date(now.getTime() + 30 * 86_400_000);

    return this.prisma.subscription.upsert({
      where: { companyId },
      update: {
        planId, status: 'TRIALING',
        currentPeriodStart: now, currentPeriodEnd: periodEnd,
        trialEndsAt: trialEnd, cancelledAt: null, cancelReason: null,
      },
      create: {
        companyId, planId, status: 'TRIALING',
        billingCycle: 'MONTHLY',
        currentPeriodStart: now, currentPeriodEnd: periodEnd,
        trialEndsAt: trialEnd,
      },
    });
  }

  // ── Upgrade / Downgrade plan ─────────────────────────────────
  async changePlan(
    companyId: number,
    newPlanId: string,
    cycle: 'MONTHLY' | 'ANNUAL' = 'MONTHLY',
    paymentRef?: string,
  ) {
    const sub = await this.prisma.subscription.findUnique({ where: { companyId } });
    if (!sub) throw new NotFoundException('No subscription found');

    const plan = await this.plans.getPlanById(newPlanId);
    if (!plan) throw new NotFoundException('Plan not found');

    const now = new Date();
    const days = cycle === 'ANNUAL' ? 365 : 30;
    const periodEnd = new Date(now.getTime() + days * 86_400_000);

    // Record payment
    const amount = cycle === 'ANNUAL' ? plan.priceAnnual : plan.priceMonthly;
    if (Number(amount) > 0 && paymentRef) {
      await this.prisma.subscriptionPayment.create({
        data: {
          subscriptionId: sub.id,
          amount,
          currency: plan.currency,
          period: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
          status: 'paid',
          paidAt: now,
          referenceNo: paymentRef,
        },
      });
    }

    const updated = await this.prisma.subscription.update({
      where: { companyId },
      data: {
        planId: newPlanId,
        billingCycle: cycle as any,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        trialEndsAt: null,
      },
      include: { plan: true },
    });

    // Update company plan field
    await this.prisma.company.update({
      where: { id: companyId },
      data: { plan: plan.tier as any },
    });

    await this.cache.del(`sub:${companyId}`);
    this.logger.log(`Plan changed: company=${companyId} → ${plan.name}`);
    return updated;
  }

  // ── Cancel subscription ─────────────────────────────────────
  async cancelSubscription(companyId: number, reason?: string) {
    const sub = await this.prisma.subscription.findUnique({ where: { companyId } });
    if (!sub) throw new NotFoundException('No subscription');

    const updated = await this.prisma.subscription.update({
      where: { companyId },
      data: { status: 'CANCELLED', cancelledAt: new Date(), cancelReason: reason, autoRenew: false },
    });
    await this.cache.del(`sub:${companyId}`);
    return updated;
  }

  // ── Renew subscription ──────────────────────────────────────
  // ── Feature gate (used by WhiteLabel + other services) ──────
  async requireFeature(companyId: number, feature: string): Promise<void> {
    const sub = await this.getSubscription(companyId);
    if (!sub?.isActive) throw new ForbiddenException('Active subscription required');
    if (!(sub.plan.features as any)[feature]) {
      throw new ForbiddenException(`Feature "${feature}" requires a higher plan`);
    }
  }

  async renewSubscription(companyId: number, paymentRef: string) {
    const sub = await this.prisma.subscription.findUnique({
      where: { companyId }, include: { plan: true },
    });
    if (!sub) throw new NotFoundException('No subscription');

    const days = sub.billingCycle === 'ANNUAL' ? 365 : sub.billingCycle === 'QUARTERLY' ? 90 : 30;
    const now = new Date();
    const start = new Date(Math.max(now.getTime(), sub.currentPeriodEnd.getTime()));
    const end = new Date(start.getTime() + days * 86_400_000);

    const amount = sub.billingCycle === 'ANNUAL'
      ? (sub.plan as any).priceAnnual
      : (sub.plan as any).priceMonthly;

    await this.prisma.subscriptionPayment.create({
      data: {
        subscriptionId: sub.id, amount,
        currency: (sub.plan as any).currency || 'IRR',
        period: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
        status: 'paid', paidAt: now, referenceNo: paymentRef,
      },
    });

    const renewed = await this.prisma.subscription.update({
      where: { companyId },
      data: { status: 'ACTIVE', currentPeriodStart: start, currentPeriodEnd: end },
    });

    await this.cache.del(`sub:${companyId}`);
    return renewed;
  }

  // ── Get billing history ─────────────────────────────────────
  async getBillingHistory(companyId: number, page = 1, limit = 10) {
    const sub = await this.prisma.subscription.findUnique({ where: { companyId } });
    if (!sub) return { data: [], total: 0 };

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.subscriptionPayment.findMany({
        where: { subscriptionId: sub.id },
        orderBy: { createdAt: 'desc' },
        skip, take: limit,
      }),
      this.prisma.subscriptionPayment.count({ where: { subscriptionId: sub.id } }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
