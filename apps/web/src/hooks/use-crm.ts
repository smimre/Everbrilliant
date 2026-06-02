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
