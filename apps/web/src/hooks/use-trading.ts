import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

// ── Requests ──────────────────────────────────────────────────
export function useRequests() {
  return useQuery({
    queryKey: ['trading', 'requests'],
    queryFn: () => api.get('/api/trading/requests'),
    staleTime: 30_000,
  });
}

export function useCreateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/api/trading/requests', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trading', 'requests'] }),
  });
}

// ── Contracts ─────────────────────────────────────────────────
export function useContracts() {
  return useQuery({
    queryKey: ['trading', 'contracts'],
    queryFn: () => api.get('/api/trading/contracts'),
    staleTime: 30_000,
  });
}

// ── Tenders ───────────────────────────────────────────────────
export function useTenders() {
  return useQuery({
    queryKey: ['trading', 'tenders'],
    queryFn: () => api.get('/api/trading/tenders'),
    staleTime: 30_000,
  });
}

export function useCreateTender() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/api/trading/tenders', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trading', 'tenders'] }),
  });
}

// ── Connections ───────────────────────────────────────────────
export function useConnections() {
  return useQuery({
    queryKey: ['trading', 'connections'],
    queryFn: () => api.get('/api/trading/connections'),
    staleTime: 60_000,
  });
}
