// ══════════════════════════════════════════════════════════════
// Finance Controller v2 — pagination + caching + query builder
// ══════════════════════════════════════════════════════════════
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CacheService } from '../../cache/cache.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { PaginationPipe, PaginationParams, paginated } from '../../common/pipes/pagination.pipe';
import { QueryBuilder, buildOrderBy } from '../../common/pipes/query-builder';

@Controller('v2/finance')
@UseGuards(JwtAuthGuard)
export class FinanceV2Controller {
  constructor(
    private finance: FinanceService,
    private cache: CacheService,
  ) {}

  @Get('invoices')
  async getInvoices(@Req() req: any, @Query(PaginationPipe) pagination: PaginationParams, @Query() raw: any) {
    const companyId = req.user.companyId;
    const cacheKey = `v2:inv:${companyId}:${pagination.page}:${raw.status||''}:${pagination.search||''}`;

    return this.cache.getOrSet(cacheKey, async () => {
      const where = new QueryBuilder()
        .forBuyerOrSeller(companyId)
        .filter({ status: raw.status, invoiceType: raw.type })
        .search({ fields: ['id', 'note'], value: pagination.search })
        .dateRange({ field: 'createdAt', from: raw.dateFrom, to: raw.dateTo })
        .build();

      const orderBy = buildOrderBy(pagination.sortBy, pagination.sortOrder, { createdAt: 'desc' });

      const [data, total] = await Promise.all([
        (this.finance as any).prisma.invoice.findMany({
          where, skip: pagination.skip, take: pagination.limit, orderBy,
          select: {
            id: true, invoiceType: true, status: true, currency: true,
            subtotal: true, vatAmount: true, total: true, paid: true, remaining: true,
            issuedAt: true, dueAt: true, taxSerial: true, createdAt: true,
            sellerCompany: { select: { id: true, name: true } },
            buyerCompany: { select: { id: true, name: true } },
            _count: { select: { items: true } },
          },
        }),
        (this.finance as any).prisma.invoice.count({ where }),
      ]);

      return paginated(data, total, pagination);
    }, pagination.search ? 0 : this.cache.TTL.SHORT);
  }

  @Get('employees')
  async getEmployees(@Req() req: any, @Query(PaginationPipe) pagination: PaginationParams) {
    const companyId = req.user.companyId;
    const cacheKey = `v2:emp:${companyId}:${pagination.page}:${pagination.search||''}`;

    return this.cache.getOrSet(cacheKey, async () => {
      const where = new QueryBuilder()
        .forCompany(companyId)
        .search({ fields: ['name', 'staffCode', 'department', 'jobTitle'], value: pagination.search })
        .build();

      const orderBy = buildOrderBy(pagination.sortBy, pagination.sortOrder, { name: 'asc' });
      const [data, total] = await Promise.all([
        (this.finance as any).prisma.employee.findMany({ where, skip: pagination.skip, take: pagination.limit, orderBy }),
        (this.finance as any).prisma.employee.count({ where }),
      ]);
      return paginated(data, total, pagination);
    }, pagination.search ? 0 : this.cache.TTL.LONG);
  }

  @Get('inventory')
  async getInventory(@Req() req: any, @Query(PaginationPipe) pagination: PaginationParams, @Query() raw: any) {
    const companyId = req.user.companyId;
    const cacheKey = `v2:inv_items:${companyId}:${pagination.page}:${raw.category||''}`;

    return this.cache.getOrSet(cacheKey, async () => {
      const where = new QueryBuilder()
        .forCompany(companyId)
        .rawFilter('category', raw.category)
        .search({ fields: ['product'], value: pagination.search })
        .build();

      const orderBy = buildOrderBy(pagination.sortBy, pagination.sortOrder, { product: 'asc' });
      const [data, total] = await Promise.all([
        (this.finance as any).prisma.inventoryItem.findMany({ where, skip: pagination.skip, take: pagination.limit, orderBy }),
        (this.finance as any).prisma.inventoryItem.count({ where }),
      ]);
      return paginated(data, total, pagination);
    }, pagination.search ? 0 : this.cache.TTL.SHORT);
  }

  @Get('summary')
  async getSummary(@Req() req: any) {
    const companyId = req.user.companyId;
    const cacheKey = `v2:fin_summary:${companyId}`;

    return this.cache.getOrSet(cacheKey, async () => {
      const prisma = (this.finance as any).prisma;
      const [invoiceStats, employeeCount, inventoryStats] = await Promise.all([
        prisma.invoice.groupBy({
          by: ['status'],
          where: { OR: [{ sellerCompanyId: companyId }, { buyerCompanyId: companyId }] },
          _sum: { total: true, paid: true },
          _count: { id: true },
        }),
        prisma.employee.count({ where: { companyId, isActive: true } }),
        prisma.inventoryItem.aggregate({
          where: { companyId },
          _count: { id: true },
          _sum: { qty: true },
        }),
      ]);

      return {
        invoices: invoiceStats,
        employees: employeeCount,
        inventory: inventoryStats,
        generatedAt: new Date().toISOString(),
      };
    }, this.cache.TTL.MEDIUM);
  }
}
