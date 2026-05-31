// ══════════════════════════════════════════════════════════════
// Memoization & Computation Utilities
// ══════════════════════════════════════════════════════════════
import { useMemo, useCallback, useRef } from 'react';

/** Memoize a pure function (simple LRU cache) */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  maxSize = 100,
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key)!;

    const result = fn(...args);

    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    cache.set(key, result);
    return result;
  }) as T;
}

/** Format currency — memoized */
export const formatCurrency = memoize((
  amount: number,
  currency = 'IRR',
  lang = 'fa',
): string => {
  const n = new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US').format(amount);
  return currency === 'IRR' ? `${n} ریال` : `${n} ${currency}`;
});

/** Format number in millions — memoized */
export const formatMillions = memoize((amount: number, lang = 'fa'): string => {
  const m = Math.round(amount / 1_000_000);
  return new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US').format(m) + 'M';
});

/** Invoice VAT calculation — memoized */
export const calcInvoiceVAT = memoize((
  subtotal: number,
  vatPct = 9,
  tolPct = 1,
) => {
  const vat = Math.round(subtotal * vatPct / 100);
  const tol = Math.round(subtotal * tolPct / 100);
  return { vat, tol, tax: vat + tol, total: subtotal + vat + tol };
});

/** Stable callback ref — avoids stale closures */
export function useStableCallback<T extends Function>(fn: T): T {
  const ref = useRef<T>(fn);
  ref.current = fn;
  return useCallback((...args: unknown[]) => ref.current(...args), []) as unknown as T;
}

/** Memoized paginated selector */
export function usePaginatedData<T>(
  data: T[] | undefined,
  page: number,
  pageSize: number,
) {
  return useMemo(() => {
    if (!data) return { items: [], total: 0, totalPages: 0 };
    const start = (page - 1) * pageSize;
    return {
      items: data.slice(start, start + pageSize),
      total: data.length,
      totalPages: Math.ceil(data.length / pageSize),
    };
  }, [data, page, pageSize]);
}

/** Debounced value hook (stable) */
export function useStableMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
): T {
  return useMemo(factory, deps);
}
