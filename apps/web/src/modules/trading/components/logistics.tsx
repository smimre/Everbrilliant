'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';

// ─── Types ────────────────────────────────────────────────────────────────────

type ShipmentType = 'domestic' | 'international' | 'air';
type ShipmentStatus = 'booked' | 'picked_up' | 'in_transit' | 'customs' | 'delivered' | 'cancelled';
type CustomsStatus = 'pending' | 'clearing' | 'cleared' | 'rejected';

interface Stage {
  key: string;
  label: string;
  labelFa: string;
  done: boolean;
  date?: string;
}

interface Shipment {
  id: string;
  trackingCode: string;
  cargo: string;
  type: ShipmentType;
  status: ShipmentStatus;
  origin: string;
  destination: string;
  weight: number;
  weightUnit: string;
  volume: number;
  cost: number;
  costPaid: boolean;
  sellerName: string;
  buyerName: string;
  waybillNo?: string;
  notes?: string;
  createdAt: string;
  stages: Stage[];
  insurance?: { company: string; amount: number; policyNo: string };
  customsStatus?: CustomsStatus;
  hsCode?: string;
  customsNotes?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SHIP_STATUS_CONFIG: Record<ShipmentStatus, { label: string; labelFa: string; color: string; icon: string }> = {
  booked:      { label: 'Booked',      labelFa: 'ثبت شده',      color: '#64748b', icon: '📋' },
  picked_up:   { label: 'Picked Up',   labelFa: 'تحویل گرفته',  color: '#3b82f6', icon: '🚛' },
  in_transit:  { label: 'In Transit',  labelFa: 'در راه',        color: '#f59e0b', icon: '🚢' },
  customs:     { label: 'Customs',     labelFa: 'گمرک',          color: '#8b5cf6', icon: '🏛️' },
  delivered:   { label: 'Delivered',   labelFa: 'تحویل داده',   color: '#10b981', icon: '✅' },
  cancelled:   { label: 'Cancelled',   labelFa: 'لغو شده',      color: '#ef4444', icon: '❌' },
};

const CUSTOMS_STATUS_CONFIG: Record<CustomsStatus, { label: string; labelFa: string; color: string }> = {
  pending:   { label: 'Pending',   labelFa: 'در انتظار',   color: '#f59e0b' },
  clearing:  { label: 'Clearing',  labelFa: 'در ترخیص',   color: '#3b82f6' },
  cleared:   { label: 'Cleared',   labelFa: 'ترخیص شده',  color: '#10b981' },
  rejected:  { label: 'Rejected',  labelFa: 'رد شده',     color: '#ef4444' },
};

function buildStages(type: ShipmentType): Stage[] {
  const base: Stage[] = [
    { key: 'booked',     label: 'Booked',     labelFa: 'ثبت',        done: false },
    { key: 'picked_up',  label: 'Picked Up',  labelFa: 'تحویل',      done: false },
    { key: 'in_transit', label: 'In Transit', labelFa: 'حمل',        done: false },
  ];
  if (type === 'international') {
    base.push({ key: 'customs', label: 'Customs', labelFa: 'گمرک', done: false });
  }
  base.push({ key: 'delivered', label: 'Delivered', labelFa: 'تحویل نهایی', done: false });
  return base;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_SHIPMENTS: Shipment[] = [
  {
    id: 'SHP-001',
    trackingCode: 'EB-TRK-48271',
    cargo: 'روغن پالم RBD',
    type: 'international',
    status: 'customs',
    origin: 'کوالالامپور، مالزی',
    destination: 'بندر امام خمینی، ایران',
    weight: 500,
    weightUnit: 'تن',
    volume: 580,
    cost: 4200000000,
    costPaid: false,
    sellerName: 'Pacific Oils Sdn Bhd',
    buyerName: 'شرکت بازرگانی آریا',
    waybillNo: 'EB-WB-10043',
    notes: 'محموله حاوی ۱۰ کانتینر ۴۰ فوتی',
    createdAt: '۱۴۰۳/۰۲/۱۵',
    stages: [
      { key: 'booked',     label: 'Booked',     labelFa: 'ثبت',            done: true,  date: '۱۴۰۳/۰۲/۱۵' },
      { key: 'picked_up',  label: 'Picked Up',  labelFa: 'تحویل',          done: true,  date: '۱۴۰۳/۰۲/۱۸' },
      { key: 'in_transit', label: 'In Transit', labelFa: 'حمل',            done: true,  date: '۱۴۰۳/۰۲/۲۰' },
      { key: 'customs',    label: 'Customs',    labelFa: 'گمرک',           done: false },
      { key: 'delivered',  label: 'Delivered',  labelFa: 'تحویل نهایی',   done: false },
    ],
    insurance: { company: 'بیمه آسیا', amount: 5000000000, policyNo: 'INS-7734-A' },
    customsStatus: 'clearing',
    hsCode: '1511.90',
  },
  {
    id: 'SHP-002',
    trackingCode: 'EB-TRK-39104',
    cargo: 'شکر سفید گرید A',
    type: 'domestic',
    status: 'in_transit',
    origin: 'بندر امام خمینی',
    destination: 'انبار تهران',
    weight: 200,
    weightUnit: 'تن',
    volume: 210,
    cost: 1800000000,
    costPaid: true,
    sellerName: 'گروه واردات پارس',
    buyerName: 'شرکت توزیع مهر',
    waybillNo: 'EB-WB-10044',
    createdAt: '۱۴۰۳/۰۳/۰۱',
    stages: [
      { key: 'booked',     label: 'Booked',     labelFa: 'ثبت',          done: true, date: '۱۴۰۳/۰۳/۰۱' },
      { key: 'picked_up',  label: 'Picked Up',  labelFa: 'تحویل',        done: true, date: '۱۴۰۳/۰۳/۰۳' },
      { key: 'in_transit', label: 'In Transit', labelFa: 'حمل',          done: false },
      { key: 'delivered',  label: 'Delivered',  labelFa: 'تحویل نهایی', done: false },
    ],
  },
  {
    id: 'SHP-003',
    trackingCode: 'EB-TRK-55890',
    cargo: 'تجهیزات صنعتی',
    type: 'air',
    status: 'delivered',
    origin: 'فرانکفورت، آلمان',
    destination: 'فرودگاه امام خمینی، تهران',
    weight: 2.8,
    weightUnit: 'تن',
    volume: 12,
    cost: 950000000,
    costPaid: true,
    sellerName: 'Siemens AG',
    buyerName: 'صنایع فولاد پارس',
    waybillNo: 'EB-WB-10041',
    notes: 'قطعات حساس — ممنوع از ضربه',
    createdAt: '۱۴۰۳/۰۱/۲۰',
    stages: [
      { key: 'booked',     label: 'Booked',     labelFa: 'ثبت',          done: true, date: '۱۴۰۳/۰۱/۲۰' },
      { key: 'picked_up',  label: 'Picked Up',  labelFa: 'تحویل',        done: true, date: '۱۴۰۳/۰۱/۲۲' },
      { key: 'in_transit', label: 'In Transit', labelFa: 'حمل',          done: true, date: '۱۴۰۳/۰۱/۲۳' },
      { key: 'delivered',  label: 'Delivered',  labelFa: 'تحویل نهایی', done: true, date: '۱۴۰۳/۰۱/۲۵' },
    ],
    insurance: { company: 'بیمه ملت', amount: 1200000000, policyNo: 'INS-3321-B' },
  },
  {
    id: 'SHP-004',
    trackingCode: 'EB-TRK-62517',
    cargo: 'کنجاله سویا',
    type: 'international',
    status: 'in_transit',
    origin: 'بوئنوس‌آیرس، آرژانتین',
    destination: 'بندر شهید رجایی، بندرعباس',
    weight: 1200,
    weightUnit: 'تن',
    volume: 1400,
    cost: 9600000000,
    costPaid: false,
    sellerName: 'AgriExport SA',
    buyerName: 'صنایع دام و طیور ایران',
    createdAt: '۱۴۰۳/۰۳/۱۰',
    stages: [
      { key: 'booked',     label: 'Booked',     labelFa: 'ثبت',          done: true,  date: '۱۴۰۳/۰۳/۱۰' },
      { key: 'picked_up',  label: 'Picked Up',  labelFa: 'تحویل',        done: true,  date: '۱۴۰۳/۰۳/۱۳' },
      { key: 'in_transit', label: 'In Transit', labelFa: 'حمل',          done: false },
      { key: 'customs',    label: 'Customs',    labelFa: 'گمرک',         done: false },
      { key: 'delivered',  label: 'Delivered',  labelFa: 'تحویل نهایی', done: false },
    ],
    customsStatus: 'pending',
    hsCode: '2304.00',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getProgress(stages: Stage[]): number {
  const done = stages.filter(s => s.done).length;
  return Math.round((done / stages.length) * 100);
}

function fmtCost(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B IRR`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(0)}M IRR`;
  return `${n.toLocaleString()} IRR`;
}

function genWaybill(): string {
  return `EB-WB-${10045 + Math.floor(Math.random() * 900)}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'dashboard', labelFa: 'داشبورد',     labelEn: 'Dashboard',    icon: '📊' },
  { id: 'shipments', labelFa: 'محموله‌ها',    labelEn: 'Shipments',    icon: '🚢' },
  { id: 'new',       labelFa: 'محموله جدید', labelEn: 'New Shipment', icon: '➕' },
  { id: 'waybills',  labelFa: 'بارنامه‌ها',  labelEn: 'Waybills',     icon: '📄' },
  { id: 'customs',   labelFa: 'گمرک',         labelEn: 'Customs',      icon: '🏛️' },
  { id: 'finance',   labelFa: 'مالی',          labelEn: 'Finance',      icon: '💰' },
] as const;

type TabId = typeof TABS[number]['id'];

export function LogisticsPage() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';

  const [tab, setTab] = useState<TabId>('dashboard');
  const [shipments, setShipments] = useState<Shipment[]>(MOCK_SHIPMENTS);
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | 'all'>('all');

  // Modals
  const [detailShip, setDetailShip] = useState<Shipment | null>(null);
  const [updateShip, setUpdateShip] = useState<Shipment | null>(null);
  const [updateForm, setUpdateForm] = useState({ date: '', location: '', notes: '' });
  const [newSuccess, setNewSuccess] = useState(false);

  // New shipment form
  const [newForm, setNewForm] = useState({
    cargo: '', type: 'domestic' as ShipmentType,
    origin: '', destination: '',
    sellerName: '', buyerName: '',
    weight: '', weightUnit: 'تن',
    volume: '', cost: '', costPaid: false, notes: '',
  });

  const inp = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]";
  const btnPrimary = "px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 transition-opacity";
  const btnSecondary = "px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] text-xs hover:bg-[hsl(var(--muted)/0.4)] transition-colors";

  // ── Derived stats ───────────────────────────────────────────────────────────
  const activeShips = shipments.filter(s => !['delivered', 'cancelled'].includes(s.status));
  const deliveredShips = shipments.filter(s => s.status === 'delivered');
  const customsPending = shipments.filter(s => s.status === 'customs' || (s.customsStatus && s.customsStatus !== 'cleared'));
  const unpaidShips = shipments.filter(s => !s.costPaid && s.status !== 'cancelled');
  const totalRevenue = shipments.filter(s => s.costPaid).reduce((s, i) => s + i.cost, 0);

  // ── Filtered list ───────────────────────────────────────────────────────────
  const filteredShips = shipments.filter(s => statusFilter === 'all' || s.status === statusFilter);

  // ── Customs list ────────────────────────────────────────────────────────────
  const customsShips = shipments.filter(s =>
    s.type === 'international' && ['in_transit', 'customs'].includes(s.status)
  );

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleUpdateStatus = () => {
    if (!updateShip) return;
    const nextStage = updateShip.stages.find(s => !s.done);
    if (!nextStage) return;
    const updated = shipments.map(s => {
      if (s.id !== updateShip.id) return s;
      const newStages = s.stages.map(st =>
        st.key === nextStage.key ? { ...st, done: true, date: updateForm.date || new Date().toLocaleDateString('fa-IR') } : st
      );
      const allDone = newStages.every(st => st.done);
      const newStatus: ShipmentStatus = allDone ? 'delivered' : (nextStage.key as ShipmentStatus) ?? s.status;
      return { ...s, stages: newStages, status: newStatus };
    });
    setShipments(updated);
    setUpdateShip(null);
    setUpdateForm({ date: '', location: '', notes: '' });
  };

  const handleIssueWaybill = (id: string) => {
    setShipments(prev => prev.map(s => s.id === id ? { ...s, waybillNo: genWaybill() } : s));
  };

  const handleMarkPaid = (id: string) => {
    setShipments(prev => prev.map(s => s.id === id ? { ...s, costPaid: true } : s));
  };

  const handleCustomsUpdate = (id: string, fields: Partial<Shipment>) => {
    setShipments(prev => prev.map(s => s.id === id ? { ...s, ...fields } : s));
  };

  const handleMarkCleared = (ship: Shipment) => {
    const updated = ship.stages.map(st =>
      st.key === 'customs' ? { ...st, done: true, date: new Date().toLocaleDateString('fa-IR') } : st
    );
    const newStatus: ShipmentStatus = updated.every(s => s.done) ? 'delivered' : 'in_transit';
    setShipments(prev => prev.map(s =>
      s.id === ship.id ? { ...s, stages: updated, status: newStatus, customsStatus: 'cleared' } : s
    ));
  };

  const handleNewShipment = () => {
    if (!newForm.cargo || !newForm.origin || !newForm.destination) {
      alert(fa ? 'فیلدهای الزامی را پر کنید' : 'Fill required fields');
      return;
    }
    const stages = buildStages(newForm.type);
    stages[0].done = true;
    stages[0].date = new Date().toLocaleDateString('fa-IR');
    const ship: Shipment = {
      id: `SHP-${String(shipments.length + 1).padStart(3, '0')}`,
      trackingCode: `EB-TRK-${10000 + Math.floor(Math.random() * 90000)}`,
      cargo: newForm.cargo,
      type: newForm.type,
      status: 'booked',
      origin: newForm.origin,
      destination: newForm.destination,
      weight: Number(newForm.weight) || 0,
      weightUnit: newForm.weightUnit,
      volume: Number(newForm.volume) || 0,
      cost: Number(newForm.cost) || 0,
      costPaid: newForm.costPaid,
      sellerName: newForm.sellerName,
      buyerName: newForm.buyerName,
      notes: newForm.notes,
      createdAt: new Date().toLocaleDateString('fa-IR'),
      stages,
      customsStatus: newForm.type === 'international' ? 'pending' : undefined,
    };
    setShipments(prev => [ship, ...prev]);
    setNewForm({ cargo: '', type: 'domestic', origin: '', destination: '', sellerName: '', buyerName: '', weight: '', weightUnit: 'تن', volume: '', cost: '', costPaid: false, notes: '' });
    setNewSuccess(true);
    setTimeout(() => setNewSuccess(false), 3500);
    setTab('shipments');
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">🚢 {fa ? 'مدیریت لجستیک و حمل‌ونقل' : 'Logistics & Shipping'}</h1>
        <button onClick={() => setTab('new')} className={btnPrimary}>
          ➕ {fa ? 'محموله جدید' : 'New Shipment'}
        </button>
      </div>

      {/* Success banner */}
      {newSuccess && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-600">
          ✅ {fa ? 'محموله جدید با موفقیت ثبت شد.' : 'New shipment registered successfully.'}
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 bg-[hsl(var(--secondary))] rounded-xl p-1 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              tab === t.id
                ? 'bg-[hsl(var(--primary))] text-white shadow'
                : 'text-[hsl(var(--muted-foreground))] hover:text-foreground'
            }`}
          >
            {t.icon} {fa ? t.labelFa : t.labelEn}
          </button>
        ))}
      </div>

