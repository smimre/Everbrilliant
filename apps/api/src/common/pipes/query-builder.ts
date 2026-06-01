// ══════════════════════════════════════════════════════════════
// Query Builder — builds efficient Prisma WHERE clauses
// ══════════════════════════════════════════════════════════════
import { Prisma } from '@prisma/client';

interface SearchOptions {
  fields: string[];          // fields to search in
  value?: string;
  mode?: Prisma.QueryMode;
}

interface FilterOptions {
  [key: string]: string | undefined;
}

interface DateRangeOptions {
  field: string;
  from?: string;
  to?: string;
}

export class QueryBuilder {
  private where: Record<string, unknown> = {};

  /** Add company isolation */
  forCompany(companyId: number, field = 'companyId') {
    this.where[field] = companyId;
    return this;
  }

  /** Add multi-field search */
  search(opts: SearchOptions) {
    if (!opts.value?.trim()) return this;
    const mode = opts.mode || 'insensitive';
    this.where.OR = opts.fields.map(f => ({
      [f]: { contains: opts.value!.trim(), mode },
    }));
    return this;
  }

  /** Add enum filter */
  filter(filters: FilterOptions) {
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== '') {
        this.where[key] = val.toUpperCase();
      }
    });
    return this;
  }

  /** Add raw filter */
  rawFilter(key: string, value: unknown) {
    if (value !== undefined && value !== null && value !== '') {
      this.where[key] = value;
    }
    return this;
  }

  /** Add date range */
  dateRange(opts: DateRangeOptions) {
    const range: Record<string, Date> = {};
    if (opts.from) range.gte = new Date(opts.from);
    if (opts.to)   range.lte = new Date(opts.to);
    if (Object.keys(range).length) {
      this.where[opts.field] = range;
    }
    return this;
  }

  /** Add OR for buyer/seller company */
  forBuyerOrSeller(companyId: number) {
    this.where.OR = [
      { buyerCompanyId: companyId },
      { sellerCompanyId: companyId },
    ];
    return this;
  }

  build() { return this.where; }
}

/** Build orderBy from sort params */
export function buildOrderBy(
  sortBy?: string,
  sortOrder: 'asc' | 'desc' = 'desc',
  defaults: Record<string, unknown> = { createdAt: 'desc' },
): Record<string, unknown> {
  if (!sortBy) return defaults;
  return { [sortBy]: sortOrder };
}
