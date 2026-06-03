export type Language = 'fa' | 'en' | 'ar' | 'hi';
export type Direction = 'rtl' | 'ltr';
export type Theme = 'dark' | 'light';
export type Module = 'trading' | 'finance' | 'automation' | 'crm' | 'manufacturing' | 'logistics';
export type RequestStatus = 'draft' | 'pending' | 'quoted' | 'approved' | 'rejected' | 'completed' | 'cancelled';
export type Priority = 'low' | 'normal' | 'high' | 'urgent';
export type InvoiceStatus = 'draft' | 'sent' | 'partial' | 'paid' | 'overdue' | 'cancelled';
export type InvoiceType = 'type1' | 'type2' | 'type3';

export interface Role { id: number; name: string; label: string; labelFa?: string; labelAr?: string; companyId?: number; isSystem?: boolean; isDefault?: boolean; createdAt?: string; permissions?: string[]; }
export interface User { id: number; name: string; phone: string; email?: string; avatar?: string; role: string | Role; companyId: number; company?: Company; permissions: string[]; isCompanyAdmin: boolean; }
export function roleLabel(role: string | Role | undefined | null): string {
  if (!role) return '';
  if (typeof role === 'string') return role;
  return role.label || role.name || '';
}
export interface Company { id: number; name: string; nationalId?: string; economicCode?: string; regNo?: string; postalCode?: string; address?: string; country: string; vatRegistered: boolean; vatRate: number; plan: string; isActive: boolean; createdAt: string; updatedAt: string; }
export interface AuthTokens { accessToken: string; refreshToken: string; expiresIn?: number; }
export interface LoginDto { phone: string; password: string; }
export interface RegisterDto { name: string; phone: string; password: string; companyName?: string; inviteCode?: string; }
export interface TradeRequest { id: string; buyerCompanyId: number; sellerCompanyId?: number; buyerCompany?: Company; sellerCompany?: Company; product: string; qty: number; unit: string; amountIRR?: number; currency: string; status: RequestStatus; priority: Priority; deadline?: string; note?: string; hsCode?: string; createdById: number; createdAt: string; updatedAt: string; }
export interface Quote { id: string; requestId: string; sellerCompanyId: number; unitPrice: number; currency: string; totalPrice: number; validUntil?: string; deliveryDays?: number; note?: string; status: string; createdAt: string; }
export interface Contract { id: string; requestId: string; buyerCompanyId: number; sellerCompanyId: number; title: string; amountIRR: number; currency: string; status: string; signedBuyer: boolean; signedSeller: boolean; startDate?: string; endDate?: string; terms?: string; createdAt: string; }
export interface Tender { id: string; type: string; title: string; companyId: number; startDate: string; endDate: string; status: string; createdAt: string; products: TenderProduct[]; bidsCount?: number; }
export interface TenderProduct { id: number; tenderId: string; name: string; qty: number; unit: string; currency: string; basePrice?: number; }
export interface Bid { id: string; tenderId: string; bidderId: number; companyId: number; totalPrice: number; currency: string; note?: string; status: string; createdAt: string; }
export interface Invoice { id: string; invoiceType: InvoiceType; sellerCompanyId: number; buyerCompanyId: number; sellerCompany?: Company; buyerCompany?: Company; requestId?: string; items: InvoiceItem[]; subtotal: number; discountTotal: number; vatAmount: number; tolAmount: number; taxAmount: number; total: number; paid: number; status: InvoiceStatus; currency: string; issuedAt: string; dueAt?: string; paidAt?: string; paymentMethod?: string; referenceNo?: string; taxSerial?: string; taxSystemRef?: string; note?: string; createdAt: string; }
export interface InvoiceItem { id?: number; row: number; desc: string; qty: number; unit: string; unitPrice: number; discount: number; netPrice: number; subtotalRow: number; vatPct: number; tolPct: number; taxPct: number; vatAmount: number; tolAmount: number; taxAmount: number; totalRow: number; hsCode?: string; }
export interface Employee { id: string; staffCode: string; name: string; department: string; jobTitle: string; baseSalary: number; currency: string; phone?: string; email?: string; isActive: boolean; hireDate: string; companyId: number; createdAt: string; }
export interface InventoryItem { id: string; companyId: number; product: string; qty: number; unit: string; minQty: number; category?: string; priceIRR?: number; createdAt: string; updatedAt: string; }
export interface Letter { id: string; type: string; title: string; letterNo: string; date: string; from: string; to: string; body: string; priority: string; status: string; companyId: number; createdAt: string; }
export interface WorkflowRequest { id: string; type: string; title: string; requesterId: number; companyId: number; amount?: number; currency?: string; startDate?: string; endDate?: string; description: string; status: string; approvals?: Approval[]; createdAt: string; }
export interface Approval { id: string; requestId: string; approverId: number; approverName: string; status: string; comment?: string; decidedAt?: string; }
export interface Meeting { id: string; title: string; date: string; startTime: string; endTime?: string; location?: string; type: string; agenda: string; minutes?: string; attendees: string[]; companyId: number; createdAt: string; }
export interface AppNotification { id: string; userId: number; type: string; title: string; message: string; link?: string; isRead: boolean; createdAt: string; }
export interface PaginatedResponse<T> { data: T[]; total: number; page: number; limit: number; totalPages: number; }
export interface PaginationQuery { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: 'asc' | 'desc'; }
export interface ApiError { message: string; statusCode: number; error?: string; }
