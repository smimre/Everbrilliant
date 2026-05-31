import { api } from '@/lib/api-client';
import type {
  TradeRequest, Quote, Contract, Tender, Bid,
  PaginatedResponse, PaginationQuery,
} from '@/types';

interface CreateRequestDto { product: string; qty: number; unit: string; currency: string; priority?: string; deadline?: string; note?: string; hsCode?: string; }
interface CreateQuoteDto { requestId: string; unitPrice: number; currency: string; validUntil?: string; deliveryDays?: number; note?: string; }
interface CreateTenderDto { type: 'auction' | 'tender'; title: string; startDate: string; endDate: string; products: Array<{ name: string; qty: number; unit: string; currency: string; basePrice?: number }>; }

export const tradingService = {
  // Requests
  getRequests: (query?: PaginationQuery & { status?: string }) =>
    api.get<PaginatedResponse<TradeRequest>>('/trading/requests', query as Record<string, unknown>),
  getRequest: (id: string) => api.get<TradeRequest>(`/trading/requests/${id}`),
  createRequest: (dto: CreateRequestDto) => api.post<TradeRequest>('/trading/requests', dto),
  updateRequest: (id: string, dto: Partial<CreateRequestDto>) => api.patch<TradeRequest>(`/trading/requests/${id}`, dto),
  cancelRequest: (id: string) => api.patch(`/trading/requests/${id}/cancel`),

  // Quotes
  getQuotes: (requestId: string) => api.get<Quote[]>(`/trading/requests/${requestId}/quotes`),
  createQuote: (dto: CreateQuoteDto) => api.post<Quote>('/trading/quotes', dto),
  acceptQuote: (id: string) => api.patch(`/trading/quotes/${id}/accept`),
  rejectQuote: (id: string) => api.patch(`/trading/quotes/${id}/reject`),

  // Contracts
  getContracts: (query?: PaginationQuery) => api.get<PaginatedResponse<Contract>>('/trading/contracts', query as Record<string, unknown>),
  getContract: (id: string) => api.get<Contract>(`/trading/contracts/${id}`),
  signContract: (id: string) => api.patch(`/trading/contracts/${id}/sign`),

  // Tenders
  getTenders: (query?: PaginationQuery & { type?: string }) =>
    api.get<PaginatedResponse<Tender>>('/trading/tenders', query as Record<string, unknown>),
  createTender: (dto: CreateTenderDto) => api.post<Tender>('/trading/tenders', dto),
  placeBid: (tenderId: string, dto: { totalPrice: number; currency: string; note?: string }) =>
    api.post<Bid>(`/trading/tenders/${tenderId}/bids`, dto),
};
