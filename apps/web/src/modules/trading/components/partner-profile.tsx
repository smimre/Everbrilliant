'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useUIStore } from '@/store';

interface Transaction {
  id: string; product: string; date: string; amount: number;
  status: 'delivered'|'pending'|'approved'|'cancelled';
}
interface Rating {
  id: string; reviewer: string; score: number;
  category: string; comment: string; date: string;
}

const MOCK_PARTNERS = [
  { id:'P-001', name:'تجارت نوین UAE',  country:'UAE',    type:'trading',   email:'info@novintrade.ae', phone:'+971-4-123-4567' },
  { id:'P-002', name:'مهر پارس',        country:'Iran',   type:'trading',   email:'info@mehrpars.ir',  phone:'021-44556677' },
  { id:'P-003', name:'البيان للتجارة',  country:'Kuwait', type:'trading',   email:'info@albayan.kw',   phone:'+965-22334455' },
  { id:'P-004', name:'آلفا لجستیک',    country:'Iran',   type:'logistics', email:'ops@alfa-log.ir',   phone:'021-88779900' },
];

const MOCK_TXS: Record<string, Transaction[]> = {
  'P-001': [
    { id:'REQ-001', product:'گندم — ۵۰۰ تن',      date:'۱۴۰۳/۰۲/۱۵', amount:8500000000, status:'delivered' },
    { id:'REQ-005', product:'روغن پالم — ۲۰۰ تن', date:'۱۴۰۳/۰۳/۱۰', amount:4200000000, status:'delivered' },
    { id:'REQ-009', product:'شکر خام — ۳۰۰ تن',   date:'۱۴۰۳/۰۴/۰۱', amount:5100000000, status:'pending'   },
  ],
  'P-002': [
    { id:'REQ-002', product:'برنج باسماتی — ۱۰۰ تن', date:'۱۴۰۳/۰۱/۲۵', amount:3200000000, status:'delivered' },
    { id:'REQ-006', product:'چای سیلان — ۵۰ تن',    date:'۱۴۰۳/۰۳/۰۵', amount:1800000000, status:'approved'  },
  ],
  'P-003': [
    { id:'REQ-003', product:'نفت خام — ۱۰۰۰ بشکه', date:'۱۴۰۳/۰۱/۱۰', amount:18500000000, status:'delivered' },
  ],
  'P-004': [
    { id:'SHP-001', product:'حمل محموله EB-TRK-10023', date:'۱۴۰۳/۰۳/۲۰', amount:450000000, status:'delivered' },
    { id:'SHP-002', product:'حمل محموله EB-TRK-10025', date:'۱۴۰۳/۰۴/۰۵', amount:380000000, status:'pending'   },
  ],
};

const MOCK_RATINGS: Record<string, Rating[]> = {
  'P-001': [
    { id:'R-001', reviewer:'گروه رضایی',  score:5, category:'delivery',      comment:'بسیار حرفه‌ای، تحویل سر وقت',  date:'۱۴۰۳/۰۳/۱۵' },
    { id:'R-002', reviewer:'تجارت البرز', score:4, category:'quality',        comment:'کیفیت خوب، قیمت مناسب',          date:'۱۴۰۳/۰۲/۲۰' },
  ],
  'P-002': [
    { id:'R-003', reviewer:'گروه رضایی',  score:4, category:'communication', comment:'پاسخگویی سریع',                   date:'۱۴۰۳/۰۲/۰۵' },
  ],
  'P-003': [],
  'P-004': [
    { id:'R-004', reviewer:'گروه رضایی',  score:5, category:'overall',       comment:'خدمات لجستیک عالی',              date:'۱۴۰۳/۰۴/۰۱' },
  ],
};

const CAT_FA: Record<string,string> = { overall:'کلی', quality:'کیفیت کالا', delivery:'تحویل به موقع', communication:'ارتباط', price:'قیمت مناسب' };
const ST_FA:  Record<string,string> = { delivered:'تحویل شد', pending:'در انتظار', approved:'تایید شد', cancelled:'لغو شد' };
const ST_CLR: Record<string,string> = { delivered:'#10b981', pending:'#f59e0b', approved:'#3b82f6', cancelled:'#ef4444' };

