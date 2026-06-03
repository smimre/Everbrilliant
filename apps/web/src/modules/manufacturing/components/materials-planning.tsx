'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useMaterials, useCreateMaterial, useCreateMaterialPO } from '@/hooks/use-manufacturing';

interface Material {
  id: string; code: string; material: string; materialEn: string;
  required: number; available: number; unit: string; dueDate: string;
  supplier: string; unitCost: number; reorderPoint: number;
}

function mapMaterial(o: any): Material {
  return {
    id: String(o.id),
    code: o.code ?? '',
    material: o.materialFa ?? o.material ?? '',
    materialEn: o.material ?? '',
    required: Number(o.required) || 0,
    available: Number(o.available) || 0,
    unit: o.unit ?? '',
    dueDate: o.dueDate ? o.dueDate.slice(0, 10) : '',
    supplier: o.supplier ?? '',
    unitCost: Number(o.unitCostIRR) || 0,
    reorderPoint: Number(o.reorderPoint) || 0,
  };
}

const inp = 'w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none';

export function MaterialsPlanning() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const { data: apiData, isLoading } = useMaterials();
  const createMaterial = useCreateMaterial();
  const createPOMutation = useCreateMaterialPO();

  const materials: Material[] = ((apiData as any)?.data ?? []).map(mapMaterial);

  const [search, setSearch]         = useState('');
  const [showNew, setShowNew]       = useState(false);
  const [poMaterial, setPoMaterial] = useState<Material | null>(null);
  const [poQty, setPoQty]           = useState('');
  const [form, setForm]             = useState({ code:'', material:'', required:'', available:'', unit:'Kg', dueDate:'', supplier:'', unitCost:'', reorderPoint:'' });

  const filtered = materials.filter(m =>
    !search || m.material.includes(search) || m.code.includes(search) || m.materialEn.toLowerCase().includes(search.toLowerCase())
  );

  const shortages  = materials.filter(m => m.available < m.required);
  const sufficient = materials.filter(m => m.available >= m.required);
  const totalShortCost = shortages.reduce((s, m) => s + (m.required - m.available) * m.unitCost, 0);

  function submitPO() {
    if (!poMaterial || !poQty) return;
    createPOMutation.mutate({
      materialId: poMaterial.id,
      qty: parseInt(poQty),
      supplier: poMaterial.supplier,
      unitCost: poMaterial.unitCost,
    });
    setPoMaterial(null);
    setPoQty('');
  }

  function addMaterial() {
    if (!form.code || !form.material || !form.required) { alert(fa?'فیلدهای الزامی':'Required fields'); return; }
    createMaterial.mutate({
      code: form.code,
      material: form.material,
      unit: form.unit,
      required: parseInt(form.required) || 0,
      available: parseInt(form.available) || 0,
      reorderPoint: parseInt(form.reorderPoint) || 0,
      unitCostIRR: form.unitCost ? String(form.unitCost) : undefined,
      supplier: form.supplier || undefined,
      dueDate: form.dueDate || undefined,
    });
    setForm({ code:'', material:'', required:'', available:'', unit:'Kg', dueDate:'', supplier:'', unitCost:'', reorderPoint:'' });
    setShowNew(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">📦 {fa?'برنامه‌ریزی مواد (MRP)':'Material Requirements Planning'}</h1>
        <button onClick={()=>setShowNew(true)} className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">
          ➕ {fa?'ماده جدید':'New Material'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon:'📦', val:materials.length, label:fa?'کل اقلام':'Total Items',     color:'#3b82f6' },
          { icon:'⚠️', val:shortages.length,  label:fa?'کمبود':'Shortages',          color:'#ef4444' },
          { icon:'✅', val:sufficient.length, label:fa?'کافی':'Sufficient',          color:'#10b981' },
          { icon:'💰', val:(totalShortCost/1e6).toFixed(1)+'M', label:fa?'هزینه کمبود (ریال)':'Shortage Cost', color:'#f59e0b' },
        ].map((s,i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-3 text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-xl font-bold" style={{color:s.color}}>{s.val}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Shortage alert */}
      {shortages.length > 0 && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-semibold text-sm text-red-500">⚠️ {fa?'مواد نیاز به سفارش دارند':'Materials Requiring Purchase Orders'}</h3>
            <a href="/trading"
              className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors font-medium border border-blue-500/20">
              📊 {fa ? 'ثبت درخواست خرید در بازرگانی ↗' : 'Create Trading Purchase Request ↗'}
            </a>
          </div>
          <div className="space-y-1">
            {shortages.map(m => (
              <div key={m.id} className="flex items-center justify-between">
                <span className="text-sm">{fa?m.material:m.materialEn}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-500 font-bold">-{m.required-m.available} {m.unit}</span>
                  <button onClick={()=>{setPoMaterial(m); setPoQty(String(m.required-m.available));}}
                    className="text-xs px-2 py-0.5 rounded-lg bg-[hsl(var(--primary))] text-white">
                    {fa?'سفارش خرید':'Purchase Order'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <input value={search} onChange={e=>setSearch(e.target.value)}
        placeholder={fa?'🔍 جستجو در مواد...':'🔍 Search materials...'}
        className="w-full px-4 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-sm focus:outline-none"/>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-10 text-[hsl(var(--muted-foreground))] text-sm">{fa?'در حال بارگذاری...':'Loading...'}</div>
      ) : (
        <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[hsl(var(--muted)/0.5)]">
              <tr>
                {[fa?'کد':'Code', fa?'نام ماده':'Material', fa?'نیاز':'Required', fa?'موجود':'Available', fa?'کمبود':'Shortage', fa?'واحد':'Unit', fa?'تاریخ نیاز':'Due', fa?'تأمین‌کننده':'Supplier', fa?'اقدام':'Action'].map(h=>(
                  <th key={h} className="text-start px-3 py-2.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const shortage = m.required - m.available;
                const isShort  = shortage > 0;
                const pct      = m.required > 0 ? Math.min(100, Math.round(m.available/m.required*100)) : 100;
                return (
                  <tr key={m.id} className="border-t border-[hsl(var(--border)/0.5)] hover:bg-[hsl(var(--muted)/0.3)]">
                    <td className="px-3 py-3 font-mono text-xs text-[hsl(var(--primary))]">{m.code}</td>
                    <td className="px-3 py-3 font-medium">{fa?m.material:m.materialEn}</td>
                    <td className="px-3 py-3">{m.required}</td>
                    <td className="px-3 py-3">
                      <div>
                        <span className={`font-medium ${isShort?'text-amber-600':'text-green-600'}`}>{m.available}</span>
                        <div className="h-1.5 rounded-full bg-[hsl(var(--muted))] mt-1 w-16">
                          <div className="h-full rounded-full" style={{width:`${pct}%`,background:isShort?'#f59e0b':'#10b981'}}/>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      {isShort
                        ? <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-bold">-{shortage}</span>
                        : <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">✅</span>}
                    </td>
                    <td className="px-3 py-3 text-[hsl(var(--muted-foreground))]">{m.unit}</td>
                    <td className="px-3 py-3 text-[hsl(var(--muted-foreground))] text-xs whitespace-nowrap">{m.dueDate || '—'}</td>
                    <td className="px-3 py-3 text-xs text-[hsl(var(--muted-foreground))]">{m.supplier || '—'}</td>
                    <td className="px-3 py-3">
                      {isShort && (
                        <button onClick={()=>{setPoMaterial(m);setPoQty(String(shortage));}}
                          className="text-xs px-3 py-1.5 rounded-lg bg-[hsl(var(--primary))] text-white whitespace-nowrap">
                          📋 {fa?'سفارش خرید':'Buy'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length===0 && (
            <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
              <div className="text-3xl mb-2">📦</div>
              <p className="text-sm">{fa?'موردی یافت نشد':'No items found'}</p>
            </div>
          )}
        </div>
      )}

      {/* Purchase Order modal */}
      {poMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-sm p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">📋 {fa?'ایجاد سفارش خرید':'Create Purchase Order'}</h2>
              <button onClick={()=>setPoMaterial(null)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            <div className="p-3 rounded-lg bg-[hsl(var(--muted)/0.3)] mb-4 text-sm">
              <div className="font-semibold">{fa?poMaterial.material:poMaterial.materialEn}</div>
              <div className="text-[hsl(var(--muted-foreground))] text-xs mt-1">
                {fa?'تأمین‌کننده:':'Supplier:'} {poMaterial.supplier || '—'}
                {poMaterial.unitCost > 0 && ` · ${fa?'قیمت واحد:':'Unit cost:'} ${poMaterial.unitCost.toLocaleString('fa-IR')} ﷼`}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'مقدار سفارش':'Order Quantity'} ({poMaterial.unit})</label>
              <input type="number" value={poQty} onChange={e=>setPoQty(e.target.value)} className={inp}/>
            </div>
            {poQty && poMaterial.unitCost > 0 && (
              <div className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                {fa?'هزینه تخمینی:':'Estimated cost:'} <span className="font-bold text-[hsl(var(--primary))]">{(parseInt(poQty)*poMaterial.unitCost).toLocaleString('fa-IR')} ﷼</span>
              </div>
            )}
            <div className="flex gap-3 mt-4">
              <button onClick={()=>setPoMaterial(null)} className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa?'انصراف':'Cancel'}</button>
              <button onClick={submitPO} disabled={createPOMutation.isPending} className="flex-1 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium disabled:opacity-60">
                📋 {fa?'ثبت سفارش':'Create PO'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New material modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-md p-6 shadow-2xl my-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg">📦 {fa?'ماده اولیه جدید':'New Material'}</h2>
              <button onClick={()=>setShowNew(false)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'کد':'Code'} *</label>
                  <input value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value}))} className={inp} placeholder="MTL-007"/></div>
                <div><label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'واحد':'Unit'}</label>
                  <select value={form.unit} onChange={e=>setForm(f=>({...f,unit:e.target.value}))} className={inp}>
                    {['Kg','Pcs','m','Liter','m²','Ton'].map(u=><option key={u}>{u}</option>)}
                  </select></div>
              </div>
              <div><label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'نام ماده':'Material Name'} *</label>
                <input value={form.material} onChange={e=>setForm(f=>({...f,material:e.target.value}))} className={inp}/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'نیاز (MRP)':'Required'} *</label>
                  <input type="number" value={form.required} onChange={e=>setForm(f=>({...f,required:e.target.value}))} className={inp}/></div>
                <div><label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'موجودی':'Available'}</label>
                  <input type="number" value={form.available} onChange={e=>setForm(f=>({...f,available:e.target.value}))} className={inp}/></div>
              </div>
              <div><label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'تأمین‌کننده':'Supplier'}</label>
                <input value={form.supplier} onChange={e=>setForm(f=>({...f,supplier:e.target.value}))} className={inp}/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'قیمت واحد (ریال)':'Unit Cost'}</label>
                  <input type="number" value={form.unitCost} onChange={e=>setForm(f=>({...f,unitCost:e.target.value}))} className={inp}/></div>
                <div><label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'تاریخ نیاز':'Due Date'}</label>
                  <input type="date" value={form.dueDate} onChange={e=>setForm(f=>({...f,dueDate:e.target.value}))} className={inp}/></div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={()=>setShowNew(false)} className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa?'انصراف':'Cancel'}</button>
              <button onClick={addMaterial} disabled={createMaterial.isPending} className="flex-1 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium disabled:opacity-60">
                📦 {fa?'ثبت':'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
