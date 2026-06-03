import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export function useCRMConnections(query?: { limit?: number; page?: number; search?: string }) {
  return useQuery({
    queryKey: ['crm', 'connections', query],
    queryFn: () => api.get('/crm/connections', query as Record<string, unknown>),
    staleTime: 60_000,
  });
}

export function useAddCRMConnection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (inviteCode: string) => api.post('/crm/connections', { inviteCode }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['crm'] }),
  });
}

export function useSearchCompanies(q: string) {
  return useQuery({
    queryKey: ['crm', 'search', q],
    queryFn: () => api.get('/crm/search', { q }),
    enabled: q.length >= 2,
    staleTime: 30_000,
  });
}

// ── CRM Deals ─────────────────────────────────────────────

export function useDeals(query?: { stage?: string; page?: number }) {
  return useQuery({
    queryKey: ['crm', 'deals', query],
    queryFn: () => api.get('/crm/deals', query as Record<string, unknown>),
    staleTime: 30_000,
    retry: false,
  });
}

export function useDealStats() {
  return useQuery({
    queryKey: ['crm', 'deals', 'stats'],
    queryFn: () => api.get('/crm/deals/stats'),
    staleTime: 60_000,
    retry: false,
  });
}

export function useCreateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => api.post('/crm/deals', dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['crm', 'deals'] }),
  });
}

export function useUpdateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: any }) => api.patch(`/crm/deals/${id}`, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['crm', 'deals'] }),
  });
}

export function useDeleteDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/crm/deals/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['crm', 'deals'] }),
  });
}
