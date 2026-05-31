'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';

interface Material {
  id: string; code: string; material: string; materialEn: string;
  required: number; available: number; unit: string; dueDate: string;
  supplier: string; unitCost: number; reorderPoint: number;
}

const INITIAL_MATERIALS: Material[] = [
  { id:'1', code:'MTL-001', material:'ورق فولادی ۲ میل', materialEn:'Steel Sheet 2mm',   required:250, available:180, unit:'Kg',    dueDate:'۱۴۰۳/۰۶/۱۵', supplier:'فولاد مبارکه', unitCost:85000,  reorderPoint:200 },
  { id:'2', code:'MTL-002', material:'الکترود جوشکاری',  materialEn:'Welding Rod',         required:25,  available:30,  unit:'Kg',    dueDate:'۱۴۰۳/۰۶/۱۵', supplier:'لینکلن',       unitCost:420000, reorderPoint:15 },
  { id:'3', code:'MTL-003', material:'رنگ اپوکسی',       materialEn:'Epoxy Paint',          required:10,  available:6,   unit:'Liter', dueDate:'۱۴۰۳/۰۶/۲۰', supplier:'ایران آلکید',  unitCost:380000, reorderPoint:8 },
  { id:'4', code:'MTL-004', material:'پیچ و مهره M8',    materialEn:'Bolt & Nut M8',        required:500, available:620, unit:'Pcs',   dueDate:'۱۴۰۳/۰۶/۱۸', supplier:'قطعات گلستان',unitCost:4200,   reorderPoint:300 },
  { id:'5', code:'MTL-005', material:'آلومینیوم ۱۵۰۰',  materialEn:'Aluminium 1500',       required:80,  available:45,  unit:'Kg',    dueDate:'۱۴۰۳/۰۶/۲۲', supplier:'الومتال',      unitCost:195000, reorderPoint:60 },
  { id:'6', code:'MTL-006', material:'لوله فولادی ۲″',   materialEn:'Steel Pipe 2-inch',   required:120, available:150, unit:'m',     dueDate:'۱۴۰۳/۰۶/۲۵', supplier:'لوله سازی',    unitCost:72000,  reorderPoint:80 },
];

const inp = 'w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none';

export function MaterialsPlanning() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const [materials, setMaterials] = useState<Material[]>(INITIAL_MATERIALS);
  const [search, setSearch]         = useState('');
  const [showNew, setShowNew]       = useState(false);
  const [poMaterial, setPoMaterial] = useState<Material|null>(null);
  const [poQty, setPoQty]           = useState('');
  const [form, setForm]             = useState({ code:'', material:'', required:'', available:'', unit:'Kg', dueDate:'', supplier:'', unitCost:'', reorderPoint:'' });

  const filtered = materials.filter(m =>
    !search || m.material.includes(search) || m.code.includes(search) || m.materialEn.toLowerCase().includes(search.toLowerCase())
  );

  const shortages  = materials.filter(m => m.available < m.required);
  const sufficient = materials.filter(m => m.available >= m.required);
  const totalShortCost = shortages.reduce((s,m) => s + (m.required - m.available) * m.unitCost, 0);

  function createPO() {
    if (!poMaterial || !poQty) return;
    const qty = parseInt(poQty);
    setMaterials(prev => prev.map(m => m.id===poMaterial.id ? {...m, available:m.available+qty} : m));
    alert(fa ? `سفارش خرید ${qty} ${poMaterial.unit} ${poMaterial.material} ثبت شد ✅` : `PO created: ${qty} ${poMaterial.unit} of ${poMaterial.materialEn} ✅`);
    setPoMaterial(null);
    setPoQty('');
  }

  function addMaterial() {
    if (!form.code || !form.material || !form.required) { alert(fa?'فیلدهای الزامی':'Required fields'); return; }
    const nm: Material = {
      id: Date.now().toString(), code:form.code, material:form.material, materialEn:form.material,
      required:parseInt(form.required)||0, available:parseInt(form.available)||0,
      unit:form.unit, dueDate:form.dueDate, supplier:form.supplier,
      unitCost:parseInt(form.unitCost)||0, reorderPoint:parseInt(form.reorderPoint)||0,
    };
    setMaterials(prev => [...prev, nm]);
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
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
          <h3 className="font-semibold text-sm text-red-500 mb-2">⚠️ {fa?'مواد نیاز به سفارش دارند':'Materials Requiring Purchase Orders'}</h3>
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
              const pct      = Math.min(100, Math.round(m.available/m.required*100));
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
                  <td className="px-3 py-3 text-[hsl(var(--muted-foreground))] text-xs whitespace-nowrap">{m.dueDate}</td>
                  <td className="px-3 py-3 text-xs text-[hsl(var(--muted-foreground))]">{m.supplier}</td>
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
                {fa?'تأمین‌کننده:':'Supplier:'} {poMaterial.supplier}
                {' · '}{fa?'قیمت واحد:':'Unit cost:'} {poMaterial.unitCost.toLocaleString('fa-IR')} ﷼
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'مقدار سفارش':'Order Quantity'} ({poMaterial.unit})</label>
              <input type="number" value={poQty} onChange={e=>setPoQty(e.target.value)} className={inp}/>
            </div>
            {poQty && (
              <div className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                {fa?'هزینه تخمینی:':'Estimated cost:'} <span className="font-bold text-[hsl(var(--primary))]">{(parseInt(poQty)*poMaterial.unitCost).toLocaleString('fa-IR')} ﷼</span>
              </div>
            )}
            <div className="flex gap-3 mt-4">
              <button onClick={()=>setPoMaterial(null)} className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa?'انصراف':'Cancel'}</button>
              <button onClick={createPO} className="flex-1 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">📋 {fa?'ثبت سفارش':'Create PO'}</button>
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
                  <input value={form.dueDate} onChange={e=>setForm(f=>({...f,dueDate:e.target.value}))} className={inp} placeholder="۱۴۰۳/۰۶/۲۰"/></div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={()=>setShowNew(false)} className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa?'انصراف':'Cancel'}</button>
              <button onClick={addMaterial} className="flex-1 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">📦 {fa?'ثبت':'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
