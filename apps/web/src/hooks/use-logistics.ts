import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { logisticsService } from '@/services';
import { useUIStore } from '@/store';
import type { PaginationQuery } from '@/types';

export const logisticsKeys = {
  all: ['logistics'] as const,
  shipments: (query?: PaginationQuery & { status?: string; type?: string; search?: string }) =>
    [...logisticsKeys.all, 'shipments', query] as const,
  quotes: () => [...logisticsKeys.all, 'quotes'] as const,
  reports: () => [...logisticsKeys.all, 'reports'] as const,
};

export function useShipments(query?: PaginationQuery & { status?: string; type?: string; search?: string }) {
  return useQuery({
    queryKey: logisticsKeys.shipments(query),
    queryFn: () => logisticsService.getShipments(query),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: false,
  });
}

export function useCreateShipment() {
  const qc = useQueryClient();
  const { toast } = useUIStore();
  return useMutation({
    mutationFn: logisticsService.createShipment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: logisticsKeys.all });
      toast('success', 'Shipment registered');
    },
    onError: (err: Error) => toast('error', err.message),
  });
}

export function useUpdateShipment() {
  const qc = useQueryClient();
  const { toast } = useUIStore();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<any> }) =>
      logisticsService.updateShipment(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: logisticsKeys.all });
    },
    onError: (err: Error) => toast('error', err.message),
  });
}

export function useAdvanceStage() {
  const qc = useQueryClient();
  const { toast } = useUIStore();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto?: { date?: string; note?: string } }) =>
      logisticsService.advanceStage(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: logisticsKeys.all });
      toast('success', 'Status updated');
    },
    onError: (err: Error) => toast('error', err.message),
  });
}

export function useIssueWaybill() {
  const qc = useQueryClient();
  const { toast } = useUIStore();
  return useMutation({
    mutationFn: (id: string) => logisticsService.issueWaybill(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: logisticsKeys.all });
      toast('success', 'Waybill issued');
    },
    onError: (err: Error) => toast('error', err.message),
  });
}

export function useRateQuotes() {
  return useQuery({
    queryKey: logisticsKeys.quotes(),
    queryFn: logisticsService.getRateQuotes,
    staleTime: 60_000,
    retry: false,
  });
}

export function useCreateRateQuote() {
  const qc = useQueryClient();
  const { toast } = useUIStore();
  return useMutation({
    mutationFn: logisticsService.createRateQuote,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: logisticsKeys.quotes() });
      toast('success', 'Rate quote added');
    },
    onError: (err: Error) => toast('error', err.message),
  });
}

export function useToggleRateQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => logisticsService.toggleRateQuote(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: logisticsKeys.quotes() }),
  });
}

export function useLogisticsReports() {
  return useQuery({
    queryKey: logisticsKeys.reports(),
    queryFn: logisticsService.getReports,
    staleTime: 60_000,
    retry: false,
  });
}
