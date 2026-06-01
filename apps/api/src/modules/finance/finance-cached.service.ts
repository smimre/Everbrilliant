// ══════════════════════════════════════════════════════════════
// Finance Service — with Redis caching layer
// ══════════════════════════════════════════════════════════════
import { Injectable } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CacheService } from '../../cache/cache.service';

@Injectable()
export class FinanceCachedService extends FinanceService {
  constructor(
    protected override prisma: any,
    private cache: CacheService,
  ) {
    super(prisma);
  }

  override async getInvoices(companyId: number, q: any) {
    if (q.search) return super.getInvoices(companyId, q);
    const page = Number(q.page) || 1;
    const key = this.cache.KEYS.invoices(companyId, page, q.status);
    return this.cache.getOrSet(key, () => super.getInvoices(companyId, q), this.cache.TTL.SHORT);
  }

  override async getInvoice(companyId: number, id: string) {
    const key = this.cache.KEYS.invoice(id);
    return this.cache.getOrSet(key, () => super.getInvoice(companyId, id), this.cache.TTL.MEDIUM);
  }

  override async createInvoice(companyId: number, userId: number, dto: any) {
    const result = await super.createInvoice(companyId, userId, dto);
    await this.cache.invalidateInvoices(companyId);
    return result;
  }

  override async payInvoice(companyId: number, id: string, dto: any) {
    const result = await super.payInvoice(companyId, id, dto);
    await this.cache.del(this.cache.KEYS.invoice(id));
    await this.cache.invalidateInvoices(companyId);
    return result;
  }

  override async getEmployees(companyId: number, q: any) {
    if (q.search) return super.getEmployees(companyId, q);
    const key = this.cache.KEYS.employees(companyId);
    return this.cache.getOrSet(key, () => super.getEmployees(companyId, q), this.cache.TTL.LONG);
  }

  override async getInventory(companyId: number, q: any) {
    const page = Number(q.page) || 1;
    const key = this.cache.KEYS.inventory(companyId, page);
    return this.cache.getOrSet(key, () => super.getInventory(companyId, q), this.cache.TTL.SHORT);
  }

  override async stockMove(companyId: number, itemId: string, type: 'in'|'out', qty: number, userId: number, ref?: string) {
    const result = await super.stockMove(companyId, itemId, type, qty, userId, ref);
    await this.cache.invalidateInventory(companyId);
    return result;
  }
}
