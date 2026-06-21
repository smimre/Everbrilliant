import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { api } from '@/api/client';

export const autoKeys = {
  all:      ['automation'] as const,
  letters:  (q?: Record<string, unknown>) => ['automation', 'letters',  q] as const,
  meetings: (q?: Record<string, unknown>) => ['automation', 'meetings', q] as const,
  requests: (q?: Record<string, unknown>) => ['automation', 'requests', q] as const,
  tasks:    (q?: Record<string, unknown>) => ['automation', 'tasks',    q] as const,
};

// ── Letters ───────────────────────────────────────────────────
export function useLetters(query?: { type?: string; archived?: boolean }) {
  return useQuery({
    queryKey: autoKeys.letters(query as Record<string, unknown>),
    queryFn:  () => api.get('/automation/letters', query as Record<string, unknown>),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: false,
  });
}

export function useCreateLetter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => api.post('/automation/letters', dto),
    onSuccess:  () => qc.invalidateQueries({ queryKey: autoKeys.all }),
  });
}

export function useArchiveLetter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/automation/letters/${id}/archive`, {}),
    onSuccess:  () => qc.invalidateQueries({ queryKey: autoKeys.all }),
  });
}

// ── Meetings ──────────────────────────────────────────────────
export function useMeetings(query?: { status?: string }) {
  return useQuery({
    queryKey: autoKeys.meetings(query as Record<string, unknown>),
    queryFn:  () => api.get('/automation/meetings', query as Record<string, unknown>),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: false,
  });
}

export function useCreateMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => api.post('/automation/meetings', dto),
    onSuccess:  () => qc.invalidateQueries({ queryKey: autoKeys.all }),
  });
}

// ── Workflow Requests ─────────────────────────────────────────
export function useWorkflowRequests(query?: { status?: string }) {
  return useQuery({
    queryKey: autoKeys.requests(query as Record<string, unknown>),
    queryFn:  () => api.get('/automation/requests', query as Record<string, unknown>),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: false,
  });
}

export function useCreateWorkflowRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => api.post('/automation/requests', dto),
    onSuccess:  () => qc.invalidateQueries({ queryKey: autoKeys.all }),
  });
}

export function useApproveRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) =>
      api.patch(`/automation/requests/${id}/approve`, { comment }),
    onSuccess: () => qc.invalidateQueries({ queryKey: autoKeys.all }),
  });
}

export function useRejectRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) =>
      api.patch(`/automation/requests/${id}/reject`, { comment }),
    onSuccess: () => qc.invalidateQueries({ queryKey: autoKeys.all }),
  });
}

// ── Tasks ─────────────────────────────────────────────────────
export function useTasks(query?: { status?: string }) {
  return useQuery({
    queryKey: autoKeys.tasks(query as Record<string, unknown>),
    queryFn:  () => api.get('/automation/tasks', query as Record<string, unknown>),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: false,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => api.post('/automation/tasks', dto),
    onSuccess:  () => qc.invalidateQueries({ queryKey: autoKeys.all }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: any }) =>
      api.patch(`/automation/tasks/${id}`, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: autoKeys.all }),
  });
}
