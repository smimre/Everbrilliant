import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { manufacturingService } from '@/services';
import { useUIStore } from '@/store';
import type { PaginationQuery } from '@/types';

export const mfgKeys = {
  all: ['manufacturing'] as const,
  workOrders: (query?: PaginationQuery & { status?: string }) => [...mfgKeys.all, 'work-orders', query] as const,
  boms: (query?: PaginationQuery) => [...mfgKeys.all, 'boms', query] as const,
  materials: (query?: PaginationQuery) => [...mfgKeys.all, 'materials', query] as const,
  wip: () => [...mfgKeys.all, 'wip'] as const,
  qc: (query?: PaginationQuery) => [...mfgKeys.all, 'quality-checks', query] as const,
  reports: () => [...mfgKeys.all, 'reports'] as const,
};

export function useWorkOrders(query?: PaginationQuery & { status?: string }) {
  return useQuery({
    queryKey: mfgKeys.workOrders(query),
    queryFn: () => manufacturingService.getWorkOrders(query),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: false,
  });
}

export function useCreateWorkOrder() {
  const qc = useQueryClient();
  const { toast } = useUIStore();
  return useMutation({
    mutationFn: manufacturingService.createWorkOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: mfgKeys.all });
      toast('success', 'Work order created');
    },
    onError: (err: Error) => toast('error', err.message),
  });
}

export function useUpdateWorkOrder() {
  const qc = useQueryClient();
  const { toast } = useUIStore();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: any }) => manufacturingService.updateWorkOrder(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: mfgKeys.all });
      toast('success', 'Work order updated');
    },
    onError: (err: Error) => toast('error', err.message),
  });
}

export function useBOMs(query?: PaginationQuery) {
  return useQuery({
    queryKey: mfgKeys.boms(query),
    queryFn: () => manufacturingService.getBOMs(query),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    retry: false,
  });
}

export function useMaterials(query?: PaginationQuery) {
  return useQuery({
    queryKey: mfgKeys.materials(query),
    queryFn: () => manufacturingService.getMaterials(query),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: false,
  });
}

export function useCreateMaterialPO() {
  const qc = useQueryClient();
  const { toast } = useUIStore();
  return useMutation({
    mutationFn: manufacturingService.createMaterialPO,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: mfgKeys.all });
      toast('success', 'Purchase order submitted to Trading module');
    },
    onError: (err: Error) => toast('error', err.message),
  });
}

export function useWIP() {
  return useQuery({
    queryKey: mfgKeys.wip(),
    queryFn: () => manufacturingService.getWIP(),
    staleTime: 30_000,
    retry: false,
  });
}

export function useQualityChecks(query?: PaginationQuery) {
  return useQuery({
    queryKey: mfgKeys.qc(query),
    queryFn: () => manufacturingService.getQualityChecks(query),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    retry: false,
  });
}

export function useMfgReports() {
  return useQuery({
    queryKey: mfgKeys.reports(),
    queryFn: () => manufacturingService.getReports(),
    staleTime: 60_000,
    retry: false,
  });
}
