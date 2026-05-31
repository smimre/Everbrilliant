import { api } from '@/lib/api-client';
import type { AppNotification, PaginatedResponse } from '@/types';

export const notificationService = {
  getAll: (page = 1, limit = 20) =>
    api.get<PaginatedResponse<AppNotification>>('/notifications', { page, limit }),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
  getUnreadCount: () => api.get<{ count: number }>('/notifications/unread-count'),
};