      {/* ── DASHBOARD ── */}
      {tab === 'dashboard' && (
        <div className="space-y-4">
          {/* KPIs */}
          <div className="grid grid-cols-5 gap-3">
            {[
              { icon: '🚚', val: activeShips.length, label: fa ? 'در حال حمل' : 'Active', color: '#3b82f6' },
              { icon: '✅', val: deliveredShips.length, label: fa ? 'تحویل داده' : 'Delivered', color: '#10b981' },
              { icon: '🏛️', val: customsPending.length, label: fa ? 'در انتظار گمرک' : 'Customs', color: '#8b5cf6' },
              { icon: '💸', val: unpaidShips.length, label: fa ? 'پرداخت نشده' : 'Unpaid', color: '#ef4444' },
              { icon: '💰', val: fmtCost(totalRevenue), label: fa ? 'درآمد تسویه' : 'Revenue', color: '#f59e0b' },
            ].map((k, i) => (
              <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-3 text-center">
                <div className="text-xl mb-1">{k.icon}</div>
                <div className="text-lg font-bold" style={{ color: k.color }}>{k.val}</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">{k.label}</div>
              </div>
            ))}
          </div>

          {/* Customs alert */}
          {customsPending.length > 0 && (
            <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-3 flex items-center gap-3">
              <span className="text-xl">🏛️</span>
              <div>
                <p className="text-sm font-semibold text-purple-600">
                  {fa ? `${customsPending.length} محموله در انتظار ترخیص گمرک` : `${customsPending.length} shipment(s) pending customs clearance`}
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {customsPending.map(s => s.trackingCode).join(' • ')}
                </p>
              </div>
              <button onClick={() => setTab('customs')} className={`${btnSecondary} ms-auto border-purple-500/40 text-purple-600`}>
                {fa ? 'مشاهده' : 'View'}
              </button>
            </div>
          )}

          {/* Active shipments */}
          <div>
            <h2 className="text-sm font-semibold mb-2">{fa ? 'محموله‌های فعال' : 'Active Shipments'}</h2>
            <div className="space-y-2">
              {activeShips.length === 0 ? (
                <p className="text-sm text-[hsl(var(--muted-foreground))] py-6 text-center">{fa ? 'هیچ محموله فعالی وجود ندارد' : 'No active shipments'}</p>
              ) : activeShips.map(s => {
                const cfg = SHIP_STATUS_CONFIG[s.status];
                const progress = getProgress(s.stages);
                return (
                  <div key={s.id} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-3" style={{ borderRight: `3px solid ${cfg.color}` }}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-semibold text-sm">{s.cargo}</span>
                        <span className="ms-2 text-xs text-[hsl(var(--muted-foreground))]">{s.trackingCode}</span>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: cfg.color + '20', color: cfg.color }}>
                        {cfg.icon} {fa ? cfg.labelFa : cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] mb-2">
                      <span>📍 {s.origin}</span>
                      <span>→</span>
                      <span>📍 {s.destination}</span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-[hsl(var(--muted)/0.4)] rounded-full mb-1.5">
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${progress}%`, background: cfg.color }} />
                    </div>
                    {/* Stage dots */}
                    <div className="flex items-center gap-1">
                      {s.stages.map((st, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${st.done ? '' : 'opacity-30'}`} style={{ background: st.done ? cfg.color : '#94a3b8' }} title={fa ? st.labelFa : st.label} />
                          {idx < s.stages.length - 1 && <div className="h-px w-3 bg-[hsl(var(--border))]" />}
                        </div>
                      ))}
                      <span className="ms-auto text-xs font-medium" style={{ color: cfg.color }}>{progress}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── SHIPMENTS LIST ── */}
      {tab === 'shipments' && (
        <div className="space-y-3">
          {/* Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as ShipmentStatus | 'all')}
              className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none"
            >
              <option value="all">{fa ? 'همه وضعیت‌ها' : 'All Statuses'}</option>
              {(Object.entries(SHIP_STATUS_CONFIG) as [ShipmentStatus, typeof SHIP_STATUS_CONFIG[ShipmentStatus]][]).map(([k, v]) => (
                <option key={k} value={k}>{fa ? v.labelFa : v.label}</option>
              ))}
            </select>
            <span className="text-sm text-[hsl(var(--muted-foreground))]">{filteredShips.length} {fa ? 'محموله' : 'shipments'}</span>
          </div>

          {/* Shipment cards */}
          {filteredShips.length === 0 ? (
            <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">
              <div className="text-4xl mb-2">🚢</div>
              <p>{fa ? 'موردی یافت نشد' : 'No shipments found'}</p>
            </div>
          ) : filteredShips.map(s => {
            const cfg = SHIP_STATUS_CONFIG[s.status];
            const progress = getProgress(s.stages);
            return (
              <div key={s.id} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4" style={{ borderRight: `4px solid ${cfg.color}` }}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{s.cargo}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: cfg.color + '20', color: cfg.color }}>
                        {cfg.icon} {fa ? cfg.labelFa : cfg.label}
                      </span>
                      <span className="text-xs bg-[hsl(var(--muted)/0.4)] px-2 py-0.5 rounded-full">
                        {s.type === 'domestic' ? (fa ? 'داخلی' : 'Domestic') : s.type === 'international' ? (fa ? 'بین‌المللی' : 'International') : (fa ? 'هوایی' : 'Air')}
                      </span>
                    </div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{s.trackingCode}</div>
                  </div>
                  <div className={`text-sm font-bold shrink-0 ${s.costPaid ? 'text-green-500' : 'text-red-500'}`}>
                    {fmtCost(s.cost)}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] mb-3">
                  <span>📍 {s.origin}</span>
                  <span>→</span>
                  <span>📍 {s.destination}</span>
                  <span className="ms-auto">{fa ? 'وزن:' : 'Wt:'} {s.weight} {s.weightUnit}</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-[hsl(var(--muted)/0.4)] rounded-full mb-1.5">
                  <div className="h-1.5 rounded-full" style={{ width: `${progress}%`, background: cfg.color }} />
                </div>
                <div className="flex items-center gap-1 mb-3">
                  {s.stages.map((st, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${st.done ? '' : 'opacity-25'}`} style={{ background: st.done ? cfg.color : '#94a3b8' }} />
                      {idx < s.stages.length - 1 && <div className="h-px w-3 bg-[hsl(var(--border))]" />}
                    </div>
                  ))}
                  <span className="ms-auto text-xs" style={{ color: cfg.color }}>{progress}%</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  {s.status !== 'delivered' && s.status !== 'cancelled' && (
                    <button
                      onClick={() => { setUpdateShip(s); setUpdateForm({ date: '', location: '', notes: '' }); }}
                      className={btnSecondary + ' border-blue-500/30 text-blue-500'}
                    >
                      🔄 {fa ? 'به‌روزرسانی وضعیت' : 'Update Status'}
                    </button>
                  )}
                  <button onClick={() => setDetailShip(s)} className={btnSecondary}>
                    📋 {fa ? 'جزئیات' : 'Details'}
                  </button>
                  {!s.waybillNo ? (
                    <button onClick={() => handleIssueWaybill(s.id)} className={btnSecondary + ' border-green-500/30 text-green-600'}>
                      📄 {fa ? 'صدور بارنامه' : 'Issue Waybill'}
                    </button>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded-lg bg-green-500/10 text-green-600">
                      📄 {s.waybillNo}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── NEW SHIPMENT ── */}
      {tab === 'new' && (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-5 max-w-2xl space-y-4">
          <h2 className="font-bold text-base">🚢 {fa ? 'ثبت محموله جدید' : 'Register New Shipment'}</h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'نام کالا *' : 'Cargo Name *'}</label>
              <input value={newForm.cargo} onChange={e => setNewForm({ ...newForm, cargo: e.target.value })} className={inp} placeholder={fa ? 'مثال: روغن پالم RBD' : 'e.g. Palm Oil RBD'} />
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'نوع حمل *' : 'Shipment Type *'}</label>
              <select value={newForm.type} onChange={e => setNewForm({ ...newForm, type: e.target.value as ShipmentType })} className={inp}>
                <option value="domestic">{fa ? 'داخلی' : 'Domestic'}</option>
                <option value="international">{fa ? 'بین‌المللی' : 'International'}</option>
                <option value="air">{fa ? 'هوایی' : 'Air Freight'}</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'مبدأ *' : 'Origin *'}</label>
              <input value={newForm.origin} onChange={e => setNewForm({ ...newForm, origin: e.target.value })} className={inp} placeholder={fa ? 'مثال: بندر امام خمینی' : 'e.g. Port of Hamburg'} />
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'مقصد *' : 'Destination *'}</label>
              <input value={newForm.destination} onChange={e => setNewForm({ ...newForm, destination: e.target.value })} className={inp} placeholder={fa ? 'مثال: انبار تهران' : 'e.g. Tehran Warehouse'} />
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'فروشنده' : 'Seller'}</label>
              <input value={newForm.sellerName} onChange={e => setNewForm({ ...newForm, sellerName: e.target.value })} className={inp} />
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'خریدار' : 'Buyer'}</label>
              <input value={newForm.buyerName} onChange={e => setNewForm({ ...newForm, buyerName: e.target.value })} className={inp} />
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'وزن' : 'Weight'}</label>
              <div className="flex gap-2">
                <input type="number" value={newForm.weight} onChange={e => setNewForm({ ...newForm, weight: e.target.value })} className={inp} placeholder="500" />
                <select value={newForm.weightUnit} onChange={e => setNewForm({ ...newForm, weightUnit: e.target.value })} className="px-2 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none w-24">
                  {['تن', 'کیلوگرم', 'گرم'].map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'حجم (m³)' : 'Volume (m³)'}</label>
              <input type="number" value={newForm.volume} onChange={e => setNewForm({ ...newForm, volume: e.target.value })} className={inp} placeholder="580" />
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'هزینه حمل (IRR)' : 'Shipping Cost (IRR)'}</label>
              <input type="number" value={newForm.cost} onChange={e => setNewForm({ ...newForm, cost: e.target.value })} className={inp} placeholder="4200000000" />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" id="costPaid" checked={newForm.costPaid} onChange={e => setNewForm({ ...newForm, costPaid: e.target.checked })} className="w-4 h-4" />
              <label htmlFor="costPaid" className="text-sm cursor-pointer">{fa ? 'هزینه پرداخت شده' : 'Cost paid'}</label>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'یادداشت' : 'Notes'}</label>
              <textarea value={newForm.notes} onChange={e => setNewForm({ ...newForm, notes: e.target.value })} rows={3} className={inp + ' resize-none'} />
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setNewForm({ cargo: '', type: 'domestic', origin: '', destination: '', sellerName: '', buyerName: '', weight: '', weightUnit: 'تن', volume: '', cost: '', costPaid: false, notes: '' })} className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">
              {fa ? 'پاک کردن' : 'Clear'}
            </button>
            <button onClick={handleNewShipment} className={btnPrimary}>
              ✅ {fa ? 'ثبت محموله' : 'Register Shipment'}
            </button>
          </div>
        </div>
      )}

      {/* ── WAYBILLS ── */}
      {tab === 'waybills' && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">{fa ? 'بارنامه‌های صادر شده' : 'Issued Waybills'}</h2>
          <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[hsl(var(--muted)/0.5)]">
                  <tr>
                    {[
                      fa ? 'شماره بارنامه' : 'Waybill No',
                      fa ? 'کالا' : 'Cargo',
                      fa ? 'مسیر' : 'Route',
                      fa ? 'تاریخ ثبت' : 'Date',
                      fa ? 'اقدام' : 'Actions',
                    ].map(h => (
                      <th key={h} className="text-start px-3 py-2.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shipments.filter(s => s.waybillNo).map(s => (
                    <tr key={s.id} className="border-t border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.3)]">
                      <td className="px-3 py-2.5 font-mono text-xs font-semibold text-green-600">{s.waybillNo}</td>
                      <td className="px-3 py-2.5 font-medium">{s.cargo}</td>
                      <td className="px-3 py-2.5 text-xs text-[hsl(var(--muted-foreground))]">{s.origin} → {s.destination}</td>
                      <td className="px-3 py-2.5 text-xs">{s.createdAt}</td>
                      <td className="px-3 py-2.5">
                        <button onClick={() => window.print()} className={btnSecondary}>
                          🖨️ {fa ? 'چاپ' : 'Print'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {shipments.filter(s => !s.waybillNo && s.status !== 'cancelled').map(s => (
                    <tr key={s.id} className="border-t border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.3)] opacity-60">
                      <td className="px-3 py-2.5 text-xs text-[hsl(var(--muted-foreground))]">{fa ? 'بارنامه ندارد' : 'No waybill'}</td>
                      <td className="px-3 py-2.5 font-medium">{s.cargo}</td>
                      <td className="px-3 py-2.5 text-xs text-[hsl(var(--muted-foreground))]">{s.origin} → {s.destination}</td>
                      <td className="px-3 py-2.5 text-xs">{s.createdAt}</td>
                      <td className="px-3 py-2.5">
                        <button onClick={() => handleIssueWaybill(s.id)} className={btnSecondary + ' border-green-500/30 text-green-600 opacity-100'}>
                          📄 {fa ? 'صدور بارنامه' : 'Issue Waybill'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── CUSTOMS ── */}
      {tab === 'customs' && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">{fa ? 'پرونده‌های گمرکی' : 'Customs Files'}</h2>
          {customsShips.length === 0 ? (
            <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">
              <div className="text-4xl mb-2">🏛️</div>
              <p>{fa ? 'هیچ محموله بین‌المللی فعالی وجود ندارد' : 'No active international shipments'}</p>
            </div>
          ) : customsShips.map(s => {
            const custCfg = CUSTOMS_STATUS_CONFIG[s.customsStatus ?? 'pending'];
            return (
              <div key={s.id} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="font-semibold">{s.cargo}</span>
                    <span className="ms-2 text-xs text-[hsl(var(--muted-foreground))]">{s.trackingCode}</span>
                    <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">📍 {s.origin} → {s.destination}</div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: custCfg.color + '20', color: custCfg.color }}>
                    {fa ? custCfg.labelFa : custCfg.label}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'کد HS' : 'HS Code'}</label>
                    <input
                      value={s.hsCode ?? ''}
                      onChange={e => handleCustomsUpdate(s.id, { hsCode: e.target.value })}
                      className={inp}
                      placeholder="1511.90"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'وضعیت گمرک' : 'Customs Status'}</label>
                    <select
                      value={s.customsStatus ?? 'pending'}
                      onChange={e => handleCustomsUpdate(s.id, { customsStatus: e.target.value as CustomsStatus })}
                      className={inp}
                    >
                      {(Object.entries(CUSTOMS_STATUS_CONFIG) as [CustomsStatus, typeof CUSTOMS_STATUS_CONFIG[CustomsStatus]][]).map(([k, v]) => (
                        <option key={k} value={k}>{fa ? v.labelFa : v.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'یادداشت گمرکی' : 'Customs Notes'}</label>
                    <textarea
                      value={s.customsNotes ?? ''}
                      onChange={e => handleCustomsUpdate(s.id, { customsNotes: e.target.value })}
                      rows={2}
                      className={inp + ' resize-none'}
                      placeholder={fa ? 'اطلاعات اضافی...' : 'Additional information...'}
                    />
                  </div>
                </div>
                {s.customsStatus !== 'cleared' && (
                  <button
                    onClick={() => handleMarkCleared(s)}
                    className={btnPrimary + ' w-full'}
                  >
                    ✅ {fa ? 'ثبت ترخیص گمرک' : 'Mark as Cleared'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── FINANCE ── */}
      {tab === 'finance' && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">{fa ? 'مالی لجستیک' : 'Logistics Finance'}</h2>
          <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[hsl(var(--muted)/0.5)]">
                  <tr>
                    {[
                      fa ? 'شناسه' : 'ID',
                      fa ? 'کالا' : 'Cargo',
                      fa ? 'مسیر' : 'Route',
                      fa ? 'هزینه حمل' : 'Shipping Cost',
                      fa ? 'وضعیت پرداخت' : 'Payment',
                      fa ? 'اقدام' : 'Actions',
                    ].map(h => (
                      <th key={h} className="text-start px-3 py-2.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shipments.filter(s => s.status !== 'cancelled').map(s => (
                    <tr key={s.id} className="border-t border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.3)]">
                      <td className="px-3 py-2.5 font-mono text-xs">{s.trackingCode}</td>
                      <td className="px-3 py-2.5 font-medium">{s.cargo}</td>
                      <td className="px-3 py-2.5 text-xs text-[hsl(var(--muted-foreground))]">{s.origin} → {s.destination}</td>
                      <td className="px-3 py-2.5 font-semibold">{fmtCost(s.cost)}</td>
                      <td className="px-3 py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.costPaid ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-500'}`}>
                          {s.costPaid ? (fa ? '✅ پرداخت شده' : '✅ Paid') : (fa ? '⏳ پرداخت نشده' : '⏳ Unpaid')}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        {!s.costPaid && (
                          <button onClick={() => handleMarkPaid(s.id)} className={btnSecondary + ' border-green-500/30 text-green-600'}>
                            💳 {fa ? 'تسویه' : 'Mark Paid'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-[hsl(var(--muted)/0.3)]">
                  <tr>
                    <td colSpan={3} className="px-3 py-2.5 text-sm font-bold">{fa ? 'جمع کل' : 'Total'}</td>
                    <td className="px-3 py-2.5 font-bold text-[hsl(var(--primary))]">
                      {fmtCost(shipments.filter(s => s.status !== 'cancelled').reduce((acc, s) => acc + s.cost, 0))}
                    </td>
                    <td colSpan={2} className="px-3 py-2.5 text-xs text-[hsl(var(--muted-foreground))]">
                      {fa ? `تسویه: ${fmtCost(totalRevenue)}` : `Settled: ${fmtCost(totalRevenue)}`}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Update Status ── */}
      {updateShip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-sm p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">🔄 {fa ? 'به‌روزرسانی وضعیت' : 'Update Status'}</h2>
              <button onClick={() => setUpdateShip(null)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
              {updateShip.cargo} — {updateShip.trackingCode}
            </p>
            {(() => {
              const next = updateShip.stages.find(s => !s.done);
              if (!next) return <p className="text-sm text-green-600">{fa ? 'تمام مراحل تکمیل شده' : 'All stages complete'}</p>;
              return (
                <>
                  <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 mb-4 text-sm text-blue-600">
                    {fa ? 'مرحله بعدی:' : 'Next stage:'} <strong>{fa ? next.labelFa : next.label}</strong>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'تاریخ' : 'Date'}</label>
                      <input value={updateForm.date} onChange={e => setUpdateForm({ ...updateForm, date: e.target.value })} className={inp} placeholder={fa ? 'مثال: ۱۴۰۳/۰۳/۱۵' : 'e.g. 2024-06-15'} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'موقعیت' : 'Location'}</label>
                      <input value={updateForm.location} onChange={e => setUpdateForm({ ...updateForm, location: e.target.value })} className={inp} placeholder={fa ? 'مثال: گمرک بندرعباس' : 'e.g. Bandar Abbas Customs'} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'یادداشت' : 'Notes'}</label>
                      <textarea value={updateForm.notes} onChange={e => setUpdateForm({ ...updateForm, notes: e.target.value })} rows={2} className={inp + ' resize-none'} />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-5">
                    <button onClick={() => setUpdateShip(null)} className="flex-1 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa ? 'انصراف' : 'Cancel'}</button>
                    <button onClick={handleUpdateStatus} className={`flex-1 ${btnPrimary}`}>
                      ✅ {fa ? 'تأیید' : 'Confirm'}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* ── MODAL: Detail ── */}
      {detailShip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-lg p-6 shadow-2xl my-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">🚢 {detailShip.cargo}</h2>
              <button onClick={() => setDetailShip(null)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            {(() => {
              const cfg = SHIP_STATUS_CONFIG[detailShip.status];
              return (
                <>
                  <span className="text-xs px-2 py-1 rounded-full mb-4 inline-block" style={{ background: cfg.color + '20', color: cfg.color }}>
                    {cfg.icon} {fa ? cfg.labelFa : cfg.label}
                  </span>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-0 mt-3">
                    {[
                      [fa ? 'کد رهگیری' : 'Tracking', detailShip.trackingCode],
                      [fa ? 'نوع حمل' : 'Type', detailShip.type === 'domestic' ? (fa ? 'داخلی' : 'Domestic') : detailShip.type === 'international' ? (fa ? 'بین‌المللی' : 'International') : (fa ? 'هوایی' : 'Air')],
                      [fa ? 'مبدأ' : 'Origin', detailShip.origin],
                      [fa ? 'مقصد' : 'Destination', detailShip.destination],
                      [fa ? 'فروشنده' : 'Seller', detailShip.sellerName || '-'],
                      [fa ? 'خریدار' : 'Buyer', detailShip.buyerName || '-'],
                      [fa ? 'وزن' : 'Weight', `${detailShip.weight} ${detailShip.weightUnit}`],
                      [fa ? 'حجم' : 'Volume', `${detailShip.volume} m³`],
                      [fa ? 'هزینه حمل' : 'Shipping Cost', fmtCost(detailShip.cost)],
                      [fa ? 'وضعیت پرداخت' : 'Payment', detailShip.costPaid ? (fa ? 'پرداخت شده' : 'Paid') : (fa ? 'پرداخت نشده' : 'Unpaid')],
                      [fa ? 'شماره بارنامه' : 'Waybill No', detailShip.waybillNo || '-'],
                      [fa ? 'تاریخ ثبت' : 'Created', detailShip.createdAt],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm py-1.5 border-b border-[hsl(var(--border)/0.5)] col-span-1">
                        <span className="text-[hsl(var(--muted-foreground))]">{k}</span>
                        <span className={`font-medium ${k === (fa ? 'وضعیت پرداخت' : 'Payment') ? (detailShip.costPaid ? 'text-green-500' : 'text-red-500') : ''}`}>{v}</span>
                      </div>
                    ))}
                  </div>
                  {detailShip.notes && (
                    <div className="mt-3 p-3 bg-[hsl(var(--muted)/0.3)] rounded-lg">
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">{detailShip.notes}</p>
                    </div>
                  )}
                  {detailShip.insurance && (
                    <div className="mt-3 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
                      <p className="text-xs font-semibold text-blue-600 mb-1">🛡️ {fa ? 'بیمه' : 'Insurance'}</p>
                      <div className="text-xs text-[hsl(var(--muted-foreground))] space-y-0.5">
                        <p>{fa ? 'شرکت:' : 'Company:'} {detailShip.insurance.company}</p>
                        <p>{fa ? 'مبلغ:' : 'Amount:'} {fmtCost(detailShip.insurance.amount)}</p>
                        <p>{fa ? 'شماره بیمه‌نامه:' : 'Policy No:'} {detailShip.insurance.policyNo}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 mt-5 flex-wrap">
                    {!detailShip.waybillNo && (
                      <button onClick={() => { handleIssueWaybill(detailShip.id); setDetailShip(prev => prev ? { ...prev, waybillNo: genWaybill() } : null); }} className={btnSecondary + ' border-green-500/30 text-green-600'}>
                        📄 {fa ? 'صدور بارنامه' : 'Issue Waybill'}
                      </button>
                    )}
                    {detailShip.status !== 'delivered' && detailShip.status !== 'cancelled' && (
                      <button
                        onClick={() => { setUpdateShip(detailShip); setDetailShip(null); setUpdateForm({ date: '', location: '', notes: '' }); }}
                        className={btnSecondary + ' border-blue-500/30 text-blue-500'}
                      >
                        🔄 {fa ? 'به‌روزرسانی' : 'Update'}
                      </button>
                    )}
                    {!detailShip.costPaid && (
                      <button onClick={() => { handleMarkPaid(detailShip.id); setDetailShip(prev => prev ? { ...prev, costPaid: true } : null); }} className={btnSecondary + ' border-green-500/30 text-green-600'}>
                        💳 {fa ? 'تسویه هزینه' : 'Mark Paid'}
                      </button>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
