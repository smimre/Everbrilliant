'use client';
import { usePresence } from '@/hooks/realtime/use-presence';
import { useLocaleStore } from '@/store/locale.store';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Users } from 'lucide-react';

const STATUS_COLORS = {
  online: 'bg-[hsl(var(--success))]',
  away:   'bg-[hsl(var(--warning))]',
  busy:   'bg-[hsl(var(--destructive))]',
};

export function PresenceIndicator({ compact = false }: { compact?: boolean }) {
  const { lang } = useLocaleStore();
  const { onlineUsers, onlineCount } = usePresence();

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[hsl(var(--muted)/0.5)]">
        <span className="h-2 w-2 rounded-full bg-[hsl(var(--success))] animate-pulse" />
        <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
          {onlineCount} {lang === 'fa' ? 'آنلاین' : 'online'}
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
      <div className="flex items-center gap-2 mb-3">
        <Users className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
        <h3 className="text-sm font-semibold">{lang === 'fa' ? 'آنلاین' : 'Online Now'}</h3>
        <span className="ms-auto text-xs font-bold text-[hsl(var(--success))]">{onlineCount}</span>
      </div>
      <div className="space-y-2">
        {onlineUsers.slice(0, 8).map(user => (
          <div key={user.userId} className="flex items-center gap-2.5">
            <div className="relative">
              <Avatar name={user.name} size="xs" />
              <span className={cn(
                'absolute -bottom-0.5 -end-0.5 h-2.5 w-2.5 rounded-full border-2 border-[hsl(var(--secondary))]',
                STATUS_COLORS[user.status]
              )} />
            </div>
            <span className="text-xs text-[hsl(var(--foreground))] truncate">{user.name}</span>
            <span className={cn(
              'text-[10px] ms-auto',
              user.status === 'online' ? 'text-[hsl(var(--success))]' :
              user.status === 'away' ? 'text-[hsl(var(--warning))]' : 'text-[hsl(var(--destructive))]'
            )}>
              {lang === 'fa' ?
                { online: 'آنلاین', away: 'غایب', busy: 'مشغول' }[user.status] :
                user.status}
            </span>
          </div>
        ))}
        {onlineUsers.length === 0 && (
          <p className="text-xs text-[hsl(var(--muted-foreground))] text-center py-2">
            {lang === 'fa' ? 'هیچ کاربری آنلاین نیست' : 'No one online'}
          </p>
        )}
      </div>
    </div>
  );
}
