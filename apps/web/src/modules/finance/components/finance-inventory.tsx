'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useInventory, useAddInventory, useStockMove } from '@/hooks/use-finance';

export function FinanceInventory() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const { data: apiData, isLoading } = useInventory();
  const items: any[] = (apiData as any)?.data ?? [];
  const addItem = useAddInventory();
  const stockMove = useStockMove();

  const [showNew, setShowNew] = useState(false);
  const [showMovement, setShowMovement] = useState<{ itemId: string; itemName: string; type: 'in' | 'out' } | null>(null);
  const [tab, setTab] = useState<'list' | 'movements'>('list');
  const [newForm, setNewForm] = useState({ product: '', unit: 'Kg', qty: '', minQty: '', category: '', location: '', priceIRR: '' });
  const [moveQty, setMoveQty] = useState('');
  const [moveRef, setMoveRef] = useState('');

  const lowStock = items.filter(i => Number(i.qty) <= Number(i.minQty));
  const totalValue = items.reduce((s, i) => s + Number(i.qty) * Number(i.priceIRR || 0), 0);
  const inp = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">📦 {fa ? 'انبار' : 'Inventory'}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{items.length} {fa ? 'قلم کالا' : 'items'}</p>
        </div>
        <button onClick={() => setShowNew(true)} className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">
          ➕ {fa ? 'کالای جدید' : 'New Item'}
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: '📦', val: items.length, label: fa ? 'اقلام انبار' : 'Items', color: '#3b82f6' },
          { icon: '⚠️', val: lowStock.length, label: fa ? 'موجودی کم' : 'Low Stock', color: lowStock.length > 0 ? '#ef4444' : '#10b981' },
          { icon: '💰', val: (totalValue / 1e6).toFixed(0) + 'M', label: fa ? 'ارزش کل (ریال)' : 'Total Value', color: '#10b981' },
          { icon: '📍', val: new Set(items.map(i => i.location).filter(Boolean)).size, label: fa ? 'مکان انبار' : 'Locations', color: '#8b5cf6' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-3 text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-xl font-bold" style={{ color: s.color }}>{s.val}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">{s.label}</div>
          </div>
        ))}
      </div>

      {lowStock.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700">
          ⚠️ {lowStock.length} {fa ? 'قلم کالا زیر حداقل موجودی:' : 'items below minimum stock:'}
          <strong className="ms-1">{lowStock.map(i => i.product).join('، ')}</strong>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[hsl(var(--border))]">
        {[{ id: 'list', label: fa ? '📦 لیست کالا' : '📦 Items' }, { id: 'movements', label: fa ? '🔄 رسید و حواله' : '🔄 Movements' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]' : 'border-transparent text-[hsl(var(--muted-foreground))]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-12 rounded-xl bg-[hsl(var(--muted)/0.5)] animate-pulse" />)}</div>
      ) : tab === 'list' ? (
        items.length === 0 ? (
          <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">
            <div className="text-4xl mb-3">📦</div>
            <p className="font-medium">{fa ? 'کالایی ثبت نشده' : 'No items yet'}</p>
          </div>
        ) : (
          <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[hsl(var(--muted)/0.5)]">
                <tr>
                  {[fa ? 'نام کالا' : 'Item', fa ? 'واحد' : 'Unit', fa ? 'موجودی' : 'Stock',
                    fa ? 'حداقل' : 'Min', fa ? 'دسته' : 'Cat', fa ? 'مکان' : 'Loc', fa ? 'وضعیت' : 'Status', ''].map(h => (
                    <th key={h} className="text-start px-3 py-3 text-xs font-semibold text-[hsl(var(--muted-foreground))]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item: any) => {
                  const isLow = Number(item.qty) <= Number(item.minQty);
                  return (
                    <tr key={item.id} className="border-t border-[hsl(var(--border)/0.5)] hover:bg-[hsl(var(--muted)/0.3)]">
                      <td className="px-3 py-3 font-medium">{item.product}</td>
                      <td className="px-3 py-3 text-[hsl(var(--muted-foreground))]">{item.unit}</td>
                      <td className={`px-3 py-3 font-bold ${isLow ? 'text-red-500' : 'text-green-600'}`}>{Number(item.qty).toLocaleString('fa-IR')}</td>
                      <td className="px-3 py-3 text-[hsl(var(--muted-foreground))]">{Number(item.minQty).toLocaleString('fa-IR')}</td>
                      <td className="px-3 py-3 text-xs">{item.category || '—'}</td>
                      <td className="px-3 py-3 text-xs text-[hsl(var(--muted-foreground))]">{item.location || '—'}</td>
                      <td className="px-3 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${isLow ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                          {isLow ? (fa ? 'کم' : 'Low') : (fa ? 'کافی' : 'OK')}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => setShowMovement({ itemId: item.id, itemName: item.product, type: 'in' })}
                            className="text-xs px-2 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200">📥</button>
                          <button onClick={() => setShowMovement({ itemId: item.id, itemName: item.product, type: 'out' })}
                            className="text-xs px-2 py-1 rounded-lg bg-red-100 text-red-600 hover:bg-red-200">📤</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
          <div className="text-3xl mb-2">🔄</div>
          <p className="text-sm">{fa ? 'برای ثبت رسید/حواله روی دکمه‌های 📥 📤 کنار هر کالا کلیک کنید' : 'Use the 📥 📤 buttons on each item to record movements'}</p>
        </div>
      )}

      {/* New Item Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg">📦 {fa ? 'کالای جدید' : 'New Item'}</h2>
              <button onClick={() => setShowNew(false)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'نام کالا *' : 'Item Name *'}</label>
                <input value={newForm.product} onChange={e => setNewForm({ ...newForm, product: e.target.value })} className={inp} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'واحد' : 'Unit'}</label>
                  <input value={newForm.unit} onChange={e => setNewForm({ ...newForm, unit: e.target.value })} className={inp} placeholder="Kg" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'دسته‌بندی' : 'Category'}</label>
                  <select value={newForm.category} onChange={e => setNewForm({ ...newForm, category: e.target.value })} className={inp}>
                    <option value="raw">{fa ? 'مواد اولیه' : 'Raw Material'}</option>
                    <option value="wip">{fa ? 'در جریان ساخت' : 'WIP'}</option>
                    <option value="finished">{fa ? 'کالای ساخته شده' : 'Finished'}</option>
                    <option value="consumable">{fa ? 'مصرفی' : 'Consumable'}</option>
                    <option value="packaging">{fa ? 'بسته‌بندی' : 'Packaging'}</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'موجودی اولیه' : 'Opening Stock'}</label>
                  <input type="number" value={newForm.qty} onChange={e => setNewForm({ ...newForm, qty: e.target.value })} className={inp} placeholder="0" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'حداقل موجودی' : 'Min Stock'}</label>
                  <input type="number" value={newForm.minQty} onChange={e => setNewForm({ ...newForm, minQty: e.target.value })} className={inp} placeholder="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'قیمت واحد (ریال)' : 'Unit Price (IRR)'}</label>
                  <input type="number" value={newForm.priceIRR} onChange={e => setNewForm({ ...newForm, priceIRR: e.target.value })} className={inp} placeholder="0" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'مکان' : 'Location'}</label>
                  <input value={newForm.location} onChange={e => setNewForm({ ...newForm, location: e.target.value })} className={inp} placeholder="A1" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowNew(false)} className="flex-1 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa ? 'انصراف' : 'Cancel'}</button>
              <button
                disabled={addItem.isPending}
                onClick={() => {
                  if (!newForm.product) return;
                  addItem.mutate(
                    { product: newForm.product, unit: newForm.unit, qty: Number(newForm.qty) || 0, minQty: Number(newForm.minQty) || 0, category: newForm.category || undefined, location: newForm.location || undefined, priceIRR: newForm.priceIRR ? Number(newForm.priceIRR) : undefined },
                    { onSuccess: () => { setShowNew(false); setNewForm({ product: '', unit: 'Kg', qty: '', minQty: '', category: '', location: '', priceIRR: '' }); } }
                  );
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium disabled:opacity-50">
                {addItem.isPending ? '...' : `✅ ${fa ? 'ذخیره' : 'Save'}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Movement Modal */}
      {showMovement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg">
                {showMovement.type === 'in' ? (fa ? '📥 رسید انبار' : '📥 Stock Receipt') : (fa ? '📤 حواله انبار' : '📤 Stock Issue')}
              </h2>
              <button onClick={() => setShowMovement(null)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">📦 {showMovement.itemName}</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'مقدار *' : 'Quantity *'}</label>
                <input type="number" value={moveQty} onChange={e => setMoveQty(e.target.value)} className={inp} placeholder="0" />
              </div>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'شماره مرجع (فاکتور/حواله)' : 'Reference No.'}</label>
                <input value={moveRef} onChange={e => setMoveRef(e.target.value)} className={inp} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowMovement(null)} className="flex-1 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa ? 'انصراف' : 'Cancel'}</button>
              <button
                disabled={stockMove.isPending}
                onClick={() => {
                  if (!moveQty) return;
                  stockMove.mutate(
                    { id: showMovement.itemId, type: showMovement.type, qty: Number(moveQty), ref: moveRef || undefined },
                    { onSuccess: () => { setShowMovement(null); setMoveQty(''); setMoveRef(''); } }
                  );
                }}
                className={`flex-1 px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50 ${showMovement.type === 'in' ? 'bg-green-500' : 'bg-red-500'}`}>
                {stockMove.isPending ? '...' : showMovement.type === 'in' ? (fa ? '📥 ثبت رسید' : '📥 Record Receipt') : (fa ? '📤 ثبت حواله' : '📤 Record Issue')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
