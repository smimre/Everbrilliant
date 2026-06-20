'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useAuthStore } from '@/store/auth.store';
import { useConnections } from '@/hooks/use-trading';
import {
  useInbox, useSent, useStarred,
  useSendMessage, useMarkRead, useMarkAllRead, useToggleStar, useReplyMessage,
} from '@/hooks/use-messaging';
import { useUIStore } from '@/store';

type Tab = 'inbox' | 'sent' | 'starred';
type MsgType = 'message' | 'notification' | 'contract' | 'logistics' | 'customs';

const TYPE_CONFIG: Record<MsgType, { icon: string; color: string; label: string; labelFa: string; labelHi?: string }> = {
  message:      { icon: '💬', color: '#3b82f6', label: 'Message',      labelFa: 'پیام',      labelHi: 'संदेश' },
  notification: { icon: '🔔', color: '#f59e0b', label: 'Notification',  labelFa: 'اعلان',    labelHi: 'सूचना' },
  contract:     { icon: '📄', color: '#8b5cf6', label: 'Contract',      labelFa: 'قرارداد',  labelHi: 'अनुबंध' },
  logistics:    { icon: '🚛', color: '#06b6d4', label: 'Logistics',     labelFa: 'لجستیک',   labelHi: 'लॉजिस्टिक्स' },
  customs:      { icon: '🛃', color: '#ef4444', label: 'Customs',       labelFa: 'گمرک',     labelHi: 'सीमाशुल्क' },
};

