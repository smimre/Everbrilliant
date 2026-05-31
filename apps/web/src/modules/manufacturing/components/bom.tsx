'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';

interface BOMItem {
  id: string;
  materialCode: string;
  materialName: string;
  materialNameFa: string;
  qty: number;
  unit: string;
  unitCost: number;
  wasteRate: number; // درصد ضایعات
  type: 'raw' | 'semi' | 'consumable';
}

interface BOM {
  id: string;
  code: string;
  productName: string;
  productNameFa: string;
  version: string;
  unit: string;
  batchSize: number; // سایز بچ (مثلاً هر ۱۰۰ عدد)
  items: BOMItem[];
  laborMinutes: number; // دقیقه کار مستقیم
  laborCostPerHour: number;
  overheadRate: number; // درصد سربار
  status: 'draft' | 'active' | 'obsolete';
}

const SAMPLE_BOMS: BOM[] = [
  {
    id: '1', code: 'BOM-001', productName: 'Steel Frame Type A', productNameFa: 'قاب فولادی نوع الف',
    version: 'v1.0', unit: 'Pcs', batchSize: 10, status: 'active', laborMinutes: 120, laborCostPerHour: 500000, overheadRate: 25,
    items: [
      { id:'1', materialCode:'MTL-001', materialName:'Steel Sheet 2mm', materialNameFa:'ورق فولادی ۲ میل', qty:5, unit:'Kg', unitCost:85000, wasteRate:5, type:'raw' },
      { id:'2', materialCode:'MTL-002', materialName:'Welding Rod', materialNameFa:'الکترود جوشکاری', qty:0.5, unit:'Kg', unitCost:220000, wasteRate:10, type:'consumable' },
      { id:'3', materialCode:'MTL-003', materialName:'Paint', materialNameFa:'رنگ', qty:0.2, unit:'Liter', unitCost:450000, wasteRate:3, type:'consumable' },
    ]
  }
];

