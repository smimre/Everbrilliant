'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';

interface ApiKey {
  id: string; name: string; key: string; scopes: string[];
  active: boolean; createdAt: string; lastUsed: string|null; expiry: string|null;
}

const SCOPES = [
  { id:'read_requests',   label:'خواندن درخواست‌ها',  labelEn:'Read Requests'   },
  { id:'write_requests',  label:'ایجاد درخواست',       labelEn:'Create Requests' },
  { id:'read_shipments',  label:'خواندن محموله‌ها',    labelEn:'Read Shipments'  },
  { id:'write_shipments', label:'بروزرسانی محموله',    labelEn:'Update Shipments'},
  { id:'read_inventory',  label:'خواندن موجودی',       labelEn:'Read Inventory'  },
  { id:'write_inventory', label:'بروزرسانی موجودی',    labelEn:'Update Inventory'},
  { id:'read_invoices',   label:'خواندن فاکتورها',     labelEn:'Read Invoices'   },
];

const MOCK_KEYS: ApiKey[] = [
  { id:'AK-001', name:'ERP Connection', key:'baz_f3k9mq2p7xt1c8yw6nj0da4r5sb', scopes:['read_requests','write_requests','read_shipments'], active:true, createdAt:'۱۴۰۳/۰۴/۱۱', lastUsed:'۱۴۰۳/۰۴/۱۵', expiry:null },
  { id:'AK-002', name:'انبار شعبه ۲',   key:'baz_h7vz1et3ul0rx4wd9fn8qs6cm2b', scopes:['read_inventory','write_inventory'],                active:true, createdAt:'۱۴۰۳/۰۳/۲۰', lastUsed:'۱۴۰۳/۰۴/۱۴', expiry:'۱۴۰۴/۰۳/۲۰' },
  { id:'AK-003', name:'گزارش‌گیر BI',  key:'baz_p2jk8nw5am0qr7yx6ft4vc1zd3', scopes:['read_requests','read_invoices'],                    active:false, createdAt:'۱۴۰۳/۰۱/۰۵', lastUsed:null,           expiry:null },
];

function genKey(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return 'baz_' + Array.from({length:28}, ()=>chars[Math.floor(Math.random()*chars.length)]).join('');
}

const inp = 'w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none';

