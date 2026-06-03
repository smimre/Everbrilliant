'use client';
import { useLocaleStore } from '@/store/locale.store';
import { useWIP } from '@/hooks/use-manufacturing';

export function WIPTracking() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const { data: apiData, isLoading } = useWIP();

  const wipGroups: any[] = Array.isArray(apiData) ? apiData : [];

  const totalEstimated = wipGroups.reduce((s, g) => {
    const est = Number(g.workOrder?.estimatedCostIRR) || 0;
    return s + est;
  }, 0);

  const totalActual = wipGroups.reduce((s, g) => {
    const actual = (g.entries ?? []).reduce((es: number, e: any) => es + (Number(e.actualCostIRR) || 0), 0);
    return s + actual;
  }, 0);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">🔄 {fa?'کالای در جریان ساخت (WIP)':'Work In Progress (WIP)'}</h1>

      <div className="grid grid-cols-3 gap-3">
        {[
          { icon:'🔄', val:wipGroups.length, label:fa?'دستور کار فعال':'Active Orders', color:'#3b82f6' },
          { icon:'📊', val:totalEstimated > 0 ? (totalEstimated/1e6).toFixed(0)+'M' : '—', label:fa?'هزینه برآورد شده':'Estimated Cost', color:'#f59e0b' },
          { icon:'💰', val:totalActual > 0 ? (totalActual/1e6).toFixed(0)+'M' : '—', label:fa?'هزینه واقعی تاکنون':'Actual Cost YTD', color:'#10b981' },
        ].map((s,i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4 text-center">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-xl font-bold" style={{color:s.color}}>{s.val}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-[hsl(var(--muted-foreground))] text-sm">{fa?'در حال بارگذاری...':'Loading...'}</div>
      ) : wipGroups.length === 0 ? (
        <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
          <div className="text-4xl mb-3">🔄</div>
          <p className="font-medium">{fa?'کالای در جریان ساخت ثبت نشده':'No WIP entries yet'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {wipGroups.map((group: any, idx: number) => {
            const wo = group.workOrder ?? {};
            const entries: any[] = group.entries ?? [];
            const pct = wo.progress ?? 0;
            const latestEntry = entries[0];

            return (
              <div key={idx} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-[hsl(var(--primary))]">{wo.orderNo ?? '—'}</span>
                      <span className="font-bold text-sm">{fa ? (wo.productNameFa ?? wo.productName) : wo.productName}</span>
                    </div>
                    {latestEntry && (
                      <div className="text-xs text-[hsl(var(--muted-foreground))]">
                        🏭 {fa?'مرحله فعلی:':'Current Stage:'} <span className="font-medium text-amber-600">{latestEntry.stage}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-bold text-2xl text-[hsl(var(--primary))]">{pct}%</div>
                    <div className="text-[hsl(var(--muted-foreground))]">{entries.length} {fa?'رکورد':'entries'}</div>
                  </div>
                </div>

                {/* Physical Progress */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[hsl(var(--muted-foreground))]">{fa?'پیشرفت فیزیکی':'Physical Progress'}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[hsl(var(--muted)/0.5)]">
                    <div className="h-2 rounded-full bg-blue-500" style={{width:pct+'%'}}/>
                  </div>
                </div>

                {/* Latest entries */}
                {entries.slice(0, 3).map((e: any, i: number) => (
                  <div key={i} className="mt-2 text-xs flex items-center justify-between text-[hsl(var(--muted-foreground))] border-t border-[hsl(var(--border)/0.3)] pt-1">
                    <span className="font-medium">{e.stage}</span>
                    <span>{e.completedQty ?? 0} {fa?'واحد تکمیل شده':'completed'}</span>
                    {e.recordedBy && <span>👤 {e.recordedBy.name}</span>}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
