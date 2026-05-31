import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { AppNotification } from '@/types';

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  hasMore: boolean;
  page: number;
}

interface NotificationActions {
  setNotifications: (notifications: AppNotification[]) => void;
  appendNotifications: (notifications: AppNotification[]) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  addRealtime: (notification: AppNotification) => void;
  setLoading: (loading: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
  incrementPage: () => void;
  reset: () => void;
}

const INITIAL: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  hasMore: false,
  page: 1,
};

export const useNotificationStore = create<NotificationState & NotificationActions>()(
  immer((set) => ({
    ...INITIAL,

    setNotifications: (notifications) => set((s) => {
      s.notifications = notifications;
      s.unreadCount = notifications.filter((n) => !n.isRead).length;
    }),

    appendNotifications: (notifications) => set((s) => {
      const newIds = new Set(notifications.map((n) => n.id));
      const existing = s.notifications.filter((n) => !newIds.has(n.id));
      s.notifications = [...existing, ...notifications];
      s.unreadCount = s.notifications.filter((n) => !n.isRead).length;
    }),

    markAsRead: (id) => set((s) => {
      const n = s.notifications.find((n) => n.id === id);
      if (n && !n.isRead) {
        n.isRead = true;
        s.unreadCount = Math.max(0, s.unreadCount - 1);
      }
    }),

    markAllAsRead: () => set((s) => {
      s.notifications.forEach((n) => { n.isRead = true; });
      s.unreadCount = 0;
    }),

    removeNotification: (id) => set((s) => {
      const n = s.notifications.find((n) => n.id === id);
      if (n && !n.isRead) s.unreadCount = Math.max(0, s.unreadCount - 1);
      s.notifications = s.notifications.filter((n) => n.id !== id);
    }),

    addRealtime: (notification) => set((s) => {
      s.notifications.unshift(notification);
      if (!notification.isRead) s.unreadCount++;
    }),

    setLoading: (isLoading) => set((s) => { s.isLoading = isLoading; }),
    setHasMore: (hasMore) => set((s) => { s.hasMore = hasMore; }),
    incrementPage: () => set((s) => { s.page++; }),
    reset: () => set((s) => { Object.assign(s, INITIAL); }),
  }))
);
