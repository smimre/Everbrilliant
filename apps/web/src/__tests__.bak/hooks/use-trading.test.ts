// ══════════════════════════════════════════════════════════════
// Hook Tests: useTradingHooks
// ══════════════════════════════════════════════════════════════
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useRequests, useCreateRequest } from '@/hooks/use-trading';
import { tradingService } from '@/services/trading.service';

jest.mock('@/services/trading.service');

const createWrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return ({ children }: any) => createElement(QueryClientProvider, { client: qc }, children);
};

describe('useRequests()', () => {
  it('fetches and returns requests', async () => {
    const mockData = {
      data: [{ id: 'REQ-001', product: 'Palm Oil', status: 'pending', qty: 10, unit: 'ton', currency: 'IRR', priority: 'normal', buyerCompanyId: 1, createdById: 1, createdAt: '', updatedAt: '' }],
      total: 1, page: 1, limit: 20, totalPages: 1,
    };
    (tradingService.getRequests as jest.Mock).mockResolvedValue(mockData);

    const { result } = renderHook(() => useRequests(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.data[0].product).toBe('Palm Oil');
  });

  it('is in loading state initially', () => {
    (tradingService.getRequests as jest.Mock).mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useRequests(), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBe(true);
  });

  it('handles error state', async () => {
    (tradingService.getRequests as jest.Mock).mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useRequests(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Network error');
  });
});

describe('useCreateRequest()', () => {
  it('calls tradingService.createRequest on mutate', async () => {
    const created = { id: 'REQ-NEW', product: 'Corn', status: 'pending', qty: 5, unit: 'ton', currency: 'IRR', priority: 'normal', buyerCompanyId: 1, createdById: 1, createdAt: '', updatedAt: '' };
    (tradingService.createRequest as jest.Mock).mockResolvedValue(created);

    const { result } = renderHook(() => useCreateRequest(), { wrapper: createWrapper() });

    result.current.mutate({ product: 'Corn', qty: 5, unit: 'ton', currency: 'IRR' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(tradingService.createRequest).toHaveBeenCalledWith({ product: 'Corn', qty: 5, unit: 'ton', currency: 'IRR' });
  });
});
