'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';

interface WorkOrder {
  id: string;
  no: string;
  productName: string;
  productNameFa: string;
  bomCode: string;
  qty: number;
  unit: string;
  startDate: string;
  dueDate: string;
  status: 'planned' | 'in-progress' | 'paused' | 'qc' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  progress: number; // درصد پیشرفت
  notes?: string;
  workcenter?: string;
}

const SAMPLE_WO: WorkOrder[] = [
  { id:'1', no:'WO-1403-001', productName:'Steel Frame Type A', productNameFa:'قاب فولادی نوع الف', bomCode:'BOM-001', qty:50, unit:'Pcs', startDate:'1403/06/01', dueDate:'1403/06/15', status:'in-progress', priority:'high', progress:65, workcenter:'خط تولید ۱' },
  { id:'2', no:'WO-1403-002', productName:'Steel Frame Type B', productNameFa:'قاب فولادی نوع ب', bomCode:'BOM-001', qty:30, unit:'Pcs', startDate:'1403/06/10', dueDate:'1403/06/25', status:'planned', priority:'normal', progress:0, workcenter:'خط تولید ۲' },
];

export function WorkOrders() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const [orders, setOrders] = useState<WorkOrder[]>(SAMPLE_WO);
  const [selected, setSelected] = useState<WorkOrder|null>(null);
  const [showNew, setShowNew] = useState(false);
  const [filter, setFilter] = useState('all');

  const statusConfig: Record<string,{label:string;labelFa:string;color:string;icon:string}> = {
    planned:     {label:'Planned',    labelFa:'برنامه‌ریزی شده', color:'#64748b', icon:'📋'},
    'in-progress':{label:'In Progress',labelFa:'در حال تولید',  color:'#3b82f6', icon:'🔄'},
    paused:      {label:'Paused',     labelFa:'متوقف شده',      color:'#f59e0b', icon:'⏸️'},
    qc:          {label:'QC Check',   labelFa:'کنترل کیفیت',    color:'#8b5cf6', icon:'🔍'},
    completed:   {label:'Completed',  labelFa:'تکمیل شده',      color:'#10b981', icon:'✅'},
    cancelled:   {label:'Cancelled',  labelFa:'لغو شده',        color:'#ef4444', icon:'❌'},
  };

  const priorityConfig: Record<string,{label:string;labelFa:string;color:string}> = {
    low:    {label:'Low',    labelFa:'پایین',  color:'#64748b'},
    normal: {label:'Normal', labelFa:'عادی',   color:'#3b82f6'},
    high:   {label:'High',   labelFa:'بالا',   color:'#f59e0b'},
    urgent: {label:'Urgent', labelFa:'فوری',   color:'#ef4444'},
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const inp = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">🏭 {fa?'دستورات کار':'Work Orders'}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{orders.length} {fa?'دستور کار':'work orders'}</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">
          ➕ {fa?'دستور کار جدید':'New Work Order'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
        {Object.entries(statusConfig).map(([s, cfg]) => (
          <button key={s} onClick={() => setFilter(filter === s ? 'all' : s)}
            className={`rounded-xl border p-2 text-center transition-all ${filter === s ? 'ring-2 ring-[hsl(var(--primary))]' : 'hover:border-[hsl(var(--primary)/0.3)]'} border-[hsl(var(--border))] bg-[hsl(var(--secondary))]`}>
            <div className="text-lg mb-0.5">{cfg.icon}</div>
            <div className="text-sm font-bold" style={{color:cfg.color}}>{orders.filter(o=>o.status===s).length}</div>
            <div className="text-[10px] text-[hsl(var(--muted-foreground))] leading-tight">{fa?cfg.labelFa:cfg.label}</div>
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
          <div className="text-4xl mb-3">🏭</div>
          <p className="font-medium">{fa?'دستور کاری وجود ندارد':'No work orders'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(wo => {
            const sc = statusConfig[wo.status];
            const pc = priorityConfig[wo.priority];
            return (
              <div key={wo.id} onClick={() => setSelected(wo)}
                className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4 cursor-pointer hover:border-[hsl(var(--primary)/0.3)] transition-colors"
                style={{borderRight:`4px solid ${sc.color}`}}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-mono text-xs font-bold">{wo.no}</span>
                      <span className="font-bold text-sm">{fa?wo.productNameFa:wo.productName}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{background:sc.color+'20',color:sc.color}}>{sc.icon} {fa?sc.labelFa:sc.label}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{background:pc.color+'20',color:pc.color}}>{fa?pc.labelFa:pc.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-[hsl(var(--muted-foreground))] mb-2">
                      <span>📦 {wo.qty} {wo.unit}</span>
                      <span>📅 {wo.startDate} → {wo.dueDate}</span>
                      {wo.workcenter && <span>🏭 {wo.workcenter}</span>}
                      <span>📋 {wo.bomCode}</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-[hsl(var(--muted)/0.5)]">
                        <div className="h-2 rounded-full transition-all" style={{width:wo.progress+'%',background:sc.color}}/>
                      </div>
                      <span className="text-xs font-bold" style={{color:sc.color}}>{wo.progress}%</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    {wo.status === 'planned' && (
                      <button className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-medium" onClick={e=>{e.stopPropagation();}}>
                        ▶️ {fa?'شروع':'Start'}
                      </button>
                    )}
                    {wo.status === 'in-progress' && (
                      <button className="px-3 py-1.5 rounded-lg bg-purple-500 text-white text-xs font-medium" onClick={e=>{e.stopPropagation();}}>
                        🔍 {fa?'ارسال به QC':'Send to QC'}
                      </button>
                    )}
                    {wo.status === 'qc' && (
                      <button className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-medium" onClick={e=>{e.stopPropagation();}}>
                        ✅ {fa?'تأیید QC':'Approve QC'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Work Order Detail */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold">{selected.no}</h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{fa?selected.productNameFa:selected.productName}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                [fa?'مقدار':'Quantity', `${selected.qty} ${selected.unit}`],
                [fa?'تاریخ شروع':'Start Date', selected.startDate],
                [fa?'تاریخ تحویل':'Due Date', selected.dueDate],
                [fa?'مرکز کار':'Work Center', selected.workcenter || '—'],
                [fa?'BOM':'BOM', selected.bomCode],
              ].map(([k,v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-[hsl(var(--border)/0.5)]">
                  <span className="text-[hsl(var(--muted-foreground))]">{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
              <div>
                <div className="text-[hsl(var(--muted-foreground))] mb-2">{fa?'پیشرفت تولید':'Production Progress'}</div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 rounded-full bg-[hsl(var(--muted)/0.5)]">
                    <div className="h-3 rounded-full" style={{width:selected.progress+'%',background:statusConfig[selected.status].color}}/>
                  </div>
                  <span className="font-bold text-base">{selected.progress}%</span>
                </div>
              </div>
              {/* Update Progress */}
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'بروزرسانی پیشرفت (%)':'Update Progress (%)'}</label>
                <div className="flex gap-2">
                  <input type="number" min={0} max={100} defaultValue={selected.progress} className={inp} />
                  <button className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm shrink-0">
                    {fa?'ذخیره':'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New WO Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg">🏭 {fa?'دستور کار جدید':'New Work Order'}</h2>
              <button onClick={() => setShowNew(false)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'انتخاب BOM (محصول) *':'Select BOM (Product) *'}</label>
                <select className={inp}><option value="">-- {fa?'انتخاب BOM':'Select BOM'} --</option></select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'مقدار *':'Quantity *'}</label><input type="number" className={inp} /></div>
                <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'اولویت':'Priority'}</label>
                  <select className={inp}>
                    <option value="normal">{fa?'عادی':'Normal'}</option>
                    <option value="high">{fa?'بالا':'High'}</option>
                    <option value="urgent">{fa?'فوری':'Urgent'}</option>
                    <option value="low">{fa?'پایین':'Low'}</option>
                  </select>
                </div>
                <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'تاریخ شروع':'Start Date'}</label><input className={inp} placeholder="1403/06/15" /></div>
                <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'تاریخ تحویل *':'Due Date *'}</label><input className={inp} placeholder="1403/06/30" /></div>
              </div>
              <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'مرکز کار / خط تولید':'Work Center / Production Line'}</label><input className={inp} placeholder={fa?'مثال: خط تولید ۱':'e.g. Line 1'} /></div>
              <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'توضیحات':'Notes'}</label><textarea rows={2} className={inp+" resize-none"} /></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowNew(false)} className="flex-1 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa?'انصراف':'Cancel'}</button>
              <button className="flex-1 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">✅ {fa?'صدور دستور کار':'Issue Work Order'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
