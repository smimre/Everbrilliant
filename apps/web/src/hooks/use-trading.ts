import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { PaginatedResponse, TradeRequest } from '@/types';

type RequestQuery = { limit?: number; page?: number; status?: string };

// ── Requests ──────────────────────────────────────────────────
export function useRequests(query?: RequestQuery) {
  return useQuery({
    queryKey: ['trading', 'requests', query],
    queryFn: () => api.get<PaginatedResponse<TradeRequest>>('/trading/requests', query as Record<string, unknown>),
    staleTime: 30_000,
  });
}

export function useCreateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/trading/requests', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trading', 'requests'] }),
  });
}

// ── Contracts ─────────────────────────────────────────────────
export function useContracts() {
  return useQuery({
    queryKey: ['trading', 'contracts'],
    queryFn: () => api.get('/trading/contracts'),
    staleTime: 30_000,
  });
}

// ── Tenders ───────────────────────────────────────────────────
export function useTenders() {
  return useQuery({
    queryKey: ['trading', 'tenders'],
    queryFn: () => api.get('/trading/tenders'),
    staleTime: 30_000,
  });
}

export function useCreateTender() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/trading/tenders', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trading', 'tenders'] }),
  });
}

// ── Connections ───────────────────────────────────────────────
export function useConnections() {
  return useQuery({
    queryKey: ['trading', 'connections'],
    queryFn: () => api.get('/trading/connections'),
    staleTime: 60_000,
  });
}

// ── Quotes ────────────────────────────────────────────────────
export function useQuotesForRequest(requestId: string) {
  return useQuery({
    queryKey: ['trading', 'quotes', requestId],
    queryFn: () => api.get(`/trading/requests/${requestId}/quotes`),
    enabled: !!requestId,
    staleTime: 30_000,
  });
}

export function useCreateQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/trading/quotes', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trading'] }),
  });
}

export function useAcceptQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/trading/quotes/${id}/accept`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trading'] }),
  });
}

// ── Sign Contract ─────────────────────────────────────────────
export function useSignContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/trading/contracts/${id}/sign`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trading', 'contracts'] }),
  });
}
