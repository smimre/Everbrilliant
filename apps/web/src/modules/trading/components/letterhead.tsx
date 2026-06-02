'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useAuthStore } from '@/store/auth.store';
import {
  FileText, Plus, Edit2, Eye, Stamp, PenTool, Trash2, X, Check,
  Upload, Download, RotateCcw, ImagePlus,
} from 'lucide-react';

interface LHTemplate {
  id: string;
  name: string;
  companyName: string;
  companyNameEn: string;
  logo: string;
  logoType: 'emoji' | 'image';
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

interface Seal {
  id: string;
  name: string;
  image: string;
}

interface Signature {
  id: string;
  name: string;
  signerName: string;
  image: string;
}

const INIT_TEMPLATES: LHTemplate[] = [
  { id: 'LHT-001', name: 'سربرگ رسمی شرکت', companyName: 'شرکت ایورتریدینگ', companyNameEn: 'Evertrading Co.', logo: '🏢', logoType: 'emoji', primaryColor: '#2563eb', address: 'تهران، خیابان ولیعصر، پلاک ۱۲۳', phone: '۰۲۱-۱۲۳۴۵۶۷۸', email: 'info@evertrading.ir', website: 'www.evertrading.ir', style: 'modern', footerText: 'این سند به صورت دیجیتال صادر شده است' },
  { id: 'LHT-002', name: 'سربرگ قرارداد',    companyName: 'شرکت ایورتریدینگ', companyNameEn: 'Evertrading Co.', logo: '📋', logoType: 'emoji', primaryColor: '#7c3aed', address: 'تهران، خیابان ولیعصر، پلاک ۱۲۳', phone: '۰۲۱-۱۲۳۴۵۶۷۸', email: 'info@evertrading.ir', website: '', style: 'classic', footerText: 'محرمانه — برای استفاده داخلی' },
];

const INIT_DOCS: LHDoc[] = [
  { id: 'LHD-001', templateId: 'LHT-001', title: 'معرفی‌نامه آقای رضایی',  docNo: 'DOC-1403-001', content: 'بدینوسیله آقای رضایی به عنوان نماینده شرکت معرفی می‌گردند.', date: '۱۴۰۳/۰۲/۱۰' },
  { id: 'LHD-002', templateId: 'LHT-002', title: 'قرارداد مشاوره فصلی',    docNo: 'DOC-1403-002', content: 'قرارداد مشاوره برای سه ماهه دوم سال ۱۴۰۳', date: '۱۴۰۳/۰۳/۰۱' },
];

const STYLE_LABELS = { modern: 'مدرن', classic: 'کلاسیک', minimal: 'مینیمال' };

type Tab = 'templates' | 'docs' | 'seals' | 'sigs';

function TemplatePreview({ tpl }: { tpl: LHTemplate }) {
  return (
    <div style={{ background: '#fff', borderBottom: `3px solid ${tpl.primaryColor}`, padding: '12px', borderRadius: '8px 8px 0 0', direction: 'rtl', minHeight: '70px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        {tpl.logoType === 'image' && tpl.logo.startsWith('data:') ? (
          <img src={tpl.logo} alt="logo" style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 4 }}/>
        ) : (
          <span style={{ fontSize: '22px' }}>{tpl.logo}</span>
        )}
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

function ImageUploadBox({ label, hint, value, onChange }: { label: string; hint: string; value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };
  return (
    <div>
      <label className="text-xs text-[hsl(var(--muted-foreground))] block mb-1">{label}</label>
      <div onClick={() => ref.current?.click()}
        className="relative border-2 border-dashed border-[hsl(var(--border))] rounded-xl p-4 text-center cursor-pointer hover:border-[hsl(var(--primary)/0.5)] transition-colors group">
        {value ? (
          <div className="flex flex-col items-center gap-2">
            <img src={value} alt="preview" className="h-14 object-contain rounded-lg"/>
            <span className="text-xs text-[hsl(var(--primary))]">{label}</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-1">
            <ImagePlus className="w-7 h-7 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))] transition-colors"/>
            <span className="text-xs text-[hsl(var(--muted-foreground))]">{hint}</span>
          </div>
        )}
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile}/>
      </div>
    </div>
  );
}

