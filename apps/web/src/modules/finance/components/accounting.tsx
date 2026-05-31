'use client';
import { useLocaleStore } from '@/store/locale.store';
export function AccountingPage() {
  const { lang } = useLocaleStore();
  const items = [
    {icon:'📋',label_fa:'سرفصل حساب‌ها',label_en:'Chart of Accounts'},
    {icon:'📓',label_fa:'دفتر روزنامه',label_en:'Journal'},
    {icon:'📊',label_fa:'دفتر کل',label_en:'General Ledger'},
    {icon:'⚖️',label_fa:'تراز آزمایشی',label_en:'Trial Balance'},
    {icon:'📈',label_fa:'سود و زیان',label_en:'P&L Statement'},
    {icon:'🏛️',label_fa:'ترازنامه',label_en:'Balance Sheet'},
  ];
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">📚 {lang==='fa'?'حسابداری':'Accounting'}</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {items.map(i=>(
          <button key={i.icon} className="flex flex-col items-center gap-3 p-5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--muted)/0.4)] transition-all group">
            <span className="text-3xl group-hover:scale-110 transition-transform">{i.icon}</span>
            <span className="text-sm font-semibold text-center">{lang==='fa'?i.label_fa:i.label_en}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
