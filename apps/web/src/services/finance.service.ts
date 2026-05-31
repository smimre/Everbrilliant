import { api } from '@/lib/api-client';
import type { Invoice, InvoiceItem, Employee, InventoryItem, PaginatedResponse, PaginationQuery } from '@/types';

interface CreateInvoiceDto {
  invoiceType: 'type1' | 'type2' | 'type3';
  buyerCompanyId: number;
  requestId?: string;
  items: Omit<InvoiceItem, 'id'>[];
  issuedAt: string;
  dueAt?: string;
  note?: string;
}

export const financeService = {
  // Invoices
  getInvoices: (query?: PaginationQuery & { status?: string }) =>
    api.get<PaginatedResponse<Invoice>>('/finance/invoices', query as Record<string, unknown>),
  getInvoice: (id: string) => api.get<Invoice>(`/finance/invoices/${id}`),
  createInvoice: (dto: CreateInvoiceDto) => api.post<Invoice>('/finance/invoices', dto),
  markPaid: (id: string, dto: { amount: number; paymentMethod: string; referenceNo?: string }) =>
    api.patch(`/finance/invoices/${id}/pay`, dto),
  getInvoicePdf: (id: string) => api.get<Blob>(`/finance/invoices/${id}/pdf`),

  // Employees
  getEmployees: (query?: PaginationQuery) => api.get<PaginatedResponse<Employee>>('/finance/employees', query as Record<string, unknown>),
  createEmployee: (dto: Omit<Employee, 'id' | 'companyId' | 'createdAt'>) => api.post<Employee>('/finance/employees', dto),
  updateEmployee: (id: string, dto: Partial<Employee>) => api.patch<Employee>(`/finance/employees/${id}`, dto),

  // Inventory
  getInventory: (query?: PaginationQuery & { category?: string }) =>
    api.get<PaginatedResponse<InventoryItem>>('/finance/inventory', query as Record<string, unknown>),
  addInventory: (dto: Omit<InventoryItem, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) =>
    api.post<InventoryItem>('/finance/inventory', dto),
  stockIn: (id: string, qty: number, ref?: string) => api.post(`/finance/inventory/${id}/stock-in`, { qty, ref }),
  stockOut: (id: string, qty: number, ref?: string) => api.post(`/finance/inventory/${id}/stock-out`, { qty, ref }),
};