function SignatureCanvas({
  onSave, onClose, fa,
}: { onSave: (dataUrl: string) => void; onClose: () => void; fa: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      const t = e.touches[0];
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
    }
    return { x: ((e as React.MouseEvent).clientX - rect.left) * scaleX, y: ((e as React.MouseEvent).clientY - rect.top) * scaleY };
  };

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawing.current = true;
    lastPos.current = getPos(e, canvas);
  }, []);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e, canvas);
    if (lastPos.current) {
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = '#1e40af';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
    lastPos.current = pos;
  }, []);

  const stopDraw = useCallback(() => {
    drawing.current = false;
    lastPos.current = null;
  }, []);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSave(canvas.toDataURL('image/png'));
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[hsl(var(--background))] rounded-2xl p-5 w-full max-w-md border border-[hsl(var(--border))]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">✍️ {fa ? 'ترسیم امضا' : 'Draw Signature'}</h3>
          <button onClick={onClose}><X className="w-4 h-4"/></button>
        </div>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mb-3">
          {fa ? 'با موس یا انگشت امضای خود را بکشید' : 'Draw your signature with mouse or finger'}
        </p>
        <canvas
          ref={canvasRef}
          width={480}
          height={180}
          className="w-full border border-[hsl(var(--border))] rounded-xl bg-white cursor-crosshair touch-none"
          style={{ touchAction: 'none' }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
        <div className="flex gap-2 mt-3 justify-between">
          <button onClick={clear} className="flex items-center gap-1.5 px-3 py-2 border border-[hsl(var(--border))] rounded-lg text-sm hover:bg-[hsl(var(--muted)/0.3)]">
            <RotateCcw className="w-3.5 h-3.5"/> {fa ? 'پاک کردن' : 'Clear'}
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 py-2 border border-[hsl(var(--border))] rounded-lg text-sm">{fa ? 'انصراف' : 'Cancel'}</button>
            <button onClick={save} className="px-4 py-2 bg-[hsl(var(--primary))] text-white rounded-lg text-sm font-bold flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5"/> {fa ? 'ذخیره امضا' : 'Save'}
            </button>
          </div>
        </div>
      </div>
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
  const [seals, setSeals] = useState<Seal[]>([]);
  const [sigs, setSigs] = useState<Signature[]>([]);
  const [showNewTpl, setShowNewTpl] = useState(false);
  const [editingTpl, setEditingTpl] = useState<LHTemplate | null>(null);
  const [showNewDoc, setShowNewDoc] = useState(false);
  const [previewTpl, setPreviewTpl] = useState<LHTemplate | null>(null);
  const [showSigCanvas, setShowSigCanvas] = useState(false);
  const [sigName, setSigName] = useState('');
  const [pendingSigName, setPendingSigName] = useState('');

  type TplFormState = {
    name: string; companyName: string; companyNameEn: string;
    logo: string; logoType: 'emoji' | 'image';
    primaryColor: string; address: string; phone: string; email: string;
    website: string; style: 'modern' | 'classic' | 'minimal'; footerText: string;
  };
  const BLANK_TPL: TplFormState = {
    name: '', companyName: user?.name || '', companyNameEn: '', logo: '🏢', logoType: 'emoji',
    primaryColor: '#2563eb', address: '', phone: '', email: '', website: '', style: 'modern', footerText: 'این سند به صورت دیجیتال صادر شده است',
  };
  const [tplForm, setTplForm] = useState<TplFormState>(BLANK_TPL);
  const [docForm, setDocForm] = useState({ templateId: '', title: '', content: '', docNo: '' });

  const setTpl = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setTplForm(f => ({ ...f, [k]: e.target.value }));
  const setDoc = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setDocForm(f => ({ ...f, [k]: e.target.value }));

  const openNewTpl = () => { setTplForm(BLANK_TPL); setEditingTpl(null); setShowNewTpl(true); };
  const openEditTpl = (tpl: LHTemplate) => {
    setTplForm({ name: tpl.name, companyName: tpl.companyName, companyNameEn: tpl.companyNameEn, logo: tpl.logo, logoType: tpl.logoType || 'emoji', primaryColor: tpl.primaryColor, address: tpl.address, phone: tpl.phone, email: tpl.email, website: tpl.website, style: tpl.style, footerText: tpl.footerText });
    setEditingTpl(tpl); setShowNewTpl(true);
  };

  const saveTpl = () => {
    if (!tplForm.name || !tplForm.companyName) return alert(fa ? 'نام قالب و شرکت الزامی' : 'Template name & company required');
    if (editingTpl) {
      setTemplates(ts => ts.map(t => t.id === editingTpl.id ? { ...t, ...tplForm } : t));
    } else {
      setTemplates(ts => [...ts, { id: 'LHT-' + Date.now(), ...tplForm }]);
    }
    setShowNewTpl(false);
  };

  const saveDoc = () => {
    if (!docForm.templateId || !docForm.title) return alert(fa ? 'قالب و عنوان الزامی' : 'Template & title required');
    setDocs(ds => [...ds, { id: 'LHD-' + Date.now(), ...docForm, docNo: 'DOC-' + Date.now().toString().slice(-4), date: new Date().toLocaleDateString('fa-IR') }]);
    setShowNewDoc(false);
    setDocForm({ templateId: '', title: '', content: '', docNo: '' });
  };

  const handleSealUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSeals(prev => [...prev, { id: 'SEAL-' + Date.now(), name: fa ? 'مهر جدید' : 'New Seal', image: reader.result as string }]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSaveSignature = (dataUrl: string) => {
    setSigs(prev => [...prev, {
      id: 'SIG-' + Date.now(),
      name: sigName || (fa ? 'امضای جدید' : 'New Signature'),
      signerName: pendingSigName || (fa ? 'امضاکننده' : 'Signer'),
      image: dataUrl,
    }]);
    setShowSigCanvas(false);
    setSigName('');
    setPendingSigName('');
  };

  const handleSigImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSigs(prev => [...prev, { id: 'SIG-' + Date.now(), name: fa ? 'امضای آپلود شده' : 'Uploaded Signature', signerName: fa ? 'امضاکننده' : 'Signer', image: reader.result as string }]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
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

      {/* ── Templates ── */}
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
                    <div className="flex gap-1.5 flex-wrap">
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
                      <button onClick={() => { if (confirm(fa ? 'حذف شود؟' : 'Delete?')) setTemplates(ts => ts.filter(t => t.id !== tpl.id)); }} className="p-1.5 border border-red-500/20 rounded-lg hover:bg-red-500/10 text-red-400">
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

      {/* ── Documents ── */}
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
              {docs.map(doc => {
                const tpl = templates.find(t => t.id === doc.templateId);
                return (
                  <div key={doc.id} className="flex items-center gap-3 p-4 hover:bg-[hsl(var(--background))] transition-colors border-b border-[hsl(var(--border))] last:border-0">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: (tpl?.primaryColor || '#2563eb') + '20' }}>
                      {tpl?.logoType === 'image' ? '📄' : (tpl?.logo || '📄')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{doc.title}</div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))]">{doc.docNo} | {tpl?.name || '—'} | {doc.date}</div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button className="p-1.5 border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--background))] text-[hsl(var(--muted-foreground))]">
                        <Eye className="w-3.5 h-3.5"/>
                      </button>
                      <button className="p-1.5 border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--background))] text-[hsl(var(--muted-foreground))]">
                        <Download className="w-3.5 h-3.5"/>
                      </button>
                      <button onClick={() => setDocs(ds => ds.filter(d => d.id !== doc.id))} className="p-1.5 border border-red-500/20 rounded-lg hover:bg-red-500/10 text-red-400">
                        <Trash2 className="w-3.5 h-3.5"/>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Seals ── */}
      {tab === 'seals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{fa ? 'مهرهای شرکت' : 'Company Seals'}</h3>
            <label className="flex items-center gap-1.5 px-3 py-2 bg-[hsl(var(--primary))] text-white rounded-lg text-sm font-bold cursor-pointer">
              <Upload className="w-4 h-4"/> {fa ? 'آپلود مهر' : 'Upload Seal'}
              <input type="file" accept="image/*" className="hidden" onChange={handleSealUpload}/>
            </label>
          </div>

          {seals.length === 0 ? (
            <div className="border-2 border-dashed border-[hsl(var(--border))] rounded-xl p-8 text-center">
              <Stamp className="w-12 h-12 mx-auto mb-3 opacity-20"/>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">{fa ? 'مهری اضافه نشده' : 'No seals added'}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{fa ? 'تصویر مهر را بارگذاری کنید (PNG با پس‌زمینه شفاف)' : 'Upload seal image (PNG with transparent bg)'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {seals.map(seal => (
                <div key={seal.id} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4 text-center group relative">
                  <img src={seal.image} alt={seal.name} className="h-16 object-contain mx-auto mb-2 rounded-lg"/>
                  <div className="text-xs font-semibold">{seal.name}</div>
                  <button onClick={() => setSeal(seals.filter(s => s.id !== seal.id))}
                    className="absolute top-2 end-2 p-1 rounded-full bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3"/>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Signatures ── */}
      {tab === 'sigs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-semibold">{fa ? 'امضاهای مجاز' : 'Authorized Signatures'}</h3>
            <div className="flex gap-2">
              <label className="flex items-center gap-1.5 px-3 py-2 border border-[hsl(var(--border))] rounded-lg text-sm cursor-pointer hover:bg-[hsl(var(--muted)/0.3)]">
                <Upload className="w-3.5 h-3.5"/> {fa ? 'آپلود تصویر' : 'Upload Image'}
                <input type="file" accept="image/*" className="hidden" onChange={handleSigImageUpload}/>
              </label>
              <button onClick={() => setShowSigCanvas(true)} className="flex items-center gap-1.5 px-3 py-2 bg-[hsl(var(--primary))] text-white rounded-lg text-sm font-bold">
                <PenTool className="w-3.5 h-3.5"/> {fa ? 'ترسیم امضا' : 'Draw Signature'}
              </button>
            </div>
          </div>

          {sigs.length === 0 ? (
            <div className="border-2 border-dashed border-[hsl(var(--border))] rounded-xl p-8 text-center">
              <PenTool className="w-12 h-12 mx-auto mb-3 opacity-20"/>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">{fa ? 'امضایی ثبت نشده' : 'No signatures yet'}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{fa ? 'امضای دیجیتال بکشید یا تصویر امضا را آپلود کنید' : 'Draw a digital signature or upload an image'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sigs.map(sig => (
                <div key={sig.id} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4 group relative">
                  <div className="font-semibold text-sm mb-2">{sig.name}</div>
                  <div className="bg-white rounded-lg p-3 flex items-center justify-center min-h-[72px]">
                    <img src={sig.image} alt={sig.name} className="max-h-16 object-contain"/>
                  </div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">{sig.signerName}</p>
                  <button onClick={() => setSigs(ss => ss.filter(s => s.id !== sig.id))}
                    className="absolute top-2 end-2 p-1 rounded-full bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3"/>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Template Editor Modal ── */}
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
                  { k: 'name', label: fa ? 'نام قالب *' : 'Template Name *', type: 'text' },
                  { k: 'companyName', label: fa ? 'نام شرکت (فارسی)' : 'Company (FA)', type: 'text' },
                  { k: 'companyNameEn', label: fa ? 'نام شرکت (انگلیسی)' : 'Company (EN)', type: 'text' },
                  { k: 'phone', label: fa ? 'تلفن' : 'Phone', type: 'text' },
                  { k: 'email', label: fa ? 'ایمیل' : 'Email', type: 'email' },
                  { k: 'website', label: fa ? 'وب‌سایت' : 'Website', type: 'text' },
                ].map(f => (
                  <div key={f.k}>
                    <label className="text-xs text-[hsl(var(--muted-foreground))] block mb-1">{f.label}</label>
                    <input value={(tplForm as any)[f.k] || ''} onChange={setTpl(f.k)} type={f.type}
                      className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none"/>
                  </div>
                ))}
                <div>
                  <label className="text-xs text-[hsl(var(--muted-foreground))] block mb-1">{fa ? 'آدرس' : 'Address'}</label>
                  <textarea value={tplForm.address} onChange={setTpl('address')} className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none h-16 resize-none"/>
                </div>
              </div>
              <div className="space-y-3">
                {/* Logo upload */}
                <div>
                  <label className="text-xs text-[hsl(var(--muted-foreground))] block mb-1">{fa ? 'لوگو' : 'Logo'}</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setTplForm(f => ({ ...f, logoType: 'emoji' }))}
                      className={`px-2 py-1.5 text-xs rounded-lg border transition-all ${tplForm.logoType === 'emoji' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)]' : 'border-[hsl(var(--border))]'}`}>
                      {fa ? 'ایموجی' : 'Emoji'}
                    </button>
                    <button type="button" onClick={() => setTplForm(f => ({ ...f, logoType: 'image' }))}
                      className={`px-2 py-1.5 text-xs rounded-lg border transition-all ${tplForm.logoType === 'image' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)]' : 'border-[hsl(var(--border))]'}`}>
                      {fa ? 'تصویر' : 'Image'}
                    </button>
                  </div>
                  {tplForm.logoType === 'emoji' ? (
                    <input value={tplForm.logo} onChange={setTpl('logo')} placeholder="🏢"
                      className="mt-2 w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none"/>
                  ) : (
                    <ImageUploadBox
                      label=""
                      hint={fa ? 'کلیک برای آپلود لوگو' : 'Click to upload logo'}
                      value={tplForm.logoType === 'image' ? tplForm.logo : ''}
                      onChange={v => setTplForm(f => ({ ...f, logo: v, logoType: 'image' }))}
                    />
                  )}
                </div>
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
                <div>
                  <label className="text-xs text-[hsl(var(--muted-foreground))] block mb-2">{fa ? 'پیش‌نمایش' : 'Preview'}</label>
                  <TemplatePreview tpl={{ ...tplForm, id: 'preview' } as LHTemplate}/>
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

      {/* ── New Document Modal ── */}
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
                <input value={docForm.title} onChange={setDoc('title')} placeholder={fa ? 'عنوان سند...' : 'Document title...'}
                  className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none"/>
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--muted-foreground))] block mb-1">{fa ? 'متن سند' : 'Content'}</label>
                <textarea value={docForm.content} onChange={setDoc('content')} placeholder={fa ? 'متن سند را اینجا بنویسید...' : 'Write document content here...'}
                  className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none h-28 resize-none"/>
              </div>
              {/* Apply seal/signature */}
              {(seals.length > 0 || sigs.length > 0) && (
                <div className="flex gap-4 flex-wrap">
                  {seals.length > 0 && (
                    <div className="flex-1">
                      <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">{fa ? 'مهر' : 'Seal'}</p>
                      <div className="flex gap-2 flex-wrap">
                        {seals.map(s => (
                          <img key={s.id} src={s.image} alt={s.name} className="h-10 object-contain border border-[hsl(var(--border))] rounded-lg p-1 cursor-pointer hover:border-[hsl(var(--primary))]"/>
                        ))}
                      </div>
                    </div>
                  )}
                  {sigs.length > 0 && (
                    <div className="flex-1">
                      <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">{fa ? 'امضا' : 'Signature'}</p>
                      <div className="flex gap-2 flex-wrap">
                        {sigs.map(s => (
                          <img key={s.id} src={s.image} alt={s.name} className="h-10 object-contain border border-[hsl(var(--border))] rounded-lg p-1 cursor-pointer hover:border-[hsl(var(--primary))] bg-white"/>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <button onClick={() => setShowNewDoc(false)} className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa ? 'انصراف' : 'Cancel'}</button>
              <button onClick={saveDoc} className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-bold">💾 {fa ? 'ذخیره سند' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Full Preview Modal ── */}
      {previewTpl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-gray-200 overflow-hidden" dir="rtl">
            <div style={{ padding: '20px 24px', borderBottom: `4px solid ${previewTpl.primaryColor}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                {previewTpl.logoType === 'image' && previewTpl.logo.startsWith('data:') ? (
                  <img src={previewTpl.logo} alt="logo" style={{ width: 48, height: 48, objectFit: 'contain' }}/>
                ) : (
                  <span style={{ fontSize: '32px' }}>{previewTpl.logo}</span>
                )}
                <div>
                  <div style={{ fontWeight: 800, fontSize: '16px', color: previewTpl.primaryColor }}>{previewTpl.companyName}</div>
                  {previewTpl.companyNameEn && <div style={{ fontSize: '11px', color: '#64748b' }}>{previewTpl.companyNameEn}</div>}
                </div>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>{previewTpl.address}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>{previewTpl.phone}{previewTpl.email ? ' | ' + previewTpl.email : ''}{previewTpl.website ? ' | ' + previewTpl.website : ''}</div>
            </div>
            <div style={{ padding: '24px', minHeight: '150px', color: '#334155', fontSize: '13px' }}>
              <p style={{ color: '#94a3b8' }}>[{fa ? 'متن سند اینجا قرار می‌گیرد' : 'Document content goes here'}]</p>
            </div>
            {(seals.length > 0 || sigs.length > 0) && (
              <div style={{ padding: '12px 24px', display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                {seals[0] && <img src={seals[0].image} alt="seal" style={{ height: 60, objectFit: 'contain' }}/>}
                {sigs[0] && <img src={sigs[0].image} alt="sig" style={{ height: 60, objectFit: 'contain' }}/>}
              </div>
            )}
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

      {/* ── Signature Canvas Modal ── */}
      {showSigCanvas && (
        <SignatureCanvas
          fa={fa}
          onSave={handleSaveSignature}
          onClose={() => setShowSigCanvas(false)}
        />
      )}
    </div>
  );

  function setSeal(updated: Seal[]) {
    setSeals(updated);
  }
}
