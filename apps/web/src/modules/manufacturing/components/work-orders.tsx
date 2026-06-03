'use client';
import { useState, useRef } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useWorkOrders, useCreateWorkOrder, useUpdateWorkOrder } from '@/hooks/use-manufacturing';
import { useUIStore } from '@/store';

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
  status: string;
  priority: string;
  progress: number;
  notes?: string;
  workcenter?: string;
}

function normalizeStatus(s: string): string {
  return (s ?? 'PLANNED').toUpperCase().replace(' ', '_');
}

function statusKey(s: string): string {
  const norm = normalizeStatus(s);
  const map: Record<string, string> = {
    PLANNED: 'planned',
    IN_PROGRESS: 'in-progress',
    PAUSED: 'paused',
    QC: 'qc',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  };
  return map[norm] ?? 'planned';
}

export function WorkOrders() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const { data: apiData, isLoading } = useWorkOrders();
  const orders: WorkOrder[] = ((apiData as any)?.data ?? []).map((o: any) => ({
    id: String(o.id),
    no: o.orderNo ?? 'WO-???',
    productName: o.productName ?? '',
    productNameFa: o.productNameFa ?? o.productName ?? '',
    bomCode: o.bom?.code ?? '',
    qty: o.qty ?? 0,
    unit: o.unit ?? 'Pcs',
    startDate: o.startDate ? o.startDate.slice(0, 10) : '',
    dueDate: o.dueDate ? o.dueDate.slice(0, 10) : '',
    status: statusKey(o.status),
    priority: (o.priority ?? 'NORMAL').toLowerCase(),
    progress: o.progress ?? 0,
    notes: o.notes,
    workcenter: o.workcenter,
  }));

  const [selected, setSelected] = useState<WorkOrder | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [filter, setFilter] = useState('all');
  const progressRef = useRef<HTMLInputElement>(null);
  const createWO = useCreateWorkOrder();
  const updateWO = useUpdateWorkOrder();

  const statusConfig: Record<string, { label: string; labelFa: string; color: string; icon: string }> = {
    planned:      { label:'Planned',     labelFa:'برنامه‌ریزی شده', color:'#64748b', icon:'📋' },
    'in-progress':{ label:'In Progress', labelFa:'در حال تولید',   color:'#3b82f6', icon:'🔄' },
    paused:       { label:'Paused',      labelFa:'متوقف شده',      color:'#f59e0b', icon:'⏸️' },
    qc:           { label:'QC Check',    labelFa:'کنترل کیفیت',    color:'#8b5cf6', icon:'🔍' },
    completed:    { label:'Completed',   labelFa:'تکمیل شده',      color:'#10b981', icon:'✅' },
    cancelled:    { label:'Cancelled',   labelFa:'لغو شده',        color:'#ef4444', icon:'❌' },
  };

  const priorityConfig: Record<string, { label: string; labelFa: string; color: string }> = {
    low:    { label:'Low',    labelFa:'پایین', color:'#64748b' },
    normal: { label:'Normal', labelFa:'عادی',  color:'#3b82f6' },
    high:   { label:'High',   labelFa:'بالا',  color:'#f59e0b' },
    urgent: { label:'Urgent', labelFa:'فوری',  color:'#ef4444' },
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
      {isLoading ? (
        <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
          <div className="text-4xl mb-3">⏳</div>
          <p className="text-sm">{fa?'در حال بارگذاری...':'Loading...'}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
          <div className="text-4xl mb-3">🏭</div>
          <p className="font-medium">{fa?'دستور کاری وجود ندارد':'No work orders'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(wo => {
            const sc = statusConfig[wo.status] ?? statusConfig.planned;
            const pc = priorityConfig[wo.priority] ?? priorityConfig.normal;
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
                      {wo.bomCode && <span>📋 {wo.bomCode}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-[hsl(var(--muted)/0.5)]">
                        <div className="h-2 rounded-full transition-all" style={{width:wo.progress+'%',background:sc.color}}/>
                      </div>
                      <span className="text-xs font-bold" style={{color:sc.color}}>{wo.progress}%</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    {wo.status === 'planned' && (
                      <button className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-medium"
                        onClick={e => { e.stopPropagation(); updateWO.mutate({ id: wo.id, dto: { status: 'IN_PROGRESS' } }); }}>
                        ▶️ {fa?'شروع':'Start'}
                      </button>
                    )}
                    {wo.status === 'in-progress' && (
                      <button className="px-3 py-1.5 rounded-lg bg-purple-500 text-white text-xs font-medium"
                        onClick={e => { e.stopPropagation(); updateWO.mutate({ id: wo.id, dto: { status: 'QC' } }); }}>
                        🔍 {fa?'ارسال به QC':'Send to QC'}
                      </button>
                    )}
                    {wo.status === 'qc' && (
                      <button className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-medium"
                        onClick={e => { e.stopPropagation(); updateWO.mutate({ id: wo.id, dto: { status: 'COMPLETED', progress: 100 } }); }}>
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
                [fa?'تاریخ شروع':'Start Date', selected.startDate || '—'],
                [fa?'تاریخ تحویل':'Due Date', selected.dueDate],
                [fa?'مرکز کار':'Work Center', selected.workcenter || '—'],
                [fa?'BOM':'BOM', selected.bomCode || '—'],
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
                    <div className="h-3 rounded-full" style={{width:selected.progress+'%',background:(statusConfig[selected.status]??statusConfig.planned).color}}/>
                  </div>
                  <span className="font-bold text-base">{selected.progress}%</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'بروزرسانی پیشرفت (%)':'Update Progress (%)'}</label>
                <div className="flex gap-2">
                  <input ref={progressRef} type="number" min={0} max={100} defaultValue={selected.progress} className={inp} />
                  <button
                    onClick={() => {
                      const p = Number(progressRef.current?.value ?? selected.progress);
                      updateWO.mutate({ id: selected.id, dto: { progress: p } });
                      setSelected(prev => prev ? { ...prev, progress: p } : null);
                    }}
                    className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm shrink-0">
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
        <NewWOModal fa={fa} inp={inp} onClose={() => setShowNew(false)}
          onSubmit={dto => {
            createWO.mutate(dto);
            setShowNew(false);
          }}
        />
      )}
    </div>
  );
}

function NewWOModal({ fa, inp, onClose, onSubmit }: { fa: boolean; inp: string; onClose: () => void; onSubmit: (dto: any) => void }) {
  const { toast } = useUIStore();
  const [form, setForm] = useState({ productName:'', bomCode:'', qty:'', unit:'Pcs', startDate:'', dueDate:'', priority:'normal', workcenter:'', notes:'' });
  const set = (k: string, v: string) => setForm(f => ({...f, [k]: v}));
  function submit() {
    if (!form.productName || !form.qty || !form.dueDate) { toast('error', fa?'فیلدهای الزامی را پر کنید':'Fill required fields'); return; }
    onSubmit({ ...form, qty: parseInt(form.qty) });
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-lg p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg">🏭 {fa?'دستور کار جدید':'New Work Order'}</h2>
          <button onClick={onClose} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
        </div>
        <div className="space-y-3">
          <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'نام محصول *':'Product Name *'}</label>
            <input value={form.productName} onChange={e=>set('productName',e.target.value)} className={inp} placeholder={fa?'مثال: قاب فولادی نوع الف':'e.g. Steel Frame A'}/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'مقدار *':'Quantity *'}</label>
              <input type="number" value={form.qty} onChange={e=>set('qty',e.target.value)} className={inp}/></div>
            <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'واحد':'Unit'}</label>
              <select value={form.unit} onChange={e=>set('unit',e.target.value)} className={inp}>
                {['Pcs','Kg','m','Set','Box'].map(u=><option key={u}>{u}</option>)}
              </select></div>
            <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'اولویت':'Priority'}</label>
              <select value={form.priority} onChange={e=>set('priority',e.target.value)} className={inp}>
                <option value="normal">{fa?'عادی':'Normal'}</option>
                <option value="high">{fa?'بالا':'High'}</option>
                <option value="urgent">{fa?'فوری':'Urgent'}</option>
                <option value="low">{fa?'پایین':'Low'}</option>
              </select></div>
            <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'BOM (اختیاری)':'BOM (optional)'}</label>
              <input value={form.bomCode} onChange={e=>set('bomCode',e.target.value)} className={inp} placeholder="BOM-001"/></div>
            <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'تاریخ شروع':'Start Date'}</label>
              <input type="date" value={form.startDate} onChange={e=>set('startDate',e.target.value)} className={inp}/></div>
            <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'تاریخ تحویل *':'Due Date *'}</label>
              <input type="date" value={form.dueDate} onChange={e=>set('dueDate',e.target.value)} className={inp}/></div>
          </div>
          <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'مرکز کار':'Work Center'}</label>
            <input value={form.workcenter} onChange={e=>set('workcenter',e.target.value)} className={inp} placeholder={fa?'مثال: خط تولید ۱':'e.g. Line 1'}/></div>
          <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'توضیحات':'Notes'}</label>
            <textarea value={form.notes} onChange={e=>set('notes',e.target.value)} rows={2} className={inp+' resize-none'}/></div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa?'انصراف':'Cancel'}</button>
          <button onClick={submit} className="flex-1 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">✅ {fa?'صدور دستور کار':'Issue Work Order'}</button>
        </div>
      </div>
    </div>
  );
}