function fmtAmt(n: number) {
  if (n >= 1e9) return (n/1e9).toFixed(1) + ' میلیارد';
  if (n >= 1e6) return (n/1e6).toFixed(0) + ' میلیون';
  return n.toLocaleString('fa-IR');
}

const inp = 'w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none';

export function PartnerProfilePage() {
  const { lang } = useLocaleStore();
  const { toast } = useUIStore();
  const fa = lang === 'fa';
  const [selId, setSelId]         = useState('P-001');
  const [ratingsDB, setRatingsDB] = useState(MOCK_RATINGS);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState({ score:0, category:'overall', comment:'' });

  const partner  = MOCK_PARTNERS.find(p => p.id === selId)!;
  const txs      = MOCK_TXS[selId] || [];
  const pRatings = ratingsDB[selId] || [];
  const delivered = txs.filter(t => t.status === 'delivered').length;
  const avgRating = pRatings.length ? +(pRatings.reduce((s,r)=>s+r.score,0)/pRatings.length).toFixed(1) : null;
  const totalVal  = txs.filter(t=>t.status==='delivered').reduce((s,t)=>s+t.amount,0);
  const trust     = Math.min(100, Math.round(delivered*22 + (avgRating||0)*8));
  const trustClr  = trust>=70?'#10b981':trust>=40?'#f59e0b':'#ef4444';

  function submitRating() {
    if (!form.score) { toast('error', fa?'امتیاز را انتخاب کنید':'Select a score'); return; }
    const r: Rating = { id:'R-'+Date.now(), reviewer:'شرکت من', score:form.score, category:form.category, comment:form.comment, date:'۱۴۰۳/۰۴/۱۵' };
    setRatingsDB(prev => ({ ...prev, [selId]: [...(prev[selId]||[]), r] }));
    setForm({ score:0, category:'overall', comment:'' });
    setShowModal(false);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">🤝 {fa?'پروفایل شرکاء':'Partner Profiles'}</h1>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{fa?'تاریخچه، امتیاز اعتماد و ارزیابی شرکاء':'History, trust score and partner reviews'}</p>
      </div>

      {/* Partner tabs */}
      <div className="flex gap-2 flex-wrap">
        {MOCK_PARTNERS.map(p => (
          <button key={p.id} onClick={()=>setSelId(p.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${selId===p.id?'bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))]':'border-[hsl(var(--border))] bg-[hsl(var(--secondary))] hover:border-[hsl(var(--primary)/0.3)]'}`}>
            {p.type==='logistics'?'🚛':'🏢'} {p.name}
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-blue-500/15 flex items-center justify-center text-3xl shrink-0">
              {partner.type==='logistics'?'🚛':'🏢'}
            </div>
            <div>
              <h2 className="font-bold text-lg">{partner.name}</h2>
              <div className="text-xs text-[hsl(var(--muted-foreground))]">
                {partner.type==='logistics'?(fa?'شرکت حمل‌ونقل':'Logistics Company'):(fa?'شرکت بازرگانی':'Trading Company')} · {partner.country}
              </div>
              {avgRating!==null && (
                <div className="flex items-center gap-1 mt-1">
                  {[1,2,3,4,5].map(i=><span key={i} className="text-sm">{i<=Math.round(avgRating)?'⭐':'☆'}</span>)}
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">{avgRating}/5 ({pRatings.length} {fa?'نظر':'reviews'})</span>
                </div>
              )}
            </div>
          </div>
          <div className="text-center shrink-0">
            <div className="text-3xl font-black" style={{color:trustClr}}>{trust}</div>
            <div className="text-[10px] text-[hsl(var(--muted-foreground))]">{fa?'امتیاز اعتماد':'Trust Score'}</div>
            <div className="w-16 h-1.5 bg-[hsl(var(--muted))] rounded-full mt-1 mx-auto">
              <div className="h-full rounded-full" style={{width:`${trust}%`,background:trustClr}}/>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="flex gap-4 flex-wrap mb-4 text-xs text-[hsl(var(--muted-foreground))]">
          {partner.email && <span>📧 {partner.email}</span>}
          {partner.phone && <span>📞 {partner.phone}</span>}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            ['📋', fa?'معاملات':'Transactions', txs.length],
            ['✅', fa?'تحویل موفق':'Delivered',    delivered],
            ['💰', fa?'ارزش کل':'Total Value',    fmtAmt(totalVal)+' ﷼'],
            ['⭐', fa?'میانگین امتیاز':'Avg Rating', avgRating?avgRating+'/5':'—'],
          ].map(([icon,label,val])=>(
            <div key={label as string} className="bg-[hsl(var(--muted)/0.3)] rounded-lg p-3 text-center">
              <div className="text-lg">{icon}</div>
              <div className="font-bold text-sm">{val}</div>
              <div className="text-[10px] text-[hsl(var(--muted-foreground))]">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
        <h3 className="font-semibold text-sm mb-3">📋 {fa?'آخرین معاملات':'Recent Transactions'}</h3>
        {txs.length===0
          ? <div className="text-center py-8 text-[hsl(var(--muted-foreground))] text-sm"><p className="text-3xl mb-2">📋</p><p>{fa?'معامله‌ای ثبت نشده':'No transactions'}</p></div>
          : <div className="space-y-2">
              {txs.map(t=>(
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--muted)/0.3)]"
                  style={{borderRight:`3px solid ${ST_CLR[t.status]}`}}>
                  <div>
                    <div className="font-semibold text-sm">{t.product}</div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))]">📅 {t.date} · {t.id}</div>
                  </div>
                  <div className="text-end">
                    {t.amount>0 && <div className="text-sm font-bold">{fmtAmt(t.amount)} ﷼</div>}
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{background:ST_CLR[t.status]+'20',color:ST_CLR[t.status]}}>
                      {fa?ST_FA[t.status]:t.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
        }
      </div>

      {/* Ratings */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">⭐ {fa?'ارزیابی‌ها':'Reviews'}</h3>
          <button onClick={()=>setShowModal(true)} className="text-xs px-3 py-1.5 rounded-lg bg-[hsl(var(--primary))] text-white">
            + {fa?'نظر جدید':'New Review'}
          </button>
        </div>
        {pRatings.length===0
          ? <div className="text-center py-8 text-[hsl(var(--muted-foreground))] text-sm"><p className="text-3xl mb-2">⭐</p><p>{fa?'ارزیابی‌ای ثبت نشده':'No reviews yet'}</p></div>
          : <div className="space-y-2">
              {pRatings.map(r=>(
                <div key={r.id} className="p-3 rounded-lg bg-[hsl(var(--muted)/0.3)]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">{r.reviewer}</span>
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(i=><span key={i} className="text-xs">{i<=r.score?'⭐':'☆'}</span>)}
                      <span className="text-[10px] text-[hsl(var(--muted-foreground))] mr-1">{r.date}</span>
                    </div>
                  </div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">
                    <span className="px-1.5 py-0.5 rounded-full bg-[hsl(var(--muted)/0.5)] mr-1">{CAT_FA[r.category]||r.category}</span>
                    {r.comment}
                  </div>
                </div>
              ))}
            </div>
        }
      </div>

      {/* Rating modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-sm p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">⭐ {fa?'ثبت ارزیابی':'Submit Review'}</h3>
              <button onClick={()=>setShowModal(false)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'امتیاز':'Score'}</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(i=>(
                    <button key={i} onClick={()=>setForm(f=>({...f,score:i}))}
                      className={`w-9 h-9 rounded-full border-2 text-lg transition-all ${form.score>=i?'border-yellow-400 bg-yellow-400/15':'border-[hsl(var(--border))]'}`}>
                      {form.score>=i?'⭐':'☆'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'نوع ارزیابی':'Category'}</label>
                <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} className={inp}>
                  {Object.entries(CAT_FA).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'نظر':'Comment'}</label>
                <textarea value={form.comment} onChange={e=>setForm(f=>({...f,comment:e.target.value}))}
                  rows={3} className={inp+' resize-none'} placeholder={fa?'تجربه خود را بنویسید...':'Share your experience...'}/>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={()=>setShowModal(false)} className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa?'انصراف':'Cancel'}</button>
              <button onClick={submitRating} className="flex-1 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">⭐ {fa?'ثبت':'Submit'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
