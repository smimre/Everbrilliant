'use client';
import { useState, useRef, useEffect } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const LANGUAGES = [
  { code: 'en' as const, dir: 'ltr' as const, flag: '🇬🇧', label: 'English' },
  { code: 'fa' as const, dir: 'rtl' as const, flag: '🇮🇷', label: 'فارسی' },
  { code: 'ar' as const, dir: 'rtl' as const, flag: '🇸🇦', label: 'العربية' },
  { code: 'hi' as const, dir: 'ltr' as const, flag: '🇮🇳', label: 'हिन्दी' },
];

export function LanguageSelector() {
  const { lang, setLocale } = useLocaleStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
      >
        <span>{current.flag}</span>
        <span>{current.label}</span>
        <ChevronDown className={cn('h-3.5 w-3.5 text-[hsl(var(--muted-foreground))] transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute end-0 top-full mt-1.5 w-40 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] shadow-[var(--shadow-lg)] overflow-hidden z-50 animate-in">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLocale(l.code); setOpen(false); }}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[hsl(var(--muted))] transition-colors',
                lang === l.code ? 'text-[hsl(var(--primary))] font-semibold' : 'text-[hsl(var(--foreground))]'
              )}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
              {lang === l.code && <span className="ms-auto text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
