import { api } from '@/lib/api-client';
import type { PaginationQuery, PaginatedResponse } from '@/types';

export interface WorkOrderDto {
  productName: string;
  bomCode: string;
  qty: number;
  unit: string;
  startDate: string;
  dueDate: string;
  priority?: string;
  workcenter?: string;
  notes?: string;
}

export const manufacturingService = {
  getWorkOrders: (query?: PaginationQuery & { status?: string }) =>
    api.get<PaginatedResponse<any>>('/manufacturing/work-orders', query as Record<string, unknown>),
  createWorkOrder: (dto: WorkOrderDto) =>
    api.post<any>('/manufacturing/work-orders', dto),
  updateWorkOrder: (id: string, dto: Partial<WorkOrderDto & { status?: string; progress?: number }>) =>
    api.patch<any>(`/manufacturing/work-orders/${id}`, dto),

  getBOMs: (query?: PaginationQuery) =>
    api.get<PaginatedResponse<any>>('/manufacturing/boms', query as Record<string, unknown>),

  getMaterials: (query?: PaginationQuery) =>
    api.get<PaginatedResponse<any>>('/manufacturing/materials', query as Record<string, unknown>),
  createMaterialPO: (dto: { materialId: string; qty: number; supplier: string; unitCost: number }) =>
    api.post<any>('/manufacturing/materials/po', dto),

  getWIP: () =>
    api.get<any[]>('/manufacturing/wip'),

  getQualityChecks: (query?: PaginationQuery) =>
    api.get<PaginatedResponse<any>>('/manufacturing/quality-checks', query as Record<string, unknown>),

  getReports: () =>
    api.get<any>('/manufacturing/reports/summary'),
};
