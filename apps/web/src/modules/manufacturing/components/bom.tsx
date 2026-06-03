'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useBOMs, useCreateBOM } from '@/hooks/use-manufacturing';
import { useUIStore } from '@/store';

interface BOMItem {
  id: string;
  materialCode: string;
  materialName: string;
  materialNameFa: string;
  qty: number;
  unit: string;
  unitCost: number;
  wasteRate: number;
}

interface BOM {
  id: string;
  code: string;
  productName: string;
  productNameFa: string;
  unit: string;
  items: BOMItem[];
  laborMinutes: number;
  overheadRate: number;
  isActive: boolean;
}

function mapBOM(o: any): BOM {
  return {
    id: String(o.id),
    code: o.code ?? '',
    productName: o.product ?? '',
    productNameFa: o.productFa ?? o.product ?? '',
    unit: o.unit ?? 'Pcs',
    laborMinutes: o.laborMinutes ?? 0,
    overheadRate: o.overheadRate ?? 0,
    isActive: o.isActive !== false,
    items: (o.items ?? []).map((it: any) => ({
      id: String(it.id),
      materialCode: it.materialCode ?? '',
      materialName: it.material ?? '',
      materialNameFa: it.materialFa ?? it.material ?? '',
      qty: Number(it.qty) ?? 0,
      unit: it.unit ?? '',
      unitCost: Number(it.unitCostIRR) || 0,
      wasteRate: Number(it.scrapFactor) || 0,
    })),
  };
}

