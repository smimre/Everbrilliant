import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { api } from '@/api/client';

export const mfgKeys = {
  all:        ['manufacturing'] as const,
  workOrders: (q?: Record<string, unknown>) => ['manufacturing', 'work-orders', q] as const,
  boms:       (q?: Record<string, unknown>) => ['manufacturing', 'boms', q] as const,
  materials:  (q?: Record<string, unknown>) => ['manufacturing', 'materials', q] as const,
  wip:        ()                            => ['manufacturing', 'wip'] as const,
  qc:         (q?: Record<string, unknown>) => ['manufacturing', 'qc', q] as const,
  reports:    ()                            => ['manufacturing', 'reports'] as const,
};

export function useWorkOrders(query?: { status?: string; page?: number }) {
  return useQuery({
    queryKey: mfgKeys.workOrders(query as Record<string, unknown>),
    queryFn:  () => api.get('/manufacturing/work-orders', query as Record<string, unknown>),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: false,
  });
}

export function useWorkOrder(id: string) {
  return useQuery({
    queryKey: ['manufacturing', 'work-order', id],
    queryFn:  () => api.get(`/manufacturing/work-orders/${id}`),
    enabled:  !!id,
    staleTime: 30_000,
    retry: false,
  });
}

export function useCreateWorkOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => api.post('/manufacturing/work-orders', dto),
    onSuccess:  () => qc.invalidateQueries({ queryKey: mfgKeys.all }),
  });
}

export function useUpdateWorkOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: any }) =>
      api.patch(`/manufacturing/work-orders/${id}`, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: mfgKeys.all }),
  });
}

export function useBOMs(query?: { page?: number }) {
  return useQuery({
    queryKey: mfgKeys.boms(query as Record<string, unknown>),
    queryFn:  () => api.get('/manufacturing/boms', query as Record<string, unknown>),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    retry: false,
  });
}

export function useMaterials(query?: { shortage?: boolean; page?: number }) {
  return useQuery({
    queryKey: mfgKeys.materials(query as Record<string, unknown>),
    queryFn:  () => api.get('/manufacturing/materials', query as Record<string, unknown>),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: false,
  });
}

export function useWIP() {
  return useQuery({
    queryKey: mfgKeys.wip(),
    queryFn:  () => api.get('/manufacturing/wip'),
    staleTime: 30_000,
    retry: false,
  });
}

export function useMfgReports() {
  return useQuery({
    queryKey: mfgKeys.reports(),
    queryFn:  () => api.get('/manufacturing/reports/summary'),
    staleTime: 60_000,
    retry: false,
  });
}
