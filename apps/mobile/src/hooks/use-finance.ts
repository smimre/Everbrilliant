import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { api } from '@/api/client';

export function useInvoices(query?: { status?: string; page?: number }) {
  return useQuery({
    queryKey: ['finance', 'invoices', query],
    queryFn: () => api.get('/finance/invoices', query as Record<string, unknown>),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: false,
  });
}

export function useBalanceSheet() {
  return useQuery({
    queryKey: ['finance', 'balance-sheet'],
    queryFn: () => api.get('/finance/reports/balance-sheet'),
    staleTime: 60_000,
    retry: false,
  });
}

export function useIncomeStatement() {
  return useQuery({
    queryKey: ['finance', 'income-statement'],
    queryFn: () => api.get('/finance/reports/income-statement'),
    staleTime: 60_000,
    retry: false,
  });
}
