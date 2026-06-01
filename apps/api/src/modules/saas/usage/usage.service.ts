// ══════════════════════════════════════════════════════════════
// EVERBRILLIANT SaaS — Usage Tracking + Enforcement
// ══════════════════════════════════════════════════════════════
import {
  Injectable, ForbiddenException, Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CacheService } from '../../../cache/cache.service';
import { BillingService } from '../billing/billing.service';

export type MetricKey = 'users' | 'requests' | 'invoices' | 'storageMB' | 'apiCalls' | 'tenders' | 'connections';

const METRIC_MAP: Record<MetricKey, string> = {
  users:       'USERS',
  requests:    'REQUESTS',
  invoices:    'INVOICES',
  storageMB:   'STORAGE_MB',
  apiCalls:    'API_CALLS',
  tenders:     'TENDERS',
  connections: 'CONNECTIONS',
};

const LIMIT_MAP: Record<MetricKey, string> = {
  users:       'maxUsers',
  requests:    'maxRequests',
  invoices:    'maxInvoices',
  storageMB:   'maxStorageMB',
  apiCalls:    'maxApiCalls',
  tenders:     'maxTenders',
  connections: 'maxConnections',
};

@Injectable()
export class UsageService {
  private readonly logger = new Logger('UsageService');

  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
    private billing: BillingService,
  ) {}

  // ── Get current usage for all metrics ──────────────────────
  async getCurrentUsage(companyId: number) {
    const cacheKey = `usage:${companyId}:${this.currentPeriod()}`;

    return this.cache.getOrSet(cacheKey, async () => {
      const period = this.currentPeriod();
      const [
        users, requests, invoices, tenders, connections,
      ] = await Promise.all([
        this.prisma.user.count({ where: { companyId, isActive: true } }),
        this.prisma.tradeRequest.count({ where: { buyerCompanyId: companyId }, }),
        this.prisma.invoice.count({ where: { sellerCompanyId: companyId } }),
        this.prisma.tender.count({ where: { companyId } }),
        this.prisma.companyConnection.count({
          where: { OR: [{ companyAId: companyId }, { companyBId: companyId }] },
        }),
      ]);

      return { users, requests, invoices, tenders, connections, apiCalls: 0, storageMB: 0, period };
    }, this.cache.TTL.SHORT);
  }

  // ── Check limit before action ───────────────────────────────
  async checkLimit(companyId: number, metric: MetricKey): Promise<void> {
    const sub = await this.billing.getSubscription(companyId);
    if (!sub?.isActive) throw new ForbiddenException('Subscription expired or inactive');

    const limit: number = (sub.plan.limits as any)[LIMIT_MAP[metric]];
    if (limit === -1) return; // Unlimited

    const usage = await this.getCurrentUsage(companyId);
    const current: number = (usage as any)[metric] ?? 0;

    if (current >= limit) {
      const msg = this.limitMessage(metric, current, limit);
      throw new ForbiddenException(msg);
    }
  }

  // ── Record API call ─────────────────────────────────────────
  async recordApiCall(companyId: number) {
    const period = this.currentPeriod();
    const sub = await this.billing.getSubscription(companyId);
    if (!sub) return;

    await this.prisma.usageRecord.create({
      data: {
        subscriptionId: sub.id,
        companyId,
        metric: 'API_CALLS' as any,
        value: 1,
        period,
      },
    });

    await this.cache.del(`usage:${companyId}:${period}`);
  }

  // ── Get usage with limits ───────────────────────────────────
  async getUsageWithLimits(companyId: number) {
    const [sub, usage] = await Promise.all([
      this.billing.getSubscription(companyId),
      this.getCurrentUsage(companyId),
    ]);

    if (!sub) return null;

    const metrics: MetricKey[] = ['users', 'requests', 'invoices', 'tenders', 'connections'];

    return metrics.map(metric => {
      const current: number = (usage as any)[metric] ?? 0;
      const limit: number = (sub.plan.limits as any)[LIMIT_MAP[metric]] ?? -1;
      const pct = limit === -1 ? 0 : Math.round((current / limit) * 100);
      return {
        metric,
        current,
        limit,
        unlimited: limit === -1,
        percentage: pct,
        isNearLimit: pct >= 80,
        isAtLimit: pct >= 100,
      };
    });
  }

  // ── Check feature access ────────────────────────────────────
  async requireFeature(companyId: number, feature: string): Promise<void> {
    const sub = await this.billing.getSubscription(companyId);
    if (!sub?.isActive) throw new ForbiddenException('Subscription required');
    const has = (sub.plan.features as any)[feature];
    if (!has) {
      throw new ForbiddenException(
        `Feature "${feature}" is not available on your current plan. Please upgrade.`
      );
    }
  }

  private currentPeriod(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  private limitMessage(metric: MetricKey, current: number, limit: number): string {
    const names: Record<MetricKey, string> = {
      users: 'Users', requests: 'Trade Requests', invoices: 'Invoices',
      storageMB: 'Storage', apiCalls: 'API Calls', tenders: 'Tenders',
      connections: 'Connections',
    };
    return `${names[metric]} limit reached (${current}/${limit}). Please upgrade your plan.`;
  }
}
