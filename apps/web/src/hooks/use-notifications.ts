import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services';
import { useNotificationStore } from '@/store';
import { useEffect } from 'react';

const notifKeys = {
  all: ['notifications'] as const,
  list: (page: number) => [...notifKeys.all, 'list', page] as const,
  count: [...notifKeys.all, 'count'] as const,
};

export function useNotifications(page = 1) {
  const { setNotifications, appendNotifications } = useNotificationStore();
  const query = useQuery({
    queryKey: notifKeys.list(page),
    queryFn: () => notificationService.getAll(page),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (query.data) {
      if (page === 1) setNotifications(query.data.data);
      else appendNotifications(query.data.data);
    }
  }, [query.data, page, setNotifications, appendNotifications]);

  return query;
}

export function useUnreadCount() {
  const { setNotifications } = useNotificationStore();
  return useQuery({
    queryKey: notifKeys.count,
    queryFn: notificationService.getUnreadCount,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  const { markAsRead } = useNotificationStore();
  return useMutation({
    mutationFn: notificationService.markRead,
    onSuccess: (_, id) => {
      markAsRead(id);
      qc.invalidateQueries({ queryKey: notifKeys.count });
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  const { markAllAsRead } = useNotificationStore();
  return useMutation({
    mutationFn: notificationService.markAllRead,
    onSuccess: () => {
      markAllAsRead();
      qc.invalidateQueries({ queryKey: notifKeys.count });
    },
  });
}
