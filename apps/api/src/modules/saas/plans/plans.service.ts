// ══════════════════════════════════════════════════════════════
// EVERBRILLIANT SaaS — Subscription Plans Service
// ══════════════════════════════════════════════════════════════
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CacheService } from '../../../cache/cache.service';

// ── Plan limits ────────────────────────────────────────────────
export interface PlanLimits {
  maxUsers:        number;   // -1 = unlimited
  maxRequests:     number;
  maxInvoices:     number;
  maxStorageMB:    number;
  maxApiCalls:     number;   // per month
  maxTenders:      number;
  maxConnections:  number;
}

export interface PlanFeatures {
  realtime:        boolean;
  whiteLabel:      boolean;
  apiAccess:       boolean;
  advancedReports: boolean;
  customWorkflow:  boolean;
  multiCurrency:   boolean;
  prioritySupport: boolean;
  ssoEnabled:      boolean;
}

// ── Default plans definition ───────────────────────────────────
const DEFAULT_PLANS = [
  {
    name: 'free',
    nameFa: 'رایگان',
    tier: 'FREE',
    priceMonthly: BigInt(0),
    priceAnnual: BigInt(0),
    currency: 'IRR',
    isDefault: true,
    trialDays: 0,
    sortOrder: 0,
    limits: {
      maxUsers: 2, maxRequests: 20, maxInvoices: 10,
      maxStorageMB: 100, maxApiCalls: 1000, maxTenders: 0, maxConnections: 3,
    } as PlanLimits,
    features: {
      realtime: false, whiteLabel: false, apiAccess: false,
      advancedReports: false, customWorkflow: false,
      multiCurrency: false, prioritySupport: false, ssoEnabled: false,
    } as PlanFeatures,
  },
  {
    name: 'starter',
    nameFa: 'استارتر',
    tier: 'STARTER',
    priceMonthly: BigInt(4_990_000),     // ~12 USD/mo in IRR
    priceAnnual: BigInt(49_900_000),     // 2 months free
    currency: 'IRR',
    trialDays: 14,
    sortOrder: 1,
    limits: {
      maxUsers: 5, maxRequests: 100, maxInvoices: 50,
      maxStorageMB: 1000, maxApiCalls: 10000, maxTenders: 3, maxConnections: 20,
    } as PlanLimits,
    features: {
      realtime: true, whiteLabel: false, apiAccess: false,
      advancedReports: false, customWorkflow: false,
      multiCurrency: true, prioritySupport: false, ssoEnabled: false,
    } as PlanFeatures,
  },
  {
    name: 'pro',
    nameFa: 'حرفه‌ای',
    tier: 'PRO',
    priceMonthly: BigInt(14_990_000),    // ~36 USD/mo
    priceAnnual: BigInt(149_900_000),
    currency: 'IRR',
    trialDays: 14,
    sortOrder: 2,
    limits: {
      maxUsers: 25, maxRequests: 1000, maxInvoices: 500,
      maxStorageMB: 10000, maxApiCalls: 100000, maxTenders: 20, maxConnections: 100,
    } as PlanLimits,
    features: {
      realtime: true, whiteLabel: false, apiAccess: true,
      advancedReports: true, customWorkflow: true,
      multiCurrency: true, prioritySupport: false, ssoEnabled: false,
    } as PlanFeatures,
  },
  {
    name: 'enterprise',
    nameFa: 'سازمانی',
    tier: 'ENTERPRISE',
    priceMonthly: BigInt(49_990_000),    // ~120 USD/mo
    priceAnnual: BigInt(499_900_000),
    currency: 'IRR',
    trialDays: 30,
    sortOrder: 3,
    limits: {
      maxUsers: -1, maxRequests: -1, maxInvoices: -1,
      maxStorageMB: -1, maxApiCalls: -1, maxTenders: -1, maxConnections: -1,
    } as PlanLimits,
    features: {
      realtime: true, whiteLabel: true, apiAccess: true,
      advancedReports: true, customWorkflow: true,
      multiCurrency: true, prioritySupport: true, ssoEnabled: true,
    } as PlanFeatures,
  },
];

@Injectable()
export class PlansService implements OnModuleInit {
  private readonly logger = new Logger('PlansService');

  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async onModuleInit() {
    await this.seedPlans();
  }

  // ── Seed default plans ──────────────────────────────────────
  private async seedPlans() {
    for (const plan of DEFAULT_PLANS) {
      await this.prisma.subscriptionPlan.upsert({
        where: { name: plan.name },
        update: {
          nameFa: plan.nameFa,
          priceMonthly: plan.priceMonthly,
          priceAnnual: plan.priceAnnual,
          limits: plan.limits,
          features: plan.features,
        },
        create: plan as any,
      });
    }
    this.logger.log('✅ Subscription plans seeded');
  }

  // ── Get all public plans ────────────────────────────────────
  async getPublicPlans(lang = 'en') {
    const cacheKey = `plans:public:${lang}`;
    return this.cache.getOrSet(cacheKey, async () => {
      const plans = await this.prisma.subscriptionPlan.findMany({
        where: { isActive: true, isPublic: true },
        orderBy: { sortOrder: 'asc' },
      });

      return plans.map(p => ({
        ...p,
        displayName: lang === 'fa' ? p.nameFa || p.name : p.name,
        priceMonthly: Number(p.priceMonthly),
        priceAnnual: Number(p.priceAnnual),
        limits: p.limits as PlanLimits,
        features: p.features as PlanFeatures,
      }));
    }, this.cache.TTL.HOUR);
  }

  async getPlanById(id: string) {
    return this.prisma.subscriptionPlan.findUnique({ where: { id } });
  }

  async getPlanByName(name: string) {
    return this.prisma.subscriptionPlan.findUnique({ where: { name } });
  }

  async getDefaultPlan() {
    return this.prisma.subscriptionPlan.findFirst({ where: { isDefault: true } });
  }

  formatPrice(amount: bigint, cycle: 'monthly' | 'annual' = 'monthly'): string {
    const n = new Intl.NumberFormat('fa-IR').format(Number(amount));
    const suffix = cycle === 'monthly' ? 'ریال / ماه' : 'ریال / سال';
    return `${n} ${suffix}`;
  }
}
