import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companyService } from '@/services';
import { useUIStore } from '@/store';

const companyKeys = {
  me: ['company', 'me'] as const,
  connections: (q?: object) => ['company', 'connections', q] as const,
  search: (q: string) => ['company', 'search', q] as const,
};

export function useMyCompany() {
  return useQuery({
    queryKey: companyKeys.me,
    queryFn: companyService.getMyCompany,
    staleTime: 60_000,
    retry: false,
  });
}

export function useUpdateMyCompany() {
  const qc = useQueryClient();
  const { toast } = useUIStore();
  return useMutation({
    mutationFn: companyService.updateCompany,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: companyKeys.me });
      toast('success', 'Company updated');
    },
    onError: (err: Error) => toast('error', err.message),
  });
}

export function useCompanyConnections(query?: object) {
  return useQuery({
    queryKey: companyKeys.connections(query),
    queryFn: () => companyService.getConnections(query as any),
    staleTime: 30_000,
    retry: false,
  });
}

export function useAddCompanyConnection() {
  const qc = useQueryClient();
  const { toast } = useUIStore();
  return useMutation({
    mutationFn: (inviteCode: string) => companyService.addConnection(inviteCode),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['company', 'connections'] });
      toast('success', 'Connection added');
    },
    onError: (err: Error) => toast('error', err.message),
  });
}

export function useRemoveCompanyConnection() {
  const qc = useQueryClient();
  const { toast } = useUIStore();
  return useMutation({
    mutationFn: (companyId: number) => companyService.removeConnection(companyId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['company', 'connections'] });
      toast('success', 'Connection removed');
    },
    onError: (err: Error) => toast('error', err.message),
  });
}

export function useSearchCompany(q: string) {
  return useQuery({
    queryKey: companyKeys.search(q),
    queryFn: () => companyService.search(q),
    enabled: q.length >= 2,
    staleTime: 30_000,
    retry: false,
  });
}
