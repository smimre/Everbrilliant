'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useAuthStore } from '@/store/auth.store';
import { FileText, Plus, Edit2, Eye, Stamp, PenTool, Trash2, X, Check } from 'lucide-react';

interface LHTemplate {
  id: string;
  name: string;
  companyName: string;
  companyNameEn: string;
  logo: string;
  primaryColor: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  style: 'modern' | 'classic' | 'minimal';
  footerText: string;
}

interface LHDoc {
  id: string;
  templateId: string;
  title: string;
  content: string;
  date: string;
  docNo: string;
}

const INIT_TEMPLATES: LHTemplate[] = [
  { id: 'LHT-001', name: 'سربرگ رسمی شرکت', companyName: 'شرکت ایورتریدینگ', companyNameEn: 'Evertrading Co.', logo: '🏢', primaryColor: '#2563eb', address: 'تهران، خیابان ولیعصر، پلاک ۱۲۳', phone: '۰۲۱-۱۲۳۴۵۶۷۸', email: 'info@evertrading.ir', website: 'www.evertrading.ir', style: 'modern', footerText: 'این سند به صورت دیجیتال صادر شده است' },
  { id: 'LHT-002', name: 'سربرگ قرارداد',    companyName: 'شرکت ایورتریدینگ', companyNameEn: 'Evertrading Co.', logo: '📋', primaryColor: '#7c3aed', address: 'تهران، خیابان ولیعصر، پلاک ۱۲۳', phone: '۰۲۱-۱۲۳۴۵۶۷۸', email: 'info@evertrading.ir', website: '', style: 'classic', footerText: 'محرمانه — برای استفاده داخلی' },
];

const INIT_DOCS: LHDoc[] = [
  { id: 'LHD-001', templateId: 'LHT-001', title: 'معرفی‌نامه آقای رضایی',    docNo: 'DOC-1403-001', content: 'بدینوسیله آقای رضایی به عنوان نماینده شرکت معرفی می‌گردند.', date: '۱۴۰۳/۰۲/۱۰' },
  { id: 'LHD-002', templateId: 'LHT-002', title: 'قرارداد مشاوره فصلی',       docNo: 'DOC-1403-002', content: 'قرارداد مشاوره برای سه ماهه دوم سال ۱۴۰۳', date: '۱۴۰۳/۰۳/۰۱' },
];

const STYLE_LABELS = { modern: 'مدرن', classic: 'کلاسیک', minimal: 'مینیمال' };

type Tab = 'templates' | 'docs' | 'seals' | 'sigs';

