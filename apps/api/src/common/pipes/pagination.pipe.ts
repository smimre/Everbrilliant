// ══════════════════════════════════════════════════════════════
// Pagination Pipe — normalizes + validates pagination params
// ══════════════════════════════════════════════════════════════
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  search?: string;
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
}

const DEFAULTS = { page: 1, limit: 20, maxLimit: 100, sortOrder: 'desc' as const };

@Injectable()
export class PaginationPipe implements PipeTransform {
  transform(query: Record<string, string>): PaginationParams {
    const page = this.parsePositiveInt(query.page, DEFAULTS.page);
    const limit = Math.min(
      this.parsePositiveInt(query.limit, DEFAULTS.limit),
      DEFAULTS.maxLimit,
    );

    const sortOrder =
      query.sortOrder === 'asc' ? 'asc' : DEFAULTS.sortOrder;

    return {
      page,
      limit,
      skip: (page - 1) * limit,
      search: query.search?.trim() || undefined,
      sortBy: query.sortBy || undefined,
      sortOrder,
    };
  }

  private parsePositiveInt(val: string | undefined, fallback: number): number {
    if (!val) return fallback;
    const n = parseInt(val, 10);
    if (isNaN(n) || n < 1) return fallback;
    return n;
  }
}

/** Build paginated response */
export function paginated<T>(
  data: T[],
  total: number,
  { page, limit }: PaginationParams,
) {
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
}