export function BOM() {
  const { lang } = useLocaleStore();
  const { toast } = useUIStore();
  const fa = lang === 'fa';
  const { data: apiData, isLoading } = useBOMs();
  const createBOM = useCreateBOM();
  const boms: BOM[] = ((apiData as any)?.data ?? []).map(mapBOM);
  const [selected, setSelected] = useState<BOM | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ code:'', productFa:'', product:'', unit:'Pcs', laborMinutes:60, overheadRate:25 });
  const [newItems, setNewItems] = useState<Partial<BOMItem>[]>([{ materialCode:'', materialNameFa:'', qty:1, unit:'Kg', unitCost:0, wasteRate:0 }]);
  const inp = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]";

  const calcBOMCost = (bom: BOM) => {
    const matCost = bom.items.reduce((s, i) => s + (i.qty * i.unitCost * (1 + i.wasteRate / 100)), 0);
    const laborCost = (bom.laborMinutes / 60) * 500000;
    const overhead = (matCost + laborCost) * (bom.overheadRate ?? 0) / 100;
    const total = matCost + laborCost + overhead;
    return { matCost, laborCost, overhead, total };
  };

  function submitBOM() {
    if (!newForm.code || !newForm.product) { toast('error', fa?'فیلدهای الزامی را پر کنید':'Fill required fields'); return; }
    createBOM.mutate({
      code: newForm.code,
      product: newForm.product,
      productFa: newForm.productFa || undefined,
      unit: newForm.unit,
      laborMinutes: newForm.laborMinutes,
      overheadRate: newForm.overheadRate,
      isActive: true,
      items: newItems.filter(i => i.materialCode).map(i => ({
        materialCode: i.materialCode,
        material: i.materialName || i.materialNameFa || '',
        materialFa: i.materialNameFa || undefined,
        qty: i.qty ?? 1,
        unit: i.unit ?? 'Kg',
        scrapFactor: i.wasteRate ?? 0,
        unitCostIRR: i.unitCost ? String(i.unitCost) : undefined,
      })),
    });
    setShowNew(false);
    setNewForm({ code:'', productFa:'', product:'', unit:'Pcs', laborMinutes:60, overheadRate:25 });
    setNewItems([{ materialCode:'', materialNameFa:'', qty:1, unit:'Kg', unitCost:0, wasteRate:0 }]);
  }

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

      {isLoading ? (
        <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
          <p className="text-sm">{fa?'در حال بارگذاری...':'Loading...'}</p>
        </div>
      ) : boms.length === 0 ? (
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
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{background:bom.isActive?'#10b98120':'#ef444420',color:bom.isActive?'#10b981':'#ef4444'}}>
                        {bom.isActive?(fa?'فعال':'Active'):(fa?'غیرفعال':'Inactive')}
                      </span>
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
                        <div className="text-[hsl(var(--muted-foreground))]">{fa?'هزینه کل':'Total Cost'}</div>
                        <div className="font-bold text-[hsl(var(--primary))]">{Math.round(costs.total).toLocaleString('fa-IR')}</div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                      {bom.items.length} {fa?'قلم مواد':'materials'} | {fa?'زمان کار:':'Labor:'} {bom.laborMinutes} {fa?'دقیقه':'min'}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setSelected(bom)} className="px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] text-xs hover:bg-[hsl(var(--muted)/0.5)]">
                      {fa?'جزئیات':'Details'}
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
                <div className="text-xs text-[hsl(var(--muted-foreground))]">{selected.code}</div>
              </div>
              <button onClick={() => setSelected(null)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            <div className="text-xs font-bold text-[hsl(var(--muted-foreground))] mb-2 uppercase">📦 {fa?'مواد اولیه و قطعات':'Materials & Components'}</div>
            <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead className="bg-[hsl(var(--muted)/0.5)]">
                  <tr>
                    {[fa?'کد':'Code', fa?'نام ماده':'Material', fa?'مقدار':'Qty', fa?'واحد':'Unit', fa?'قیمت واحد':'Unit Cost', fa?'ضایعات':'Waste%'].map(h => (
                      <th key={h} className="text-start px-3 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selected.items.map(item => (
                    <tr key={item.id} className="border-t border-[hsl(var(--border)/0.5)] hover:bg-[hsl(var(--muted)/0.3)]">
                      <td className="px-3 py-2 font-mono text-xs">{item.materialCode}</td>
                      <td className="px-3 py-2 font-medium">{fa?item.materialNameFa:item.materialName}</td>
                      <td className="px-3 py-2">{item.qty}</td>
                      <td className="px-3 py-2 text-[hsl(var(--muted-foreground))]">{item.unit}</td>
                      <td className="px-3 py-2">{item.unitCost.toLocaleString('fa-IR')}</td>
                      <td className="px-3 py-2 text-amber-600">{item.wasteRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {selected.items.length === 0 && (
                <div className="text-center py-6 text-sm text-[hsl(var(--muted-foreground))]">{fa?'قلم مواد ثبت نشده':'No materials defined'}</div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-[hsl(var(--border))] p-3">
                <div className="text-xs text-[hsl(var(--muted-foreground))] mb-1">⏱️ {fa?'زمان کار مستقیم':'Direct Labor Time'}</div>
                <div className="font-bold">{selected.laborMinutes} {fa?'دقیقه':'min'}</div>
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
                <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'کد BOM *':'BOM Code *'}</label>
                  <input value={newForm.code} onChange={e=>setNewForm(f=>({...f,code:e.target.value}))} className={inp} placeholder="BOM-002" /></div>
                <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'نام محصول *':'Product Name *'}</label>
                  <input value={newForm.product} onChange={e=>setNewForm(f=>({...f,product:e.target.value}))} className={inp} /></div>
                <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'نام فارسی':'FA Name'}</label>
                  <input value={newForm.productFa} onChange={e=>setNewForm(f=>({...f,productFa:e.target.value}))} className={inp} /></div>
                <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'واحد':'Unit'}</label>
                  <input value={newForm.unit} onChange={e=>setNewForm(f=>({...f,unit:e.target.value}))} className={inp} /></div>
                <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'زمان کار (دقیقه)':'Labor Time (min)'}</label>
                  <input type="number" value={newForm.laborMinutes} onChange={e=>setNewForm(f=>({...f,laborMinutes:Number(e.target.value)}))} className={inp} /></div>
                <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'نرخ سربار (%)':'Overhead Rate (%)'}</label>
                  <input type="number" value={newForm.overheadRate} onChange={e=>setNewForm(f=>({...f,overheadRate:Number(e.target.value)}))} className={inp} /></div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase">📦 {fa?'مواد اولیه':'Materials'}</div>
                  <button onClick={() => setNewItems([...newItems, {materialCode:'',materialNameFa:'',qty:1,unit:'Kg',unitCost:0,wasteRate:0}])}
                    className="text-xs text-[hsl(var(--primary))] hover:underline">➕ {fa?'افزودن':'Add'}</button>
                </div>
                <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-[hsl(var(--muted)/0.5)]">
                      <tr>
                        {[fa?'کد':'Code', fa?'نام':'Name', fa?'مقدار':'Qty', fa?'واحد':'Unit', fa?'قیمت':'Cost', fa?'ضایعات%':'Waste%', ''].map(h=>(
                          <th key={h} className="text-start px-2 py-2 font-semibold text-[hsl(var(--muted-foreground))]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {newItems.map((item,i) => (
                        <tr key={i} className="border-t border-[hsl(var(--border)/0.5)]">
                          <td className="px-1 py-1"><input value={item.materialCode||''} onChange={e=>{const r=[...newItems];r[i]={...r[i],materialCode:e.target.value};setNewItems(r);}} className={inp+" w-20"}/></td>
                          <td className="px-1 py-1"><input value={item.materialNameFa||''} onChange={e=>{const r=[...newItems];r[i]={...r[i],materialNameFa:e.target.value};setNewItems(r);}} className={inp+" min-w-[100px]"}/></td>
                          <td className="px-1 py-1"><input type="number" value={item.qty||1} onChange={e=>{const r=[...newItems];r[i]={...r[i],qty:Number(e.target.value)};setNewItems(r);}} className={inp+" w-16"}/></td>
                          <td className="px-1 py-1"><input value={item.unit||''} onChange={e=>{const r=[...newItems];r[i]={...r[i],unit:e.target.value};setNewItems(r);}} className={inp+" w-14"}/></td>
                          <td className="px-1 py-1"><input type="number" value={item.unitCost||0} onChange={e=>{const r=[...newItems];r[i]={...r[i],unitCost:Number(e.target.value)};setNewItems(r);}} className={inp+" w-24"}/></td>
                          <td className="px-1 py-1"><input type="number" value={item.wasteRate||0} onChange={e=>{const r=[...newItems];r[i]={...r[i],wasteRate:Number(e.target.value)};setNewItems(r);}} className={inp+" w-14"}/></td>
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
              <button onClick={submitBOM} disabled={createBOM.isPending} className="flex-1 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium disabled:opacity-60">
                {createBOM.isPending ? '...' : `✅ ${fa?'ذخیره BOM':'Save BOM'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
