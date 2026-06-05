'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';

interface WorkflowStep {
  label: string;
  person: string;
}

interface Workflow {
  id: string;
  title: string;
  trigger: 'request_amount' | 'always';
  threshold: number;
  active: boolean;
  steps: WorkflowStep[];
}

interface WorkflowInstance {
  id: string;
  title: string;
  workflowId: string;
  status: 'pending' | 'approved' | 'rejected';
  currentStep: number;
  totalSteps: number;
  myTurn: boolean;
  amount: number;
}

const MOCK_WORKFLOWS: Workflow[] = [
  {
    id: 'WF-001', title: 'تأیید خرید بزرگ', trigger: 'request_amount', threshold: 500000000, active: true,
    steps: [{ label: 'تأیید مدیر مالی', person: 'علی رضایی' }, { label: 'تأیید مدیر عامل', person: 'محمد کریمی' }],
  },
  {
    id: 'WF-002', title: 'تأیید قرارداد', trigger: 'always', threshold: 0, active: true,
    steps: [{ label: 'بررسی حقوقی', person: 'سارا احمدی' }, { label: 'امضای نهایی', person: 'محمد کریمی' }],
  },
];

const MOCK_INSTANCES: WorkflowInstance[] = [
  { id: 'WFI-001', title: 'درخواست خرید روغن پالم ۵۰۰ تن', workflowId: 'WF-001', status: 'pending', currentStep: 0, totalSteps: 2, myTurn: true, amount: 2500000000 },
  { id: 'WFI-002', title: 'قرارداد فروش شکر', workflowId: 'WF-002', status: 'approved', currentStep: 2, totalSteps: 2, myTurn: false, amount: 1100000000 },
  { id: 'WFI-003', title: 'درخواست خرید تجهیزات', workflowId: 'WF-001', status: 'pending', currentStep: 1, totalSteps: 2, myTurn: false, amount: 800000000 },
];

const STATUS_CONFIG = {
  pending:  { labelFa: 'در انتظار', labelEn: 'Pending',  color: '#f59e0b', icon: '⏳' },
  approved: { labelFa: 'تأیید شده', labelEn: 'Approved', color: '#10b981', icon: '✅' },
  rejected: { labelFa: 'رد شده',    labelEn: 'Rejected', color: '#ef4444', icon: '❌' },
};

function fmtAmount(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B IRR';
  if (n >= 1e6) return (n / 1e6).toFixed(0) + 'M IRR';
  return n.toLocaleString() + ' IRR';
}

const STEP_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

