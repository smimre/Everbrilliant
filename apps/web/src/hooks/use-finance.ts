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
  balanceSheet: () => [...financeKeys.all, 'balance-sheet'] as const,
  incomeStatement: (from?: string, to?: string) => [...financeKeys.all, 'income-statement', from, to] as const,
  cashFlow: (from?: string, to?: string) => [...financeKeys.all, 'cash-flow', from, to] as const,
  trialBalance: () => [...financeKeys.all, 'trial-balance'] as const,
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

export function usePayInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...dto }: { id: string; amount: number; paymentMethod?: string; referenceNo?: string }) =>
      financeService.payInvoice(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: financeKeys.all }),
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

export function useAddInventory() {
  const qc = useQueryClient();
  const { toast } = useUIStore();
  return useMutation({
    mutationFn: (dto: any) => financeService.addInventory(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: financeKeys.inventory() });
      toast('success', 'Item added');
    },
    onError: (err: Error) => toast('error', err.message),
  });
}

export function useStockMove() {
  const qc = useQueryClient();
  const { toast } = useUIStore();
  return useMutation({
    mutationFn: ({ id, type, qty, ref }: { id: string; type: 'in' | 'out'; qty: number; ref?: string }) =>
      type === 'in' ? financeService.stockIn(id, qty, ref) : financeService.stockOut(id, qty, ref),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: financeKeys.inventory() });
      toast('success', 'Stock updated');
    },
    onError: (err: Error) => toast('error', err.message),
  });
}

export function useBalanceSheet() {
  return useQuery({
    queryKey: financeKeys.balanceSheet(),
    queryFn: () => financeService.getBalanceSheet(),
    staleTime: 60_000,
    retry: false,
  });
}

export function useIncomeStatement(from?: string, to?: string) {
  return useQuery({
    queryKey: financeKeys.incomeStatement(from, to),
    queryFn: () => financeService.getIncomeStatement(from, to),
    staleTime: 60_000,
    retry: false,
  });
}

export function useCashFlow(from?: string, to?: string) {
  return useQuery({
    queryKey: financeKeys.cashFlow(from, to),
    queryFn: () => financeService.getCashFlow(from, to),
    staleTime: 60_000,
    retry: false,
  });
}

export function useTrialBalance() {
  return useQuery({
    queryKey: financeKeys.trialBalance(),
    queryFn: () => financeService.getTrialBalance(),
    staleTime: 60_000,
    retry: false,
  });
}
