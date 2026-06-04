// ══════════════════════════════════════════════════════════════
// Trading Service — with Redis caching layer
// ══════════════════════════════════════════════════════════════
import { Injectable } from '@nestjs/common';
import { TradingService } from './trading.service';
import { CacheService } from '../../cache/cache.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TradingCachedService extends TradingService {
  constructor(
    protected override prisma: any,
    private cache: CacheService,
  ) {
    super(prisma);
  }

  override async getRequests(companyId: number, q: any) {
    const page = Number(q.page) || 1;

    // Skip cache if search/filter active
    if (q.search || q.status) {
      return super.getRequests(companyId, q);
    }

    const key = this.cache.KEYS.requests(companyId, page);
    return this.cache.getOrSet(key, () => super.getRequests(companyId, q), this.cache.TTL.SHORT);
  }

  override async getTenders(q: any) {
    const page = Number(q.page) || 1;
    if (q.search) return super.getTenders(q);

    const key = this.cache.KEYS.tenders(page);
    return this.cache.getOrSet(key, () => super.getTenders(q), this.cache.TTL.MEDIUM);
  }

  override async getContracts(companyId: number, q: any) {
    const key = this.cache.KEYS.contracts(companyId);
    return this.cache.getOrSet(key, () => super.getContracts(companyId, q), this.cache.TTL.MEDIUM);
  }

  override async createRequest(companyId: number, userId: number, dto: any) {
    const result = await super.createRequest(companyId, userId, dto);
    await this.cache.invalidateRequests(companyId);
    if (dto.sellerCompanyId) {
      await this.cache.invalidateRequests(Number(dto.sellerCompanyId));
    }
    return result;
  }

  override async cancelRequest(companyId: number, id: string) {
    const result = await super.cancelRequest(companyId, id);
    await this.cache.invalidateRequests(companyId);
    await this.cache.del(this.cache.KEYS.request(id));
    return result;
  }

  override async signContract(companyId: number, id: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      select: { buyerCompanyId: true, sellerCompanyId: true },
    });
    const result = await super.signContract(companyId, id);
    await this.cache.del(this.cache.KEYS.contracts(companyId));
    if (contract) {
      const otherId = contract.buyerCompanyId === companyId
        ? contract.sellerCompanyId
        : contract.buyerCompanyId;
      if (otherId && otherId !== companyId) {
        await this.cache.del(this.cache.KEYS.contracts(otherId));
      }
    }
    return result;
  }

  override async createTender(companyId: number, userId: number, dto: any) {
    const result = await super.createTender(companyId, userId, dto);
    await this.cache.invalidateTenders();
    return result;
  }
}