export function BOM() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const [boms, setBoms] = useState<BOM[]>(SAMPLE_BOMS);
  const [selected, setSelected] = useState<BOM | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ code:'', productNameFa:'', productName:'', unit:'Pcs', batchSize:1, laborMinutes:60, laborCostPerHour:500000, overheadRate:25 });
  const [newItems, setNewItems] = useState<Partial<BOMItem>[]>([{ materialCode:'', materialNameFa:'', qty:1, unit:'Kg', unitCost:0, wasteRate:0, type:'raw' }]);
  const inp = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]";

  const calcBOMCost = (bom: BOM) => {
    const matCost = bom.items.reduce((s, i) => s + (i.qty * i.unitCost * (1 + i.wasteRate/100)), 0);
    const laborCost = (bom.laborMinutes / 60) * bom.laborCostPerHour;
    const overhead = (matCost + laborCost) * bom.overheadRate / 100;
    const total = matCost + laborCost + overhead;
    return { matCost, laborCost, overhead, total, perUnit: total / bom.batchSize };
  };

  const statusColors = { draft:'#94a3b8', active:'#10b981', obsolete:'#ef4444' };
  const statusLabels = { draft:fa?'پیش‌نویس':'Draft', active:fa?'فعال':'Active', obsolete:fa?'منسوخ':'Obsolete' };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">🧾 {fa?'فهرست مواد (BOM)':'Bill of Materials (BOM)'}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{boms.length} {fa?'BOM تعریف شده':'BOMs defined'}</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">
          ➕ {fa?'BOM جدید':'New BOM'}
        </button>
      </div>

      {boms.length === 0 ? (
        <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">
          <div className="text-4xl mb-3">🧾</div>
          <p className="font-medium">{fa?'BOM تعریف نشده':'No BOMs defined'}</p>
          <button onClick={() => setShowNew(true)} className="mt-4 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm">
            {fa?'+ BOM اول را بسازید':'+ Create First BOM'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {boms.map(bom => {
            const costs = calcBOMCost(bom);
            return (
              <div key={bom.id} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4 hover:border-[hsl(var(--primary)/0.3)] transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-xs font-bold text-[hsl(var(--primary))]">{bom.code}</span>
                      <span className="font-bold">{fa?bom.productNameFa:bom.productName}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{background:statusColors[bom.status]+'20',color:statusColors[bom.status]}}>{statusLabels[bom.status]}</span>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">{bom.version}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-3 text-xs">
                      <div className="rounded-lg bg-[hsl(var(--muted)/0.3)] p-2">
                        <div className="text-[hsl(var(--muted-foreground))]">{fa?'مواد اولیه':'Materials'}</div>
                        <div className="font-bold text-blue-600">{(costs.matCost/1000).toFixed(0)}K</div>
                      </div>
                      <div className="rounded-lg bg-[hsl(var(--muted)/0.3)] p-2">
                        <div className="text-[hsl(var(--muted-foreground))]">{fa?'دستمزد':'Labor'}</div>
                        <div className="font-bold text-purple-600">{(costs.laborCost/1000).toFixed(0)}K</div>
                      </div>
                      <div className="rounded-lg bg-[hsl(var(--muted)/0.3)] p-2">
                        <div className="text-[hsl(var(--muted-foreground))]">{fa?'سربار':'Overhead'}</div>
                        <div className="font-bold text-amber-600">{(costs.overhead/1000).toFixed(0)}K</div>
                      </div>
                      <div className="rounded-lg bg-[hsl(var(--primary)/0.08)] p-2 border border-[hsl(var(--primary)/0.2)]">
                        <div className="text-[hsl(var(--muted-foreground))]">{fa?'بهای تمام‌شده هر واحد':'Cost/Unit'}</div>
                        <div className="font-bold text-[hsl(var(--primary))]">{Math.round(costs.perUnit).toLocaleString('fa-IR')}</div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                      {bom.items.length} {fa?'قلم مواد':'materials'} | {fa?'سایز بچ:':'Batch:'} {bom.batchSize} {bom.unit} | {fa?'زمان کار:':'Labor:'} {bom.laborMinutes} {fa?'دقیقه':'min'}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setSelected(bom)} className="px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] text-xs hover:bg-[hsl(var(--muted)/0.5)]">
                      {fa?'جزئیات':'Details'}
                    </button>
                    <button className="px-3 py-1.5 rounded-lg bg-[hsl(var(--primary))] text-white text-xs">
                      {fa?'دستور کار':'Work Order'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* BOM Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-2xl p-6 shadow-2xl my-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-lg">{fa?selected.productNameFa:selected.productName}</h2>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">{selected.code} | {selected.version}</div>
              </div>
              <button onClick={() => setSelected(null)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>

            {/* Cost Breakdown */}
            {(() => {
              const costs = calcBOMCost(selected);
              return (
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    { label: fa?'مواد مستقیم':'Direct Materials', val: costs.matCost, color: '#3b82f6' },
                    { label: fa?'دستمزد مستقیم':'Direct Labor', val: costs.laborCost, color: '#8b5cf6' },
                    { label: fa?'سربار تولید':'Manufacturing Overhead', val: costs.overhead, color: '#f59e0b' },
                    { label: fa?'بهای تمام‌شده هر واحد':'Cost Per Unit', val: costs.perUnit, color: '#10b981' },
                  ].map((s,i) => (
                    <div key={i} className="rounded-xl border border-[hsl(var(--border))] p-3 text-center">
                      <div className="text-lg font-bold" style={{color:s.color}}>{Math.round(s.val).toLocaleString('fa-IR')}</div>
                      <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1 leading-tight">{s.label}</div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Materials Table */}
            <div className="text-xs font-bold text-[hsl(var(--muted-foreground))] mb-2 uppercase">📦 {fa?'مواد اولیه و قطعات':'Materials & Components'}</div>
            <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead className="bg-[hsl(var(--muted)/0.5)]">
                  <tr>
                    {[fa?'کد':'Code', fa?'نام ماده':'Material', fa?'مقدار':'Qty', fa?'واحد':'Unit',
                      fa?'قیمت واحد':'Unit Cost', fa?'ضایعات':'Waste%', fa?'بهای کل':'Total Cost', fa?'نوع':'Type'].map(h => (
                      <th key={h} className="text-start px-3 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selected.items.map(item => {
                    const totalCost = item.qty * item.unitCost * (1 + item.wasteRate/100);
                    const typeColors = { raw:'#3b82f6', semi:'#8b5cf6', consumable:'#f59e0b' };
                    const typeLabels = { raw:fa?'مواد اولیه':'Raw', semi:fa?'نیمه‌ساخته':'Semi', consumable:fa?'مصرفی':'Consumable' };
                    return (
                      <tr key={item.id} className="border-t border-[hsl(var(--border)/0.5)] hover:bg-[hsl(var(--muted)/0.3)]">
                        <td className="px-3 py-2 font-mono text-xs">{item.materialCode}</td>
                        <td className="px-3 py-2 font-medium">{fa?item.materialNameFa:item.materialName}</td>
                        <td className="px-3 py-2">{item.qty}</td>
                        <td className="px-3 py-2 text-[hsl(var(--muted-foreground))]">{item.unit}</td>
                        <td className="px-3 py-2">{item.unitCost.toLocaleString('fa-IR')}</td>
                        <td className="px-3 py-2 text-amber-600">{item.wasteRate}%</td>
                        <td className="px-3 py-2 font-bold">{Math.round(totalCost).toLocaleString('fa-IR')}</td>
                        <td className="px-3 py-2">
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{background:typeColors[item.type]+'20',color:typeColors[item.type]}}>
                            {typeLabels[item.type]}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Labor & Overhead */}
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg border border-[hsl(var(--border))] p-3">
                <div className="text-xs text-[hsl(var(--muted-foreground))] mb-1">⏱️ {fa?'زمان کار مستقیم':'Direct Labor Time'}</div>
                <div className="font-bold">{selected.laborMinutes} {fa?'دقیقه':'min'}</div>
              </div>
              <div className="rounded-lg border border-[hsl(var(--border))] p-3">
                <div className="text-xs text-[hsl(var(--muted-foreground))] mb-1">💵 {fa?'نرخ دستمزد':'Labor Rate'}</div>
                <div className="font-bold">{selected.laborCostPerHour.toLocaleString('fa-IR')} {fa?'ریال/ساعت':'IRR/hr'}</div>
              </div>
              <div className="rounded-lg border border-[hsl(var(--border))] p-3">
                <div className="text-xs text-[hsl(var(--muted-foreground))] mb-1">📊 {fa?'نرخ سربار':'Overhead Rate'}</div>
                <div className="font-bold">{selected.overheadRate}%</div>
              </div>
            </div>

            <button onClick={() => setSelected(null)} className="w-full mt-4 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted)/0.5)]">
              {fa?'بستن':'Close'}
            </button>
          </div>
        </div>
      )}

      {/* New BOM Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-2xl p-6 shadow-2xl my-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg">🧾 {fa?'BOM جدید':'New BOM'}</h2>
              <button onClick={() => setShowNew(false)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'کد BOM *':'BOM Code *'}</label><input value={newForm.code} onChange={e=>setNewForm(f=>({...f,code:e.target.value}))} className={inp} placeholder="BOM-002" /></div>
                <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'نام محصول (فارسی) *':'Product Name (FA) *'}</label><input value={newForm.productNameFa} onChange={e=>setNewForm(f=>({...f,productNameFa:e.target.value}))} className={inp} /></div>
                <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'نام محصول (انگلیسی)':'Product Name (EN)'}</label><input value={newForm.productName} onChange={e=>setNewForm(f=>({...f,productName:e.target.value}))} className={inp} /></div>
                <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'سایز بچ':'Batch Size'}</label><input type="number" value={newForm.batchSize} onChange={e=>setNewForm(f=>({...f,batchSize:Number(e.target.value)}))} className={inp} /></div>
                <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'زمان کار (دقیقه)':'Labor Time (min)'}</label><input type="number" value={newForm.laborMinutes} onChange={e=>setNewForm(f=>({...f,laborMinutes:Number(e.target.value)}))} className={inp} /></div>
                <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'نرخ دستمزد (ریال/ساعت)':'Labor Rate (IRR/hr)'}</label><input type="number" value={newForm.laborCostPerHour} onChange={e=>setNewForm(f=>({...f,laborCostPerHour:Number(e.target.value)}))} className={inp} /></div>
                <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'نرخ سربار (%)':'Overhead Rate (%)'}</label><input type="number" value={newForm.overheadRate} onChange={e=>setNewForm(f=>({...f,overheadRate:Number(e.target.value)}))} className={inp} /></div>
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase">📦 {fa?'مواد اولیه':'Materials'}</div>
                  <button onClick={() => setNewItems([...newItems, {materialCode:'',materialNameFa:'',qty:1,unit:'Kg',unitCost:0,wasteRate:0,type:'raw'}])}
                    className="text-xs text-[hsl(var(--primary))] hover:underline">➕ {fa?'افزودن ماده':'Add Material'}</button>
                </div>
                <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-[hsl(var(--muted)/0.5)]">
                      <tr>
                        {[fa?'کد':'Code', fa?'نام':'Name', fa?'مقدار':'Qty', fa?'واحد':'Unit', fa?'قیمت واحد':'Unit Cost', fa?'ضایعات%':'Waste%', fa?'نوع':'Type', ''].map(h=>(
                          <th key={h} className="text-start px-2 py-2 font-semibold text-[hsl(var(--muted-foreground))]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {newItems.map((item,i) => (
                        <tr key={i} className="border-t border-[hsl(var(--border)/0.5)]">
                          <td className="px-1 py-1"><input value={item.materialCode||''} onChange={e=>{const r=[...newItems];r[i].materialCode=e.target.value;setNewItems(r);}} className={inp+" w-20"} /></td>
                          <td className="px-1 py-1"><input value={item.materialNameFa||''} onChange={e=>{const r=[...newItems];r[i].materialNameFa=e.target.value;setNewItems(r);}} className={inp+" min-w-[100px]"} /></td>
                          <td className="px-1 py-1"><input type="number" value={item.qty||1} onChange={e=>{const r=[...newItems];r[i].qty=Number(e.target.value);setNewItems(r);}} className={inp+" w-16"} /></td>
                          <td className="px-1 py-1"><input value={item.unit||''} onChange={e=>{const r=[...newItems];r[i].unit=e.target.value;setNewItems(r);}} className={inp+" w-14"} /></td>
                          <td className="px-1 py-1"><input type="number" value={item.unitCost||0} onChange={e=>{const r=[...newItems];r[i].unitCost=Number(e.target.value);setNewItems(r);}} className={inp+" w-24"} /></td>
                          <td className="px-1 py-1"><input type="number" value={item.wasteRate||0} onChange={e=>{const r=[...newItems];r[i].wasteRate=Number(e.target.value);setNewItems(r);}} className={inp+" w-14"} /></td>
                          <td className="px-1 py-1">
                            <select value={item.type||'raw'} onChange={e=>{const r=[...newItems];r[i].type=e.target.value as any;setNewItems(r);}} className={inp}>
                              <option value="raw">{fa?'مواد اولیه':'Raw'}</option>
                              <option value="semi">{fa?'نیمه‌ساخته':'Semi'}</option>
                              <option value="consumable">{fa?'مصرفی':'Consumable'}</option>
                            </select>
                          </td>
                          <td className="px-1 py-1"><button onClick={()=>setNewItems(newItems.filter((_,j)=>j!==i))} className="text-red-500 px-1">✕</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowNew(false)} className="flex-1 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa?'انصراف':'Cancel'}</button>
              <button className="flex-1 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">✅ {fa?'ذخیره BOM':'Save BOM'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
