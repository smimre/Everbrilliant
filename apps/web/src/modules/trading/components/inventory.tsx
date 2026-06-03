'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useInventory } from '@/hooks/use-finance';
import { useUIStore } from '@/store';

const INV_CATS = ['روغن خوراکی', 'دانه‌های روغنی', 'غلات', 'مواد شیمیایی', 'تجهیزات صنعتی', 'فلزات', 'پلیمرها', 'سایر'];

const MOCK_INVENTORY = [
  { id:'INV-001', name:'روغن پالم RBD', category:'روغن خوراکی', qty:320, minQty:50, unit:'تن', unitCost:82000000, location:'انبار تهران A1', available:true, owner:'my', reserved:20 },
  { id:'INV-002', name:'شکر سفید گرید A', category:'غلات', qty:45, minQty:100, unit:'تن', unitCost:55000000, location:'انبار اصفهان', available:true, owner:'my', reserved:0 },
  { id:'INV-003', name:'گندم وارداتی', category:'غلات', qty:800, minQty:200, unit:'تن', unitCost:28000000, location:'سیلوی بندر', available:true, owner:'partner', partnerName:'مهر پارس', reserved:150 },
  { id:'INV-004', name:'پلی اتیلن سبک', category:'پلیمرها', qty:60, minQty:30, unit:'تن', unitCost:95000000, location:'انبار شیراز', available:false, owner:'my', reserved:0 },
];

function normalizeInventoryItem(raw: any) {
  return {
    id: raw.id || raw._id || 'INV-' + Math.random().toString(36).slice(2,6).toUpperCase(),
    name: raw.name || raw.productName || '—',
    category: raw.category || raw.type || 'سایر',
    qty: raw.quantity || raw.qty || raw.stock || 0,
    minQty: raw.minQty || raw.reorderPoint || 0,
    unit: raw.unit || 'تن',
    unitCost: raw.unitPrice || raw.unitCost || raw.price || 0,
    location: raw.location || raw.warehouse || '—',
    available: (raw.quantity || raw.qty || raw.stock || 0) > 0,
    owner: 'my' as const,
    partnerName: '',
    reserved: raw.reserved || 0,
  };
}

