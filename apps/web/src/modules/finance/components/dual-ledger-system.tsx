'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';

// ── Types ─────────────────────────────────────────────────────
type BookType = 'legal' | 'real';

interface Book {
  id: BookType;
  label: string;
  labelFa: string;
  icon: string;
  color: string;
  description: string;
  descriptionFa: string;
  warning?: string;
  warningFa?: string;
}

const BOOKS: Book[] = [
  {
    id: 'legal',
    label: 'Legal Book',
    labelFa: 'دفتر قانونی',
    icon: '⚖️',
    color: '#3b82f6',
    description: 'Submitted to Tax Authority (IRIB / Modiyan)',
    descriptionFa: 'ارائه به سازمان مالیاتی — سامانه مودیان',
    warning: 'This book is submitted to tax authorities. Only verified entries.',
    warningFa: 'این دفتر به اداره مالیات ارائه می‌شود. فقط اسناد تأیید شده.'
  },
  {
    id: 'real',
    label: 'Internal Book',
    labelFa: 'دفتر واقعی',
    icon: '🔒',
    color: '#8b5cf6',
    description: 'Internal accounting — full picture',
    descriptionFa: 'حسابداری داخلی — تصویر کامل واقعی',
    warning: 'Private & confidential. Never shared externally.',
    warningFa: 'محرمانه — هرگز به خارج از شرکت ارائه نمی‌شود.'
  }
];

interface JournalEntry {
  id: string;
  no: string;
  date: string;
  description: string;
  ref?: string;
  book: BookType;
  rows: { account: string; accountName: string; debit: number; credit: number; note?: string }[];
  status: 'draft' | 'posted' | 'approved';
  createdBy?: string;
}

