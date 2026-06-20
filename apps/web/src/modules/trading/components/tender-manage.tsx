'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useMyTenders, useCreateTender, useCloseTender, useAwardTender, useTenderBids } from '@/hooks/use-trading';
import { useUIStore } from '@/store';
import { Share2, Copy, MessageCircle, Mail, Check } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://187.127.88.138.nip.io/api';
const SITE = typeof window !== 'undefined' ? window.location.origin : 'https://187.127.88.138.nip.io';

function ShareModal({ tender, onClose, fa }: { tender: any; onClose: () => void; fa: boolean }) {
  const [link, setLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateLink = async () => {
    setLoading(true);
    try {
      const raw = localStorage.getItem('everbrilliant-auth') || '{}';
      const token = JSON.parse(raw)?.state?.accessToken || '';
      const res = await fetch(`${API}/trading/tenders/${tender.id}/invite`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLink(`${SITE}/invite/${data.token}`);
    } catch {
      // fallback
    } finally { setLoading(false); }
  };

  const copy = () => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => link && window.open(`https://wa.me/?text=${encodeURIComponent((fa ? `دعوت به شرکت در مناقصه «${tender.title}»:\n` : `Invitation to tender "${tender.title}":\n`) + link)}`);
  const shareEmail = () => link && window.open(`mailto:?subject=${encodeURIComponent(fa ? `دعوت به مناقصه: ${tender.title}` : `Tender Invitation: ${tender.title}`)}&body=${encodeURIComponent(link)}`);
  const shareSms = () => link && window.open(`sms:?body=${encodeURIComponent(link)}`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-md p-6 shadow-2xl" dir={fa ? 'rtl' : 'ltr'}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            {fa ? 'اشتراک‌گذاری لینک دعوت' : 'Share Invite Link'}
          </h2>
          <button onClick={onClose} className="text-xl leading-none text-[hsl(var(--muted-foreground))]">✕</button>
        </div>

        <div className="rounded-xl p-3 mb-4 text-sm" style={{ background: 'rgba(59,130,246,.08)', border: '1px solid rgba(59,130,246,.25)' }}>
          <div className="font-semibold mb-0.5">📋 {tender.title}</div>
          <div className="text-xs text-[hsl(var(--muted-foreground))]">
            {fa ? 'شرکت‌های خارج از سیستم می‌توانند با این لینک ثبت‌نام کنند و در مناقصه شرکت کنند.' : 'External companies can register and join this tender via this link.'}
          </div>
        </div>

        {!link ? (
          <button onClick={generateLink} disabled={loading}
            className="w-full py-3 rounded-xl bg-[hsl(var(--primary))] text-white font-bold text-sm disabled:opacity-50 hover:opacity-90 transition-opacity">
            {loading ? (fa ? 'در حال ساخت لینک...' : 'Generating...') : (fa ? '🔗 ساختن لینک دعوت' : '🔗 Generate Invite Link')}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3">
              <span className="flex-1 text-xs font-mono text-[hsl(var(--muted-foreground))] truncate">{link}</span>
              <button onClick={copy} className="shrink-0 p-1.5 rounded-lg hover:bg-[hsl(var(--muted)/0.5)] transition-colors">
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button onClick={shareWhatsApp}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.4)] transition-colors text-xs font-medium">
                <MessageCircle className="w-5 h-5 text-green-500" />
                WhatsApp
              </button>
              <button onClick={shareSms}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.4)] transition-colors text-xs font-medium">
                <span className="text-xl">💬</span>
                SMS
              </button>
              <button onClick={shareEmail}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.4)] transition-colors text-xs font-medium">
                <Mail className="w-5 h-5 text-blue-500" />
                {fa ? 'ایمیل' : 'Email'}
              </button>
            </div>

            <div className="rounded-xl p-3 text-xs text-[hsl(var(--muted-foreground))]" style={{ background: 'hsl(var(--muted)/0.3)' }}>
              ⏱ {fa ? 'این لینک تا ۳۰ روز معتبر است.' : 'This link is valid for 30 days.'}
            </div>
          </div>
        )}

        <button onClick={onClose} className="w-full mt-3 py-2 rounded-xl border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted)/0.4)] transition-colors">
          {fa ? 'بستن' : 'Close'}
        </button>
      </div>
    </div>
  );
}

// ─── KEY SYSTEM ─────────────────────────────────────────────────
type KeyHolder = {
  slot: number; holder: string; holderName: string; label: string;
  entered: boolean; enteredBy: string | null; enteredAt: string | null;
  passwordHash: string; passwordSetAt: string | null;
};
type KeyConfig = { enabled: boolean; keyCount: number; keys: KeyHolder[] };

const MOCK_STAFF = [
  { id: 'u1', name: 'احمد رضایی', role: 'مدیرعامل' },
  { id: 'u2', name: 'سارا کریمی', role: 'کارشناس فروش' },
  { id: 'u3', name: 'محمد حسینی', role: 'مدیر مالی' },
  { id: 'u4', name: 'فاطمه احمدی', role: 'مدیر خرید' },
  { id: 'u5', name: 'علی محمدی', role: 'ادمین سیستم' },
];
const CURRENT_USER = { id: 'u1', name: 'احمد رضایی' };

function hashPass(p: string): string {
  let h = 0;
  for (const c of p) { h = (h << 5) - h + c.charCodeAt(0); h |= 0; }
  return 'H' + Math.abs(h).toString(16).padStart(8, '0');
}
function nowStr(): string { return new Date().toLocaleString('fa-IR'); }
const emptyConfig = (): KeyConfig => ({ enabled: false, keyCount: 2, keys: [] });

