'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useLocaleStore } from '@/store/locale.store';
import { LanguageSelector } from '@/components/layout/language-selector';

export const dynamic = 'force-dynamic';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const { dir, lang } = useLocaleStore();
  const router = useRouter();

  useEffect(() => {
    if (_hasHydrated && isAuthenticated) router.replace('/dashboard');
  }, [_hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [dir, lang]);

  return (
    <div className="min-h-screen flex bg-[hsl(var(--background))]">
      {/* ── Branding panel (hidden on mobile) ───────────────── */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[42%] relative flex-col justify-between p-12 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, hsl(217 91% 14%) 0%, hsl(250 60% 10%) 50%, hsl(217 80% 12%) 100%)',
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, hsl(217 91% 60%) 0%, transparent 70%)' }} />
          <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, hsl(270 80% 60%) 0%, transparent 70%)' }} />
          {/* Grid pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Logo */}
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Everbrilliant</span>
          </div>
        </div>

        {/* Main text */}
        <div className="relative space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              {lang === 'fa' ? 'سامانه جامع' : 'Complete B2B'}<br/>
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {lang === 'fa' ? 'بازرگانی و ERP' : 'Trading & ERP'}
              </span>
            </h2>
            <p className="mt-3 text-blue-200/70 text-sm leading-relaxed max-w-xs">
              {lang === 'fa'
                ? 'مدیریت خرید، فروش، مزایده، حسابداری و تولید در یک پلتفرم'
                : 'Manage procurement, sales, tenders, accounting & manufacturing in one platform'}
            </p>
          </div>

          <div className="space-y-3">
            {[
              { icon: '📦', en: 'Trade Requests & Contracts', fa: 'درخواست خرید و قراردادها' },
              { icon: '💰', en: 'Finance & Accounting', fa: 'مالی و حسابداری' },
              { icon: '🏭', en: 'Manufacturing & Logistics', fa: 'تولید و لجستیک' },
              { icon: '🤝', en: 'B2B Connections', fa: 'شبکه کسب‌وکار' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-sm flex-shrink-0">
                  {f.icon}
                </div>
                <span className="text-white/75 text-sm">{lang === 'fa' ? f.fa : f.en}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative">
          <p className="text-white/30 text-xs">© 2025 Everbrilliant. All rights reserved.</p>
        </div>
      </div>

      {/* ── Form panel ───────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 30% 20%, hsl(217 91% 60% / 0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, hsl(270 60% 50% / 0.04) 0%, transparent 40%)
          `,
        }}
      >
        <div className="w-full max-w-sm">
          <div className="flex justify-end mb-6 lg:hidden">
            <LanguageSelector />
          </div>
          <div className="hidden lg:flex justify-end mb-6">
            <LanguageSelector />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