export function ApiKeysPage() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const [keys, setKeys]           = useState<ApiKey[]>(MOCK_KEYS);
  const [showNew, setShowNew]     = useState(false);
  const [newKey, setNewKey]       = useState<ApiKey|null>(null);
  const [copiedId, setCopiedId]   = useState<string|null>(null);
  const [form, setForm]           = useState({ name:'', scopes:[] as string[], expiry:'' });

  function createKey() {
    if (!form.name.trim()) { alert(fa?'نام الزامی':'Name required'); return; }
    const k: ApiKey = {
      id: 'AK-'+Date.now(), name: form.name.trim(), key: genKey(),
      scopes: form.scopes, active: true,
      createdAt: '۱۴۰۳/۰۴/۱۵', lastUsed: null,
      expiry: form.expiry || null,
    };
    setKeys(prev => [...prev, k]);
    setNewKey(k);
    setForm({ name:'', scopes:[], expiry:'' });
    setShowNew(false);
  }

  function toggleKey(id: string) {
    setKeys(prev => prev.map(k => k.id===id ? {...k,active:!k.active} : k));
  }

  function deleteKey(id: string) {
    if (!confirm(fa?'این کلید حذف شود؟':'Delete this key?')) return;
    setKeys(prev => prev.filter(k => k.id!==id));
  }

  function copyKey(key: string, id: string) {
    navigator.clipboard?.writeText(key).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  function toggleScope(scope: string) {
    setForm(f => ({
      ...f,
      scopes: f.scopes.includes(scope) ? f.scopes.filter(s=>s!==scope) : [...f.scopes,scope]
    }));
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">🔑 {fa?'مدیریت API Keys':'API Key Management'}</h1>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
          {fa?'API Key به سیستم‌های خارجی اجازه دسترسی به داده‌ها را می‌دهد':'API Keys allow external systems to access your data securely'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:fa?'کل کلیدها':'Total Keys', val:keys.length,                          color:'#3b82f6' },
          { label:fa?'فعال':'Active',            val:keys.filter(k=>k.active).length,      color:'#10b981' },
          { label:fa?'غیرفعال':'Inactive',       val:keys.filter(k=>!k.active).length,     color:'#64748b' },
        ].map((s,i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-3 text-center">
            <div className="text-2xl font-bold" style={{color:s.color}}>{s.val}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Keys list */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
          <h2 className="font-semibold text-sm">🔑 API Keys ({keys.length})</h2>
          <button onClick={()=>setShowNew(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">
            + {fa?'کلید جدید':'New Key'}
          </button>
        </div>

        {keys.length === 0 ? (
          <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
            <div className="text-4xl mb-2">🔑</div>
            <p className="text-sm mb-3">{fa?'API Key ندارید':'No API keys yet'}</p>
            <button onClick={()=>setShowNew(true)} className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm">
              + {fa?'ایجاد کلید':'Create Key'}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[hsl(var(--border))]">
            {keys.map(k => (
              <div key={k.id} className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm">{k.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${k.active?'bg-green-500/10 text-green-500':'bg-gray-500/10 text-gray-400'}`}>
                        {k.active?(fa?'فعال':'Active'):(fa?'غیرفعال':'Inactive')}
                      </span>
                      {k.expiry && <span className="text-[10px] text-amber-500">⏰ {fa?'انقضا:':'Expires:'} {k.expiry}</span>}
                    </div>
                    {/* Masked key + copy */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <code className="text-xs bg-[hsl(var(--muted)/0.5)] px-2 py-0.5 rounded font-mono text-[hsl(var(--primary))] tracking-wider">
                        {k.key.slice(0,14)}...{k.key.slice(-4)}
                      </code>
                      <button onClick={()=>copyKey(k.key, k.id)}
                        className="text-xs px-2 py-0.5 rounded border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.5)] transition-colors">
                        {copiedId===k.id?'✅':'📋'}
                      </button>
                    </div>
                    {/* Scopes */}
                    <div className="flex gap-1 flex-wrap mt-1.5">
                      {k.scopes.slice(0,4).map(s => (
                        <span key={s} className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500">{s}</span>
                      ))}
                      {k.scopes.length > 4 && <span className="text-[10px] text-[hsl(var(--muted-foreground))]">+{k.scopes.length-4}</span>}
                    </div>
                    <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1">
                      📅 {fa?'ایجاد:':'Created:'} {k.createdAt}
                      {k.lastUsed && <span className="ml-2">🕐 {fa?'آخرین استفاده:':'Last used:'} {k.lastUsed}</span>}
                      {!k.lastUsed && <span className="ml-2 text-amber-500">{fa?'هرگز استفاده نشده':'Never used'}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={()=>toggleKey(k.id)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${k.active?'border-red-500/30 text-red-500 hover:bg-red-500/10':'border-green-500/30 text-green-500 hover:bg-green-500/10'}`}>
                      {k.active?(fa?'غیرفعال':'Disable'):(fa?'فعال':'Enable')}
                    </button>
                    <button onClick={()=>deleteKey(k.id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20 transition-colors">
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* API Quick Docs */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
        <h2 className="font-semibold text-sm mb-3">📚 {fa?'مستندات سریع API':'Quick API Docs'}</h2>
        <div className="rounded-lg bg-[hsl(var(--background))] p-4 text-xs font-mono leading-relaxed overflow-x-auto" dir="ltr">
          <div className="text-[hsl(var(--muted-foreground))] mb-1"># Get requests</div>
          <div className="text-green-400">GET /api/v1/requests</div>
          <div className="text-[hsl(var(--muted-foreground))]">Authorization: Bearer YOUR_API_KEY</div>
          <div className="text-[hsl(var(--muted-foreground))] mt-3 mb-1"># Create shipment</div>
          <div className="text-green-400">POST /api/v1/shipments</div>
          <div className="text-[hsl(var(--muted-foreground))]">Content-Type: application/json</div>
          <div className="text-[hsl(var(--muted-foreground))]">Authorization: Bearer YOUR_API_KEY</div>
          <div className="text-[hsl(var(--muted-foreground))] mt-3 mb-1"># Get inventory</div>
          <div className="text-green-400">GET /api/v1/inventory</div>
          <div className="text-[hsl(var(--muted-foreground))]">Authorization: Bearer YOUR_API_KEY</div>
        </div>
        <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-2">
          {fa?'برای مستندات کامل به docs.everbrilliant.com مراجعه کنید':'For full docs visit docs.everbrilliant.com'}
        </p>
      </div>

      {/* New Key Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-md p-6 shadow-2xl my-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg">🔑 {fa?'API Key جدید':'New API Key'}</h2>
              <button onClick={()=>setShowNew(false)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'نام کلید *':'Key Name *'}</label>
                <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}
                  className={inp} placeholder={fa?'مثال: ERP Connection، انبار شعبه':'e.g. ERP Connection'}/>
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'دسترسی‌ها':'Permissions'}</label>
                <div className="rounded-lg border border-[hsl(var(--border))] p-3 space-y-2">
                  {SCOPES.map(s => (
                    <label key={s.id} className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="checkbox" checked={form.scopes.includes(s.id)} onChange={()=>toggleScope(s.id)}
                        className="w-4 h-4 rounded accent-[hsl(var(--primary))]"/>
                      <span>{fa ? s.label : s.labelEn}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'تاریخ انقضا (اختیاری)':'Expiry Date (optional)'}</label>
                <input value={form.expiry} onChange={e=>setForm(f=>({...f,expiry:e.target.value}))}
                  className={inp} placeholder="۱۴۰۴/۰۱/۰۱"/>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={()=>setShowNew(false)} className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa?'انصراف':'Cancel'}</button>
              <button onClick={createKey} className="flex-1 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">🔑 {fa?'ایجاد':'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Show new key secret */}
      {newKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-green-500">✅ {fa?'کلید ایجاد شد':'Key Created'}</h2>
              <button onClick={()=>setNewKey(null)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            <div className="rounded-lg bg-[hsl(var(--background))] p-4 mb-3">
              <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2">{fa?'کلید API شما (یک بار نمایش داده می‌شود):':'Your API key (shown only once):'}</p>
              <code className="text-sm font-mono text-[hsl(var(--primary))] break-all leading-relaxed">{newKey.key}</code>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 mb-4">
              <span className="text-amber-500 text-lg shrink-0">⚠️</span>
              <p className="text-xs text-amber-500">{fa?'این کلید را جای امنی ذخیره کنید — دوباره نمایش داده نمی‌شود':'Store this key securely — it will not be shown again'}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={()=>copyKey(newKey.key,'new')}
                className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">
                {copiedId==='new'?'✅ کپی شد':'📋 '+( fa?'کپی':'Copy')}
              </button>
              <button onClick={()=>setNewKey(null)} className="flex-1 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">{fa?'باشه':'Done'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