function KeyConfigModal({ tender, config, onSave, onClose, fa }: {
  tender: any; config: KeyConfig; onSave: (cfg: KeyConfig) => void; onClose: () => void; fa: boolean;
}) {
  const [enabled, setEnabled] = useState(config.enabled);
  const [keyCount, setKeyCount] = useState(config.keyCount || 2);
  const [slots, setSlots] = useState<Record<number, string>>(() => {
    const s: Record<number, string> = {};
    config.keys.forEach(k => { s[k.slot] = k.holder; });
    return s;
  });
  const inp = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none";

  const handleSave = () => {
    if (enabled) {
      for (let i = 1; i <= keyCount; i++) {
        if (!slots[i]) { alert(fa ? `لطفاً دارنده کلید ${i} را انتخاب کنید` : `Select key holder ${i}`); return; }
      }
    }
    const newKeys: KeyHolder[] = [];
    for (let i = 1; i <= keyCount; i++) {
      const holderId = slots[i] || '';
      const holderName = MOCK_STAFF.find(s => s.id === holderId)?.name || holderId;
      const exist = config.keys.find(k => k.slot === i && k.holder === holderId);
      newKeys.push({
        slot: i, holder: holderId, holderName, label: fa ? `کلید ${i}` : `Key ${i}`,
        entered: false, enteredBy: null, enteredAt: null,
        passwordHash: exist?.holder === holderId ? (exist.passwordHash || '') : '',
        passwordSetAt: exist?.holder === holderId ? (exist.passwordSetAt || null) : null,
      });
    }
    onSave({ enabled, keyCount, keys: newKeys });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-lg p-6 shadow-2xl my-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-sm">⚙️ {fa ? `قفل چند کلیده — ${tender.title}` : `Multi-Key Lock — ${tender.title}`}</h2>
          <button onClick={onClose} className="text-xl leading-none text-[hsl(var(--muted-foreground))]">✕</button>
        </div>
        <div className="rounded-xl p-3 mb-4 text-xs" style={{ background: 'rgba(59,130,246,.08)', border: '1px solid rgba(59,130,246,.25)' }}>
          🔐 {fa ? 'ادمین تعداد کلیددار و اشخاص را تعیین می‌کند. هر نفر رمز خودش را خودش تنظیم می‌کند — ادمین رمزها را نمی‌بیند.' : 'Admin assigns key holders. Each person sets their own private password — admin cannot see them.'}
        </div>
        <div className="flex items-center gap-3 bg-[hsl(var(--background))] rounded-xl p-3 mb-4 cursor-pointer select-none" onClick={() => setEnabled(!enabled)}>
          <div className={`w-10 h-5 rounded-full relative transition-colors flex-shrink-0 ${enabled ? 'bg-green-500' : 'bg-[hsl(var(--muted))]'}`}>
            <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow ${enabled ? 'left-5' : 'left-0.5'}`} />
          </div>
          <div>
            <div className="font-semibold text-sm">{fa ? 'فعال‌سازی قفل چند کلیده' : 'Enable Multi-Key Lock'}</div>
            <div className="text-xs" style={{ color: enabled ? '#10b981' : 'hsl(var(--muted-foreground))' }}>
              {fa ? (enabled ? 'فعال' : 'غیرفعال') : (enabled ? 'Active' : 'Inactive')}
            </div>
          </div>
        </div>
        <div className="mb-4">
          <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-2 block">
            {fa ? 'تعداد کلیدداران مورد نیاز (۲ تا ۱۰ نفر)' : 'Required key holders (2–10)'}
          </label>
          <div className="flex gap-2 flex-wrap">
            {[2,3,4,5,6,7,8,9,10].map(n => (
              <button key={n} onClick={() => setKeyCount(n)}
                className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${keyCount === n ? 'bg-[hsl(var(--primary))] text-white' : 'bg-[hsl(var(--background))] border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)]'}`}>
                {n}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3 mb-4">
          {Array.from({ length: keyCount }, (_, i) => i + 1).map(slot => {
            const existing = config.keys.find(k => k.slot === slot);
            return (
              <div key={slot} className="bg-[hsl(var(--background))] rounded-xl p-3">
                <div className="text-xs font-bold text-amber-500 mb-2">🗝️ {fa ? `کلید ${slot}` : `Key ${slot}`}</div>
                <select value={slots[slot] || ''} onChange={e => setSlots(prev => ({ ...prev, [slot]: e.target.value }))} className={inp}>
                  <option value="">{fa ? `انتخاب دارنده کلید ${slot}...` : `Select key holder ${slot}...`}</option>
                  {MOCK_STAFF.map(s => <option key={s.id} value={s.id}>{s.name} — {s.role}</option>)}
                </select>
                {slots[slot] && (existing?.holder === slots[slot] && existing?.passwordHash
                  ? <div className="text-xs text-green-500 mt-1.5">✅ {fa ? 'رمز تنظیم شده' : 'Password set'} {existing.passwordSetAt ? `— ${existing.passwordSetAt}` : ''}</div>
                  : slots[slot] ? <div className="text-xs text-amber-500 mt-1.5">⏳ {fa ? 'هنوز رمز تنظیم نشده' : 'Password not set yet'}</div> : null
                )}
              </div>
            );
          })}
        </div>
        {config.keys.some(k => k.passwordHash) && (
          <div className="rounded-xl p-3 mb-4 text-xs" style={{ background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.3)' }}>
            ⚠️ {fa ? 'تغییر دارنده کلید، رمز قبلی آن کلید را پاک می‌کند.' : 'Changing a key holder will clear their existing password.'}
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted)/0.5)] transition-colors">{fa ? 'انصراف' : 'Cancel'}</button>
          <button onClick={handleSave} className="flex-1 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-bold hover:opacity-90 transition-opacity">
            💾 {fa ? 'ذخیره تنظیمات' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SetPasswordModal({ tenderTitle, keySlot, keyLabel, onSave, onClose, fa }: {
  tenderTitle: string; keySlot: number; keyLabel: string;
  onSave: (slot: number, hash: string, setAt: string) => void; onClose: () => void; fa: boolean;
}) {
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const inp = "w-full px-3 py-2.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)] tracking-widest text-center";

  const strength = (p: string) => {
    if (!p) return null;
    let s = 0;
    if (p.length >= 6) s++; if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++; if (/[0-9]/.test(p)) s++; if (/[^a-zA-Z0-9]/.test(p)) s++;
    if (s <= 1) return { label: fa ? 'ضعیف' : 'Weak', color: '#ef4444' };
    if (s <= 3) return { label: fa ? 'متوسط' : 'Medium', color: '#f59e0b' };
    return { label: fa ? 'قوی' : 'Strong', color: '#10b981' };
  };
  const str = strength(p1);

  const handleSave = () => {
    if (!p1 || p1.length < 6) { alert(fa ? 'رمز باید حداقل ۶ کاراکتر باشد' : 'Password must be at least 6 characters'); return; }
    if (p1 !== p2) { alert(fa ? 'رمزها با هم مطابقت ندارند' : 'Passwords do not match'); return; }
    onSave(keySlot, hashPass(p1), nowStr());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-sm p-6 shadow-2xl">
        <h2 className="font-bold mb-1">🔑 {fa ? `تنظیم رمز — ${keyLabel}` : `Set Password — ${keyLabel}`}</h2>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4">{tenderTitle}</p>
        <div className="rounded-xl p-3 mb-4 text-xs" style={{ background: 'rgba(59,130,246,.08)', border: '1px solid rgba(59,130,246,.25)' }}>
          🔐 {fa ? 'رمزی که اینجا تنظیم می‌کنید فقط برای شماست. هیچ‌کس دیگری آن را نمی‌بیند — حتی ادمین.' : 'This password is private. No one else can see it — not even admin.'}
        </div>
        <div className="space-y-3 mb-4">
          <div>
            <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'رمز جدید (حداقل ۶ کاراکتر)' : 'New Password (min 6 chars)'}</label>
            <input type="password" value={p1} onChange={e => setP1(e.target.value)} className={inp} placeholder="••••••••" />
            {str && <div className="text-xs mt-1 font-medium" style={{ color: str.color }}>{fa ? 'قدرت رمز: ' : 'Strength: '}{str.label}</div>}
          </div>
          <div>
            <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'تکرار رمز' : 'Confirm Password'}</label>
            <input type="password" value={p2} onChange={e => setP2(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()} className={inp} placeholder="••••••••" />
            {p2 && p1 !== p2 && <div className="text-xs mt-1 text-red-500">❌ {fa ? 'رمزها مطابقت ندارند' : 'Passwords do not match'}</div>}
          </div>
        </div>
        <div className="rounded-xl p-3 mb-4 text-xs" style={{ background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.3)' }}>
          ⚠️ {fa ? 'این رمز قابل بازیابی توسط ادمین نیست. فقط ریست (حذف) می‌شود.' : 'Admin cannot recover this password — only reset it.'}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa ? 'انصراف' : 'Cancel'}</button>
          <button onClick={handleSave} className="flex-1 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-bold">🔑 {fa ? 'ذخیره رمز' : 'Save Password'}</button>
        </div>
      </div>
    </div>
  );
}

function KeyCeremonyModal({ tender, config, onUpdate, onOpen, onClose, onSetPassword, fa }: {
  tender: any; config: KeyConfig; onUpdate: (cfg: KeyConfig) => void;
  onOpen: () => void; onClose: () => void; onSetPassword: (slot: number) => void; fa: boolean;
}) {
  const [password, setPassword] = useState('');
  const total = config.keys.length;
  const entered = config.keys.filter(k => k.entered).length;
  const allDone = entered === total;
  const myKey = config.keys.find(k => k.holder === CURRENT_USER.id);
  const myKeyEntered = myKey?.entered || false;
  const myKeyHasPassword = !!(myKey?.passwordHash);
  const cols = Math.min(total <= 4 ? total : Math.ceil(total / 2), 4);

  const submitKey = () => {
    if (!password) { alert(fa ? 'رمز را وارد کنید' : 'Enter password'); return; }
    if (!myKey) return;
    if (hashPass(password) !== myKey.passwordHash) {
      alert(fa ? '❌ رمز اشتباه است!' : '❌ Wrong password!');
      setPassword('');
      return;
    }
    onUpdate({
      ...config,
      keys: config.keys.map(k => k.slot === myKey.slot
        ? { ...k, entered: true, enteredBy: CURRENT_USER.name, enteredAt: nowStr() }
        : k),
    });
    setPassword('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-md p-6 shadow-2xl">
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">🔐</div>
          <h2 className="font-bold">{fa ? 'باز کردن پاکت مزایده' : 'Open Auction Envelope'}</h2>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{tender.title}</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
            {fa ? `برای باز شدن باید همه ${total} نفر رمز خود را وارد کنند` : `All ${total} key holders must enter their passwords`}
          </p>
        </div>
        <div className="grid gap-2 mb-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {config.keys.map(k => {
            const isMe = k.holder === CURRENT_USER.id;
            return (
              <div key={k.slot} className="rounded-xl p-2 text-center text-xs relative" style={{
                background: k.entered ? 'rgba(16,185,129,.12)' : 'hsl(var(--background))',
                border: `2px solid ${k.entered ? '#10b981' : isMe && !k.entered ? '#f59e0b' : 'hsl(var(--border))'}`,
              }}>
                {isMe && !k.entered && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">
                    {fa ? 'شما' : 'You'}
                  </div>
                )}
                <div className="text-xl mb-0.5">{k.entered ? '🔓' : !k.passwordHash ? '⚠️' : '🔒'}</div>
                <div className="font-bold truncate" style={{ color: k.entered ? '#10b981' : 'hsl(var(--foreground))' }}>{k.label}</div>
                <div className="text-[hsl(var(--muted-foreground))] truncate">{k.holderName}</div>
                {k.entered ? <div className="text-[9px] text-green-500 mt-0.5">✅ {k.enteredAt?.slice(-5)}</div>
                  : !k.passwordHash ? <div className="text-[9px] text-amber-500 mt-0.5">{fa ? 'رمز نشده' : 'No password'}</div>
                  : <div className="text-[9px] text-[hsl(var(--muted-foreground))] mt-0.5">⏳ {fa ? 'منتظر' : 'Waiting'}</div>}
              </div>
            );
          })}
        </div>
        <div className="mb-4">
          <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))] mb-1">
            <span>{fa ? 'پیشرفت' : 'Progress'}</span>
            <span className="font-bold" style={{ color: allDone ? '#10b981' : '#f59e0b' }}>{entered} / {total}</span>
          </div>
          <div className="h-2 bg-[hsl(var(--muted)/0.4)] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.round(entered/total*100)}%`, background: allDone ? '#10b981' : '#f59e0b' }} />
          </div>
        </div>
        {allDone ? (
          <>
            <div className="rounded-xl p-3 mb-4 text-sm text-center" style={{ background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.3)', color: '#10b981' }}>
              ✅ {fa ? `همه ${total} رمز تایید شد! پاکت قابل باز شدن است.` : `All ${total} passwords confirmed! Ready to open.`}
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa ? 'بعداً' : 'Later'}</button>
              <button onClick={onOpen} className="flex-1 py-2 rounded-lg font-bold text-white text-sm" style={{ background: '#10b981' }}>
                🔓 {fa ? 'باز کردن پاکت' : 'Open Envelope'}
              </button>
            </div>
          </>
        ) : myKey && !myKeyEntered && myKeyHasPassword ? (
          <>
            <div className="rounded-xl p-4 mb-3" style={{ background: 'rgba(245,158,11,.07)', border: '1px solid #f59e0b' }}>
              <div className="text-xs font-bold text-amber-500 mb-2">🗝️ {myKey.label} — {fa ? 'ورود رمز شما' : 'Your key password'}</div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submitKey()}
                className="w-full px-3 py-2.5 rounded-lg border-2 text-center tracking-widest text-base bg-[hsl(var(--background))] focus:outline-none"
                style={{ borderColor: '#f59e0b' }} placeholder="••••••••" />
              <button onClick={submitKey} className="w-full mt-2 py-2 rounded-lg font-bold text-sm" style={{ background: '#f59e0b', color: '#000' }}>
                🗝️ {fa ? 'تایید رمز' : 'Confirm Password'}
              </button>
            </div>
            <div className="flex justify-end">
              <button onClick={onClose} className="py-1.5 px-4 rounded-lg border border-[hsl(var(--border))] text-sm">{fa ? 'بعداً' : 'Later'}</button>
            </div>
          </>
        ) : myKey && !myKeyEntered && !myKeyHasPassword ? (
          <>
            <div className="rounded-xl p-3 mb-3 text-sm" style={{ background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.4)' }}>
              ⚠️ {fa ? 'شما هنوز رمز کلید خود را تنظیم نکرده‌اید!' : 'You have not set your key password yet!'}
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa ? 'بعداً' : 'Later'}</button>
              <button onClick={() => { onClose(); onSetPassword(myKey.slot); }} className="flex-1 py-2 rounded-lg text-sm font-bold" style={{ background: '#f59e0b', color: '#000' }}>
                🔑 {fa ? 'تنظیم رمز الان' : 'Set Password Now'}
              </button>
            </div>
          </>
        ) : myKeyEntered ? (
          <>
            <div className="rounded-xl p-3 mb-4 text-sm" style={{ background: 'rgba(16,185,129,.1)', color: '#10b981' }}>
              ✅ {fa ? `رمز شما ثبت شده. منتظر ${total - entered} نفر دیگر هستیم.` : `Your password confirmed. Waiting for ${total - entered} more.`}
            </div>
            <div className="flex justify-end">
              <button onClick={onClose} className="py-2 px-4 rounded-lg border border-[hsl(var(--border))] text-sm">{fa ? 'بستن' : 'Close'}</button>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-xl p-3 mb-4 text-sm text-[hsl(var(--muted-foreground))]" style={{ background: 'hsl(var(--muted)/0.3)' }}>
              ℹ️ {fa ? 'شما دارنده کلید این مزایده نیستید.' : 'You are not a key holder for this auction.'}
            </div>
            <div className="flex justify-end">
              <button onClick={onClose} className="py-2 px-4 rounded-lg border border-[hsl(var(--border))] text-sm">{fa ? 'بستن' : 'Close'}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MyKeysModal({ keyConfigsByTender, tendersMap, onSetPassword, onClose, fa }: {
  keyConfigsByTender: Record<string, KeyConfig>; tendersMap: Record<string, any>;
  onSetPassword: (tenderId: string, slot: number) => void; onClose: () => void; fa: boolean;
}) {
  const myKeys = Object.entries(keyConfigsByTender).flatMap(([tid, cfg]) => {
    if (!cfg.enabled) return [];
    return cfg.keys.filter(k => k.holder === CURRENT_USER.id).map(k => ({ tid, tender: tendersMap[tid], key: k }));
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">🗝️ {fa ? 'کلیدهای مزایده‌های من' : 'My Auction Keys'}</h2>
          <button onClick={onClose} className="text-xl leading-none text-[hsl(var(--muted-foreground))]">✕</button>
        </div>
        <div className="text-xs text-[hsl(var(--muted-foreground))] mb-3">
          {fa ? 'در مزایده‌های زیر شما دارنده کلید هستید. برای هر کدام که رمز ندارید، رمز تنظیم کنید.' : 'These are tenders where you are a key holder. Set a password for any unprotected key.'}
        </div>
        {myKeys.length === 0 ? (
          <div className="text-center py-10 text-[hsl(var(--muted-foreground))]">
            <div className="text-4xl mb-3">🔑</div>
            <p className="text-sm">{fa ? 'شما در هیچ مزایده‌ای به عنوان دارنده کلید تعیین نشده‌اید.' : 'You are not assigned as a key holder in any auction.'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myKeys.map(({ tid, tender, key }) => (
              <div key={`${tid}-${key.slot}`} className="flex items-center justify-between rounded-xl p-3 gap-3"
                style={{ border: `1px solid ${key.passwordHash ? 'rgba(16,185,129,.4)' : 'rgba(245,158,11,.4)'}`, background: key.passwordHash ? 'rgba(16,185,129,.05)' : 'rgba(245,158,11,.05)' }}>
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate">{tender?.title || tid}</div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">{key.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: key.passwordHash ? '#10b981' : '#f59e0b' }}>
                    {key.passwordHash ? (fa ? '✅ رمز تنظیم شده' : '✅ Password set') : (fa ? '⚠️ رمز تنظیم نشده' : '⚠️ No password set')}
                    {key.passwordSetAt ? ` — ${key.passwordSetAt}` : ''}
                  </div>
                </div>
                {key.passwordHash
                  ? <span className="text-xs px-2 py-1 rounded-full shrink-0" style={{ background: 'rgba(16,185,129,.1)', color: '#10b981' }}>✅ {fa ? 'آماده' : 'Ready'}</span>
                  : <button onClick={() => { onClose(); onSetPassword(tid, key.slot); }}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium shrink-0"
                      style={{ background: 'rgba(245,158,11,.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,.3)' }}>
                      🔑 {fa ? 'تنظیم رمز' : 'Set Password'}
                    </button>
                }
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="py-2 px-4 rounded-lg border border-[hsl(var(--border))] text-sm">{fa ? 'بستن' : 'Close'}</button>
        </div>
      </div>
    </div>
  );
}
// ────────────────────────────────────────────────────────────────

function fmt(n: any) {
  try { return Number(n).toLocaleString('fa-IR'); } catch { return String(n); }
}

function DeadlineBadge({ endDate }: { endDate: string }) {
  if (!endDate) return null;
  const end  = new Date(endDate);
  const now  = new Date();
  const days = Math.ceil((end.getTime() - now.getTime()) / 86400_000);
  const urgent = days <= 3;
  const label = end.toLocaleDateString('fa-IR');
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs"
      style={{
        background: urgent ? 'rgba(239,68,68,.12)' : 'rgba(59,130,246,.08)',
        border: `1px solid ${urgent ? 'rgba(239,68,68,.4)' : 'rgba(59,130,246,.3)'}`,
        color: urgent ? '#ef4444' : '#2563eb',
      }}
    >
      📅 {label}
    </span>
  );
}

function ResultsModal({ tenderId, lang, onClose }: { tenderId: string; lang: string; onClose: () => void }) {
  const fa = lang === 'fa';
  const { data: bidsRaw, isLoading } = useTenderBids(tenderId);
  const bids: any[] = Array.isArray(bidsRaw) ? bidsRaw : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-lg p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">📊 {fa ? 'نتایج مزایده' : 'Auction Results'}</h2>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] text-xl leading-none">✕</button>
        </div>
        {isLoading ? (
          <div className="py-8 text-center text-[hsl(var(--muted-foreground))]">
            <div className="w-6 h-6 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          </div>
        ) : bids.length === 0 ? (
          <div className="py-8 text-center text-[hsl(var(--muted-foreground))]">
            <p>{fa ? 'پیشنهادی دریافت نشده' : 'No bids received'}</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {bids.map((b: any, i: number) => (
              <div key={b.id} className="flex items-center justify-between rounded-xl bg-[hsl(var(--background))] p-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: i === 0 ? '#f59e0b20' : 'hsl(var(--muted)/0.5)', color: i === 0 ? '#f59e0b' : undefined }}>
                    {i + 1}
                  </span>
                  <span className="text-[hsl(var(--muted-foreground))] text-xs">
                    {new Date(b.submittedAt).toLocaleDateString('fa-IR')}
                  </span>
                </div>
                <span className="font-bold" style={{ color: i === 0 ? '#f59e0b' : undefined }}>
                  {fmt(b.totalPrice)} {b.currency || 'IRR'}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted)/0.5)] transition-colors">
            {fa ? 'بستن' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function TenderManage() {
  const { lang } = useLocaleStore();
  const { toast } = useUIStore();
  const fa = lang === 'fa';
  const { data: raw, isLoading } = useMyTenders();
  const tenders: any[] = (raw as any)?.data ?? [];
  const [showNew, setShowNew]         = useState(false);
  const [resultsId, setResultsId]     = useState<string | null>(null);
  const [shareId, setShareId]         = useState<string | null>(null);

  // ── Key system state ──
  const [keyConfigs, setKeyConfigs]                     = useState<Record<string, KeyConfig>>({});
  const [keyConfigTenderId, setKeyConfigTenderId]       = useState<string | null>(null);
  const [keyCeremonyId, setKeyCeremonyId]               = useState<string | null>(null);
  const [setPasswordKey, setSetPasswordKey]             = useState<{ tenderId: string; slot: number } | null>(null);
  const [showMyKeys, setShowMyKeys]                     = useState(false);

  const getConfig = (tid: string): KeyConfig => keyConfigs[tid] || emptyConfig();

  const saveKeyConfig = (tid: string, cfg: KeyConfig) => {
    setKeyConfigs(prev => ({ ...prev, [tid]: { ...cfg, enabled: true } }));
    setKeyConfigTenderId(null);
    toast('success', fa ? '✅ تنظیمات کلید ذخیره شد' : '✅ Key settings saved');
  };

  const setKeyPassword = (tid: string, slot: number, hash: string, setAt: string) => {
    setKeyConfigs(prev => {
      const cfg = prev[tid] || emptyConfig();
      return { ...prev, [tid]: { ...cfg, keys: cfg.keys.map(k => k.slot === slot ? { ...k, passwordHash: hash, passwordSetAt: setAt } : k) } };
    });
    setSetPasswordKey(null);
    toast('success', fa ? '🔑 رمز کلید تنظیم شد' : '🔑 Key password saved');
  };

  const closeTender = useCloseTender();
  const awardTender = useAwardTender();

  const handleClose = (id: string) => {
    closeTender.mutate(id, {
      onSuccess: () => toast('success', fa ? '🔒 مزایده بسته شد' : '🔒 Auction closed'),
      onError: (e: any) => toast('error', e?.message || 'Error'),
    });
  };

  const handleAward = (id: string) => {
    const cfg = getConfig(id);
    if (cfg.enabled && !cfg.keys.every(k => k.entered)) {
      setKeyCeremonyId(id);
      return;
    }
    doAward(id);
  };

  const doAward = (id: string) => {
    setKeyCeremonyId(null);
    awardTender.mutate(id, {
      onSuccess: () => { toast('success', fa ? '🔓 پاکت باز شد' : '🔓 Envelope opened'); setResultsId(id); },
      onError: (e: any) => toast('error', e?.message || 'Error'),
    });
  };

  return (
    <div className="space-y-4">
      {/* Top bar: new auction + my keys */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setShowMyKeys(true)}
          className="px-3 py-2 rounded-lg text-sm font-medium border border-amber-500/40 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors"
        >
          🗝️ {fa ? 'کلیدهای من' : 'My Keys'}
        </button>
        <button
          onClick={() => setShowNew(true)}
          className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          ➕ {fa ? 'مزایده جدید' : 'New Auction'}
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-32 rounded-xl bg-[hsl(var(--muted)/0.5)] animate-pulse" />)}</div>
      ) : tenders.length === 0 ? (
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-10 text-center text-[hsl(var(--muted-foreground))]">
          <div className="text-5xl mb-3">🏷️</div>
          <p className="font-medium">{fa ? 'مزایده‌ای ایجاد نشده' : 'No auctions yet'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tenders.map(t => {
            const st = (t.status || '').toUpperCase();
            const isOpen   = st === 'OPEN';
            const isClosed = st === 'CLOSED';
            const isAwarded = st === 'AWARDED';

            return (
              <div key={t.id} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="font-bold text-base mb-0.5">{t.title}</div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))] font-mono mb-2">{t.id}</div>
                    <DeadlineBadge endDate={t.endDate} />
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-bold shrink-0 ${
                    isOpen ? 'bg-green-500/10 text-green-600' : 'bg-[hsl(var(--muted)/0.6)] text-[hsl(var(--muted-foreground))]'
                  }`}>
                    {isOpen ? '🟢 باز' : '🔒 بسته'}
                  </span>
                </div>

                {/* Products grid */}
                {(t.products || []).length > 0 && (
                  <div className="space-y-2 mb-4">
                    {(t.products as any[]).map((p: any, i: number) => (
                      <div key={i} className="rounded-lg bg-[hsl(var(--background))] px-3 py-2 text-xs border border-[hsl(var(--border))]">
                        <div className="flex items-center justify-between">
                          <span className="font-bold">{p.name}</span>
                          <span className="text-[hsl(var(--muted-foreground))]">{p.currency || 'ریال'}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1 text-[hsl(var(--muted-foreground))]">
                          <span>{Number(p.qty)} {p.unit}</span>
                          <span>
                            {p.minPrice ? `کف: ${fmt(p.minPrice)}` : ''}
                            {p.maxPrice ? ` | سقف: ${fmt(p.maxPrice)}` : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer: bid count + action buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-[hsl(var(--border))]">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      <span className="font-bold" style={{ color: 'hsl(var(--primary))' }}>{t.bidsCount ?? 0}</span>
                      {' '}{fa ? 'پیشنهاد' : 'bids'}
                    </span>
                    {getConfig(t.id).enabled && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,.3)' }}>
                        🔐 {fa ? `${getConfig(t.id).keyCount} کلیده` : `${getConfig(t.id).keyCount}-key`}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    {/* Share invite link */}
                    {isOpen && (
                      <button
                        onClick={() => setShareId(t.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
                        style={{ borderColor: 'rgba(59,130,246,.35)', background: 'rgba(59,130,246,.08)', color: '#3b82f6' }}
                      >
                        🔗 {fa ? 'دعوت' : 'Invite'}
                      </button>
                    )}
                    {/* Key config button — available on open and closed tenders */}
                    {!isAwarded && (
                      <button
                        onClick={() => setKeyConfigTenderId(t.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
                        style={{ borderColor: 'rgba(245,158,11,.35)', background: 'rgba(245,158,11,.08)', color: '#f59e0b' }}
                      >
                        🗝️ {fa ? 'کلید' : 'Keys'}
                      </button>
                    )}
                    {isOpen && (
                      <button
                        disabled={closeTender.isPending}
                        onClick={() => handleClose(t.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border border-red-300/50 bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                      >
                        🔒 {fa ? 'بستن' : 'Close'}
                      </button>
                    )}
                    {isClosed && (
                      <button
                        disabled={awardTender.isPending}
                        onClick={() => handleAward(t.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/10 text-green-700 border border-green-500/30 hover:bg-green-500/20 transition-colors disabled:opacity-50"
                      >
                        🔓 {fa ? 'باز کردن پاکت' : 'Open Envelope'}
                      </button>
                    )}
                    {isAwarded && (
                      <button
                        onClick={() => setResultsId(t.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[hsl(var(--primary))] text-white hover:opacity-90 transition-opacity"
                      >
                        📊 {fa ? 'نتایج' : 'Results'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showNew && <NewAuctionModal lang={lang} onClose={() => setShowNew(false)} />}
      {resultsId && <ResultsModal tenderId={resultsId} lang={lang} onClose={() => setResultsId(null)} />}
      {shareId && (() => { const t = tenders.find((x: any) => x.id === shareId); return t ? <ShareModal tender={t} onClose={() => setShareId(null)} fa={fa} /> : null; })()}

      {/* Key config modal */}
      {keyConfigTenderId && (() => {
        const t = tenders.find((x: any) => x.id === keyConfigTenderId);
        if (!t) return null;
        return (
          <KeyConfigModal
            tender={t}
            config={getConfig(keyConfigTenderId)}
            onSave={cfg => saveKeyConfig(keyConfigTenderId, cfg)}
            onClose={() => setKeyConfigTenderId(null)}
            fa={fa}
          />
        );
      })()}

      {/* Key ceremony modal */}
      {keyCeremonyId && (() => {
        const t = tenders.find((x: any) => x.id === keyCeremonyId);
        if (!t) return null;
        const cfg = getConfig(keyCeremonyId);
        return (
          <KeyCeremonyModal
            tender={t}
            config={cfg}
            onUpdate={newCfg => setKeyConfigs(prev => ({ ...prev, [keyCeremonyId]: newCfg }))}
            onOpen={() => doAward(keyCeremonyId)}
            onClose={() => setKeyCeremonyId(null)}
            onSetPassword={slot => setSetPasswordKey({ tenderId: keyCeremonyId, slot })}
            fa={fa}
          />
        );
      })()}

      {/* Set password modal */}
      {setPasswordKey && (() => {
        const cfg = getConfig(setPasswordKey.tenderId);
        const key = cfg.keys.find(k => k.slot === setPasswordKey.slot);
        const t = tenders.find((x: any) => x.id === setPasswordKey.tenderId);
        if (!key) return null;
        return (
          <SetPasswordModal
            tenderTitle={t?.title || setPasswordKey.tenderId}
            keySlot={key.slot}
            keyLabel={key.label}
            onSave={(slot, hash, setAt) => setKeyPassword(setPasswordKey.tenderId, slot, hash, setAt)}
            onClose={() => setSetPasswordKey(null)}
            fa={fa}
          />
        );
      })()}

      {/* My keys modal */}
      {showMyKeys && (
        <MyKeysModal
          keyConfigsByTender={keyConfigs}
          tendersMap={Object.fromEntries(tenders.map((t: any) => [t.id, t]))}
          onSetPassword={(tid, slot) => setSetPasswordKey({ tenderId: tid, slot })}
          onClose={() => setShowMyKeys(false)}
          fa={fa}
        />
      )}
    </div>
  );
}

function NewAuctionModal({ lang, onClose }: { lang: string; onClose: () => void }) {
  const fa = lang === 'fa';
  const { toast } = useUIStore();
  const createTender = useCreateTender();
  const [form, setForm] = useState({ title: '', deadline: '', deadlineTime: '23:59', type: 'AUCTION', description: '' });
  const [products, setProducts] = useState([{ name: '', qtyMin: '', qtyMax: '', unit: 'ton', currency: 'IRR' }]);

  const inp = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]";

  const addProduct = () => setProducts(p => [...p, { name: '', qtyMin: '', qtyMax: '', unit: 'ton', currency: 'IRR' }]);
  const setP = (i: number, k: string, v: string) => setProducts(p => p.map((r, idx) => idx === i ? { ...r, [k]: v } : r));
  const removeP = (i: number) => setProducts(p => p.filter((_, idx) => idx !== i));

  const handleSubmit = () => {
    if (!form.title)    { toast('error', fa ? 'عنوان الزامی است' : 'Title required'); return; }
    if (!form.deadline) { toast('error', fa ? 'مهلت الزامی است' : 'Deadline required'); return; }
    if (products.some(p => !p.name)) { toast('error', fa ? 'نام محصول الزامی است' : 'Product name required'); return; }

    createTender.mutate(
      {
        type: form.type,
        title: form.title,
        description: form.description || undefined,
        endDate: form.deadline,
        products: products.filter(p => p.name).map(p => ({
          name: p.name,
          qty: Number(p.qtyMax) || Number(p.qtyMin) || 0,
          unit: p.unit,
          currency: p.currency,
        })),
      },
      {
        onSuccess: () => { toast('success', fa ? '📤 مزایده منتشر شد' : '📤 Auction published'); onClose(); },
        onError: (err: any) => toast('error', err?.message || (fa ? 'خطا در انتشار مزایده' : 'Failed to publish')),
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-lg p-6 shadow-2xl my-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg">🏷️ {fa ? 'مزایده جدید' : 'New Auction'}</h2>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] text-xl leading-none">✕</button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5 block">{fa ? 'عنوان مزایده *' : 'Auction Title *'}</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inp}
              placeholder={fa ? 'مناقصه فروش...' : 'e.g. Motor Oil 1000L'} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5 block">📅 {fa ? 'تاریخ مهلت *' : 'Deadline *'}</label>
              <input value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })}
                className={inp} placeholder="2026-09-01" type="date" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5 block">⏰ {fa ? 'ساعت مهلت' : 'Time'}</label>
              <select value={form.deadlineTime} onChange={e => setForm({ ...form, deadlineTime: e.target.value })} className={inp}>
                {['00:00','01:00','02:00','03:00','04:00','05:00','06:00','07:00','08:00','09:00',
                  '10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00',
                  '20:00','21:00','22:00','23:00','23:59'].map(h => (
                  <option key={h} value={h}>{h}{h === '23:59' ? ` (${fa ? 'پایان روز' : 'EOD'})` : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5 block">{fa ? 'نوع' : 'Type'}</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className={inp}>
                <option value="AUCTION">{fa ? '🔒 پاکت بسته' : '🔒 Sealed'}</option>
                <option value="TENDER">{fa ? '📖 باز' : '📖 Open'}</option>
              </select>
            </div>
          </div>
          {form.deadline && (
            <div className="px-3 py-2 rounded-lg text-xs" style={{ background: 'rgba(59,130,246,.08)', border: '1px solid rgba(59,130,246,.3)', color: '#2563eb' }}>
              ⏰ {fa ? 'مهلت نهایی:' : 'Final deadline:'} <strong>{form.deadline} — {form.deadlineTime}</strong>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5 block">{fa ? 'توضیحات' : 'Notes'}</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3} className={inp + ' resize-none'}
              placeholder={fa ? 'شرایط تحویل...' : 'Delivery conditions...'} />
          </div>

          {/* Products */}
          <div className="rounded-xl border border-[hsl(var(--border))] p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">📦 {fa ? 'محصولات' : 'Products'}</span>
              <button onClick={addProduct} className="text-xs px-2 py-1 rounded-lg border border-[hsl(var(--primary)/0.3)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.08)]">
                + {fa ? 'محصول' : 'Add'}
              </button>
            </div>
            {products.map((p, i) => (
              <div key={i} className="bg-[hsl(var(--background))] rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[hsl(var(--primary))]">{fa ? 'محصول' : 'Product'} {i + 1}</span>
                  {products.length > 1 && <button onClick={() => removeP(i)} className="text-red-400 text-xs">✕</button>}
                </div>
                <input value={p.name} onChange={e => setP(i, 'name', e.target.value)} className={inp}
                  placeholder={fa ? 'نام کالا *' : 'Product name *'} />
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'حداقل' : 'Min'}</label>
                    <input value={p.qtyMin} onChange={e => setP(i, 'qtyMin', e.target.value)} type="number" className={inp} />
                  </div>
                  <div>
                    <label className="text-[10px] text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'حداکثر' : 'Max'}</label>
                    <input value={p.qtyMax} onChange={e => setP(i, 'qtyMax', e.target.value)} type="number" className={inp} />
                  </div>
                  <div>
                    <label className="text-[10px] text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'واحد' : 'Unit'}</label>
                    <select value={p.unit} onChange={e => setP(i, 'unit', e.target.value)} className={inp}>
                      {['ton','kg','liter','m','m2','unit','pallet'].map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted)/0.5)] transition-colors">
            {fa ? 'انصراف' : 'Cancel'}
          </button>
          <button onClick={handleSubmit} disabled={createTender.isPending}
            className="flex-1 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity">
            {createTender.isPending ? (fa ? 'در حال انتشار...' : 'Publishing...') : `📤 ${fa ? 'انتشار' : 'Publish'}`}
          </button>
        </div>
      </div>
    </div>
  );
}
