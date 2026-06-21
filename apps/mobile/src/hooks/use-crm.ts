import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { api } from '@/api/client';

export const crmKeys = {
  all:         ['crm'] as const,
  connections: (q?: Record<string, unknown>) => ['crm', 'connections', q] as const,
  deals:       (q?: Record<string, unknown>) => ['crm', 'deals', q] as const,
  dealStats:   ()                            => ['crm', 'deals', 'stats'] as const,
  search:      (q: string)                   => ['crm', 'search', q] as const,
};

export function useCRMConnections(query?: { page?: number; search?: string }) {
  return useQuery({
    queryKey: crmKeys.connections(query as Record<string, unknown>),
    queryFn:  () => api.get('/crm/connections', query as Record<string, unknown>),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    retry: false,
  });
}

export function useSearchCompanies(q: string) {
  return useQuery({
    queryKey: crmKeys.search(q),
    queryFn:  () => api.get('/crm/search', { q }),
    enabled:  q.length >= 2,
    staleTime: 30_000,
    retry: false,
  });
}

export function useDeals(query?: { stage?: string; page?: number }) {
  return useQuery({
    queryKey: crmKeys.deals(query as Record<string, unknown>),
    queryFn:  () => api.get('/crm/deals', query as Record<string, unknown>),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: false,
  });
}

export function useDealStats() {
  return useQuery({
    queryKey: crmKeys.dealStats(),
    queryFn:  () => api.get('/crm/deals/stats'),
    staleTime: 60_000,
    retry: false,
  });
}

export function useCreateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => api.post('/crm/deals', dto),
    onSuccess:  () => qc.invalidateQueries({ queryKey: crmKeys.all }),
  });
}

export function useUpdateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: any }) =>
      api.patch(`/crm/deals/${id}`, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: crmKeys.all }),
  });
}
