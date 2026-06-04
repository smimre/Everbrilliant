'use client';
import { useState, useRef, useEffect } from 'react';
import { useNotificationStore } from '@/store/notification.store';
import { useLocaleStore } from '@/store/locale.store';
import { useUnreadCount } from '@/hooks/use-messaging';
import { Bell, CheckCheck, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function NotificationBell() {
  const lang = useLocaleStore((s) => s.lang);
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const { data: msgUnread } = useUnreadCount();
  const msgCount = (msgUnread as any)?.count ?? 0;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const totalUnread = unreadCount + msgCount;

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
      >
        <Bell className="h-5 w-5" />
        {totalUnread > 0 && (
          <span className="absolute top-1 end-1 h-4 w-4 rounded-full bg-[hsl(var(--destructive))] text-white text-[9px] font-bold flex items-center justify-center">
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute end-0 top-full mt-2 w-80 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border))]">
            <h3 className="font-semibold text-sm">{lang === 'fa' ? 'اعلان‌ها' : 'Notifications'}</h3>
            <div className="flex items-center gap-2">
              {msgCount > 0 && (
                <Link href="/inbox" onClick={() => setOpen(false)}
                  className="text-xs text-[hsl(var(--primary))] hover:underline flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {msgCount} {lang === 'fa' ? 'پیام جدید' : 'new msg'}
                </Link>
              )}
              {unreadCount > 0 && (
                <button onClick={() => markAllAsRead()}
                  className="text-xs text-[hsl(var(--primary))] hover:underline flex items-center gap-1"
                >
                  <CheckCheck className="h-3 w-3" />
                  {lang === 'fa' ? 'همه خوانده شد' : 'Mark all read'}
                </button>
              )}
            </div>
          </div>
          <div className="overflow-y-auto max-h-80 divide-y divide-[hsl(var(--border))]">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-[hsl(var(--muted-foreground))] text-sm">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                {lang === 'fa' ? 'هیچ اعلانی ندارید' : 'No notifications'}
              </div>
            ) : notifications.slice(0, 10).map((n) => (
              <div key={n.id}
                className={cn(
                  'flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-[hsl(var(--muted)/0.5)]',
                  !n.isRead && 'bg-[hsl(var(--primary)/0.04)]'
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm truncate', !n.isRead && 'font-semibold')}>{n.title}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{n.message}</p>
                </div>
                {!n.isRead && <span className="h-2 w-2 rounded-full bg-[hsl(var(--primary))] shrink-0 mt-1.5" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
