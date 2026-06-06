'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useUIStore } from '@/store';

// ─── KEY SYSTEM (reused from tender logic) ───────────────────────
type MnqKeyHolder = {
  slot: number; holder: string; holderName: string; label: string;
  entered: boolean; enteredBy: string | null; enteredAt: string | null;
  passwordHash: string; passwordSetAt: string | null;
};
type MnqKeyConfig = { enabled: boolean; keyCount: number; keys: MnqKeyHolder[] };

const MNQ_STAFF = [
  { id: 'u1', name: 'احمد رضایی', role: 'مدیرعامل' },
  { id: 'u2', name: 'سارا کریمی', role: 'کارشناس خرید' },
  { id: 'u3', name: 'محمد حسینی', role: 'مدیر مالی' },
  { id: 'u4', name: 'فاطمه احمدی', role: 'مدیر خرید' },
  { id: 'u5', name: 'علی محمدی', role: 'ادمین سیستم' },
];
const MNQ_CURRENT_USER = { id: 'u1', name: 'احمد رضایی' };

function mnqHashPass(p: string): string {
  let h = 0;
  for (const c of p) { h = (h << 5) - h + c.charCodeAt(0); h |= 0; }
  return 'H' + Math.abs(h).toString(16).padStart(8, '0');
}
function mnqNowStr(): string { return new Date().toLocaleString('fa-IR'); }
const emptyMnqConfig = (): MnqKeyConfig => ({ enabled: false, keyCount: 2, keys: [] });

