import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { financeService } from '@/services';
import { useUIStore } from '@/store';
import type { PaginationQuery } from '@/types';

export const financeKeys = {
  all: ['finance'] as const,
  invoices: (query?: PaginationQuery & { status?: string }) => [...financeKeys.all, 'invoices', query] as const,
  invoice: (id: string) => [...financeKeys.all, 'invoice', id] as const,
  employees: (query?: PaginationQuery) => [...financeKeys.all, 'employees', query] as const,
  inventory: (query?: PaginationQuery) => [...financeKeys.all, 'inventory', query] as const,
};

export function useInvoices(query?: PaginationQuery & { status?: string }) {
  return useQuery({
    queryKey: financeKeys.invoices(query),
    queryFn: () => financeService.getInvoices(query),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: financeKeys.invoice(id),
    queryFn: () => financeService.getInvoice(id),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  const { toast } = useUIStore();
  return useMutation({
    mutationFn: financeService.createInvoice,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: financeKeys.all });
      toast('success', 'Invoice created');
    },
    onError: (err: Error) => toast('error', err.message),
  });
}

export function useEmployees(query?: PaginationQuery) {
  return useQuery({
    queryKey: financeKeys.employees(query),
    queryFn: () => financeService.getEmployees(query),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useInventory(query?: PaginationQuery) {
  return useQuery({
    queryKey: financeKeys.inventory(query),
    queryFn: () => financeService.getInventory(query),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
