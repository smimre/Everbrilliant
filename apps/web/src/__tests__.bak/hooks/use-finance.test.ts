import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useInvoices, useInvoice } from '@/hooks/use-finance';
import { financeService } from '@/services/finance.service';

jest.mock('@/services/finance.service');

const createWrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: any) => createElement(QueryClientProvider, { client: qc }, children);
};

const MOCK_INVOICE = {
  id: 'TINV-1403-001', invoiceType: 'type1' as const,
  sellerCompanyId: 1, buyerCompanyId: 2,
  items: [], subtotal: 1000, discountTotal: 0,
  vatAmount: 90, tolAmount: 10, taxAmount: 100, total: 1100,
  paid: 1100, status: 'paid' as const, currency: 'IRR',
  issuedAt: '1403/02/15', createdAt: new Date().toISOString(),
};

describe('useInvoices()', () => {
  it('returns invoice list', async () => {
    const mockData = { data: [MOCK_INVOICE], total: 1, page: 1, limit: 20, totalPages: 1 };
    (financeService.getInvoices as jest.Mock).mockResolvedValue(mockData);

    const { result } = renderHook(() => useInvoices(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data[0].id).toBe('TINV-1403-001');
  });
});

describe('useInvoice()', () => {
  it('fetches single invoice by id', async () => {
    (financeService.getInvoice as jest.Mock).mockResolvedValue(MOCK_INVOICE);
    const { result } = renderHook(() => useInvoice('TINV-1403-001'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe('TINV-1403-001');
  });

  it('does not fetch when id is empty', () => {
    const { result } = renderHook(() => useInvoice(''), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe('idle');
  });
});
