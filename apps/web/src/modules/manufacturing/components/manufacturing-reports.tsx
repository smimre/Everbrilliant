'use client';
import { useLocaleStore } from '@/store/locale.store';

export function ManufacturingReports() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';

  const reports = [
    { icon:'🏭', title:fa?'گزارش تولید':'Production Report', desc:fa?'خلاصه دستورات کار و پیشرفت':'Work Orders Summary & Progress', color:'#3b82f6' },
    { icon:'💰', title:fa?'هزینه‌یابی':'Cost Analysis', desc:fa?'بهای تمام‌شده محصولات':'Product Cost Analysis', color:'#10b981' },
    { icon:'🔄', title:fa?'گزارش WIP':'WIP Report', desc:fa?'کالای در جریان ساخت':'Work In Progress', color:'#f59e0b' },
    { icon:'⚠️', title:fa?'نیاز به مواد':'Material Requirements', desc:fa?'برنامه‌ریزی مواد مورد نیاز (MRP)':'Material Requirements Planning', color:'#8b5cf6' },
    { icon:'🔍', title:fa?'کنترل کیفیت':'QC Report', desc:fa?'نرخ قبولی و رد محصولات':'Pass/Fail Rates', color:'#06b6d4' },
    { icon:'📊', title:fa?'بهره‌وری خط':'Line Efficiency', desc:fa?'کارایی ماشین‌آلات و نیروی کار':'Machine & Labor Efficiency', color:'#ec4899' },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">📊 {fa?'گزارشات تولید':'Manufacturing Reports'}</h1>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((r,i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4 cursor-pointer hover:border-[hsl(var(--primary)/0.3)] hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform" style={{background:r.color+'15',color:r.color}}>{r.icon}</div>
            <div className="font-semibold text-sm mb-1">{r.title}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mb-3">{r.desc}</div>
            <div className="flex gap-2">
              <button className="text-xs font-medium hover:underline" style={{color:r.color}}>{fa?'مشاهده →':'View →'}</button>
              <button className="text-xs px-2 py-1 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.5)]">📥 Excel</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
