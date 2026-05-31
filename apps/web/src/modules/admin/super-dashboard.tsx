'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_COMPANIES = [
  { id:'A1', name:'گروه تجاری رضایی', country:'Iran',   type:'trading',   users:12, active:true,  txCount:18, txValue:45200000000 },
  { id:'A2', name:'تجارت نوین UAE',   country:'UAE',    type:'trading',   users:7,  active:true,  txCount:14, txValue:38500000000 },
  { id:'A3', name:'مهر پارس',         country:'Iran',   type:'trading',   users:5,  active:true,  txCount:9,  txValue:22100000000 },
  { id:'A4', name:'البيان للتجارة',   country:'Kuwait', type:'trading',   users:3,  active:true,  txCount:6,  txValue:18700000000 },
  { id:'A5', name:'آلفا لجستیک',     country:'Iran',   type:'logistics', users:8,  active:true,  txCount:22, txValue:9800000000  },
  { id:'A6', name:'تجارت البرز',      country:'Iran',   type:'trading',   users:4,  active:false, txCount:3,  txValue:4500000000  },
];

const MOCK_RECENT_TXS = [
  { id:'REQ-009', product:'شکر خام — ۳۰۰ تن',    buyer:'گروه رضایی',   seller:'تجارت نوین UAE', amount:5100000000, status:'pending'   },
  { id:'REQ-008', product:'گندم — ۲۰۰ تن',       buyer:'تجارت البرز',  seller:'مهر پارس',       amount:3200000000, status:'approved'  },
  { id:'REQ-007', product:'روغن پالم — ۱۰۰ تن',  buyer:'البيان',       seller:'گروه رضایی',     amount:2100000000, status:'delivered' },
  { id:'REQ-006', product:'چای سیلان — ۵۰ تن',   buyer:'گروه رضایی',   seller:'مهر پارس',       amount:1800000000, status:'delivered' },
  { id:'REQ-005', product:'قهوه — ۲۰ تن',        buyer:'آلفا لجستیک',  seller:'تجارت نوین UAE', amount:980000000,  status:'approved'  },
  { id:'REQ-004', product:'برنج باسماتی — ۱۵۰ تن',buyer:'البيان',      seller:'گروه رضایی',     amount:4800000000, status:'delivered' },
  { id:'REQ-003', product:'نفت خام — ۵۰۰ بشکه',  buyer:'تجارت نوین',   seller:'مهر پارس',       amount:9250000000, status:'pending'   },
  { id:'REQ-002', product:'ذرت — ۸۰۰ تن',        buyer:'گروه رضایی',   seller:'البيان',          amount:6400000000, status:'delivered' },
];

const MOCK_ACTIVITY = [
  { icon:'🔑', text:'گروه رضایی — ورود موفق',         user:'احمد رضایی',   ts:'۵ دقیقه پیش'  },
  { icon:'📋', text:'درخواست شکر خام REQ-009 ایجاد شد', user:'احمد رضایی',  ts:'۲۰ دقیقه پیش' },
  { icon:'📄', text:'قرارداد الفا CNT-001 امضا شد',    user:'محمد کریمی',   ts:'۱ ساعت پیش'   },
  { icon:'💰', text:'فاکتور SI-002 پرداخت شد',         user:'علی رضایی',    ts:'۲ ساعت پیش'   },
  { icon:'🚛', text:'وضعیت EB-TRK-10023 بروزرسانی شد', user:'آلفا لجستیک', ts:'۳ ساعت پیش'   },
  { icon:'👤', text:'کاربر جدید دعوت شد',              user:'احمد رضایی',   ts:'دیروز'         },
  { icon:'⚙️', text:'تنظیمات اعلان‌ها تغییر کرد',    user:'سارا احمدی',   ts:'دیروز'         },
  { icon:'🔌', text:'API Key جدید ایجاد شد',           user:'احمد رضایی',   ts:'۲ روز پیش'    },
];

const SHIPMENT_STATUSES = [
  { key:'booked',     label:'رزرو',           labelEn:'Booked',       color:'#3b82f6', count:3  },
  { key:'picked_up',  label:'تحویل گرفته',    labelEn:'Picked Up',    color:'#8b5cf6', count:2  },
  { key:'in_transit', label:'در راه',          labelEn:'In Transit',   color:'#f59e0b', count:5  },
  { key:'customs',    label:'گمرک',            labelEn:'Customs',      color:'#06b6d4', count:1  },
  { key:'delivered',  label:'تحویل شده',      labelEn:'Delivered',    color:'#10b981', count:12 },
  { key:'cancelled',  label:'لغو شده',        labelEn:'Cancelled',    color:'#ef4444', count:2  },
];

const STATUS_COLORS: Record<string,string> = { pending:'#f59e0b', approved:'#3b82f6', delivered:'#10b981', cancelled:'#ef4444', paid:'#10b981' };

