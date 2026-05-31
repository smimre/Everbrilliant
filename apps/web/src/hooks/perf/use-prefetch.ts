// ══════════════════════════════════════════════════════════════
// usePrefetch — preload data on hover/focus
// ══════════════════════════════════════════════════════════════
'use client';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export function usePrefetch<T>(
  queryKey: unknown[],
  fetcher: () => Promise<T>,
  ttl = 30_000,
) {
  const qc = useQueryClient();

  const prefetch = useCallback(() => {
    qc.prefetchQuery({
      queryKey,
      queryFn: fetcher,
      staleTime: ttl,
    });
  }, [qc, queryKey, fetcher, ttl]);

  return { prefetch };
}

/** Prefetch on link hover */
export function usePrefetchOnHover<T>(
  queryKey: unknown[],
  fetcher: () => Promise<T>,
) {
  const { prefetch } = usePrefetch(queryKey, fetcher);
  return {
    onMouseEnter: prefetch,
    onFocus: prefetch,
  };
}
