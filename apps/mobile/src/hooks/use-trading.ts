import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { api } from '@/api/client';

export function useRequests(query?: { status?: string; page?: number }) {
  return useQuery({
    queryKey: ['trading', 'requests', query],
    queryFn: () => api.get('/trading/requests', query as Record<string, unknown>),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: false,
  });
}

export function useContracts(query?: { page?: number }) {
  return useQuery({
    queryKey: ['trading', 'contracts', query],
    queryFn: () => api.get('/trading/contracts', query as Record<string, unknown>),
    staleTime: 30_000,
    retry: false,
  });
}

export function useTenders(query?: { type?: string }) {
  return useQuery({
    queryKey: ['trading', 'tenders', query],
    queryFn: () => api.get('/trading/tenders', query as Record<string, unknown>),
    staleTime: 60_000,
    retry: false,
  });
}

export function useCreateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => api.post('/trading/requests', dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trading', 'requests'] }),
  });
}