function MnqKeyConfigModal({ tender, config, onSave, onClose, fa }: {
  tender: any; config: MnqKeyConfig; onSave: (cfg: MnqKeyConfig) => void; onClose: () => void; fa: boolean;
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
    const newKeys: MnqKeyHolder[] = [];
    for (let i = 1; i <= keyCount; i++) {
      const holderId = slots[i] || '';
      const holderName = MNQ_STAFF.find(s => s.id === holderId)?.name || holderId;
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
          🔐 {fa ? 'ادمین تعداد کلیددار و اشخاص را تعیین می‌کند. هر نفر رمز خودش را خودش تنظیم می‌کند.' : 'Admin assigns key holders. Each person sets their own private password.'}
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
                  {MNQ_STAFF.map(s => <option key={s.id} value={s.id}>{s.name} — {s.role}</option>)}
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
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa ? 'انصراف' : 'Cancel'}</button>
          <button onClick={handleSave} className="flex-1 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-bold">
            💾 {fa ? 'ذخیره تنظیمات' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}

function MnqSetPasswordModal({ tenderTitle, keySlot, keyLabel, onSave, onClose, fa }: {
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
    if (p1 !== p2) { alert(fa ? 'رمزها مطابقت ندارند' : 'Passwords do not match'); return; }
    onSave(keySlot, mnqHashPass(p1), mnqNowStr());
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
            <input type="password" value={p2} onChange={e => setP2(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave()} className={inp} placeholder="••••••••" />
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

function MnqKeyCeremonyModal({ tender, config, onUpdate, onConfirm, onClose, onSetPassword, fa }: {
  tender: any; config: MnqKeyConfig; onUpdate: (cfg: MnqKeyConfig) => void;
  onConfirm: () => void; onClose: () => void; onSetPassword: (slot: number) => void; fa: boolean;
}) {
  const [password, setPassword] = useState('');
  const total = config.keys.length;
  const entered = config.keys.filter(k => k.entered).length;
  const allDone = entered === total;
  const myKey = config.keys.find(k => k.holder === MNQ_CURRENT_USER.id);
  const myKeyEntered = myKey?.entered || false;
  const myKeyHasPassword = !!(myKey?.passwordHash);
  const cols = Math.min(total <= 4 ? total : Math.ceil(total / 2), 4);

  const submitKey = () => {
    if (!password) { alert(fa ? 'رمز را وارد کنید' : 'Enter password'); return; }
    if (!myKey) return;
    if (mnqHashPass(password) !== myKey.passwordHash) {
      alert(fa ? '❌ رمز اشتباه است!' : '❌ Wrong password!');
      setPassword('');
      return;
    }
    onUpdate({ ...config, keys: config.keys.map(k => k.slot === myKey.slot ? { ...k, entered: true, enteredBy: MNQ_CURRENT_USER.name, enteredAt: mnqNowStr() } : k) });
    setPassword('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-md p-6 shadow-2xl">
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">🔐</div>
          <h2 className="font-bold">{fa ? 'باز کردن پاکت مناقصه' : 'Open Tender Envelope'}</h2>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{tender.title}</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
            {fa ? `برای باز شدن باید همه ${total} نفر رمز خود را وارد کنند` : `All ${total} key holders must enter their passwords`}
          </p>
        </div>
        <div className="grid gap-2 mb-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {config.keys.map(k => {
            const isMe = k.holder === MNQ_CURRENT_USER.id;
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
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[hsl(var(--muted-foreground))]">{fa ? 'پیشرفت' : 'Progress'}</span>
            <span className="font-bold" style={{ color: allDone ? '#10b981' : '#f59e0b' }}>{entered} / {total}</span>
          </div>
          <div className="h-2 bg-[hsl(var(--muted)/0.4)] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.round(entered/total*100)}%`, background: allDone ? '#10b981' : '#f59e0b' }} />
          </div>
        </div>
        {allDone ? (
          <>
            <div className="rounded-xl p-3 mb-4 text-sm text-center" style={{ background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.3)', color: '#10b981' }}>
              ✅ {fa ? `همه ${total} رمز تایید شد! پاکت قابل بررسی است.` : `All ${total} passwords confirmed! Ready to review.`}
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa ? 'بعداً' : 'Later'}</button>
              <button onClick={onConfirm} className="flex-1 py-2 rounded-lg font-bold text-white text-sm" style={{ background: '#10b981' }}>
                🔓 {fa ? 'بررسی پیشنهادها' : 'Review Proposals'}
              </button>
            </div>
          </>
        ) : myKey && !myKeyEntered && myKeyHasPassword ? (
          <>
            <div className="rounded-xl p-4 mb-3" style={{ background: 'rgba(245,158,11,.07)', border: '1px solid #f59e0b' }}>
              <div className="text-xs font-bold text-amber-500 mb-2">🗝️ {myKey.label} — {fa ? 'ورود رمز شما' : 'Your key password'}</div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submitKey()}
                className="w-full px-3 py-2.5 rounded-lg border-2 text-center tracking-widest bg-[hsl(var(--background))] focus:outline-none"
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
                🔑 {fa ? 'تنظیم رمز الان' : 'Set Now'}
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
              ℹ️ {fa ? 'شما دارنده کلید این مناقصه نیستید.' : 'You are not a key holder for this tender.'}
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

function MnqMyKeysModal({ keyConfigsByTender, tendersMap, onSetPassword, onClose, fa }: {
  keyConfigsByTender: Record<string, MnqKeyConfig>; tendersMap: Record<string, any>;
  onSetPassword: (tid: string, slot: number) => void; onClose: () => void; fa: boolean;
}) {
  const myKeys = Object.entries(keyConfigsByTender).flatMap(([tid, cfg]) => {
    if (!cfg.enabled) return [];
    return cfg.keys.filter(k => k.holder === MNQ_CURRENT_USER.id).map(k => ({ tid, tender: tendersMap[tid], key: k }));
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">🗝️ {fa ? 'کلیدهای مناقصه‌های من' : 'My Tender Keys'}</h2>
          <button onClick={onClose} className="text-xl leading-none text-[hsl(var(--muted-foreground))]">✕</button>
        </div>
        {myKeys.length === 0 ? (
          <div className="text-center py-10 text-[hsl(var(--muted-foreground))]">
            <div className="text-4xl mb-3">🔑</div>
            <p className="text-sm">{fa ? 'شما در هیچ مناقصه‌ای به عنوان دارنده کلید تعیین نشده‌اید.' : 'You are not a key holder in any tender.'}</p>
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
                    {key.passwordHash ? (fa ? '✅ رمز تنظیم شده' : '✅ Password set') : (fa ? '⚠️ رمز تنظیم نشده' : '⚠️ No password')}
                  </div>
                </div>
                {key.passwordHash
                  ? <span className="text-xs px-2 py-1 rounded-full shrink-0" style={{ background: 'rgba(16,185,129,.1)', color: '#10b981' }}>✅</span>
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

const MNQ_TYPES = [
  { id: 'goods', icon: '📦', label: 'کالا', en: 'Goods' },
  { id: 'service', icon: '🛠️', label: 'خدمات', en: 'Services' },
  { id: 'project', icon: '🏗️', label: 'پروژه/EPC', en: 'Project/EPC' },
  { id: 'rental', icon: '🔑', label: 'اجاره', en: 'Rental' },
  { id: 'other', icon: '📋', label: 'سایر', en: 'Other' },
];

const MOCK_TENDERS: any[] = [
  {
    id: 'MNQ-MY-001', type: 'goods', title: 'مناقصه تأمین تجهیزات انبار', status: 'open',
    deadline: '۱۴۰۳/۰۶/۳۰', proposals: 3, budget: 8000000000, subject: 'تأمین رک‌های انباری و تجهیزات جانبی',
    items: [{ name: 'رک انباری فلزی', qty: 50, unit: 'دست' }],
  },
  {
    id: 'MNQ-MY-002', type: 'service', title: 'مناقصه خدمات حمل بین‌المللی', status: 'closed',
    deadline: '۱۴۰۳/۰۵/۱۵', proposals: 7, budget: 12000000000, subject: 'خدمات ترخیص و حمل دریایی',
    items: [{ name: 'حمل دریایی FCL', qty: 10, unit: 'محموله' }],
  },
];

export function MyManaqeseh() {
  const { lang } = useLocaleStore();
  const { toast } = useUIStore();
  const fa = lang === 'fa';
  const [showNew, setShowNew] = useState(false);
  const [items, setItems] = useState(MOCK_TENDERS);
  const [selected, setSelected] = useState<any>(null);
  const [showProposals, setShowProposals] = useState<any>(null);

  // ── Key system state ──
  const [keyConfigs, setKeyConfigs]                     = useState<Record<string, MnqKeyConfig>>({});
  const [keyConfigTid, setKeyConfigTid]                 = useState<string | null>(null);
  const [keyCeremonyTid, setKeyCeremonyTid]             = useState<string | null>(null);
  const [setPasswordKey, setSetPasswordKey]             = useState<{ tid: string; slot: number } | null>(null);
  const [showMyKeys, setShowMyKeys]                     = useState(false);

  const getConfig = (tid: string): MnqKeyConfig => keyConfigs[tid] || emptyMnqConfig();
  const saveKeyConfig = (tid: string, cfg: MnqKeyConfig) => {
    setKeyConfigs(prev => ({ ...prev, [tid]: { ...cfg, enabled: true } }));
    setKeyConfigTid(null);
    toast('success', fa ? '✅ تنظیمات کلید ذخیره شد' : '✅ Key settings saved');
  };
  const setKeyPassword = (tid: string, slot: number, hash: string, setAt: string) => {
    setKeyConfigs(prev => {
      const cfg = prev[tid] || emptyMnqConfig();
      return { ...prev, [tid]: { ...cfg, keys: cfg.keys.map(k => k.slot === slot ? { ...k, passwordHash: hash, passwordSetAt: setAt } : k) } };
    });
    setSetPasswordKey(null);
    toast('success', fa ? '🔑 رمز کلید تنظیم شد' : '🔑 Key password saved');
  };
  const handleOpenProposals = (item: any) => {
    const cfg = getConfig(item.id);
    if (cfg.enabled && !cfg.keys.every(k => k.entered)) {
      setKeyCeremonyTid(item.id);
      return;
    }
    setShowProposals(item);
  };

  const open = items.filter(i => i.status === 'open');
  const totalProposals = items.reduce((s: number, i: any) => s + i.proposals, 0);
  const awarded = items.filter(i => i.status === 'awarded');

  const statuses = [
    { icon: '📢', val: items.length, label: fa ? 'کل مناقصه‌ها' : 'Total', color: '#3b82f6' },
    { icon: '🟢', val: open.length, label: fa ? 'باز' : 'Open', color: '#10b981' },
    { icon: '📋', val: totalProposals, label: fa ? 'پیشنهاد دریافتی' : 'Bids Received', color: '#8b5cf6' },
    { icon: '🏆', val: awarded.length, label: fa ? 'برنده اعلام شده' : 'Awarded', color: '#f59e0b' },
  ];

  const STATUS_COLORS: Record<string, string> = {
    open: '#10b981', closed: '#f59e0b', evaluating: '#3b82f6', awarded: '#8b5cf6', cancelled: '#ef4444',
  };
  const STATUS_LABELS: Record<string, string> = {
    open: fa ? 'باز' : 'Open', closed: fa ? 'بسته' : 'Closed',
    evaluating: fa ? 'در حال ارزیابی' : 'Evaluating', awarded: fa ? 'برنده اعلام شد' : 'Awarded', cancelled: fa ? 'لغو شده' : 'Cancelled',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">{fa ? '📝 مناقصه‌های من' : '📝 My Tenders'}</h1>
          <button
            onClick={() => setShowMyKeys(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
            style={{ borderColor: 'rgba(245,158,11,.35)', background: 'rgba(245,158,11,.08)', color: '#f59e0b' }}
          >
            🗝️ {fa ? 'کلیدهای من' : 'My Keys'}
          </button>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 transition-all active:scale-95"
        >
          ➕ {fa ? 'مناقصه جدید' : 'New Tender'}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {statuses.map((s, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-3 text-center relative overflow-hidden group hover:scale-[1.03] hover:shadow-md transition-all duration-200">
            <div className="absolute top-0 inset-x-0 h-1 rounded-t-xl" style={{ background: s.color }} />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.04] transition-opacity duration-200 pointer-events-none" style={{ background: s.color }} />
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-xl font-bold leading-none" style={{ color: s.color }}>{s.val}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">
          <div className="text-4xl mb-3">📝</div>
          <p className="font-medium">{fa ? 'مناقصه‌ای ایجاد نشده' : 'No tenders yet'}</p>
          <button onClick={() => setShowNew(true)} className="mt-4 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm">
            {fa ? '+ مناقصه جدید' : '+ New Tender'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item: any) => {
            const typeObj = MNQ_TYPES.find(t => t.id === item.type) || MNQ_TYPES[0];
            const color = STATUS_COLORS[item.status] || '#64748b';
            return (
              <div key={item.id} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] overflow-hidden">
                <div className="p-4" style={{ borderRight: `4px solid ${color}` }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-base">{typeObj.icon}</span>
                        <span className="font-bold text-sm">{item.title}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: color + '20', color }}>
                          {STATUS_LABELS[item.status]}
                        </span>
                      </div>
                      <div className="flex gap-3 text-xs text-[hsl(var(--muted-foreground))] flex-wrap">
                        <span>⏰ {item.deadline}</span>
                        <span className="font-semibold text-amber-500">📋 {item.proposals} {fa ? 'پیشنهاد' : 'proposals'}</span>
                        {item.budget > 0 && <span className="text-green-500 font-semibold">💰 {(item.budget/1e9).toFixed(1)}B IRR</span>}
                      </div>
                      {item.subject && <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1.5 line-clamp-1">{item.subject}</p>}
                    </div>
                    <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                      {/* Key config button */}
                      {item.status !== 'awarded' && (
                        <button onClick={() => setKeyConfigTid(item.id)}
                          className="text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors"
                          style={{ borderColor: 'rgba(245,158,11,.35)', background: 'rgba(245,158,11,.08)', color: '#f59e0b' }}>
                          🗝️ {fa ? 'کلید' : 'Keys'}
                          {getConfig(item.id).enabled && <span className="ms-1 text-[9px] font-bold">●</span>}
                        </button>
                      )}
                      <button onClick={() => setSelected(item)} className="text-xs px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.5)]">
                        {fa ? 'مشاهده' : 'View'}
                      </button>
                      {item.proposals > 0 && item.status !== 'open' && (
                        <button
                          onClick={() => handleOpenProposals(item)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-[hsl(var(--primary))] text-white hover:opacity-90"
                        >
                          📋 {fa ? `${item.proposals} پیشنهاد` : `${item.proposals} Proposals`}
                        </button>
                      )}
                      {item.status === 'open' && (
                        <button
                          onClick={() => {
                            if (confirm(fa ? 'آیا مناقصه را ببندید؟' : 'Close this tender?'))
                              setItems(prev => prev.map((p: any) => p.id === item.id ? { ...p, status: 'closed' } : p));
                          }}
                          className="text-xs px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] text-amber-500 border-amber-500/30 hover:bg-amber-500/10"
                        >
                          {fa ? 'بستن' : 'Close'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Tender Modal */}
      {showNew && <NewTenderModal lang={lang} onClose={() => setShowNew(false)} onSubmit={(t: any) => { setItems(prev => [...prev, t]); setShowNew(false); }} />}

      {/* Key config modal */}
      {keyConfigTid && (() => {
        const t = items.find((x: any) => x.id === keyConfigTid);
        if (!t) return null;
        return (
          <MnqKeyConfigModal
            tender={t}
            config={getConfig(keyConfigTid)}
            onSave={cfg => saveKeyConfig(keyConfigTid, cfg)}
            onClose={() => setKeyConfigTid(null)}
            fa={fa}
          />
        );
      })()}

      {/* Key ceremony modal */}
      {keyCeremonyTid && (() => {
        const t = items.find((x: any) => x.id === keyCeremonyTid);
        if (!t) return null;
        const cfg = getConfig(keyCeremonyTid);
        return (
          <MnqKeyCeremonyModal
            tender={t}
            config={cfg}
            onUpdate={newCfg => setKeyConfigs(prev => ({ ...prev, [keyCeremonyTid]: newCfg }))}
            onConfirm={() => { setKeyCeremonyTid(null); setShowProposals(t); }}
            onClose={() => setKeyCeremonyTid(null)}
            onSetPassword={slot => setSetPasswordKey({ tid: keyCeremonyTid, slot })}
            fa={fa}
          />
        );
      })()}

      {/* Set password modal */}
      {setPasswordKey && (() => {
        const cfg = getConfig(setPasswordKey.tid);
        const key = cfg.keys.find(k => k.slot === setPasswordKey.slot);
        const t = items.find((x: any) => x.id === setPasswordKey.tid);
        if (!key) return null;
        return (
          <MnqSetPasswordModal
            tenderTitle={t?.title || setPasswordKey.tid}
            keySlot={key.slot}
            keyLabel={key.label}
            onSave={(slot, hash, setAt) => setKeyPassword(setPasswordKey.tid, slot, hash, setAt)}
            onClose={() => setSetPasswordKey(null)}
            fa={fa}
          />
        );
      })()}

      {/* My keys modal */}
      {showMyKeys && (
        <MnqMyKeysModal
          keyConfigsByTender={keyConfigs}
          tendersMap={Object.fromEntries(items.map((t: any) => [t.id, t]))}
          onSetPassword={(tid, slot) => setSetPasswordKey({ tid, slot })}
          onClose={() => setShowMyKeys(false)}
          fa={fa}
        />
      )}

      {/* Proposals Modal */}
      {showProposals && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-lg p-6 shadow-2xl my-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">📋 {fa ? 'پیشنهادهای دریافتی' : 'Received Proposals'}</h2>
              <button onClick={() => setShowProposals(null)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            <div className="space-y-3">
              {Array.from({ length: showProposals.proposals }).map((_, i) => (
                <div key={i} className={`rounded-xl border p-4 ${i === 0 ? 'border-green-500/30 bg-green-500/5' : 'border-[hsl(var(--border))]'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold">
                        {i === 0 && <span className="text-xs px-1.5 py-0.5 bg-green-500/20 text-green-500 rounded mr-2">🥇 {fa ? 'کمترین قیمت' : 'Lowest'}</span>}
                        {fa ? `شرکت نمونه ${i + 1}` : `Company ${i + 1}`}
                      </div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                        💰 {((5 + i) * 1000000000 / 1e9).toFixed(1)}B IRR · 📅 {i + 30} {fa ? 'روز' : 'days delivery'}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-xs px-2 py-1 rounded-lg border border-green-500/30 text-green-500 hover:bg-green-500/10">
                        {fa ? '🏆 برنده' : '🏆 Award'}
                      </button>
                      <button className="text-xs px-2 py-1 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.5)]">
                        {fa ? 'جزئیات' : 'Details'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NewTenderModal({ lang, onClose, onSubmit }: { lang: string; onClose: () => void; onSubmit: (t: any) => void }) {
  const fa = lang === 'fa';
  const { toast } = useUIStore();
  const [type, setType] = useState('goods');
  const [form, setForm] = useState({ title: '', subject: '', description: '', deadline: '', deadlineTime: '23:59', deliveryPlace: '', deliveryDays: '', paymentTerms: '', budget: '', budgetVisible: false, isPublic: true });
  const [itemRows, setItemRows] = useState([{ name: '', qty: '', unit: 'تن', specs: '' }]);
  const [criteria, setCriteria] = useState([{ label: fa ? 'قیمت' : 'Price', weight: '60' }, { label: fa ? 'تحویل' : 'Delivery', weight: '40' }]);
  const [reqDocs, setReqDocs] = useState('');

  const inp = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]";

  const addItem = () => setItemRows(prev => [...prev, { name: '', qty: '', unit: 'تن', specs: '' }]);
  const setItemField = (i: number, k: string, v: string) =>
    setItemRows(prev => prev.map((r, idx) => idx === i ? { ...r, [k]: v } : r));

  const totalWeight = criteria.reduce((s, c) => s + Number(c.weight || 0), 0);

  const handleSubmit = () => {
    if (!form.title) { toast('error', fa ? 'عنوان الزامی است' : 'Title required'); return; }
    if (!form.deadline) { toast('error', fa ? 'مهلت الزامی است' : 'Deadline required'); return; }
    if (totalWeight !== 100) { toast('error', fa ? 'مجموع وزن معیارها باید ۱۰۰٪ باشد' : 'Criteria weights must total 100%'); return; }
    onSubmit({
      id: `MNQ-MY-${Date.now()}`, type, title: form.title, status: 'open',
      deadline: form.deadline, proposals: 0, budget: Number(form.budget) || 0, subject: form.subject,
      items: itemRows.filter(r => r.name),
    });
    toast('success', fa ? 'مناقصه منتشر شد' : 'Tender published');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-2xl p-6 shadow-2xl my-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg">📝 {fa ? 'مناقصه جدید' : 'New Tender'}</h2>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] text-xl">✕</button>
        </div>

        <div className="space-y-5">
          {/* Type selector */}
          <div>
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-2 block">{fa ? 'نوع مناقصه' : 'Tender Type'}</label>
            <div className="grid grid-cols-5 gap-2">
              {MNQ_TYPES.map(t => (
                <button key={t.id} onClick={() => setType(t.id)}
                  className={`p-2.5 rounded-xl border text-center transition-all text-xs ${type === t.id ? 'bg-[hsl(var(--primary))] text-white border-transparent' : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)]'}`}>
                  <div className="text-xl mb-1">{t.icon}</div>
                  {fa ? t.label : t.en}
                </button>
              ))}
            </div>
          </div>

          {/* Basic info */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'عنوان مناقصه *' : 'Tender Title *'}</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className={inp} placeholder={fa ? 'مثال: مناقصه تأمین مواد اولیه' : 'e.g. Raw Materials Tender'} />
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'خلاصه موضوع' : 'Subject Summary'}</label>
              <input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className={inp} />
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'توضیحات کامل' : 'Full Description'}</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className={inp + " resize-none"} />
            </div>
          </div>

          {/* Items */}
          <div className="rounded-xl border border-[hsl(var(--border))] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">📦 {fa ? 'اقلام' : 'Items'}</h3>
              <button onClick={addItem} className="text-xs px-3 py-1.5 rounded-lg border border-[hsl(var(--primary)/0.3)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.08)]">
                ➕ {fa ? 'افزودن' : 'Add'}
              </button>
            </div>
            {itemRows.map((row, i) => (
              <div key={i} className="bg-[hsl(var(--background))] rounded-lg p-3 space-y-2">
                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-2">
                    <label className="text-[10px] text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'نام قلم *' : 'Item Name *'}</label>
                    <input value={row.name} onChange={e => setItemField(i, 'name', e.target.value)} className={inp} placeholder={fa ? 'مثال: روغن پالم' : 'e.g. Palm Oil'} />
                  </div>
                  <div>
                    <label className="text-[10px] text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'مقدار' : 'Qty'}</label>
                    <input value={row.qty} onChange={e => setItemField(i, 'qty', e.target.value)} type="number" className={inp} />
                  </div>
                  <div>
                    <label className="text-[10px] text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'واحد' : 'Unit'}</label>
                    <select value={row.unit} onChange={e => setItemField(i, 'unit', e.target.value)} className={inp}>
                      {['تن','کیلوگرم','لیتر','متر','عدد','دست'].map(u => <option key={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'مشخصات فنی' : 'Technical Specs'}</label>
                  <input value={row.specs} onChange={e => setItemField(i, 'specs', e.target.value)} className={inp} placeholder={fa ? 'گرید، استاندارد...' : 'Grade, standard...'} />
                </div>
              </div>
            ))}
          </div>

          {/* Conditions */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'مهلت ارسال پیشنهاد *' : 'Submission Deadline *'}</label>
              <input value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} className={inp} placeholder="1403/06/15" />
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'ساعت مهلت' : 'Deadline Time'}</label>
              <input value={form.deadlineTime} onChange={e => setForm({...form, deadlineTime: e.target.value})} type="time" className={inp} />
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'محل تحویل' : 'Delivery Place'}</label>
              <input value={form.deliveryPlace} onChange={e => setForm({...form, deliveryPlace: e.target.value})} className={inp} />
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'زمان تحویل (روز)' : 'Delivery Days'}</label>
              <input value={form.deliveryDays} onChange={e => setForm({...form, deliveryDays: e.target.value})} type="number" className={inp} />
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'شرایط پرداخت' : 'Payment Terms'}</label>
              <input value={form.paymentTerms} onChange={e => setForm({...form, paymentTerms: e.target.value})} className={inp} placeholder={fa ? '۳۰ روزه' : '30 days'} />
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'سقف بودجه (اختیاری)' : 'Budget Cap (optional)'}</label>
              <input value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} type="number" className={inp} placeholder="10000000000" />
            </div>
          </div>

          {/* Evaluation Criteria */}
          <div className="rounded-xl border border-[hsl(var(--border))] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">⚖️ {fa ? 'معیارهای ارزیابی' : 'Evaluation Criteria'}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${totalWeight === 100 ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
                {fa ? 'مجموع: ' : 'Total: '}{totalWeight}%
              </span>
            </div>
            {criteria.map((c, i) => (
              <div key={i} className="flex gap-2">
                <input value={c.label} onChange={e => setCriteria(prev => prev.map((r, idx) => idx === i ? { ...r, label: e.target.value } : r))}
                  className={inp + " flex-1"} placeholder={fa ? 'معیار ارزیابی' : 'Criterion'} />
                <input value={c.weight} onChange={e => setCriteria(prev => prev.map((r, idx) => idx === i ? { ...r, weight: e.target.value } : r))}
                  type="number" max="100" className={inp + " w-20"} placeholder="%" />
                {criteria.length > 1 && (
                  <button onClick={() => setCriteria(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 px-2">✕</button>
                )}
              </div>
            ))}
            <button onClick={() => setCriteria(prev => [...prev, { label: '', weight: '0' }])}
              className="text-xs text-[hsl(var(--primary))] hover:underline">
              ➕ {fa ? 'افزودن معیار' : 'Add Criterion'}
            </button>
          </div>

          {/* Required docs */}
          <div>
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'مدارک مورد نیاز (هر مدرک یک خط)' : 'Required Documents (one per line)'}</label>
            <textarea value={reqDocs} onChange={e => setReqDocs(e.target.value)} rows={3} className={inp + " resize-none"}
              placeholder={fa ? 'گواهی ثبت شرکت\nجواز کسب\nسابقه کار' : 'Company registration\nBusiness license\nWork experience'} />
          </div>

          {/* Toggles */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.budgetVisible} onChange={e => setForm({...form, budgetVisible: e.target.checked})} className="w-4 h-4" />
              <span className="text-sm">{fa ? 'نمایش بودجه به متقاضیان' : 'Show budget to participants'}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isPublic} onChange={e => setForm({...form, isPublic: e.target.checked})} className="w-4 h-4" />
              <span className="text-sm">{fa ? 'دعوت عمومی (همه شرکاء)' : 'Public invite (all partners)'}</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg border border-[hsl(var(--border))] text-sm">{fa ? 'انصراف' : 'Cancel'}</button>
          <button onClick={() => { onSubmit({ id: `MNQ-DRAFT-${Date.now()}`, type, title: form.title || fa ? 'پیش‌نویس' : 'Draft', status: 'draft', deadline: form.deadline, proposals: 0, budget: Number(form.budget) || 0, subject: form.subject, items: itemRows }); }} className="px-5 py-2.5 rounded-lg border border-[hsl(var(--border))] text-sm">
            📝 {fa ? 'ذخیره پیش‌نویس' : 'Save Draft'}
          </button>
          <button onClick={handleSubmit} className="flex-1 px-5 py-2.5 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-bold">
            📢 {fa ? 'انتشار مناقصه' : 'Publish Tender'}
          </button>
        </div>
      </div>
    </div>
  );
}
