'use client';
import { useLocaleStore } from '@/store/locale.store';

interface Props { onNavigate: (view: any) => void; }

export function ManufacturingDashboard({ onNavigate }: Props) {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';

  const stats = [
    { icon: '🏭', val: '0', label: fa?'دستور کار فعال':'Active Work Orders', color: '#3b82f6', view: 'work-orders' },
    { icon: '📋', val: '0', label: fa?'BOM تعریف شده':'Defined BOMs', color: '#8b5cf6', view: 'bom' },
    { icon: '⚠️', val: '0', label: fa?'کمبود مواد':'Material Shortage', color: '#ef4444', view: 'materials' },
    { icon: '✅', val: '0', label: fa?'تکمیل شده امروز':'Completed Today', color: '#10b981', view: 'work-orders' },
    { icon: '🔄', val: '0', label: fa?'در جریان ساخت (WIP)':'In Progress (WIP)', color: '#f59e0b', view: 'wip' },
    { icon: '💰', val: '0', label: fa?'هزینه تولید این ماه':'Production Cost', color: '#06b6d4', view: 'costing' },
  ];

  const quickActions = [
    { icon: '📋', label: fa?'دستور کار جدید':'New Work Order', view: 'work-orders', color: '#3b82f6' },
    { icon: '🧾', label: fa?'BOM جدید':'New BOM', view: 'bom', color: '#8b5cf6' },
    { icon: '📦', label: fa?'رسید مواد':'Material Receipt', view: 'materials', color: '#10b981' },
    { icon: '🔄', label: fa?'شروع تولید':'Start Production', view: 'work-orders', color: '#f59e0b' },
    { icon: '💰', label: fa?'هزینه‌یابی':'Costing', view: 'costing', color: '#06b6d4' },
    { icon: '📊', label: fa?'گزارش تولید':'Production Report', view: 'reports', color: '#ec4899' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">🏭 {fa?'داشبورد تولید':'Manufacturing Dashboard'}</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{fa?'مدیریت فرآیند تولید و هزینه‌یابی':'Production process & cost management'}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s,i) => (
          <button key={i} onClick={() => onNavigate(s.view)}
            className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4 text-start hover:border-[hsl(var(--primary)/0.3)] transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{s.icon}</span>
            </div>
            <div className="text-2xl font-bold" style={{color:s.color}}>{s.val}</div>
            <div className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{s.label}</div>
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
        <h2 className="font-semibold mb-4">⚡ {fa?'دسترسی سریع':'Quick Actions'}</h2>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((a,i) => (
            <button key={i} onClick={() => onNavigate(a.view)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--muted)/0.5)] transition-all group">
              <div className="rounded-xl p-2 text-xl group-hover:scale-110 transition-transform" style={{background:a.color+'18',color:a.color}}>{a.icon}</div>
              <span className="text-xs font-medium text-center leading-tight text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))]">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Production Flow */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
        <h2 className="font-semibold mb-4">🔄 {fa?'فرآیند تولید':'Production Flow'}</h2>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[
            { icon:'📦', label:fa?'انبار مواد':'Raw Materials', color:'#3b82f6' },
            { icon:'→', label:'', color:'#94a3b8' },
            { icon:'🔄', label:fa?'در جریان ساخت':'WIP', color:'#f59e0b' },
            { icon:'→', label:'', color:'#94a3b8' },
            { icon:'✅', label:fa?'کنترل کیفیت':'QC', color:'#8b5cf6' },
            { icon:'→', label:'', color:'#94a3b8' },
            { icon:'🏪', label:fa?'انبار محصول':'Finished Goods', color:'#10b981' },
          ].map((step,i) => (
            <div key={i} className={`flex flex-col items-center gap-1 ${step.label ? 'min-w-[80px]' : 'shrink-0'}`}>
              {step.label ? (
                <>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{background:step.color+'15',color:step.color}}>{step.icon}</div>
                  <span className="text-[10px] text-center text-[hsl(var(--muted-foreground))] leading-tight">{step.label}</span>
                </>
              ) : (
                <span className="text-2xl text-[hsl(var(--muted-foreground))] mt-3">{step.icon}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