function fmtB(n: number) {
  if (n >= 1e9) return (n/1e9).toFixed(1) + 'B ﷼';
  if (n >= 1e6) return (n/1e6).toFixed(0) + 'M ﷼';
  return n.toLocaleString('fa-IR') + ' ﷼';
}

export function SuperDashboard() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const [companies, setCompanies] = useState(MOCK_COMPANIES);
  const [txFilter, setTxFilter]   = useState('');

  const totalTrade    = MOCK_COMPANIES.reduce((s,c) => s+c.txValue, 0);
  const totalTxs      = MOCK_COMPANIES.reduce((s,c) => s+c.txCount, 0);
  const activeAccs    = companies.filter(c=>c.active).length;
  const totalShips    = SHIPMENT_STATUSES.reduce((s,x)=>s+x.count,0);
  const activeShips   = SHIPMENT_STATUSES.filter(s=>!['delivered','cancelled'].includes(s.key)).reduce((s,x)=>s+x.count,0);

  const topCompanies  = [...companies].sort((a,b)=>b.txValue-a.txValue).slice(0,5);
  const filteredTxs   = txFilter ? MOCK_RECENT_TXS.filter(r=>r.status===txFilter) : MOCK_RECENT_TXS;

  function toggleCompany(id: string) {
    setCompanies(prev => prev.map(c => c.id===id ? {...c,active:!c.active} : c));
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">🛡️ {fa?'داشبورد مدیریت سیستم':'Super Admin Dashboard'}</h1>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{fa?'نمای کلی کل سیستم — فقط برای سوپر ادمین':'Full system overview — Super Admin only'}</p>
      </div>

      {/* Hero KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { ic:'🏢', label:fa?'شرکت‌های عضو':'Member Companies', val:companies.length, sub:activeAccs+(fa?' فعال':' active'),       color:'#3b82f6' },
          { ic:'📋', label:fa?'کل معاملات':'Total Transactions',  val:totalTxs,         sub:MOCK_RECENT_TXS.filter(r=>r.status==='pending').length+(fa?' در انتظار':' pending'), color:'#8b5cf6' },
          { ic:'🚛', label:fa?'محموله فعال':'Active Shipments',   val:activeShips,      sub:totalShips+(fa?' کل':' total'),          color:'#06b6d4' },
          { ic:'💰', label:fa?'حجم کل معاملات':'Total Trade Vol', val:fmtB(totalTrade), sub:fa?'کل تراکنش‌ها':'all transactions',    color:'#10b981' },
          { ic:'📄', label:fa?'قراردادهای امضا':'Signed Contracts',val:'3',             sub:fa?'از ۵ قرارداد':'of 5 total',           color:'#10b981' },
          { ic:'👥', label:fa?'کل کاربران':'Total Users',         val:companies.reduce((s,c)=>s+c.users,0), sub:fa?'در همه شرکت‌ها':'across all companies', color:'#f59e0b' },
        ].map((k,i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
            <div className="text-2xl mb-2">{k.ic}</div>
            <div className="font-black text-lg" style={{color:k.color}}>{k.val}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">{k.label}</div>
            <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Top companies + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
          <h2 className="font-semibold text-sm mb-3">🏆 {fa?'شرکت‌های پر معامله':'Top Companies'}</h2>
          <div className="space-y-2">
            {topCompanies.map((c,i) => (
              <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg bg-[hsl(var(--muted)/0.3)]">
                <div className="w-6 h-6 rounded-full bg-[hsl(var(--primary))] text-white flex items-center justify-center text-xs font-bold shrink-0">{i+1}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{c.name}</div>
                  <div className="text-[10px] text-[hsl(var(--muted-foreground))]">{c.txCount} {fa?'معامله':'txns'} · {c.country}</div>
                </div>
                <div className="text-sm font-bold text-green-500 text-end">{fmtB(c.txValue)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
          <h2 className="font-semibold text-sm mb-3">🕐 {fa?'آخرین رویدادها':'Recent Activity'}</h2>
          <div className="space-y-2">
            {MOCK_ACTIVITY.slice(0,7).map((a,i) => (
              <div key={i} className="flex items-start gap-2 py-1.5 border-b border-[hsl(var(--border)/0.5)]">
                <span className="text-base shrink-0">{a.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{a.text}</div>
                  <div className="text-[10px] text-[hsl(var(--muted-foreground))]">{a.user} · {a.ts}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shipment status bar */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
        <h2 className="font-semibold text-sm mb-3">🚛 {fa?'وضعیت محموله‌ها':'Shipment Status'}</h2>
        <div className="flex h-10 rounded-xl overflow-hidden gap-0.5 mb-3">
          {SHIPMENT_STATUSES.map(s => {
            const pct = Math.round(s.count/totalShips*100);
            if (!pct) return null;
            return (
              <div key={s.key} title={`${fa?s.label:s.labelEn}: ${s.count}`}
                className="flex items-center justify-center text-white text-xs font-bold transition-all"
                style={{flex:pct, background:s.color, minWidth:pct>5?'auto':'4px'}}>
                {pct > 8 ? s.count : ''}
              </div>
            );
          })}
        </div>
        <div className="flex gap-3 flex-wrap">
          {SHIPMENT_STATUSES.filter(s=>s.count>0).map(s => (
            <div key={s.key} className="flex items-center gap-1.5 text-xs">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{background:s.color}}/>
              <span className="text-[hsl(var(--muted-foreground))]">{fa?s.label:s.labelEn}:</span>
              <strong>{s.count}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
          <h2 className="font-semibold text-sm">📋 {fa?'آخرین معاملات':'Recent Transactions'}</h2>
          <select value={txFilter} onChange={e=>setTxFilter(e.target.value)}
            className="text-xs border border-[hsl(var(--border))] bg-[hsl(var(--background))] rounded-lg px-2 py-1 outline-none">
            <option value="">{fa?'همه':'All'}</option>
            <option value="pending">{fa?'در انتظار':'Pending'}</option>
            <option value="approved">{fa?'تایید شده':'Approved'}</option>
            <option value="delivered">{fa?'تحویل شده':'Delivered'}</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[hsl(var(--muted)/0.5)]">
              <tr>
                {['ID', fa?'محصول':'Product', fa?'خریدار':'Buyer', fa?'فروشنده':'Seller', fa?'مبلغ':'Amount', fa?'وضعیت':'Status'].map(h=>(
                  <th key={h} className="text-start px-4 py-2.5 text-xs font-semibold text-[hsl(var(--muted-foreground))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTxs.map(r => (
                <tr key={r.id} className="border-t border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.2)]">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-[hsl(var(--primary))]">{r.id}</td>
                  <td className="px-4 py-3 font-semibold">{r.product}</td>
                  <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">{r.buyer}</td>
                  <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">{r.seller}</td>
                  <td className="px-4 py-3 font-bold text-xs">{fmtB(r.amount)}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{background:(STATUS_COLORS[r.status]||'#64748b')+'20',color:STATUS_COLORS[r.status]||'#64748b'}}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Company management */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
          <h2 className="font-semibold text-sm">🏢 {fa?'مدیریت شرکت‌ها':'Company Management'}</h2>
          <div className="flex gap-2 text-xs text-[hsl(var(--muted-foreground))]">
            <span>{companies.filter(c=>c.active).length} {fa?'فعال':'active'}</span>
            <span>/ {companies.length} {fa?'کل':'total'}</span>
          </div>
        </div>
        <div className="divide-y divide-[hsl(var(--border))]">
          {companies.map(c => (
            <div key={c.id} className="flex items-center gap-3 px-4 py-3">
              <div className="w-9 h-9 rounded-xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center text-base shrink-0">
                {c.type==='logistics'?'🚛':'🏢'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{c.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${c.active?'bg-green-500/10 text-green-500':'bg-gray-500/10 text-gray-400'}`}>
                    {c.active?(fa?'فعال':'Active'):(fa?'غیرفعال':'Inactive')}
                  </span>
                </div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">{c.country} · {c.users} {fa?'کاربر':'users'} · {c.txCount} {fa?'معامله':'txns'}</div>
              </div>
              <div className="text-end text-xs font-bold text-green-500">{fmtB(c.txValue)}</div>
              <div className="flex gap-1 shrink-0">
                <button onClick={()=>alert(fa?'ورود به: '+c.name:'Login: '+c.name)}
                  className="text-xs px-2 py-1 rounded-lg bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.2)]">
                  {fa?'ورود':'Login'}
                </button>
                <button onClick={()=>toggleCompany(c.id)}
                  className={`text-xs px-2 py-1 rounded-lg border transition-colors ${c.active?'border-red-500/30 text-red-500 hover:bg-red-500/10':'border-green-500/30 text-green-500 hover:bg-green-500/10'}`}>
                  {c.active?(fa?'تعلیق':'Suspend'):(fa?'فعال':'Activate')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-semibold text-sm mb-3">⚡ {fa?'اقدامات سریع':'Quick Actions'}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { icon:'📊', label:fa?'گزارش سیستم':'System Report', color:'#3b82f6' },
            { icon:'💾', label:fa?'پشتیبان‌گیری':'Backup',        color:'#10b981' },
            { icon:'📋', label:fa?'لاگ سیستم':'System Logs',     color:'#06b6d4' },
            { icon:'⚙️', label:fa?'پیکربندی':'Config',           color:'#8b5cf6' },
            { icon:'📧', label:fa?'ارسال انبوه':'Mass Email',     color:'#f59e0b' },
            { icon:'🔄', label:fa?'پاک‌سازی کش':'Clear Cache',   color:'#ef4444' },
          ].map((a,i) => (
            <button key={i} onClick={()=>alert(a.label)}
              className="flex items-center gap-3 p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--muted)/0.4)] transition-colors">
              <span className="text-2xl">{a.icon}</span>
              <span className="text-sm font-medium" style={{color:a.color}}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
