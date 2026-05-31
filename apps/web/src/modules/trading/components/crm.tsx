'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useRequests } from '@/hooks/use-trading';

const FOLLOWUP_TYPES = [
  { id: 'call', icon: '📞', label: 'تماس تلفنی', en: 'Phone Call' },
  { id: 'email', icon: '📧', label: 'ایمیل', en: 'Email' },
  { id: 'meeting', icon: '🤝', label: 'جلسه', en: 'Meeting' },
  { id: 'whatsapp', icon: '💬', label: 'واتساپ', en: 'WhatsApp' },
  { id: 'visit', icon: '🏢', label: 'بازدید حضوری', en: 'Site Visit' },
  { id: 'note', icon: '📝', label: 'یادداشت', en: 'Note' },
];

const STAGES = [
  { key: 'pending', icon: '⏳', label: 'در انتظار', en: 'Pending', color: '#f59e0b' },
  { key: 'quoted', icon: '💬', label: 'قیمت داده', en: 'Quoted', color: '#3b82f6' },
  { key: 'approved', icon: '✅', label: 'تایید شده', en: 'Approved', color: '#8b5cf6' },
  { key: 'paid', icon: '💳', label: 'پرداخت شده', en: 'Paid', color: '#06b6d4' },
  { key: 'completed', icon: '🏆', label: 'تکمیل شده', en: 'Completed', color: '#10b981' },
];