export function ApprovalWorkflowsPage() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';

  const [workflows, setWorkflows] = useState<Workflow[]>(MOCK_WORKFLOWS);
  const [instances, setInstances] = useState<WorkflowInstance[]>(MOCK_INSTANCES);
  const [showNewModal, setShowNewModal] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formTrigger, setFormTrigger] = useState<'request_amount' | 'always'>('always');
  const [formThreshold, setFormThreshold] = useState('');
  const [formSteps, setFormSteps] = useState<WorkflowStep[]>([{ label: '', person: '' }]);

  const pendingInstances = instances.filter(i => i.status === 'pending');
  const approvedToday = instances.filter(i => i.status === 'approved');
  const rejectedInstances = instances.filter(i => i.status === 'rejected');
  const myPendingTurn = instances.filter(i => i.myTurn && i.status === 'pending');

  const stats = [
    { icon: '🔄', val: workflows.filter(w => w.active).length, label: fa ? 'گردش‌کار فعال' : 'Active Workflows', color: '#3b82f6' },
    { icon: '⏳', val: pendingInstances.length, label: fa ? 'در انتظار تأیید' : 'Pending Approvals', color: '#f59e0b' },
    { icon: '✅', val: approvedToday.length, label: fa ? 'تأیید شده امروز' : 'Approved Today', color: '#10b981' },
    { icon: '❌', val: rejectedInstances.length, label: fa ? 'رد شده' : 'Rejected', color: '#ef4444' },
  ];

  function addFormStep() {
    setFormSteps(prev => [...prev, { label: '', person: '' }]);
  }
  function removeFormStep(idx: number) {
    setFormSteps(prev => prev.filter((_, i) => i !== idx));
  }
  function updateFormStep(idx: number, field: keyof WorkflowStep, val: string) {
    setFormSteps(prev => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s));
  }

  function handleSaveWorkflow() {
    if (!formTitle.trim()) return;
    const newWf: Workflow = {
      id: `WF-${String(workflows.length + 1).padStart(3, '0')}`,
      title: formTitle.trim(),
      trigger: formTrigger,
      threshold: formTrigger === 'request_amount' ? (parseFloat(formThreshold) || 0) : 0,
      active: true,
      steps: formSteps.filter(s => s.label.trim() || s.person.trim()),
    };
    setWorkflows(prev => [...prev, newWf]);
    setFormTitle('');
    setFormTrigger('always');
    setFormThreshold('');
    setFormSteps([{ label: '', person: '' }]);
    setShowNewModal(false);
  }

  function handleCancelModal() {
    setFormTitle('');
    setFormTrigger('always');
    setFormThreshold('');
    setFormSteps([{ label: '', person: '' }]);
    setShowNewModal(false);
  }

  function toggleActive(id: string) {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, active: !w.active } : w));
  }

  function handleApprove(id: string) {
    setInstances(prev => prev.map(i => i.id === id ? { ...i, status: 'approved', myTurn: false } : i));
  }
  function handleReject(id: string) {
    setInstances(prev => prev.map(i => i.id === id ? { ...i, status: 'rejected', myTurn: false } : i));
  }

  const inp = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">✅ {fa ? 'گردش‌کارهای تأیید' : 'Approval Workflows'}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
            {fa ? 'مدیریت فرآیندهای تأیید و تصویب' : 'Manage approval processes and chains'}
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          ➕ {fa ? 'گردش‌کار جدید' : 'New Workflow'}
        </button>
      </div>

      {/* Alert Banner */}
      {myPendingTurn.length > 0 && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 flex items-center gap-3">
          <span className="text-xl flex-shrink-0">🔔</span>
          <div>
            <div className="font-semibold text-sm text-amber-600">
              {fa
                ? `${myPendingTurn.length} درخواست در انتظار تأیید شما`
                : `${myPendingTurn.length} request${myPendingTurn.length > 1 ? 's' : ''} awaiting your approval`}
            </div>
            <div className="text-xs text-amber-600/80 mt-0.5">
              {myPendingTurn.map(i => i.title).join(' · ')}
            </div>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-3 text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-0.5 rounded-t-xl" style={{ background: s.color }} />
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-xl font-bold leading-none" style={{ color: s.color }}>{s.val}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* My Workflows */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] overflow-hidden">
        <div className="p-4 border-b border-[hsl(var(--border))]">
          <h2 className="font-semibold text-sm">🔧 {fa ? 'گردش‌کارهای من' : 'My Workflows'}</h2>
        </div>
        <div className="divide-y divide-[hsl(var(--border))]">
          {workflows.map(wf => (
            <div key={wf.id} className="p-4 hover:bg-[hsl(var(--muted)/0.2)] transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Title + Active badge */}
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="font-semibold text-sm">{wf.title}</span>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{
                        background: wf.active ? '#10b98120' : '#64748b20',
                        color: wf.active ? '#10b981' : '#64748b',
                      }}
                    >
                      {wf.active ? (fa ? 'فعال' : 'Active') : (fa ? 'غیرفعال' : 'Inactive')}
                    </span>
                    {/* Trigger badge */}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-medium">
                      {wf.trigger === 'request_amount'
                        ? (fa ? `مبلغ بیش از ${fmtAmount(wf.threshold)}` : `Amount > ${fmtAmount(wf.threshold)}`)
                        : (fa ? 'همیشه' : 'Always')}
                    </span>
                  </div>

                  {/* Step chain */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {wf.steps.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                            style={{ background: STEP_COLORS[idx % STEP_COLORS.length] }}
                          >
                            {idx + 1}
                          </span>
                          <span className="text-xs">
                            {step.label}
                            <span className="text-[hsl(var(--muted-foreground))]"> ({step.person})</span>
                          </span>
                        </div>
                        {idx < wf.steps.length - 1 && (
                          <span className="text-[hsl(var(--muted-foreground))] text-xs mx-1">→</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 shrink-0">
                  <button className="px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] text-xs hover:bg-[hsl(var(--muted)/0.3)] transition-colors">
                    ✏️ {fa ? 'ویرایش' : 'Edit'}
                  </button>
                  <button
                    onClick={() => toggleActive(wf.id)}
                    className="px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] text-xs hover:bg-[hsl(var(--muted)/0.3)] transition-colors"
                  >
                    {wf.active ? (fa ? 'غیرفعال‌کردن' : 'Deactivate') : (fa ? 'فعال‌کردن' : 'Activate')}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {workflows.length === 0 && (
            <div className="p-8 text-center text-[hsl(var(--muted-foreground))]">
              <div className="text-2xl mb-1">📋</div>
              <p className="text-xs">{fa ? 'هیچ گردش‌کاری تعریف نشده' : 'No workflows defined yet'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Active Instances */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] overflow-hidden">
        <div className="p-4 border-b border-[hsl(var(--border))]">
          <h2 className="font-semibold text-sm">⚙️ {fa ? 'نمونه‌های در حال اجرا' : 'Active Instances'}</h2>
        </div>
        <div className="divide-y divide-[hsl(var(--border))]">
          {instances.map(inst => {
            const st = STATUS_CONFIG[inst.status];
            const progressPct = inst.totalSteps > 0 ? Math.min(100, (inst.currentStep / inst.totalSteps) * 100) : 0;
            return (
              <div key={inst.id} className="p-4 hover:bg-[hsl(var(--muted)/0.15)] transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Title + Status */}
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="font-medium text-sm">{inst.title}</span>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: st.color + '20', color: st.color }}
                      >
                        {st.icon} {fa ? st.labelFa : st.labelEn}
                      </span>
                      {inst.myTurn && inst.status === 'pending' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 font-semibold animate-pulse">
                          {fa ? 'نوبت شما' : 'Your turn'}
                        </span>
                      )}
                    </div>

                    {/* Amount + step info */}
                    <div className="flex gap-3 text-xs text-[hsl(var(--muted-foreground))] mb-2">
                      <span>💰 {fmtAmount(inst.amount)}</span>
                      <span>
                        {fa
                          ? `مرحله ${inst.currentStep + (inst.status !== 'approved' ? 1 : inst.currentStep)} از ${inst.totalSteps}`
                          : `Step ${inst.currentStep + (inst.status !== 'approved' ? 1 : inst.currentStep)} of ${inst.totalSteps}`}
                      </span>
                      <span className="font-mono text-[10px]">{inst.id}</span>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1.5 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${progressPct}%`, background: st.color }}
                      />
                    </div>
                    <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1">
                      {progressPct.toFixed(0)}%
                    </div>
                  </div>

                  {/* Approve / Reject buttons for my-turn */}
                  {inst.myTurn && inst.status === 'pending' && (
                    <div className="flex gap-2 shrink-0 flex-col sm:flex-row">
                      <button
                        onClick={() => handleApprove(inst.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-600 border border-green-500/30 text-xs font-medium hover:bg-green-500/20 transition-colors"
                      >
                        ✅ {fa ? 'تأیید' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(inst.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-600 border border-red-500/30 text-xs font-medium hover:bg-red-500/20 transition-colors"
                      >
                        ❌ {fa ? 'رد کردن' : 'Reject'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {instances.length === 0 && (
            <div className="p-8 text-center text-[hsl(var(--muted-foreground))]">
              <div className="text-2xl mb-1">✅</div>
              <p className="text-xs">{fa ? 'هیچ نمونه‌ای در حال اجرا نیست' : 'No active instances'}</p>
            </div>
          )}
        </div>
      </div>

      {/* New Workflow Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg">➕ {fa ? 'گردش‌کار جدید' : 'New Workflow'}</h2>
              <button onClick={handleCancelModal} className="text-[hsl(var(--muted-foreground))] text-xl hover:text-[hsl(var(--foreground))]">✕</button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">
                  {fa ? 'عنوان گردش‌کار *' : 'Workflow Title *'}
                </label>
                <input
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className={inp}
                  placeholder={fa ? 'مثال: تأیید خرید بزرگ' : 'e.g. Large Purchase Approval'}
                />
              </div>

              {/* Trigger */}
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">
                  {fa ? 'شرط فعال‌سازی' : 'Trigger Condition'}
                </label>
                <select
                  value={formTrigger}
                  onChange={e => setFormTrigger(e.target.value as 'request_amount' | 'always')}
                  className={inp}
                >
                  <option value="always">{fa ? 'همیشه' : 'Always'}</option>
                  <option value="request_amount">{fa ? 'مبلغ درخواست بیش از...' : 'Request amount exceeds...'}</option>
                </select>
              </div>

              {/* Threshold (only if trigger = request_amount) */}
              {formTrigger === 'request_amount' && (
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">
                    {fa ? 'حد آستانه مبلغ (ریال)' : 'Threshold Amount (IRR)'}
                  </label>
                  <input
                    type="number"
                    value={formThreshold}
                    onChange={e => setFormThreshold(e.target.value)}
                    className={inp}
                    placeholder="500000000"
                  />
                </div>
              )}

              {/* Steps */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
                    {fa ? 'مراحل تأیید' : 'Approval Steps'}
                  </label>
                  <button
                    onClick={addFormStep}
                    className="text-xs text-[hsl(var(--primary))] hover:underline"
                  >
                    + {fa ? 'افزودن مرحله' : 'Add Step'}
                  </button>
                </div>
                <div className="space-y-2">
                  {formSteps.map((step, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                        style={{ background: STEP_COLORS[idx % STEP_COLORS.length] }}
                      >
                        {idx + 1}
                      </span>
                      <input
                        value={step.person}
                        onChange={e => updateFormStep(idx, 'person', e.target.value)}
                        className={inp}
                        placeholder={fa ? 'نام شخص' : 'Person name'}
                      />
                      <input
                        value={step.label}
                        onChange={e => updateFormStep(idx, 'label', e.target.value)}
                        className={inp}
                        placeholder={fa ? 'عنوان مرحله' : 'Step label'}
                      />
                      {formSteps.length > 1 && (
                        <button
                          onClick={() => removeFormStep(idx)}
                          className="text-red-500 hover:text-red-600 flex-shrink-0 text-lg leading-none"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCancelModal}
                className="flex-1 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted)/0.3)] transition-colors"
              >
                {fa ? 'انصراف' : 'Cancel'}
              </button>
              <button
                onClick={handleSaveWorkflow}
                disabled={!formTitle.trim()}
                className="flex-1 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ✅ {fa ? 'ذخیره گردش‌کار' : 'Save Workflow'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
