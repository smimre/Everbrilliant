'use client';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { COUNTRIES, getCountryByCode } from '@/lib/countries';
import { useLocaleStore } from '@/store/locale.store';

interface CountrySelectorProps {
  value: string;
  onChange: (code: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function CountrySelector({ value, onChange, label, placeholder, className }: CountrySelectorProps) {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const selected = getCountryByCode(value);

  const filtered = COUNTRIES.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.en.toLowerCase().includes(q) ||
           c.fa.includes(search) ||
           (c.ar && c.ar.includes(search)) ||
           c.code.toLowerCase().includes(q);
  }).slice(0, 60);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const displayName = selected
    ? `${selected.flag} ${(selected as any)[lang] || selected.fa}`
    : (placeholder || (fa ? '— انتخاب کشور —' : '— Select Country —'));

  return (
    <div className={className}>
      {label && (
        <label className="text-xs text-[hsl(var(--muted-foreground))] block mb-1">{label}</label>
      )}
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between px-3 py-2 text-sm bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg hover:border-[hsl(var(--primary)/0.5)] transition-colors outline-none"
        >
          <span className={selected ? '' : 'text-[hsl(var(--muted-foreground))]'}>{displayName}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-[hsl(var(--muted-foreground))] transition-transform ${open ? 'rotate-180' : ''}`}/>
        </button>

        {open && (
          <div className="absolute top-full mt-1 start-0 end-0 z-50 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl shadow-xl overflow-hidden">
            <div className="p-2 border-b border-[hsl(var(--border))]">
              <div className="relative">
                <Search className="absolute start-2.5 top-2 w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]"/>
                <input
                  autoFocus
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={fa ? '🔍 جستجو...' : '🔍 Search...'}
                  className="w-full ps-8 pe-3 py-1.5 text-xs bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg outline-none"
                  onClick={e => e.stopPropagation()}
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-52">
              {filtered.map(c => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => { onChange(c.code); setOpen(false); setSearch(''); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-start hover:bg-[hsl(var(--secondary))] transition-colors ${value === c.code ? 'bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]' : ''}`}
                >
                  <span>{c.flag}</span>
                  <span>{(c as any)[lang] || c.fa}</span>
                  <span className="text-xs text-[hsl(var(--muted-foreground))] ms-auto">{c.code}</span>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="px-3 py-6 text-center text-xs text-[hsl(var(--muted-foreground))]">
                  {fa ? 'کشوری یافت نشد' : 'No country found'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