export function CRMPage() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const { data: rawRequests = [] } = useRequests();
  const requests = (rawRequests as any[]) || [];

  const [tab, setTab] = useState<'pipeline'|'schedule'|'list'>('pipeline');
  const [reqFilter, setReqFilter] = useState('all');
  const [showActivity, setShowActivity] = useState<any>(null);
  const [actType, setActType] = useState('call');
  const [actNote, setActNote] = useState('');

  const open = requests.filter((r: any) => !['completed','rejected','cancelled'].includes(r.status));
  const won = requests.filter((r: any) => ['completed','paid'].includes(r.status));
  const convRate = requests.length ? Math.round(won.length / requests.length * 100) : 0;
  const pipeline = open.reduce((s: number, r: any) => s + (r.amountIRR || 0), 0);
  const overdueFollowups = 0;
  const todayFollowups = 0;

  const tabs = [
    { id: 'pipeline', icon: '📊', label: fa ? 'پایپ‌لاین' : 'Pipeline' },
    { id: 'schedule', icon: '🔔', label: fa ? 'پیگیری‌ها' : 'Follow-ups' },
    { id: 'list', icon: '📋', label: fa ? 'فرصت‌ها' : 'Deals' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">🎯 {fa ? 'مدیریت مشتریان' : 'CRM'}</h1>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { icon: '⚠️', val: overdueFollowups, label: fa ? 'پیگیری عقب‌افتاده' : 'Overdue', color: '#ef4444' },
          { icon: '📅', val: todayFollowups, label: fa ? 'پیگیری امروز' : "Today's", color: '#f59e0b' },
          { icon: '📋', val: open.length, label: fa ? 'فرصت‌های باز' : 'Open Deals', color: '#3b82f6' },
          { icon: '📈', val: convRate + '%', label: fa ? 'نرخ تبدیل' : 'Conv. Rate', color: '#10b981' },
          { icon: '💰', val: pipeline > 0 ? `${(pipeline / 1e9).toFixed(1)}B` : '0', label: fa ? 'ارزش پایپ‌لاین' : 'Pipeline', color: '#8b5cf6' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-3 text-center">
            <div className="text-lg mb-1">{s.icon}</div>
            <div className="text-lg font-bold" style={{ color: s.color }}>{s.val}</div>
            <div className="text-[10px] text-[hsl(var(--muted-foreground))] leading-tight">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Alert banners */}
      {overdueFollowups > 0 && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
          ⚠️ <strong>{overdueFollowups}</strong> {fa ? 'پیگیری عقب‌افتاده دارید!' : 'overdue follow-ups!'}
        </div>
      )}
      {todayFollowups > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-600">
          📅 <strong>{todayFollowups}</strong> {fa ? 'پیگیری برای امروز' : 'follow-ups today'}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[hsl(var(--border))]">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id
                ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]'
                : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Pipeline Kanban */}
      {tab === 'pipeline' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {STAGES.map(stage => {
            const items = requests.filter((r: any) => r.status === stage.key);
            const stageValue = items.reduce((s: number, r: any) => s + (r.amountIRR || 0), 0);
            return (
              <div key={stage.key} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] overflow-hidden">
                <div className="p-3" style={{ background: stage.color + '12', borderBottom: `2px solid ${stage.color}30` }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span>{stage.icon}</span>
                    <span className="text-xs font-semibold">{fa ? stage.label : stage.en}</span>
                  </div>
                  <div className="text-2xl font-bold" style={{ color: stage.color }}>{items.length}</div>
                  {stageValue > 0 && (
                    <div className="text-[10px] text-[hsl(var(--muted-foreground))]">{(stageValue / 1e6).toFixed(0)}M IRR</div>
                  )}
                </div>
                <div className="p-2 space-y-1.5 max-h-64 overflow-y-auto">
                  {items.length === 0 ? (
                    <div className="text-center py-4 text-[10px] text-[hsl(var(--muted-foreground))]">
                      {fa ? 'موردی نیست' : 'Empty'}
                    </div>
                  ) : (
                    items.slice(0, 3).map((r: any) => (
                      <button
                        key={r.id}
                        onClick={() => setShowActivity(r)}
                        className="w-full text-start p-2 rounded-lg text-xs bg-[hsl(var(--background))] border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)] transition-colors"
                      >
                        <div className="font-medium truncate">{r.productName || r.title}</div>
                        {r.amountIRR && <div style={{ color: stage.color }} className="font-semibold mt-0.5">{(r.amountIRR/1e6).toFixed(0)}M</div>}
                      </button>
                    ))
                  )}
                  {items.length > 3 && (
                    <div className="text-center text-[10px] text-[hsl(var(--muted-foreground))] pt-1">
                      +{items.length - 3} {fa ? 'مورد دیگر' : 'more'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Follow-ups Schedule */}
      {tab === 'schedule' && (
        <div className="space-y-3">
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm">📅 {fa ? 'برنامه امروز' : "Today's Schedule"}</h2>
              <button className="text-xs px-3 py-1.5 rounded-lg bg-[hsl(var(--primary))] text-white">
                ➕ {fa ? 'ثبت فعالیت' : 'Log Activity'}
              </button>
            </div>
            <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-sm">{fa ? 'پیگیری برنامه‌ریزی‌شده‌ای وجود ندارد' : 'No follow-ups scheduled'}</p>
            </div>
          </div>

          {/* Followup type reference */}
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
            <h2 className="font-semibold text-sm mb-3">🔖 {fa ? 'انواع فعالیت' : 'Activity Types'}</h2>
            <div className="grid grid-cols-3 gap-2">
              {FOLLOWUP_TYPES.map(f => (
                <div key={f.id} className="flex items-center gap-2 p-2 rounded-lg bg-[hsl(var(--muted)/0.3)] text-xs">
                  <span className="text-base">{f.icon}</span>
                  <span>{fa ? f.label : f.en}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Deals List */}
      {tab === 'list' && (
        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            {['all','pending','quoted','approved'].map(s => (
              <button
                key={s}
                onClick={() => setReqFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  reqFilter === s
                    ? 'bg-[hsl(var(--primary))] text-white'
                    : 'bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'
                }`}
              >
                {s === 'all' ? (fa ? 'همه' : 'All') : s === 'pending' ? (fa ? 'در انتظار' : 'Pending') : s === 'quoted' ? (fa ? 'قیمت داده' : 'Quoted') : (fa ? 'تایید شده' : 'Approved')}
              </button>
            ))}
          </div>
          {open.length === 0 ? (
            <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">
              <div className="text-4xl mb-3">🎯</div>
              <p className="font-medium">{fa ? 'فرصت تجاری‌ای در پایپ‌لاین نیست' : 'No deals in pipeline'}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {open
                .filter((r: any) => reqFilter === 'all' || r.status === reqFilter)
                .map((r: any) => {
                  const stage = STAGES.find(s => s.key === r.status);
                  const color = stage?.color || '#64748b';
                  return (
                    <div
                      key={r.id}
                      className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-3 hover:border-[hsl(var(--primary)/0.3)] transition-colors cursor-pointer"
                      style={{ borderRight: `3px solid ${color}` }}
                      onClick={() => setShowActivity(r)}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{r.productName || r.title}</div>
                          <div className="flex gap-3 text-xs text-[hsl(var(--muted-foreground))] mt-0.5 flex-wrap">
                            {r.createdAt && <span>📅 {r.createdAt}</span>}
                            {r.amountIRR && <span style={{ color }} className="font-semibold">💰 {(r.amountIRR/1e6).toFixed(0)}M IRR</span>}
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={e => { e.stopPropagation(); setShowActivity(r); }}
                            className="text-xs px-2 py-1 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.5)]"
                          >
                            📋 {fa ? 'پرونده' : 'File'}
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); setShowActivity(r); }}
                            className="text-xs px-2 py-1 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.5)]"
                          >
                            ➕ {fa ? 'فعالیت' : 'Activity'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* CRM File / Activity Modal */}
      {showActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-lg p-6 shadow-2xl my-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">🎯 {showActivity.productName || showActivity.title}</h2>
              <button onClick={() => setShowActivity(null)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>

            {/* Progress bar */}
            <div className="mb-5">
              <div className="flex items-center gap-1 mb-2">
                {STAGES.map((s, i) => {
                  const idx = STAGES.findIndex(st => st.key === showActivity.status);
                  const done = i <= idx;
                  return (
                    <div key={s.key} className="flex items-center flex-1">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0"
                        style={{ background: done ? s.color : 'hsl(var(--muted))', color: done ? '#fff' : 'hsl(var(--muted-foreground))' }}>
                        {done ? '✓' : i + 1}
                      </div>
                      {i < STAGES.length - 1 && (
                        <div className="h-0.5 flex-1 mx-1" style={{ background: done ? s.color : 'hsl(var(--muted))' }} />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[9px] text-[hsl(var(--muted-foreground))]">
                {STAGES.map(s => <span key={s.key}>{fa ? s.label : s.en}</span>)}
              </div>
            </div>

            {/* Log activity */}
            <div className="space-y-3 border border-[hsl(var(--border))] rounded-xl p-4">
              <h3 className="font-semibold text-sm">➕ {fa ? 'ثبت فعالیت' : 'Log Activity'}</h3>
              <div>
                <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'نوع فعالیت' : 'Activity Type'}</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {FOLLOWUP_TYPES.map(f => (
                    <button
                      key={f.id}
                      onClick={() => setActType(f.id)}
                      className={`px-2 py-1.5 rounded-lg text-xs border transition-all ${
                        actType === f.id
                          ? 'bg-[hsl(var(--primary))] text-white border-transparent'
                          : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.5)]'
                      }`}
                    >
                      {f.icon} {fa ? f.label : f.en}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'یادداشت' : 'Note'}</label>
                <textarea
                  value={actNote}
                  onChange={e => setActNote(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none resize-none"
                  placeholder={fa ? 'خلاصه مکالمه یا اقدام...' : 'Summary of call or action...'}
                />
              </div>
              <button
                onClick={() => { alert(fa ? 'فعالیت ثبت شد ✅' : 'Activity logged ✅'); setActNote(''); setShowActivity(null); }}
                className="w-full py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium"
              >
                ✅ {fa ? 'ثبت فعالیت' : 'Log Activity'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