export function InventoryPage() {
  const { lang } = useLocaleStore();
  const { toast } = useUIStore();
  const fa = lang === 'fa';
  const [showNew, setShowNew] = useState(false);
  const [extraItems, setExtraItems] = useState<typeof MOCK_INVENTORY>([]);

  const { data: apiData, isLoading } = useInventory();
  const apiItems: any[] = (apiData as any)?.data ?? (Array.isArray(apiData) ? apiData : []);
  const useMock = !isLoading && apiItems.length === 0;
  const baseItems = useMock ? MOCK_INVENTORY : apiItems.map(normalizeInventoryItem);
  const items = [...baseItems, ...extraItems];
  const setItems = (fn: (prev: any[]) => any[]) => setExtraItems(prev => fn([...baseItems, ...prev]).slice(baseItems.length));
  const [ownerFilter, setOwnerFilter] = useState<'all'|'my'|'partner'>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ name:'', category: INV_CATS[0], unit:'تن', qty:'', minQty:'', unitCost:'', location:'', visible:true });

  const myItems = items.filter(i => i.owner === 'my');
  const lowStock = myItems.filter(i => i.qty <= i.minQty);
  const totalValue = myItems.reduce((s, i) => s + i.qty * i.unitCost, 0);
  const partnerItems = items.filter(i => i.owner === 'partner');

  const filtered = items.filter(i => {
    const matchOwner = ownerFilter === 'all' || i.owner === ownerFilter;
    const matchSearch = !search || i.name.includes(search) || i.category.includes(search) || i.location.includes(search);
    return matchOwner && matchSearch;
  });

  const inp = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]";

  const handleAddItem = () => {
    if (!form.name) { toast('error', fa ? 'نام کالا الزامی است' : 'Item name required'); return; }
    const newItem = {
      id: `INV-${String(items.length + 1).padStart(3, '0')}`,
      name: form.name, category: form.category, qty: Number(form.qty) || 0,
      minQty: Number(form.minQty) || 0, unit: form.unit,
      unitCost: Number(form.unitCost) || 0, location: form.location,
      available: true, owner: 'my' as const, reserved: 0,
    };
    setItems(prev => [...prev, newItem]);
    setForm({ name:'', category: INV_CATS[0], unit:'تن', qty:'', minQty:'', unitCost:'', location:'', visible:true });
    setShowNew(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">📦 {fa ? 'موجودی و انبار' : 'Inventory'}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{filtered.length} {fa ? 'قلم کالا' : 'items'}</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90"
        >
          ➕ {fa ? 'کالای جدید' : 'New Item'}
        </button>
      </div>

      {/* 4-col Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: '📦', val: myItems.length, label: fa ? 'انبار من' : 'My Inventory', color: '#3b82f6' },
          { icon: '⚠️', val: lowStock.length, label: fa ? 'موجودی کم' : 'Low Stock', color: '#ef4444' },
          { icon: '💰', val: totalValue > 0 ? `${(totalValue/1e9).toFixed(1)}B` : '0', label: fa ? 'ارزش کل' : 'Total Value', color: '#10b981' },
          { icon: '👥', val: partnerItems.length, label: fa ? 'موجودی شرکاء' : 'Partners Stock', color: '#06b6d4' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-3 text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-xl font-bold" style={{ color: s.color }}>{s.val}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
          ⚠️ {fa ? 'موجودی کم: ' : 'Low stock: '}
          <span className="font-semibold">{lowStock.map(i => i.name).join('، ')}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex gap-1 bg-[hsl(var(--secondary))] rounded-lg p-1">
          {([
            { id: 'all', label: fa ? 'همه' : 'All' },
            { id: 'my', label: fa ? 'انبار من' : 'My Inventory' },
            { id: 'partner', label: fa ? 'انبار شرکاء' : 'Partners' },
          ] as const).map(opt => (
            <button
              key={opt.id}
              onClick={() => setOwnerFilter(opt.id)}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${ownerFilter === opt.id ? 'bg-[hsl(var(--primary))] text-white' : 'text-[hsl(var(--muted-foreground))]'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={fa ? '🔍 جستجو...' : '🔍 Search...'}
          className="flex-1 min-w-[140px] px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-sm focus:outline-none"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">
          <div className="text-4xl mb-3">📦</div>
          <p className="font-medium">{fa ? 'انبار خالی است' : 'Inventory is empty'}</p>
          <button onClick={() => setShowNew(true)} className="mt-4 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm">
            {fa ? '+ افزودن کالا' : '+ Add Item'}
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[hsl(var(--muted)/0.5)]">
                <tr>
                  {[fa?'نام کالا':'Item', fa?'دسته':'Category', fa?'موجودی':'Stock', fa?'واحد':'Unit', fa?'قیمت واحد':'Unit Cost', fa?'مکان':'Location', fa?'وضعیت':'Status', fa?'اقدام':'Actions'].map(h => (
                    <th key={h} className="text-start px-3 py-2.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const isLow = item.qty <= item.minQty;
                  const netQty = item.qty - item.reserved;
                  return (
                    <tr key={item.id} className="border-t border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.3)] transition-colors">
                      <td className="px-3 py-2.5">
                        <div className="font-medium">{item.name}</div>
                        {item.owner === 'partner' && item.partnerName && (
                          <div className="text-[10px] text-[hsl(var(--muted-foreground))]">👥 {item.partnerName}</div>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--muted)/0.5)]">{item.category}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className={`font-semibold ${isLow ? 'text-red-500' : ''}`}>{item.qty}</div>
                        {item.reserved > 0 && <div className="text-[10px] text-amber-500">{fa ? 'رزرو: ' : 'Reserved: '}{item.reserved}</div>}
                        {isLow && <div className="text-[10px] text-red-400">{fa ? '⚠️ کم' : '⚠️ Low'}</div>}
                      </td>
                      <td className="px-3 py-2.5 text-[hsl(var(--muted-foreground))]">{item.unit}</td>
                      <td className="px-3 py-2.5 font-medium">{item.unitCost > 0 ? `${(item.unitCost/1e6).toFixed(0)}M IRR` : '-'}</td>
                      <td className="px-3 py-2.5 text-[hsl(var(--muted-foreground))] text-xs">{item.location}</td>
                      <td className="px-3 py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${item.available ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                          {item.available ? (fa ? '✅ موجود' : '✅ OK') : (fa ? '❌ ناموجود' : '❌ NA')}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex gap-1">
                          <button onClick={() => setSelected(item)} className="text-xs px-2 py-1 rounded border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.5)]" title={fa ? 'جزئیات' : 'Details'}>📋</button>
                          {item.owner === 'my' && (
                            <button onClick={() => setEditItem(item)} className="text-xs px-2 py-1 rounded border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.5)]" title={fa ? 'ویرایش' : 'Edit'}>✏️</button>
                          )}
                          {item.owner === 'partner' && item.available && (
                            <button className="text-xs px-2 py-1 rounded border border-[hsl(var(--primary)/0.3)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.08)]" title={fa ? 'درخواست' : 'Request'}>🛒</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">📦 {selected.name}</h2>
              <button onClick={() => setSelected(null)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            <div className="space-y-1.5">
              {[
                [fa?'دسته':'Category', selected.category],
                [fa?'موجودی کل':'Total Qty', `${selected.qty} ${selected.unit}`],
                [fa?'رزرو شده':'Reserved', `${selected.reserved} ${selected.unit}`],
                [fa?'موجود خالص':'Net Available', `${selected.qty - selected.reserved} ${selected.unit}`],
                [fa?'حداقل موجودی':'Min Stock', `${selected.minQty} ${selected.unit}`],
                [fa?'قیمت واحد':'Unit Cost', `${selected.unitCost.toLocaleString('fa-IR')} IRR`],
                [fa?'ارزش کل':'Total Value', `${(selected.qty * selected.unitCost).toLocaleString('fa-IR')} IRR`],
                [fa?'مکان':'Location', selected.location],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm py-1.5 border-b border-[hsl(var(--border)/0.5)]">
                  <span className="text-[hsl(var(--muted-foreground))]">{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add New Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-md p-6 shadow-2xl my-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg">📦 {fa ? 'کالای جدید' : 'New Item'}</h2>
              <button onClick={() => setShowNew(false)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'نام کالا *' : 'Item Name *'}</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={inp} placeholder={fa ? 'مثال: روغن پالم RBD' : 'e.g. Palm Oil RBD'} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'دسته‌بندی' : 'Category'}</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className={inp}>
                    {INV_CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'واحد' : 'Unit'}</label>
                  <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className={inp}>
                    {['تن','کیلوگرم','لیتر','متر','عدد','پالت','کارتن'].map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'موجودی فعلی' : 'Current Stock'}</label>
                  <input value={form.qty} onChange={e => setForm({...form, qty: e.target.value})} type="number" className={inp} />
                </div>
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'حداقل موجودی' : 'Min Stock'}</label>
                  <input value={form.minQty} onChange={e => setForm({...form, minQty: e.target.value})} type="number" className={inp} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'قیمت واحد (IRR)' : 'Unit Cost (IRR)'}</label>
                <input value={form.unitCost} onChange={e => setForm({...form, unitCost: e.target.value})} type="number" className={inp} placeholder="80000000" />
              </div>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'مکان انبار' : 'Storage Location'}</label>
                <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} className={inp} placeholder={fa ? 'مثال: انبار تهران A1' : 'e.g. Tehran Warehouse A1'} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.visible} onChange={e => setForm({...form, visible: e.target.checked})} className="w-4 h-4" />
                <span className="text-sm">{fa ? 'قابل مشاهده برای شرکاء تجاری' : 'Visible to trading partners'}</span>
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowNew(false)} className="flex-1 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa ? 'انصراف' : 'Cancel'}</button>
              <button onClick={handleAddItem} className="flex-1 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">✅ {fa ? 'ذخیره' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
