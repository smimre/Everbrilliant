'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';

interface InventoryItem {
  id: string; code: string; name: string; nameFa: string;
  unit: string; qty: number; minQty: number; unitCost: number;
  category: string; location?: string;
}

const SAMPLE: InventoryItem[] = [
  { id:'1', code:'MTL-001', name:'Steel Sheet 2mm', nameFa:'ورق فولادی ۲ میل', unit:'Kg', qty:5000, minQty:500, unitCost:85000, category:'raw', location:'A1' },
  { id:'2', code:'CHM-001', name:'Industrial Oil', nameFa:'روغن صنعتی', unit:'Liter', qty:200, minQty:50, unitCost:320000, category:'consumable', location:'B2' },
  { id:'3', code:'PKG-001', name:'Cardboard Box', nameFa:'کارتن بسته‌بندی', unit:'Pcs', qty:30, minQty:100, unitCost:45000, category:'packaging', location:'C1' },
];

export function FinanceInventory() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const [items, setItems] = useState<InventoryItem[]>(SAMPLE);
  const [showNew, setShowNew] = useState(false);
  const [showMovement, setShowMovement] = useState<{item: InventoryItem; type: 'IN'|'OUT'} | null>(null);
  const [tab, setTab] = useState<'list'|'movements'>('list');
  const [movements, setMovements] = useState<any[]>([]);

  const lowStock = items.filter(i => i.qty <= i.minQty);
  const totalValue = items.reduce((s, i) => s + i.qty * i.unitCost, 0);
  const inp = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">📦 {fa ? 'انبار' : 'Inventory'}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{items.length} {fa ? 'قلم کالا' : 'items'}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowNew(true)} className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">
            ➕ {fa ? 'کالای جدید' : 'New Item'}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: '📦', val: items.length, label: fa?'اقلام انبار':'Items', color: '#3b82f6' },
          { icon: '⚠️', val: lowStock.length, label: fa?'موجودی کم':'Low Stock', color: lowStock.length > 0 ? '#ef4444' : '#10b981' },
          { icon: '💰', val: (totalValue/1e6).toFixed(0)+'M', label: fa?'ارزش کل (ریال)':'Total Value', color: '#10b981' },
          { icon: '📍', val: new Set(items.map(i=>i.location).filter(Boolean)).size, label: fa?'مکان انبار':'Locations', color: '#8b5cf6' },
        ].map((s,i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-3 text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-xl font-bold" style={{color:s.color}}>{s.val}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">{s.label}</div>
          </div>
        ))}
      </div>

      {lowStock.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700">
          ⚠️ {lowStock.length} {fa?'قلم کالا زیر حداقل موجودی:':'items below minimum stock:'}
          <strong className="ms-1">{lowStock.map(i=>fa?i.nameFa:i.name).join('، ')}</strong>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[hsl(var(--border))]">
        {[{id:'list',label:fa?'📦 لیست کالا':'📦 Items'},{id:'movements',label:fa?'🔄 رسید و حواله':'🔄 Movements'}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab===t.id?'border-[hsl(var(--primary))] text-[hsl(var(--primary))]':'border-transparent text-[hsl(var(--muted-foreground))]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'list' && (
        <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[hsl(var(--muted)/0.5)]">
              <tr>
                {[fa?'کد':'Code', fa?'نام کالا':'Item', fa?'واحد':'Unit', fa?'موجودی':'Stock',
                  fa?'حداقل':'Min', fa?'قیمت واحد':'Unit Cost', fa?'ارزش کل':'Total Value', fa?'وضعیت':'Status', ''].map(h=>(
                  <th key={h} className="text-start px-3 py-3 text-xs font-semibold text-[hsl(var(--muted-foreground))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const isLow = item.qty <= item.minQty;
                return (
                  <tr key={item.id} className="border-t border-[hsl(var(--border)/0.5)] hover:bg-[hsl(var(--muted)/0.3)]">
                    <td className="px-3 py-3 font-mono text-xs font-bold">{item.code}</td>
                    <td className="px-3 py-3">
                      <div className="font-medium">{fa?item.nameFa:item.name}</div>
                      {item.location && <div className="text-xs text-[hsl(var(--muted-foreground))]">📍 {item.location}</div>}
                    </td>
                    <td className="px-3 py-3 text-[hsl(var(--muted-foreground))]">{item.unit}</td>
                    <td className={`px-3 py-3 font-bold ${isLow?'text-red-500':'text-green-600'}`}>{item.qty.toLocaleString('fa-IR')}</td>
                    <td className="px-3 py-3 text-[hsl(var(--muted-foreground))]">{item.minQty.toLocaleString('fa-IR')}</td>
                    <td className="px-3 py-3">{item.unitCost.toLocaleString('fa-IR')}</td>
                    <td className="px-3 py-3 font-medium">{(item.qty*item.unitCost).toLocaleString('fa-IR')}</td>
                    <td className="px-3 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${isLow?'bg-red-100 text-red-600':'bg-green-100 text-green-700'}`}>
                        {isLow?(fa?'کم':'Low'):(fa?'کافی':'OK')}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1">
                        <button onClick={()=>setShowMovement({item, type:'IN'})} className="text-xs px-2 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200">📥</button>
                        <button onClick={()=>setShowMovement({item, type:'OUT'})} className="text-xs px-2 py-1 rounded-lg bg-red-100 text-red-600 hover:bg-red-200">📤</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'movements' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <button onClick={()=>setShowMovement({item: items[0], type:'IN'})} className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-medium">
              📥 {fa?'رسید انبار':'Stock Receipt'}
            </button>
            <button onClick={()=>setShowMovement({item: items[0], type:'OUT'})} className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium">
              📤 {fa?'حواله انبار':'Stock Issue'}
            </button>
          </div>
          {movements.length === 0 ? (
            <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
              <div className="text-3xl mb-2">🔄</div>
              <p className="text-sm">{fa?'رسید و حواله‌ای ثبت نشده':'No movements recorded'}</p>
            </div>
          ) : (
            <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[hsl(var(--muted)/0.5)]">
                  <tr>
                    {[fa?'تاریخ':'Date', fa?'نوع':'Type', fa?'کالا':'Item', fa?'مقدار':'Qty', fa?'مرجع':'Ref', fa?'کاربر':'User'].map(h=>(
                      <th key={h} className="text-start px-4 py-3 text-xs font-semibold text-[hsl(var(--muted-foreground))]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m:any) => (
                    <tr key={m.id} className="border-t border-[hsl(var(--border)/0.5)] hover:bg-[hsl(var(--muted)/0.3)]">
                      <td className="px-4 py-2">{m.date}</td>
                      <td className="px-4 py-2"><span className={`text-xs px-2 py-0.5 rounded-full ${m.type==='IN'?'bg-green-100 text-green-700':'bg-red-100 text-red-600'}`}>{m.type==='IN'?(fa?'📥 رسید':'📥 In'):(fa?'📤 حواله':'📤 Out')}</span></td>
                      <td className="px-4 py-2 font-medium">{fa?m.itemFa:m.item}</td>
                      <td className="px-4 py-2 font-bold">{m.qty}</td>
                      <td className="px-4 py-2 text-xs text-[hsl(var(--muted-foreground))]">{m.ref}</td>
                      <td className="px-4 py-2 text-xs">{m.user}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* New Item Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg">📦 {fa?'کالای جدید':'New Item'}</h2>
              <button onClick={()=>setShowNew(false)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            <div className="space-y-3">
              {[
                {label: fa?'کد کالا *':'Item Code *', type:'text', placeholder:'MTL-001'},
                {label: fa?'نام فارسی *':'Name (FA) *', type:'text', placeholder:''},
                {label: fa?'نام انگلیسی':'Name (EN)', type:'text', placeholder:''},
                {label: fa?'موجودی اولیه':'Opening Stock', type:'number', placeholder:'0'},
                {label: fa?'حداقل موجودی':'Min Stock', type:'number', placeholder:'0'},
                {label: fa?'قیمت واحد (ریال)':'Unit Cost (IRR)', type:'number', placeholder:'0'},
                {label: fa?'مکان در انبار':'Location', type:'text', placeholder:'A1'},
              ].map((f,i) => (
                <div key={i}>
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{f.label}</label>
                  <input type={f.type} className={inp} placeholder={f.placeholder} />
                </div>
              ))}
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'دسته‌بندی':'Category'}</label>
                <select className={inp}>
                  <option value="raw">{fa?'مواد اولیه':'Raw Material'}</option>
                  <option value="wip">{fa?'در جریان ساخت':'WIP'}</option>
                  <option value="finished">{fa?'کالای ساخته شده':'Finished Goods'}</option>
                  <option value="consumable">{fa?'مصرفی':'Consumable'}</option>
                  <option value="packaging">{fa?'بسته‌بندی':'Packaging'}</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={()=>setShowNew(false)} className="flex-1 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa?'انصراف':'Cancel'}</button>
              <button className="flex-1 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">✅ {fa?'ذخیره':'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Movement Modal */}
      {showMovement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg">
                {showMovement.type==='IN'?(fa?'📥 رسید انبار':'📥 Stock Receipt'):(fa?'📤 حواله انبار':'📤 Stock Issue')}
              </h2>
              <button onClick={()=>setShowMovement(null)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'کالا':'Item'}</label>
                <select className={inp}>
                  {items.map(i=><option key={i.id} value={i.id}>{i.code} — {fa?i.nameFa:i.name} ({fa?'موجودی:':'Stock:'} {i.qty})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'مقدار *':'Quantity *'}</label>
                  <input type="number" className={inp} />
                </div>
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'تاریخ':'Date'}</label>
                  <input className={inp} placeholder="1403/06/15" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'شماره مرجع (فاکتور/حواله)':'Reference No.'}</label>
                <input className={inp} />
              </div>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'توضیحات':'Notes'}</label>
                <input className={inp} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={()=>setShowMovement(null)} className="flex-1 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa?'انصراف':'Cancel'}</button>
              <button className={`flex-1 px-4 py-2 rounded-lg text-white text-sm font-medium ${showMovement.type==='IN'?'bg-green-500':'bg-red-500'}`}>
                {showMovement.type==='IN'?(fa?'📥 ثبت رسید':'📥 Record Receipt'):(fa?'📤 ثبت حواله':'📤 Record Issue')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
