import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';

export const logKeys = {
  all:       ['logistics'] as const,
  shipments: (q?: Record<string, unknown>) => ['logistics', 'shipments', q] as const,
};

export function useShipments(query?: { status?: string; page?: number }) {
  return useQuery({
    queryKey: logKeys.shipments(query as Record<string, unknown>),
    queryFn:  () => api.get('/logistics/shipments', query as Record<string, unknown>),
    placeholderData: undefined,
    staleTime: 30_000,
    retry: false,
  });
}

export function useCreateShipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => api.post('/logistics/shipments', dto),
    onSuccess:  () => qc.invalidateQueries({ queryKey: logKeys.all }),
  });
}

export function useUpdateShipmentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/logistics/shipments/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: logKeys.all }),
  });
}
