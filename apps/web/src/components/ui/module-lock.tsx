'use client';
import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocaleStore } from '@/store/locale.store';

interface ModuleLockProps {
  moduleName: string;
  moduleNameFa: string;
}

export function ModuleLock({ moduleName, moduleNameFa }: ModuleLockProps) {
  const router = useRouter();
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
      <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--muted)/0.5)] flex items-center justify-center mb-4">
        <Lock className="w-8 h-8 text-[hsl(var(--muted-foreground))]" />
      </div>
      <h2 className="text-xl font-bold mb-2">
        {fa ? `ماژول ${moduleNameFa} قفل است` : `${moduleName} Module Locked`}
      </h2>
      <p className="text-[hsl(var(--muted-foreground))] text-sm max-w-xs mb-6">
        {fa
          ? 'این ماژول برای پلن رایگان در دسترس نیست. برای فعال‌سازی، اشتراک تهیه کنید.'
          : 'This module is not available on the free plan. Upgrade to unlock full access.'}
      </p>
      <button
        onClick={() => router.push('/settings/pricing')}
        className="px-6 py-2.5 rounded-xl bg-[hsl(var(--primary))] text-white font-medium text-sm hover:opacity-90 transition-opacity"
      >
        {fa ? '🚀 مشاهده پلن‌ها' : '🚀 View Plans'}
      </button>
      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-4">
        {fa ? 'دسترسی رایگان: مناقصه، اتصالات، بلک‌لیست' : 'Free access: Tenders, Connections, Blacklist'}
      </p>
    </div>
  );
}
