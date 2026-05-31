'use client';
import { useEffect, useState, useCallback } from 'react';
import { useSocket } from './use-socket';
import { WS_EVENTS } from '@/lib/socket/socket-client';

interface PresenceUser {
  userId: number;
  name: string;
  status: 'online' | 'away' | 'busy';
}

export function usePresence() {
  const { on, emit } = useSocket();
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    const c1 = on(WS_EVENTS.PRESENCE_LIST, (users: PresenceUser[]) => {
      setOnlineUsers(users);
    });

    const c2 = on(WS_EVENTS.PRESENCE_JOIN, (user: PresenceUser) => {
      setOnlineUsers(prev => {
        const exists = prev.find(u => u.userId === user.userId);
        if (exists) return prev.map(u => u.userId === user.userId ? { ...u, status: user.status } : u);
        return [...prev, user];
      });
    });

    const c3 = on(WS_EVENTS.PRESENCE_LEAVE, (data: { userId: number }) => {
      setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId));
    });

    return () => { c1(); c2(); c3(); };
  }, [on]);

  const setPage = useCallback((page: string) => {
    emit(WS_EVENTS.MARK_ONLINE, { page, status: 'online' });
  }, [emit]);

  const setStatus = useCallback((status: 'online' | 'away' | 'busy') => {
    emit(WS_EVENTS.MARK_ONLINE, { status });
  }, [emit]);

  return { onlineUsers, onlineCount: onlineUsers.length, setPage, setStatus };
}
