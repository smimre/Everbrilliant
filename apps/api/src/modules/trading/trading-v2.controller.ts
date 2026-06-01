// ══════════════════════════════════════════════════════════════
// Trading Controller v2 — with pagination, caching, query builder
// ══════════════════════════════════════════════════════════════
import {
  Controller, Get, Post, Patch, Body, Param,
  Query, Req, UseGuards, UsePipes,
} from '@nestjs/common';
import { TradingService } from './trading.service';
import { CacheService } from '../../cache/cache.service';
import { JwtAuthGuard, RequirePermissions } from '../auth/auth.guard';
import { PaginationPipe, PaginationParams, paginated } from '../../common/pipes/pagination.pipe';
import { QueryBuilder, buildOrderBy } from '../../common/pipes/query-builder';

@Controller('v2/trading')
@UseGuards(JwtAuthGuard)
export class TradingV2Controller {
  constructor(
    private trading: TradingService,
    private cache: CacheService,
  ) {}

  @Get('requests')
  @RequirePermissions('req_view')
  async getRequests(@Req() req: any, @Query(PaginationPipe) pagination: PaginationParams, @Query() raw: any) {
    const companyId = req.user.companyId;
    const cacheKey = `v2:req:${companyId}:${pagination.page}:${pagination.search||''}:${raw.status||''}`;

    return this.cache.getOrSet(cacheKey, async () => {
      const where = new QueryBuilder()
        .forBuyerOrSeller(companyId)
        .search({ fields: ['product', 'note'], value: pagination.search })
        .filter({ status: raw.status, priority: raw.priority })
        .dateRange({ field: 'createdAt', from: raw.dateFrom, to: raw.dateTo })
        .build();

      const orderBy = buildOrderBy(pagination.sortBy, pagination.sortOrder, { createdAt: 'desc' });

      const [data, total] = await Promise.all([
        (this.trading as any).prisma.tradeRequest.findMany({
          where, skip: pagination.skip, take: pagination.limit, orderBy,
          select: {
            id: true, product: true, qty: true, unit: true,
            amountIRR: true, currency: true, status: true, priority: true,
            deadline: true, createdAt: true,
            buyerCompany: { select: { id: true, name: true } },
            sellerCompany: { select: { id: true, name: true } },
            _count: { select: { quotes: true } },
          },
        }),
        (this.trading as any).prisma.tradeRequest.count({ where }),
      ]);

      return paginated(data, total, pagination);
    }, pagination.search ? 0 : this.cache.TTL.SHORT); // no cache if searching
  }

  @Get('tenders')
  async getTenders(@Query(PaginationPipe) pagination: PaginationParams, @Query() raw: any) {
    const cacheKey = `v2:tenders:${pagination.page}:${raw.type||'all'}:${raw.status||'OPEN'}`;

    return this.cache.getOrSet(cacheKey, async () => {
      const where = new QueryBuilder()
        .filter({ type: raw.type, status: raw.status || 'OPEN' })
        .search({ fields: ['title', 'description'], value: pagination.search })
        .dateRange({ field: 'endDate', from: raw.endFrom, to: raw.endTo })
        .build();

      const orderBy = buildOrderBy(pagination.sortBy, pagination.sortOrder, { endDate: 'asc' });

      const [data, total] = await Promise.all([
        (this.trading as any).prisma.tender.findMany({
          where, skip: pagination.skip, take: pagination.limit, orderBy,
          include: {
            products: { select: { name: true, qty: true, unit: true } },
            _count: { select: { bids: true } },
          },
        }),
        (this.trading as any).prisma.tender.count({ where }),
      ]);

      return paginated(
        data.map((t: any) => ({ ...t, bidsCount: t._count.bids })),
        total, pagination,
      );
    }, this.cache.TTL.MEDIUM);
  }

  @Get('contracts')
  @RequirePermissions('contract_view')
  async getContracts(@Req() req: any, @Query(PaginationPipe) pagination: PaginationParams, @Query() raw: any) {
    const companyId = req.user.companyId;
    const where = new QueryBuilder()
      .forBuyerOrSeller(companyId)
      .filter({ status: raw.status })
      .build();

    const orderBy = buildOrderBy(pagination.sortBy, pagination.sortOrder, { createdAt: 'desc' });
    const [data, total] = await Promise.all([
      (this.trading as any).prisma.contract.findMany({
        where, skip: pagination.skip, take: pagination.limit, orderBy,
        include: {
          buyerCompany: { select: { id: true, name: true } },
          sellerCompany: { select: { id: true, name: true } },
        },
      }),
      (this.trading as any).prisma.contract.count({ where }),
    ]);

    return paginated(data, total, pagination);
  }
}
