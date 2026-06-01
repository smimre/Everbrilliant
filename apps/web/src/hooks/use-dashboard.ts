import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export interface DashboardStats {
  pendingRequests: number;
  activeContracts: number;
  unpaidInvoicesCount: number;
  unpaidAmount: number;
  overdueCount: number;
  totalRevenueMTD: number;
  activeConnections: number;
  recentActivity: {
    action: string;
    entityType: string | null;
    module: string;
    description: string | null;
    createdAt: string;
    userId: number | null;
    user: { name: string } | null;
  }[];
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => api.get<DashboardStats>('/dashboard/stats'),
    staleTime: 60_000,
  });
}
