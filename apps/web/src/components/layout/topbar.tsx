'use client';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { useLocaleStore } from '@/store/locale.store';
import { NotificationBell } from '@/components/realtime/notification-bell';
import { LanguageSelector } from './language-selector';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Menu, Sun, Moon } from 'lucide-react';

type Module = 'trading' | 'finance' | 'automation' | 'crm';

const MODULE_ITEMS: { id: Module; label_fa: string; label_en: string; icon: string; href: string }[] = [
  { id: 'trading',    label_fa: 'بازرگانی',   label_en: 'Trading',    icon: '🏪', href: '/trading' },
  { id: 'finance',    label_fa: 'مالی',        label_en: 'Finance',    icon: '💰', href: '/finance' },
  { id: 'manufacturing', label_fa: 'تولید', label_en: 'Manufacturing', icon: '🏭', href: '/manufacturing' },
  { id: 'automation', label_fa: 'اتوماسیون',  label_en: 'Automation', icon: '⚙️', href: '/automation' },
  { id: 'crm',        label_fa: 'مشتریان',    label_en: 'CRM',        icon: '🏢', href: '/crm' },
];

export function Topbar() {
  const { toggleSidebar, sidebarOpen, activeModule, setActiveModule, theme, toggleTheme } = useUIStore();
  const { user } = useAuthStore();
  const { lang } = useLocaleStore();
  const router = useRouter();

  const handleModuleSwitch = (mod: Module, href: string) => {
    setActiveModule(mod);
    router.push(href);
  };

  return (
    <header className="h-14 shrink-0 border-b border-[hsl(var(--border))] bg-[hsl(var(--secondary))] flex items-center px-4 gap-3 z-20">
      {/* Hamburger */}
      <button onClick={toggleSidebar}
        className="p-2 rounded-lg text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-colors">
        <Menu className="h-5 w-5" />
      </button>

      {/* Logo */}
      <button onClick={() => router.push('/dashboard')}
        className="font-bold text-lg text-[hsl(var(--primary))] hover:opacity-80 transition-opacity shrink-0">
        EB
      </button>

      {/* Module Tabs */}
      <div className="flex items-center gap-1 flex-1 overflow-x-auto">
        {MODULE_ITEMS.map(mod => (
          <button key={mod.id}
            onClick={() => handleModuleSwitch(mod.id, mod.href)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
              activeModule === mod.id
                ? 'bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))]'
                : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted)/0.5)]'
            )}>
            <span>{mod.icon}</span>
            <span className="hidden sm:inline">{lang === 'fa' ? mod.label_fa : mod.label_en}</span>
          </button>
        ))}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Theme toggle */}
        <button onClick={toggleTheme}
          className="p-2 rounded-lg text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-colors">
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <LanguageSelector />
        <NotificationBell />

        {user && (
          <button onClick={() => router.push('/dashboard/settings')}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[hsl(var(--muted)/0.5)] transition-colors">
            <Avatar name={user.name} size="xs" />
            <span className="text-sm font-medium hidden md:inline truncate max-w-24">{user.name}</span>
          </button>
        )}
      </div>
    </header>
  );
}