function TemplatePreview({ tpl }: { tpl: LHTemplate }) {
  return (
    <div style={{ background: '#fff', borderBottom: `3px solid ${tpl.primaryColor}`, padding: '12px', borderRadius: '8px 8px 0 0', direction: 'rtl', minHeight: '70px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <span style={{ fontSize: '22px' }}>{tpl.logo}</span>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 800, color: tpl.primaryColor }}>{tpl.companyName}</div>
          {tpl.companyNameEn && <div style={{ fontSize: '9px', color: '#64748b' }}>{tpl.companyNameEn}</div>}
        </div>
      </div>
      <div style={{ fontSize: '8px', color: '#94a3b8' }}>{tpl.address?.slice(0, 50)}</div>
      <div style={{ fontSize: '8px', color: '#94a3b8' }}>{tpl.phone}{tpl.email ? ' | ' + tpl.email : ''}</div>
    </div>
  );
}

export function LetterheadPage() {
  const { lang } = useLocaleStore();
  const { user } = useAuthStore();
  const fa = lang === 'fa';
  const [tab, setTab] = useState<Tab>('templates');
  const [templates, setTemplates] = useState<LHTemplate[]>(INIT_TEMPLATES);
  const [docs, setDocs] = useState<LHDoc[]>(INIT_DOCS);
  const [showNewTpl, setShowNewTpl] = useState(false);
  const [editingTpl, setEditingTpl] = useState<LHTemplate | null>(null);
  const [showNewDoc, setShowNewDoc] = useState(false);
  const [previewTpl, setPreviewTpl] = useState<LHTemplate | null>(null);
  const [tplForm, setTplForm] = useState<{ name: string; companyName: string; companyNameEn: string; logo: string; primaryColor: string; address: string; phone: string; email: string; website: string; style: 'modern' | 'classic' | 'minimal'; footerText: string }>({ name: '', companyName: '', companyNameEn: '', logo: '🏢', primaryColor: '#2563eb', address: '', phone: '', email: '', website: '', style: 'modern', footerText: '' });
  const [docForm, setDocForm] = useState({ templateId: '', title: '', content: '', docNo: '' });

  const setTpl = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setTplForm(f => ({ ...f, [k]: e.target.value }));
  const setDoc = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setDocForm(f => ({ ...f, [k]: e.target.value }));

  const openNewTpl = () => {
    setTplForm({ name: '', companyName: user?.name || '', companyNameEn: '', logo: '🏢', primaryColor: '#2563eb', address: '', phone: '', email: '', website: '', style: 'modern', footerText: 'این سند به صورت دیجیتال صادر شده است' });
    setEditingTpl(null);
    setShowNewTpl(true);
  };

  const openEditTpl = (tpl: LHTemplate) => {
    setTplForm({ name: tpl.name, companyName: tpl.companyName, companyNameEn: tpl.companyNameEn, logo: tpl.logo, primaryColor: tpl.primaryColor, address: tpl.address, phone: tpl.phone, email: tpl.email, website: tpl.website, style: tpl.style as 'modern' | 'classic' | 'minimal', footerText: tpl.footerText });
    setEditingTpl(tpl);
    setShowNewTpl(true);
  };

  const saveTpl = () => {
    if (!tplForm.name || !tplForm.companyName) return alert(fa ? 'نام قالب و شرکت الزامی' : 'Template name and company are required');
    if (editingTpl) {
      setTemplates(ts => ts.map(t => t.id === editingTpl.id ? { ...t, ...tplForm } : t));
    } else {
      setTemplates(ts => [...ts, { id: 'LHT-' + Date.now(), ...tplForm }]);
    }
    setShowNewTpl(false);
  };

  const delTpl = (id: string) => {
    if (!confirm(fa ? 'این قالب حذف شود؟' : 'Delete this template?')) return;
    setTemplates(ts => ts.filter(t => t.id !== id));
  };

  const saveDoc = () => {
    if (!docForm.templateId || !docForm.title) return alert(fa ? 'قالب و عنوان الزامی' : 'Template and title required');
    setDocs(ds => [...ds, {
      id: 'LHD-' + Date.now(), ...docForm,
      docNo: 'DOC-' + Date.now().toString().slice(-4),
      date: new Date().toLocaleDateString('fa-IR'),
    }]);
    setShowNewDoc(false);
    setDocForm({ templateId: '', title: '', content: '', docNo: '' });
  };

  const tabs: { id: Tab; icon: string; fa: string; en: string }[] = [
    { id: 'templates', icon: '📋', fa: 'قالب‌های سربرگ', en: 'Templates' },
    { id: 'docs',      icon: '📄', fa: 'اسناد',           en: 'Documents' },
    { id: 'seals',     icon: '🔵', fa: 'مهرها',           en: 'Seals' },
    { id: 'sigs',      icon: '✍️', fa: 'امضاها',          en: 'Signatures' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileText className="w-5 h-5 text-[hsl(var(--primary))]"/>
          {fa ? 'سربرگ دیجیتال' : 'Digital Letterhead'}
        </h2>
      </div>
      <p className="text-sm text-[hsl(var(--muted-foreground))]">
        {fa ? 'اسناد رسمی با مهر و امضای دیجیتال بسازید' : 'Create official documents with digital seals & signatures'}
      </p>

      {/* Tabs */}
      <div className="flex gap-1 bg-[hsl(var(--secondary))] rounded-xl p-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${tab === t.id ? 'bg-[hsl(var(--primary))] text-white' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`}>
            {t.icon} {fa ? t.fa : t.en}
          </button>
        ))}
      </div>

      {/* Templates */}
      {tab === 'templates' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={openNewTpl} className="flex items-center gap-1.5 px-3 py-2 bg-[hsl(var(--primary))] text-white rounded-lg text-sm font-bold">
              <Plus className="w-4 h-4"/> {fa ? 'قالب جدید' : 'New Template'}
            </button>
          </div>
          {templates.length === 0 ? (
            <div className="py-16 text-center text-[hsl(var(--muted-foreground))] border border-dashed border-[hsl(var(--border))] rounded-xl">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-20"/>
              <p>{fa ? 'قالبی ندارید' : 'No templates yet'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {templates.map(tpl => (
                <div key={tpl.id} className="rounded-xl border border-[hsl(var(--border))] overflow-hidden hover:border-[hsl(var(--primary)/0.4)] transition-colors">
                  <TemplatePreview tpl={tpl}/>
                  <div className="p-3 bg-[hsl(var(--secondary))]">
                    <div className="font-bold text-sm mb-0.5">{tpl.name}</div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))] mb-3">
                      {fa ? 'سبک:' : 'Style:'} {STYLE_LABELS[tpl.style]} &nbsp;|&nbsp;
                      <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: tpl.primaryColor, verticalAlign: 'middle' }}/>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => { setDocForm(f => ({ ...f, templateId: tpl.id })); setShowNewDoc(true); }}
                        className="flex-1 text-xs py-1.5 bg-[hsl(var(--primary))] text-white rounded-lg font-bold">
                        ✍️ {fa ? 'سند جدید' : 'New Doc'}
                      </button>
                      <button onClick={() => openEditTpl(tpl)} className="p-1.5 border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--background))] text-[hsl(var(--muted-foreground))]">
                        <Edit2 className="w-3.5 h-3.5"/>
                      </button>
                      <button onClick={() => setPreviewTpl(tpl)} className="p-1.5 border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--background))] text-[hsl(var(--muted-foreground))]">
                        <Eye className="w-3.5 h-3.5"/>
                      </button>
                      <button onClick={() => delTpl(tpl.id)} className="p-1.5 border border-red-500/20 rounded-lg hover:bg-red-500/10 text-red-400">
                        <Trash2 className="w-3.5 h-3.5"/>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Documents */}
      {tab === 'docs' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowNewDoc(true)} className="flex items-center gap-1.5 px-3 py-2 bg-[hsl(var(--primary))] text-white rounded-lg text-sm font-bold">
              <Plus className="w-4 h-4"/> {fa ? 'سند جدید' : 'New Document'}
            </button>
          </div>
          {docs.length === 0 ? (
            <div className="py-16 text-center text-[hsl(var(--muted-foreground))] border border-dashed border-[hsl(var(--border))] rounded-xl">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-20"/>
              <p>{fa ? 'سندی ایجاد نشده' : 'No documents yet'}</p>
            </div>
          ) : (
            <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden bg-[hsl(var(--secondary))]">
              <div className="divide-y divide-[hsl(var(--border))]">
                {docs.map(doc => {
                  const tpl = templates.find(t => t.id === doc.templateId);
                  return (
                    <div key={doc.id} className="flex items-center gap-3 p-4 hover:bg-[hsl(var(--background))] transition-colors">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: (tpl?.primaryColor || '#2563eb') + '20' }}>
                        {tpl?.logo || '📄'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{doc.title}</div>
                        <div className="text-xs text-[hsl(var(--muted-foreground))]">
                          {doc.docNo} | {tpl?.name || '—'} | {doc.date}
                        </div>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button className="p-1.5 border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--background))] text-[hsl(var(--muted-foreground))]">
                          <Eye className="w-3.5 h-3.5"/>
                        </button>
                        <button className="p-1.5 border border-red-500/20 rounded-lg hover:bg-red-500/10 text-red-400"
                          onClick={() => setDocs(ds => ds.filter(d => d.id !== doc.id))}>
                          <Trash2 className="w-3.5 h-3.5"/>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Seals */}
      {tab === 'seals' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['🔵', '🟣', '⭕', '🔴'].map((icon, i) => (
              <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4 text-center">
                <div className="text-4xl mb-2">{icon}</div>
                <div className="text-xs font-semibold">{fa ? `مهر ${i + 1}` : `Seal ${i + 1}`}</div>
                <div className="text-[10px] text-[hsl(var(--muted-foreground))]">{fa ? 'کلیک برای آپلود' : 'Click to upload'}</div>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-xl border border-dashed border-[hsl(var(--border))] text-center text-sm text-[hsl(var(--muted-foreground))]">
            <Stamp className="w-8 h-8 mx-auto mb-2 opacity-30"/>
            <p>{fa ? 'تصویر مهر را بارگذاری کنید (PNG با پس‌زمینه شفاف)' : 'Upload seal image (PNG with transparent background)'}</p>
            <button className="mt-3 px-4 py-2 bg-[hsl(var(--primary))] text-white rounded-lg text-xs font-bold">
              + {fa ? 'آپلود مهر' : 'Upload Seal'}
            </button>
          </div>
        </div>
      )}

      {/* Signatures */}
      {tab === 'sigs' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: fa ? 'مدیرعامل' : 'CEO',           sig: '~Signature~' },
              { name: fa ? 'مدیر مالی' : 'CFO',          sig: '~Signature~' },
            ].map((s, i) => (
              <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
                <div className="font-semibold text-sm mb-3">{s.name}</div>
                <div className="bg-[hsl(var(--background))] rounded-lg p-4 text-center min-h-16 flex items-center justify-center border border-dashed border-[hsl(var(--border))]">
                  <span className="text-[hsl(var(--muted-foreground))] text-xs">{s.sig}</span>
                </div>
                <button className="mt-2 w-full text-xs py-1.5 border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--background))]">
                  <PenTool className="w-3 h-3 inline me-1"/>
                  {fa ? 'ترسیم / آپلود امضا' : 'Draw / Upload Signature'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Template Editor Modal */}
      {showNewTpl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[hsl(var(--background))] rounded-2xl p-6 w-full max-w-2xl border border-[hsl(var(--border))] my-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{editingTpl ? (fa ? '✏️ ویرایش سربرگ' : '✏️ Edit Template') : (fa ? '📋 قالب جدید' : '📋 New Template')}</h3>
              <button onClick={() => setShowNewTpl(false)} className="p-1 rounded-lg hover:bg-[hsl(var(--muted)/0.5)]"><X className="w-4 h-4"/></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                {[
                  { k: 'name', label: fa ? 'نام قالب' : 'Template Name', type: 'text' },
                  { k: 'companyName', label: fa ? 'نام شرکت (فارسی)' : 'Company (FA)', type: 'text' },
                  { k: 'companyNameEn', label: fa ? 'نام شرکت (انگلیسی)' : 'Company (EN)', type: 'text' },
                  { k: 'logo', label: fa ? 'ایموجی لوگو' : 'Logo Emoji', type: 'text' },
                  { k: 'phone', label: fa ? 'تلفن' : 'Phone', type: 'text' },
                  { k: 'email', label: fa ? 'ایمیل' : 'Email', type: 'email' },
                  { k: 'website', label: fa ? 'وب‌سایت' : 'Website', type: 'text' },
                ].map(f => (
                  <div key={f.k}>
                    <label className="text-xs text-[hsl(var(--muted-foreground))] block mb-1">{f.label}</label>
                    <input value={(tplForm as any)[f.k]} onChange={setTpl(f.k)} type={f.type}
                      className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none"/>
                  </div>
                ))}
                <div>
                  <label className="text-xs text-[hsl(var(--muted-foreground))] block mb-1">{fa ? 'آدرس' : 'Address'}</label>
                  <textarea value={tplForm.address} onChange={setTpl('address')}
                    className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none h-16 resize-none"/>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-[hsl(var(--muted-foreground))] block mb-1">{fa ? 'رنگ اصلی' : 'Primary Color'}</label>
                  <input type="color" value={tplForm.primaryColor} onChange={setTpl('primaryColor')}
                    className="w-full h-10 rounded-lg border border-[hsl(var(--border))] p-1 bg-[hsl(var(--secondary))] cursor-pointer"/>
                </div>
                <div>
                  <label className="text-xs text-[hsl(var(--muted-foreground))] block mb-1">{fa ? 'سبک' : 'Style'}</label>
                  <select value={tplForm.style} onChange={setTpl('style')}
                    className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none">
                    <option value="modern">{fa ? '🎨 مدرن' : '🎨 Modern'}</option>
                    <option value="classic">{fa ? '📜 کلاسیک' : '📜 Classic'}</option>
                    <option value="minimal">{fa ? '✦ مینیمال' : '✦ Minimal'}</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[hsl(var(--muted-foreground))] block mb-1">{fa ? 'متن پاورقی' : 'Footer Text'}</label>
                  <input value={tplForm.footerText} onChange={setTpl('footerText')}
                    className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none"/>
                </div>
                {/* Live Preview */}
                <div>
                  <label className="text-xs text-[hsl(var(--muted-foreground))] block mb-2">{fa ? 'پیش‌نمایش' : 'Preview'}</label>
                  <TemplatePreview tpl={{ ...tplForm, id: 'preview' } as LHTemplate}/>
                  <div style={{ padding: '6px 12px', background: '#f8fafc', fontSize: '9px', color: '#94a3b8', borderRadius: '0 0 8px 8px', borderTop: `1px solid ${tplForm.primaryColor}30` }}>
                    {tplForm.footerText}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <button onClick={() => setShowNewTpl(false)} className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa ? 'انصراف' : 'Cancel'}</button>
              <button onClick={saveTpl} className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-bold">💾 {fa ? 'ذخیره سربرگ' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* New Document Modal */}
      {showNewDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[hsl(var(--background))] rounded-2xl p-6 w-full max-w-lg border border-[hsl(var(--border))]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">📄 {fa ? 'سند جدید' : 'New Document'}</h3>
              <button onClick={() => setShowNewDoc(false)} className="p-1 rounded-lg hover:bg-[hsl(var(--muted)/0.5)]"><X className="w-4 h-4"/></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[hsl(var(--muted-foreground))] block mb-1">{fa ? 'قالب سربرگ *' : 'Template *'}</label>
                <select value={docForm.templateId} onChange={setDoc('templateId')}
                  className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none">
                  <option value="">{fa ? '— انتخاب کنید —' : '— Select —'}</option>
                  {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--muted-foreground))] block mb-1">{fa ? 'عنوان سند *' : 'Title *'}</label>
                <input value={docForm.title} onChange={setDoc('title')}
                  placeholder={fa ? 'عنوان سند...' : 'Document title...'}
                  className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none"/>
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--muted-foreground))] block mb-1">{fa ? 'متن سند' : 'Content'}</label>
                <textarea value={docForm.content} onChange={setDoc('content')}
                  placeholder={fa ? 'متن سند را اینجا بنویسید...' : 'Write document content here...'}
                  className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none h-28 resize-none"/>
              </div>
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <button onClick={() => setShowNewDoc(false)} className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa ? 'انصراف' : 'Cancel'}</button>
              <button onClick={saveDoc} className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-bold">💾 {fa ? 'ذخیره سند' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewTpl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-gray-200 overflow-hidden" dir="rtl">
            <div style={{ padding: '20px 24px', borderBottom: `4px solid ${previewTpl.primaryColor}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span style={{ fontSize: '32px' }}>{previewTpl.logo}</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '16px', color: previewTpl.primaryColor }}>{previewTpl.companyName}</div>
                  {previewTpl.companyNameEn && <div style={{ fontSize: '11px', color: '#64748b' }}>{previewTpl.companyNameEn}</div>}
                </div>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>{previewTpl.address}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                {previewTpl.phone}{previewTpl.email ? ' | ' + previewTpl.email : ''}{previewTpl.website ? ' | ' + previewTpl.website : ''}
              </div>
            </div>
            <div style={{ padding: '24px', minHeight: '150px', color: '#334155', fontSize: '13px' }}>
              <p style={{ color: '#94a3b8' }}>[متن سند اینجا قرار می‌گیرد]</p>
            </div>
            <div style={{ padding: '12px 24px', borderTop: `1px solid ${previewTpl.primaryColor}30`, background: '#f8fafc', fontSize: '10px', color: '#94a3b8' }}>
              {previewTpl.footerText}
            </div>
            <div className="p-3 flex justify-end gap-2">
              <button onClick={() => setPreviewTpl(null)} className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-bold">
                <Check className="w-4 h-4 inline me-1"/>{fa ? 'بستن' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
