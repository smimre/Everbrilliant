// ══════════════════════════════════════════════════════════════
// useInfiniteScroll — infinite pagination hook
// ══════════════════════════════════════════════════════════════
'use client';
import { useInfiniteQuery, InfiniteData } from '@tanstack/react-query';
import { useRef, useCallback } from 'react';

interface InfiniteResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number; hasNextPage: boolean };
}

export function useInfiniteList<T>(
  queryKey: unknown[],
  fetcher: (page: number) => Promise<InfiniteResponse<T>>,
  enabled = true,
) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
    useInfiniteQuery<InfiniteResponse<T>, Error, InfiniteData<InfiniteResponse<T>>, unknown[], number>({
      queryKey,
      queryFn: ({ pageParam }) => fetcher(pageParam),
      initialPageParam: 1,
      getNextPageParam: (last) => last.meta.hasNextPage ? last.meta.page + 1 : undefined,
      enabled,
    });

  const observer = useRef<IntersectionObserver>();

  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    if (isFetchingNextPage) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) fetchNextPage();
    });
    if (node) observer.current.observe(node);
  }, [isFetchingNextPage, fetchNextPage, hasNextPage]);

  const allItems = data?.pages.flatMap(p => p.data) ?? [];
  const total = data?.pages[0]?.meta.total ?? 0;

  return { items: allItems, total, isLoading, isFetchingNextPage, hasNextPage, error, sentinelRef };
}
