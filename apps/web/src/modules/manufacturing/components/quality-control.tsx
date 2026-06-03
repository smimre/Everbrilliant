'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useQualityChecks, useCreateQCInspection, useWorkOrders } from '@/hooks/use-manufacturing';

interface Inspection {
  id: string; wo: string; woId: string; product: string; inspector: string;
  date: string; qty: number; passed: number; failed: number; result: string;
  defects: string[];
}

function mapInspection(o: any): Inspection {
  return {
    id: String(o.id),
    wo: o.workOrder?.orderNo ?? '—',
    woId: o.workOrderId ?? '',
    product: o.workOrder?.productName ?? '',
    inspector: o.inspectedBy?.name ?? '—',
    date: o.inspectedAt ? o.inspectedAt.slice(0, 10) : '',
    qty: Number(o.inspectedQty) || 0,
    passed: Number(o.passedQty) || 0,
    failed: Number(o.failedQty) || 0,
    result: (o.result ?? 'PENDING').toUpperCase(),
    defects: o.defectCodes ? (Array.isArray(o.defectCodes) ? o.defectCodes : String(o.defectCodes).split(',').map((s: string) => s.trim()).filter(Boolean)) : [],
  };
}

const inp = 'w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none';

export function QualityControl() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const { data: qcData, isLoading } = useQualityChecks();
  const { data: woData } = useWorkOrders();
  const createQC = useCreateQCInspection();
  const inspections: Inspection[] = ((qcData as any)?.data ?? []).map(mapInspection);
  const workOrders: any[] = ((woData as any)?.data ?? []);

  const [showNew, setShowNew]   = useState(false);
  const [selected, setSelected] = useState<Inspection | null>(null);
  const [form, setForm]         = useState({ workOrderId:'', qty:'', passed:'', defects:'' });

  const completed = inspections.filter(i => i.result !== 'PENDING');
  const totalQty    = completed.reduce((s, i) => s + i.qty, 0);
  const totalPassed = completed.reduce((s, i) => s + i.passed, 0);
  const totalFailed = completed.reduce((s, i) => s + i.failed, 0);
  const passRate    = totalQty ? Math.round(totalPassed / totalQty * 100) : 0;

  function submitInspection() {
    if (!form.workOrderId || !form.qty || !form.passed) {
      alert(fa?'فیلدهای الزامی را پر کنید':'Fill required fields'); return;
    }
    const qty = parseInt(form.qty);
    const passed = parseInt(form.passed);
    const failed = qty - passed;
    const defectCodes = form.defects ? form.defects.split(/[,،]/).map(s => s.trim()).filter(Boolean) : [];
    createQC.mutate({
      workOrderId: form.workOrderId,
      dto: {
        inspectedQty: qty,
        passedQty: passed,
        failedQty: failed,
        result: failed === 0 ? 'PASSED' : passed === 0 ? 'FAILED' : 'PARTIAL',
        defectCodes: defectCodes.length ? defectCodes : undefined,
      },
    });
    setForm({ workOrderId:'', qty:'', passed:'', defects:'' });
    setShowNew(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">🔍 {fa?'کنترل کیفیت':'Quality Control'}</h1>
        <button onClick={()=>setShowNew(true)}
          className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">
          ➕ {fa?'بازرسی جدید':'New Inspection'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon:'🔍', val:inspections.length, label:fa?'کل بازرسی‌ها':'Total Inspections', color:'#3b82f6' },
          { icon:'✅', val:totalPassed,         label:fa?'تأیید شده':'Passed',               color:'#10b981' },
          { icon:'❌', val:totalFailed,         label:fa?'رد شده':'Failed',                  color:'#ef4444' },
          { icon:'📊', val:passRate+'%',        label:fa?'نرخ قبولی':'Pass Rate',            color:'#8b5cf6' },
        ].map((s,i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-3 text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-xl font-bold" style={{color:s.color}}>{s.val}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Pass rate bar */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="font-semibold">{fa?'نرخ قبولی کلی':'Overall Pass Rate'}</span>
          <span className="font-bold text-lg" style={{color:passRate>=95?'#10b981':passRate>=85?'#f59e0b':'#ef4444'}}>{passRate}%</span>
        </div>
        <div className="flex h-4 rounded-full overflow-hidden">
          <div className="bg-green-500 transition-all" style={{width:`${passRate}%`}}/>
          <div className="bg-red-400 flex-1"/>
        </div>
        <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))] mt-1">
          <span>✅ {totalPassed} {fa?'قبول':'passed'}</span>
          <span>❌ {totalFailed} {fa?'رد':'failed'}</span>
        </div>
      </div>

      {/* Inspections list */}
      {isLoading ? (
        <div className="text-center py-10 text-[hsl(var(--muted-foreground))] text-sm">{fa?'در حال بارگذاری...':'Loading...'}</div>
      ) : inspections.length === 0 ? (
        <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-medium">{fa?'بازرسی ثبت نشده':'No inspections yet'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inspections.map(ins => {
            const rate = ins.qty ? Math.round(ins.passed / ins.qty * 100) : 0;
            const isPending = ins.result === 'PENDING';
            const borderColor = isPending ? '#f59e0b' : ins.failed > 0 ? '#ef4444' : '#10b981';
            return (
              <div key={ins.id} onClick={() => setSelected(ins)}
                className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4 cursor-pointer hover:border-[hsl(var(--primary)/0.3)] transition-colors"
                style={{borderRight:`4px solid ${borderColor}`}}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-[hsl(var(--primary))]">{ins.wo}</span>
                      <span className="font-semibold text-sm">{ins.product}</span>
                      {isPending && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500">{fa?'در انتظار':'Pending'}</span>}
                    </div>
                    <div className="flex gap-3 text-xs text-[hsl(var(--muted-foreground))] mt-1">
                      <span>👤 {ins.inspector}</span>
                      <span>📅 {ins.date}</span>
                      <span>📦 {ins.qty} {fa?'عدد':'pcs'}</span>
                    </div>
                  </div>
                  {!isPending && (
                    <div className="text-center shrink-0">
                      <div className="text-xl font-black" style={{color:rate>=95?'#10b981':rate>=85?'#f59e0b':'#ef4444'}}>{rate}%</div>
                      <div className="text-[10px] text-[hsl(var(--muted-foreground))]">{fa?'نرخ قبولی':'Pass Rate'}</div>
                    </div>
                  )}
                </div>
                {!isPending && (
                  <>
                    <div className="flex gap-4 mb-2">
                      <div className="text-center"><div className="font-bold text-green-600">{ins.passed}</div><div className="text-[10px]">{fa?'قبول':'Pass'}</div></div>
                      <div className="text-center"><div className="font-bold text-red-500">{ins.failed}</div><div className="text-[10px]">{fa?'رد':'Fail'}</div></div>
                    </div>
                    {ins.defects.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {ins.defects.map((d, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-500">{d}</span>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">🔍 {selected.wo}</h2>
              <button onClick={()=>setSelected(null)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            {[
              [fa?'محصول':'Product', selected.product],
              [fa?'بازرس':'Inspector', selected.inspector],
              [fa?'تاریخ':'Date', selected.date],
              [fa?'کل تعداد':'Total Qty', selected.qty+' '+(fa?'عدد':'pcs')],
              [fa?'قبول شده':'Passed', selected.passed],
              [fa?'رد شده':'Failed', selected.failed],
              [fa?'نرخ قبولی':'Pass Rate', selected.qty?Math.round(selected.passed/selected.qty*100)+'%':'—'],
            ].map(([k,v])=>(
              <div key={k} className="flex justify-between py-2 border-b border-[hsl(var(--border)/0.5)] text-sm">
                <span className="text-[hsl(var(--muted-foreground))]">{k}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
            {selected.defects.length > 0 && (
              <div className="mt-3">
                <div className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-2">⚠️ {fa?'عیوب شناسایی شده':'Identified Defects'}</div>
                <div className="flex gap-1 flex-wrap">
                  {selected.defects.map((d,i)=>(
                    <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-500">{d}</span>
                  ))}
                </div>
              </div>
            )}
            <button onClick={()=>setSelected(null)} className="w-full mt-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa?'بستن':'Close'}</button>
          </div>
        </div>
      )}

      {/* New inspection modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-md p-6 shadow-2xl my-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg">🔍 {fa?'بازرسی جدید':'New Inspection'}</h2>
              <button onClick={()=>setShowNew(false)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'دستور کار *':'Work Order *'}</label>
                {workOrders.length > 0 ? (
                  <select value={form.workOrderId} onChange={e=>setForm(f=>({...f,workOrderId:e.target.value}))} className={inp}>
                    <option value="">{fa?'انتخاب کنید':'Select...'}</option>
                    {workOrders.map((wo: any) => (
                      <option key={wo.id} value={wo.id}>{wo.orderNo} — {wo.productName}</option>
                    ))}
                  </select>
                ) : (
                  <input value={form.workOrderId} onChange={e=>setForm(f=>({...f,workOrderId:e.target.value}))} className={inp} placeholder={fa?'شناسه دستور کار':'Work order ID'}/>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'کل تعداد *':'Total Qty *'}</label>
                  <input type="number" value={form.qty} onChange={e=>setForm(f=>({...f,qty:e.target.value}))} className={inp}/></div>
                <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'قبول شده *':'Passed *'}</label>
                  <input type="number" value={form.passed} onChange={e=>setForm(f=>({...f,passed:e.target.value}))} className={inp}/></div>
              </div>
              <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'عیوب (با ، جدا کنید)':'Defects (comma-separated)'}</label>
                <input value={form.defects} onChange={e=>setForm(f=>({...f,defects:e.target.value}))} className={inp} placeholder={fa?'ترک جوش، رنگ ناقص':'Weld crack, Incomplete paint'}/></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={()=>setShowNew(false)} className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa?'انصراف':'Cancel'}</button>
              <button onClick={submitInspection} disabled={createQC.isPending} className="flex-1 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium disabled:opacity-60">
                🔍 {fa?'ثبت':'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
