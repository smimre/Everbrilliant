import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

// ── Letters ───────────────────────────────────────────────────
export function useLetters(query?: { type?: string; archived?: boolean }) {
  return useQuery({
    queryKey: ['automation', 'letters', query],
    queryFn: () => api.get('/automation/letters', query as Record<string, unknown>),
    staleTime: 30_000,
  });
}

export function useCreateLetter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/automation/letters', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['automation', 'letters'] }),
  });
}

export function useArchiveLetter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/automation/letters/${id}/archive`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['automation', 'letters'] }),
  });
}

// ── Meetings ──────────────────────────────────────────────────
export function useMeetings(query?: { status?: string }) {
  return useQuery({
    queryKey: ['automation', 'meetings', query],
    queryFn: () => api.get('/automation/meetings', query as Record<string, unknown>),
    staleTime: 30_000,
  });
}

export function useCreateMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/automation/meetings', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['automation', 'meetings'] }),
  });
}

export function useAddMinutes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, minutes }: { id: string; minutes: string }) =>
      api.patch(`/automation/meetings/${id}/minutes`, { minutes }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['automation', 'meetings'] }),
  });
}

// ── Workflow Requests ─────────────────────────────────────────
export function useWorkflowRequests(query?: { status?: string }) {
  return useQuery({
    queryKey: ['automation', 'requests', query],
    queryFn: () => api.get('/automation/requests', query as Record<string, unknown>),
    staleTime: 30_000,
  });
}

export function useCreateWorkflowRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/automation/requests', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['automation', 'requests'] }),
  });
}

export function useApproveRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) =>
      api.patch(`/automation/requests/${id}/approve`, { comment }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['automation', 'requests'] }),
  });
}

export function useRejectRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) =>
      api.patch(`/automation/requests/${id}/reject`, { comment }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['automation', 'requests'] }),
  });
}