export function DualLedgerSystem() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const [activeBook, setActiveBook] = useState<BookType>('legal');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [tab, setTab] = useState<'journal'|'ledger'|'trial'|'settings'>('journal');

  const book = BOOKS.find(b => b.id === activeBook)!;
  const bookEntries = entries.filter(e => e.book === activeBook);

  const legalEntries = entries.filter(e => e.book === 'legal');
  const realEntries = entries.filter(e => e.book === 'real');

  // محاسبه اختلاف بین دو دفتر
  const legalTotal = legalEntries.reduce((s, e) => s + e.rows.reduce((rs, r) => rs + r.debit, 0), 0);
  const realTotal = realEntries.reduce((s, e) => s + e.rows.reduce((rs, r) => rs + r.debit, 0), 0);
  const diff = realTotal - legalTotal;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">📚 {fa ? 'سیستم دفتر دوگانه' : 'Dual-Book Accounting'}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {fa ? 'مدیریت دفتر قانونی و دفتر واقعی به صورت جداگانه' : 'Manage legal and internal books separately'}
          </p>
        </div>
        <button onClick={() => setShowDiff(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted)/0.5)]">
          🔍 {fa ? 'مقایسه دو دفتر' : 'Compare Books'}
        </button>
      </div>

      {/* Book Selector */}
      <div className="grid grid-cols-2 gap-3">
        {BOOKS.map(b => (
          <button key={b.id} onClick={() => setActiveBook(b.id)}
            className={`rounded-xl border-2 p-4 text-start transition-all ${
              activeBook === b.id
                ? 'shadow-lg'
                : 'border-[hsl(var(--border))] bg-[hsl(var(--secondary))] hover:border-opacity-50'
            }`}
            style={activeBook === b.id ? { borderColor: b.color, background: b.color + '08' } : {}}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{b.icon}</span>
              <div>
                <div className="font-bold text-sm">{fa ? b.labelFa : b.label}</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">{fa ? b.descriptionFa : b.description}</div>
              </div>
              {activeBook === b.id && (
                <span className="ms-auto text-xs px-2 py-0.5 rounded-full text-white font-medium" style={{ background: b.color }}>
                  {fa ? 'فعال' : 'Active'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
              <span>📋 {entries.filter(e => e.book === b.id).length} {fa ? 'سند' : 'entries'}</span>
              <span>✅ {entries.filter(e => e.book === b.id && e.status === 'posted').length} {fa ? 'ثبت شده' : 'posted'}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Warning Banner */}
      <div className="rounded-xl p-3 text-xs flex items-start gap-2"
        style={{ background: book.color + '10', borderColor: book.color + '40', border: '1px solid' }}>
        <span style={{ color: book.color }}>{book.id === 'real' ? '🔒' : '⚖️'}</span>
        <span style={{ color: book.color }}>{fa ? book.warningFa : book.warning}</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[hsl(var(--border))]">
        {[
          { id: 'journal', label: fa?'📒 روزنامه':'📒 Journal' },
          { id: 'ledger',  label: fa?'📔 دفتر کل':'📔 Ledger' },
          { id: 'trial',   label: fa?'⚖️ تراز آزمایشی':'⚖️ Trial Balance' },
          { id: 'settings',label: fa?'⚙️ تنظیمات':'⚙️ Settings' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]' : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Journal Tab */}
      {tab === 'journal' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[hsl(var(--muted-foreground))]">
              {bookEntries.length} {fa ? 'سند در' : 'entries in'} {fa ? book.labelFa : book.label}
            </span>
            <button onClick={() => setShowNew(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ background: book.color }}>
              ➕ {fa ? 'سند جدید' : 'New Entry'}
            </button>
          </div>

          {bookEntries.length === 0 ? (
            <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">
              <div className="text-4xl mb-3">{book.icon}</div>
              <p className="font-medium">{fa ? `هنوز سندی در ${book.labelFa} ثبت نشده` : `No entries in ${book.label} yet`}</p>
              <button onClick={() => setShowNew(true)} className="mt-4 px-4 py-2 rounded-lg text-white text-sm" style={{ background: book.color }}>
                {fa ? '+ ثبت اولین سند' : '+ Add First Entry'}
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[hsl(var(--muted)/0.5)]">
                  <tr>
                    {[fa?'شماره':'No.', fa?'تاریخ':'Date', fa?'شرح':'Description',
                      fa?'بدهکار':'Debit', fa?'بستانکار':'Credit', fa?'وضعیت':'Status'].map(h => (
                      <th key={h} className="text-start px-4 py-3 text-xs font-semibold text-[hsl(var(--muted-foreground))]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookEntries.map(e => {
                    const totalDr = e.rows.reduce((s, r) => s + r.debit, 0);
                    const totalCr = e.rows.reduce((s, r) => s + r.credit, 0);
                    const statusColors = { draft: '#94a3b8', posted: '#10b981', approved: '#3b82f6' };
                    const statusLabels = { draft: fa?'پیش‌نویس':'Draft', posted: fa?'ثبت شده':'Posted', approved: fa?'تأیید شده':'Approved' };
                    return (
                      <tr key={e.id} className="border-t border-[hsl(var(--border)/0.5)] hover:bg-[hsl(var(--muted)/0.3)]">
                        <td className="px-4 py-3 font-mono font-bold text-xs">{e.no}</td>
                        <td className="px-4 py-3">{e.date}</td>
                        <td className="px-4 py-3">{e.description}</td>
                        <td className="px-4 py-3 text-green-600">{totalDr.toLocaleString('fa-IR')}</td>
                        <td className="px-4 py-3 text-red-500">{totalCr.toLocaleString('fa-IR')}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: statusColors[e.status]+'20', color: statusColors[e.status] }}>
                            {statusLabels[e.status]}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Ledger Tab */}
      {tab === 'ledger' && (
        <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">
          <div className="text-4xl mb-3">📔</div>
          <p className="font-medium">{fa ? 'دفتر کل برای ' + book.labelFa : 'Ledger for ' + book.label}</p>
          <p className="text-sm mt-1">{fa ? 'پس از ثبت اسناد، دفتر کل به‌طور خودکار تولید می‌شود' : 'Ledger is auto-generated from journal entries'}</p>
        </div>
      )}

      {/* Trial Balance Tab */}
      {tab === 'trial' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-[hsl(var(--border))] p-4 bg-[hsl(var(--secondary))]">
            <div className="text-sm font-semibold mb-3">⚖️ {fa ? 'تراز آزمایشی' : 'Trial Balance'} — {fa ? book.labelFa : book.label}</div>
            {bookEntries.length === 0 ? (
              <div className="text-center py-6 text-[hsl(var(--muted-foreground))] text-sm">{fa ? 'سندی برای تراز وجود ندارد' : 'No entries to balance'}</div>
            ) : (
              <div className="text-center text-green-600 py-4">
                <div className="text-2xl mb-1">✅</div>
                <div className="font-medium">{fa ? 'حساب‌ها تراز هستند' : 'Accounts are balanced'}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {tab === 'settings' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
            <h3 className="font-semibold mb-4">⚙️ {fa ? 'تنظیمات دفتر دوگانه' : 'Dual-Book Settings'}</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-lg border border-[hsl(var(--border))] cursor-pointer hover:bg-[hsl(var(--muted)/0.3)]">
                <div>
                  <div className="text-sm font-medium">{fa ? 'قفل دفتر قانونی' : 'Lock Legal Book'}</div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">{fa ? 'نیاز به تأیید مدیر برای ویرایش' : 'Require manager approval to edit'}</div>
                </div>
                <input type="checkbox" className="w-4 h-4" defaultChecked />
              </label>
              <label className="flex items-center justify-between p-3 rounded-lg border border-[hsl(var(--border))] cursor-pointer hover:bg-[hsl(var(--muted)/0.3)]">
                <div>
                  <div className="text-sm font-medium">{fa ? 'دسترسی محدود به دفتر واقعی' : 'Restrict Real Book Access'}</div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">{fa ? 'فقط مدیر مالی و مدیرعامل' : 'Only CFO and CEO'}</div>
                </div>
                <input type="checkbox" className="w-4 h-4" defaultChecked />
              </label>
              <label className="flex items-center justify-between p-3 rounded-lg border border-[hsl(var(--border))] cursor-pointer hover:bg-[hsl(var(--muted)/0.3)]">
                <div>
                  <div className="text-sm font-medium">{fa ? 'هشدار اختلاف دفاتر' : 'Difference Alert'}</div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">{fa ? 'اعلان هنگام وجود اختلاف بین دو دفتر' : 'Alert when books diverge'}</div>
                </div>
                <input type="checkbox" className="w-4 h-4" defaultChecked />
              </label>
              <label className="flex items-center justify-between p-3 rounded-lg border border-[hsl(var(--border))] cursor-pointer hover:bg-[hsl(var(--muted)/0.3)]">
                <div>
                  <div className="text-sm font-medium">{fa ? 'گزارش‌گیری جداگانه' : 'Separate Reporting'}</div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">{fa ? 'گزارشات مالی برای هر دفتر به صورت مجزا' : 'Separate financial reports per book'}</div>
                </div>
                <input type="checkbox" className="w-4 h-4" defaultChecked />
              </label>
            </div>
          </div>

          {/* Access Control */}
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
            <h3 className="font-semibold mb-4">🔐 {fa ? 'کنترل دسترسی' : 'Access Control'}</h3>
            <div className="space-y-2 text-sm">
              {[
                { role: fa?'مدیرعامل':'CEO', legal: true, real: true, color: '#10b981' },
                { role: fa?'مدیر مالی (CFO)':'CFO', legal: true, real: true, color: '#10b981' },
                { role: fa?'حسابدار ارشد':'Senior Accountant', legal: true, real: false, color: '#f59e0b' },
                { role: fa?'حسابدار':'Accountant', legal: true, real: false, color: '#f59e0b' },
                { role: fa?'بازرس/حسابرس':'Auditor', legal: true, real: false, color: '#3b82f6' },
                { role: fa?'سایر کارکنان':'Other Staff', legal: false, real: false, color: '#ef4444' },
              ].map((r, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg border border-[hsl(var(--border)/0.5)]">
                  <span className="font-medium">{r.role}</span>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs flex items-center gap-1 ${r.legal ? 'text-green-600' : 'text-red-400'}`}>
                      {r.legal ? '✅' : '❌'} {fa ? 'دفتر قانونی' : 'Legal'}
                    </span>
                    <span className={`text-xs flex items-center gap-1 ${r.real ? 'text-green-600' : 'text-red-400'}`}>
                      {r.real ? '✅' : '❌'} {fa ? 'دفتر واقعی' : 'Real'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* New Entry Modal */}
      {showNew && (
        <NewEntryModal
          lang={lang}
          bookType={activeBook}
          book={book}
          onClose={() => setShowNew(false)}
          onSave={(entry) => { setEntries([...entries, entry]); setShowNew(false); }}
        />
      )}

      {/* Diff Modal */}
      {showDiff && (
        <DiffModal
          lang={lang}
          legalEntries={legalEntries}
          realEntries={realEntries}
          diff={diff}
          onClose={() => setShowDiff(false)}
        />
      )}
    </div>
  );
}

// ── New Entry Modal ───────────────────────────────────────────
function NewEntryModal({ lang, bookType, book, onClose, onSave }: {
  lang: string; bookType: BookType; book: Book;
  onClose: () => void; onSave: (entry: JournalEntry) => void;
}) {
  const fa = lang === 'fa';
  const [date, setDate] = useState('');
  const [desc, setDesc] = useState('');
  const [ref, setRef] = useState('');
  const [rows, setRows] = useState([
    { account: '', accountName: '', debit: 0, credit: 0, note: '' },
    { account: '', accountName: '', debit: 0, credit: 0, note: '' },
  ]);

  const totalDr = rows.reduce((s, r) => s + (Number(r.debit) || 0), 0);
  const totalCr = rows.reduce((s, r) => s + (Number(r.credit) || 0), 0);
  const balanced = totalDr === totalCr && totalDr > 0;
  const inp = "w-full px-2 py-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary)/0.3)]";

  const handleSave = (status: 'draft' | 'posted') => {
    const entry: JournalEntry = {
      id: String(Date.now()),
      no: `${bookType === 'legal' ? 'L' : 'R'}-${String(Date.now()).slice(-6)}`,
      date, description: desc, ref, book: bookType,
      rows: rows.map(r => ({ ...r, debit: Number(r.debit), credit: Number(r.credit) })),
      status,
    };
    onSave(entry);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[hsl(var(--secondary))] rounded-2xl border-2 w-full max-w-3xl p-6 shadow-2xl my-4" style={{ borderColor: book.color }}>
        <div className="flex items-center gap-3 mb-5">
          <span className="text-2xl">{book.icon}</span>
          <div>
            <h2 className="font-bold text-lg">{fa ? 'سند جدید' : 'New Entry'} — {fa ? book.labelFa : book.label}</h2>
            <p className="text-xs text-[hsl(var(--muted-foreground))]" style={{ color: book.color }}>{fa ? book.warningFa : book.warning}</p>
          </div>
          <button onClick={onClose} className="ms-auto text-xl text-[hsl(var(--muted-foreground))]">✕</button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">📅 {fa?'تاریخ *':'Date *'}</label>
            <input value={date} onChange={e => setDate(e.target.value)} className={inp} placeholder="1403/06/15" />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'شرح سند *':'Description *'}</label>
            <input value={desc} onChange={e => setDesc(e.target.value)} className={inp} />
          </div>
        </div>

        <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden mb-3">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: book.color + '15' }}>
                {[fa?'کد حساب':'Acc.Code', fa?'نام حساب':'Account Name', fa?'شرح ردیف':'Row Desc',
                  fa?'بدهکار':'Debit', fa?'بستانکار':'Credit', ''].map((h, i) => (
                  <th key={i} className="text-start px-3 py-2 font-semibold text-[hsl(var(--muted-foreground))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-t border-[hsl(var(--border)/0.5)]">
                  <td className="px-2 py-1"><input value={row.account} onChange={e => { const r=[...rows];r[i].account=e.target.value;setRows(r); }} className={inp+" w-20"} placeholder="1100" /></td>
                  <td className="px-2 py-1"><input value={row.accountName} onChange={e => { const r=[...rows];r[i].accountName=e.target.value;setRows(r); }} className={inp+" min-w-[120px]"} /></td>
                  <td className="px-2 py-1"><input value={row.note||''} onChange={e => { const r=[...rows];r[i].note=e.target.value;setRows(r); }} className={inp} /></td>
                  <td className="px-2 py-1">
                    <input type="number" value={row.debit||''} onChange={e => { const r=[...rows];r[i].debit=Number(e.target.value);r[i].credit=0;setRows(r); }} className={inp+" w-28 text-green-600"} />
                  </td>
                  <td className="px-2 py-1">
                    <input type="number" value={row.credit||''} onChange={e => { const r=[...rows];r[i].credit=Number(e.target.value);r[i].debit=0;setRows(r); }} className={inp+" w-28 text-red-500"} />
                  </td>
                  <td className="px-2 py-1">
                    {rows.length > 2 && <button onClick={() => setRows(rows.filter((_,j)=>j!==i))} className="text-red-500 hover:opacity-70 px-1">✕</button>}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot style={{ background: book.color + '08' }}>
              <tr>
                <td colSpan={3} className="px-3 py-2 text-xs font-bold">{fa?'جمع کل:':'Total:'}</td>
                <td className="px-3 py-2 text-sm font-bold text-green-600">{totalDr.toLocaleString('fa-IR')}</td>
                <td className="px-3 py-2 text-sm font-bold text-red-500">{totalCr.toLocaleString('fa-IR')}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>

        <button onClick={() => setRows([...rows, { account:'', accountName:'', debit:0, credit:0, note:'' }])}
          className="text-sm hover:underline mb-4 block" style={{ color: book.color }}>
          ➕ {fa?'افزودن ردیف':'Add Row'}
        </button>

        {!balanced && totalDr > 0 && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-500 mb-3">
            ⚠️ {fa ? `سند ترازمند نیست! اختلاف: ${Math.abs(totalDr-totalCr).toLocaleString('fa-IR')} ریال` : `Not balanced! Difference: ${Math.abs(totalDr-totalCr).toLocaleString()}`}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa?'انصراف':'Cancel'}</button>
          <button onClick={() => handleSave('draft')} className="px-4 py-2 rounded-lg border text-sm" style={{ borderColor: book.color, color: book.color }}>
            💾 {fa?'پیش‌نویس':'Draft'}
          </button>
          <button onClick={() => handleSave('posted')} disabled={!balanced}
            className="flex-1 px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50"
            style={{ background: balanced ? book.color : undefined }}>
            ✅ {fa?'ثبت سند':'Post Entry'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Diff Modal ────────────────────────────────────────────────
function DiffModal({ lang, legalEntries, realEntries, diff, onClose }: {
  lang: string; legalEntries: JournalEntry[]; realEntries: JournalEntry[]; diff: number; onClose: () => void;
}) {
  const fa = lang === 'fa';
  const legalTotal = legalEntries.reduce((s, e) => s + e.rows.reduce((rs, r) => rs + r.debit, 0), 0);
  const realTotal = realEntries.reduce((s, e) => s + e.rows.reduce((rs, r) => rs + r.debit, 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-lg p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg">🔍 {fa ? 'مقایسه دو دفتر' : 'Compare Books'}</h2>
          <button onClick={onClose} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 text-center">
            <div className="text-2xl mb-2">⚖️</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mb-1">{fa?'دفتر قانونی':'Legal Book'}</div>
            <div className="text-lg font-bold text-blue-600">{legalTotal.toLocaleString('fa-IR')}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{legalEntries.length} {fa?'سند':'entries'}</div>
          </div>
          <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4 text-center">
            <div className="text-2xl mb-2">🔒</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mb-1">{fa?'دفتر واقعی':'Internal Book'}</div>
            <div className="text-lg font-bold text-purple-600">{realTotal.toLocaleString('fa-IR')}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{realEntries.length} {fa?'سند':'entries'}</div>
          </div>
        </div>

        <div className={`rounded-xl p-4 text-center ${diff === 0 ? 'bg-green-500/10 border border-green-500/30' : 'bg-amber-500/10 border border-amber-500/30'}`}>
          <div className="text-2xl mb-1">{diff === 0 ? '✅' : '⚠️'}</div>
          <div className={`font-bold text-sm ${diff === 0 ? 'text-green-600' : 'text-amber-600'}`}>
            {diff === 0
              ? (fa ? 'دو دفتر کاملاً یکسان هستند' : 'Both books are identical')
              : (fa ? `اختلاف: ${Math.abs(diff).toLocaleString('fa-IR')} ریال` : `Difference: ${Math.abs(diff).toLocaleString()}`)
            }
          </div>
          {diff !== 0 && (
            <div className="text-xs text-amber-600 mt-1">
              {fa ? (diff > 0 ? 'دفتر واقعی بیشتر از دفتر قانونی است' : 'دفتر قانونی بیشتر از دفتر واقعی است') : (diff > 0 ? 'Internal book has more entries than legal' : 'Legal book has more entries than internal')}
            </div>
          )}
        </div>

        <div className="mt-4 space-y-2">
          <div className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-2">📋 {fa?'تفاوت‌های کلیدی':'Key Differences'}</div>
          {diff === 0 && legalEntries.length === realEntries.length ? (
            <div className="text-sm text-center text-[hsl(var(--muted-foreground))] py-4">{fa?'تفاوتی وجود ندارد':'No differences found'}</div>
          ) : (
            <div className="text-xs text-amber-600 bg-amber-500/5 rounded-lg p-3">
              {fa ? `دفتر واقعی ${realEntries.length} سند دارد ولی دفتر قانونی ${legalEntries.length} سند دارد.` : `Internal book has ${realEntries.length} entries vs ${legalEntries.length} in legal book.`}
            </div>
          )}
        </div>

        <button onClick={onClose} className="w-full mt-5 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted)/0.5)]">
          {fa?'بستن':'Close'}
        </button>
      </div>
    </div>
  );
}
