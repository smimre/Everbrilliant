import { api } from '@/lib/api-client';
import type { PaginationQuery, PaginatedResponse } from '@/types';

export interface CreateShipmentDto {
  cargo: string;
  shipType: 'domestic' | 'international' | 'air';
  origin: string;
  destination: string;
  sellerName?: string;
  buyerName?: string;
  weight?: string | number;
  weightUnit?: string;
  volume?: string | number;
  cost?: string | number;
  costPaid?: boolean;
  notes?: string;
}

export const logisticsService = {
  getShipments: (query?: PaginationQuery & { status?: string; type?: string; search?: string }) =>
    api.get<PaginatedResponse<any>>('/logistics/shipments', query as Record<string, unknown>),

  createShipment: (dto: CreateShipmentDto) =>
    api.post<any>('/logistics/shipments', dto),

  updateShipment: (id: string, dto: Partial<any>) =>
    api.patch<any>(`/logistics/shipments/${id}`, dto),

  advanceStage: (id: string, dto?: { date?: string; note?: string }) =>
    api.post<any>(`/logistics/shipments/${id}/advance-stage`, dto ?? {}),

  issueWaybill: (id: string) =>
    api.post<any>(`/logistics/shipments/${id}/waybill`, {}),

  getRateQuotes: () =>
    api.get<any[]>('/logistics/quotes'),

  createRateQuote: (dto: { from: string; to: string; mode: string; rate: number; unit: string }) =>
    api.post<any>('/logistics/quotes', dto),

  toggleRateQuote: (id: string) =>
    api.patch<any>(`/logistics/quotes/${id}/toggle`, {}),

  getReports: () =>
    api.get<any>('/logistics/reports'),
};