function fmtDate(iso: string, fa: boolean) {
  try { return new Date(iso).toLocaleDateString(fa ? 'fa-IR' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return iso; }
}

export function InboxModule() {
  const { lang } = useLocaleStore();
  const { user } = useAuthStore();
  const { toast } = useUIStore();
  const fa = lang === 'fa';

  const [tab, setTab] = useState<Tab>('inbox');
  const [selected, setSelected] = useState<any>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null);

  const { data: inboxData, isLoading: inboxLoading } = useInbox();
  const { data: sentData,  isLoading: sentLoading  } = useSent();
  const { data: starData,  isLoading: starLoading  } = useStarred();
  const { data: rawConns } = useConnections();

  const inbox:   any[] = (inboxData as any)?.data ?? [];
  const sent:    any[] = (sentData  as any)?.data ?? [];
  const starred: any[] = (starData  as any)?.data ?? [];

  const conns: any[] = (rawConns as any)?.data ?? [];
  const contacts = conns
    .filter((c: any) => (c.status || '').toLowerCase() === 'active')
    .map((c: any) => {
      const isA = c.companyAId === user?.companyId;
      const peer = isA ? c.companyB : c.companyA;
      return { id: peer?.id, name: peer?.name ?? '' };
    })
    .filter(c => c.id);

  const markRead   = useMarkRead();
  const markAll    = useMarkAllRead();
  const toggleStar = useToggleStar();
  const sendMsg    = useSendMessage();
  const replyMsg   = useReplyMessage();

  const openMessage = (msg: any) => {
    setSelected(msg);
    if (!msg.isRead && msg.toCompanyId === user?.companyId) {
      markRead.mutate(msg.id);
    }
  };

  const currentList = tab === 'inbox' ? inbox : tab === 'sent' ? sent : starred;
  const isLoading   = tab === 'inbox' ? inboxLoading : tab === 'sent' ? sentLoading : starLoading;
  const unreadCount = inbox.filter(m => !m.isRead).length;

  const inp = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">📥 {fa ? 'صندوق پیام' : 'Messages'}</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {fa ? `${unreadCount} پیام خوانده نشده` : `${unreadCount} unread`}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => markAll.mutate()}
              className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted)/0.5)]"
            >
              {fa ? 'همه را خوانده کن' : 'Mark all read'}
            </button>
          )}
          <button
            onClick={() => { setShowCompose(true); setReplyTo(null); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium"
          >
            ✏️ {fa ? 'پیام جدید' : 'New Message'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: '📥', val: inbox.length,   label: fa ? 'دریافت شده' : 'Received',  color: '#3b82f6' },
          { icon: '🔵', val: unreadCount,     label: fa ? 'خوانده نشده' : 'Unread',   color: unreadCount > 0 ? '#ef4444' : '#10b981' },
          { icon: '⭐', val: starred.length,  label: fa ? 'ستاره‌دار' : 'Starred',   color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-3 text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-xl font-bold" style={{ color: s.color }}>{s.val}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[hsl(var(--secondary))] rounded-xl">
        {([
          { id: 'inbox',   label: fa ? '📥 دریافتی' : '📥 Inbox',   badge: unreadCount },
          { id: 'sent',    label: fa ? '📤 ارسالی'  : '📤 Sent',    badge: 0 },
          { id: 'starred', label: fa ? '⭐ ستاره‌دار' : '⭐ Starred', badge: 0 },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setSelected(null); }}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? 'bg-[hsl(var(--primary))] text-white' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
            }`}
          >
            {t.label}
            {t.badge > 0 && (
              <span className="text-[10px] font-bold bg-white/20 rounded-full px-1.5 py-0.5 leading-none">{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Message list */}
      {isLoading ? (
        <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="h-16 rounded-xl bg-[hsl(var(--muted)/0.5)] animate-pulse" />)}</div>
      ) : currentList.length === 0 ? (
        <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">
          <div className="text-4xl mb-3">📭</div>
          <p className="font-medium">{fa ? 'پیامی وجود ندارد' : 'No messages'}</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {currentList.map((msg: any) => {
            const isInbox = msg.toCompanyId === user?.companyId;
            const cfg = TYPE_CONFIG[(msg.type as MsgType)] ?? TYPE_CONFIG.message;
            const isUnread = !msg.isRead && isInbox;
            const otherCompany = isInbox ? msg.fromCompany?.name : msg.toCompany?.name;

            return (
              <div
                key={msg.id}
                onClick={() => openMessage(msg)}
                className={`flex gap-3 p-3.5 rounded-xl border cursor-pointer transition-all hover:border-[hsl(var(--primary)/0.3)] ${
                  isUnread
                    ? 'border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--primary)/0.04)]'
                    : 'border-[hsl(var(--border))] bg-[hsl(var(--secondary))]'
                }`}
              >
                {/* Icon */}
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-base"
                  style={{ background: cfg.color + '18', border: `1px solid ${cfg.color}30` }}>
                  {cfg.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className={`text-sm truncate ${isUnread ? 'font-bold' : 'font-semibold'}`}>
                      {msg.subject}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {msg.isStarred && <span className="text-xs">⭐</span>}
                      <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                        {fmtDate(msg.createdAt, fa)}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                    {isInbox ? (fa ? 'از: ' : 'From: ') : (fa ? 'به: ' : 'To: ')}
                    {otherCompany} — {msg.body.slice(0, 70)}{msg.body.length > 70 ? '...' : ''}
                  </div>
                </div>

                {/* Unread dot */}
                {isUnread && (
                  <div className="w-2 h-2 rounded-full bg-[hsl(var(--primary))] shrink-0 mt-1.5" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Message Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-lg p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <h2 className="font-bold text-lg flex-1 me-4">{selected.subject}</h2>
              <button onClick={() => setSelected(null)} className="text-xl text-[hsl(var(--muted-foreground))] shrink-0">✕</button>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-3 mb-4 p-3 bg-[hsl(var(--background))] rounded-xl">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0"
                style={{ background: (TYPE_CONFIG[selected.type as MsgType] ?? TYPE_CONFIG.message).color + '18' }}>
                {(TYPE_CONFIG[selected.type as MsgType] ?? TYPE_CONFIG.message).icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{selected.fromUser?.name}</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">
                  {selected.fromCompany?.name} — {fmtDate(selected.createdAt, fa)}
                </div>
              </div>
              <button
                onClick={() => toggleStar.mutate(selected.id)}
                className="text-xl shrink-0 hover:scale-110 transition-transform"
              >
                {selected.isStarred ? '⭐' : '☆'}
              </button>
            </div>

            {/* Body */}
            <div className="text-sm leading-relaxed text-[hsl(var(--foreground))] p-4 bg-[hsl(var(--muted)/0.2)] rounded-xl mb-4 whitespace-pre-wrap">
              {selected.body}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={() => setSelected(null)} className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">
                {fa ? 'بستن' : 'Close'}
              </button>
              {selected.toCompanyId === user?.companyId && (
                <button
                  onClick={() => { setSelected(null); setReplyTo(selected); setShowCompose(true); }}
                  className="flex-1 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium"
                >
                  ↩️ {fa ? 'پاسخ' : 'Reply'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Compose / Reply Modal */}
      {showCompose && (
        <ComposeModal
          fa={fa}
          contacts={contacts}
          replyTo={replyTo}
          sendMsg={sendMsg}
          replyMsg={replyMsg}
          toast={toast}
          onClose={() => { setShowCompose(false); setReplyTo(null); }}
          inp={inp}
        />
      )}
    </div>
  );
}

function ComposeModal({ fa, contacts, replyTo, sendMsg, replyMsg, toast, onClose, inp }: any) {
  const [to, setTo]           = useState('');
  const [subject, setSubject] = useState(replyTo ? (replyTo.subject.startsWith('Re:') ? replyTo.subject : `Re: ${replyTo.subject}`) : '');
  const [body, setBody]       = useState('');

  const handleSend = () => {
    if (!body.trim()) { toast('error', fa ? 'متن پیام الزامی است' : 'Message body required'); return; }
    if (replyTo) {
      replyMsg.mutate(
        { id: replyTo.id, body },
        {
          onSuccess: () => { toast('success', fa ? 'پاسخ ارسال شد' : 'Reply sent'); onClose(); },
          onError: (e: any) => toast('error', e?.message || (fa ? 'خطا در ارسال' : 'Failed to send')),
        }
      );
    } else {
      if (!to) { toast('error', fa ? 'انتخاب گیرنده الزامی است' : 'Recipient required'); return; }
      if (!subject.trim()) { toast('error', fa ? 'موضوع الزامی است' : 'Subject required'); return; }
      sendMsg.mutate(
        { toCompanyId: Number(to), subject, body },
        {
          onSuccess: () => { toast('success', fa ? 'پیام ارسال شد' : 'Message sent'); onClose(); },
          onError: (e: any) => toast('error', e?.message || (fa ? 'خطا در ارسال' : 'Failed to send')),
        }
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-lg p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg">
            {replyTo ? `↩️ ${fa ? 'پاسخ به' : 'Reply to'}: ${replyTo.subject}` : `✏️ ${fa ? 'پیام جدید' : 'New Message'}`}
          </h2>
          <button onClick={onClose} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
        </div>

        {/* Quoted original for replies */}
        {replyTo && (
          <div className="mb-4 p-3 rounded-xl border-s-4 border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--muted)/0.3)] text-xs text-[hsl(var(--muted-foreground))]">
            <div className="font-medium mb-1">{replyTo.fromCompany?.name}:</div>
            <div className="line-clamp-3">{replyTo.body}</div>
          </div>
        )}

        <div className="space-y-3">
          {!replyTo && (
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'ارسال به *' : 'To *'}</label>
              {contacts.length === 0 ? (
                <p className="text-xs text-[hsl(var(--muted-foreground))] p-3 rounded-lg bg-[hsl(var(--muted)/0.3)]">
                  {fa ? 'برای ارسال پیام باید به یک شرکت متصل باشید' : 'You need connections to send messages'}
                </p>
              ) : (
                <select value={to} onChange={e => setTo(e.target.value)} className={inp}>
                  <option value="">{fa ? '-- انتخاب شرکت --' : '-- Select Company --'}</option>
                  {contacts.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}
            </div>
          )}
          {!replyTo && (
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'موضوع *' : 'Subject *'}</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} className={inp} placeholder={fa ? 'موضوع پیام' : 'Message subject'} />
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'متن پیام *' : 'Message *'}</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={5}
              className={inp + ' resize-none'}
              placeholder={fa ? 'پیام خود را بنویسید...' : 'Write your message...'}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">
            {fa ? 'انصراف' : 'Cancel'}
          </button>
          <button
            onClick={handleSend}
            disabled={sendMsg.isPending || replyMsg.isPending}
            className="flex-1 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium disabled:opacity-50"
          >
            {(sendMsg.isPending || replyMsg.isPending) ? (fa ? 'در حال ارسال...' : 'Sending...') : `📤 ${fa ? 'ارسال' : 'Send'}`}
          </button>
        </div>
      </div>
    </div>
  );
}
