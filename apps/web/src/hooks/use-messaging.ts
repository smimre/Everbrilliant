import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

const msgKeys = {
  inbox:       (page?: number) => ['messages', 'inbox', page]  as const,
  sent:        (page?: number) => ['messages', 'sent',  page]  as const,
  starred:                       ['messages', 'starred']        as const,
  unread:                        ['messages', 'unread']         as const,
};

export function useInbox(page = 1) {
  return useQuery({
    queryKey: msgKeys.inbox(page),
    queryFn:  () => api.get<any>('/messages/inbox', { page }),
    staleTime: 15_000,
  });
}

export function useSent(page = 1) {
  return useQuery({
    queryKey: msgKeys.sent(page),
    queryFn:  () => api.get<any>('/messages/sent', { page }),
    staleTime: 30_000,
  });
}

export function useStarred() {
  return useQuery({
    queryKey: msgKeys.starred,
    queryFn:  () => api.get<any>('/messages/inbox', { starred: 'true', limit: 50 }),
    staleTime: 30_000,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: msgKeys.unread,
    queryFn:  () => api.get<{ count: number }>('/messages/unread-count'),
    staleTime: 15_000,
    refetchInterval: 60_000,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { toCompanyId: number; subject: string; body: string; type?: string; refId?: string; refType?: string }) =>
      api.post('/messages', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/messages/${id}/read`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messages'] }),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch('/messages/read-all', {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messages'] }),
  });
}

export function useToggleStar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/messages/${id}/star`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messages'] }),
  });
}

export function useReplyMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) =>
      api.post(`/messages/${id}/reply`, { body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messages'] }),
  });
}
