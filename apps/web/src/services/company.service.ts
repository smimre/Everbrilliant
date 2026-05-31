import { api } from '@/lib/api-client';
import type { Company, PaginatedResponse, PaginationQuery } from '@/types';

export const companyService = {
  getMyCompany: () => api.get<Company>('/companies/me'),
  updateCompany: (data: Partial<Company>) => api.patch<Company>('/companies/me', data),
  getConnections: (query?: PaginationQuery) => api.get<PaginatedResponse<Company>>('/companies/connections', query as Record<string, unknown>),
  addConnection: (inviteCode: string) => api.post<Company>('/companies/connections', { inviteCode }),
  removeConnection: (companyId: number) => api.delete(`/companies/connections/${companyId}`),
  search: (q: string) => api.get<Company[]>('/companies/search', { q }),
};
