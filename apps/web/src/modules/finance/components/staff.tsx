'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';

interface Employee {
  id: string;
  code: string;
  name: string;
  nameFa?: string;
  dept: string;
  position: string;
  nationalId: string;
  insuranceNo?: string;
  base: number;
  allowances: { housing: number; food: number; transport: number; other: number };
  deductions: { insurance: number; tax: number; loan: number; other: number };
  iban?: string;
  startDate: string;
  active: boolean;
}

export function Staff() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const [staff, setStaff] = useState<Employee[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [deptFilter, setDeptFilter] = useState('all');

  const depts = ['all', ...new Set(staff.map(s => s.dept).filter(Boolean))];
  const filtered = staff.filter(s => deptFilter === 'all' || s.dept === deptFilter);
  const active = filtered.filter(s => s.active);

  const calcNet = (emp: Employee) => {
    const gross = emp.base + Object.values(emp.allowances).reduce((a, v) => a + v, 0);
    const totalDeduct = Object.values(emp.deductions).reduce((a, v) => a + v, 0);
    return gross - totalDeduct;
  };

  const totalPayroll = active.reduce((s, e) => s + calcNet(e), 0);
  const inp = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">👥 {fa ? 'پرسنل' : 'Staff'}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{active.length} {fa ? 'کارمند فعال' : 'active employees'}</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">
          👤 {fa ? 'کارمند جدید' : 'New Employee'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: '👥', val: active.length, label: fa?'کارمند فعال':'Active Staff', color: '#3b82f6' },
          { icon: '🏢', val: new Set(staff.map(s=>s.dept).filter(Boolean)).size, label: fa?'دپارتمان':'Departments', color: '#8b5cf6' },
          { icon: '💰', val: totalPayroll>0?(totalPayroll/1000000).toFixed(0)+'M':'0', label: fa?'حقوق ماهانه (ریال)':'Monthly Payroll', color: '#10b981' },
          { icon: '📋', val: staff.filter(s=>!s.active).length, label: fa?'غیرفعال':'Inactive', color: '#94a3b8' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-3 text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-xl font-bold" style={{ color: s.color }}>{s.val}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Dept Filter */}
      <div className="flex gap-2 flex-wrap">
        {depts.map(d => (
          <button key={d} onClick={() => setDeptFilter(d)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${deptFilter === d ? 'bg-[hsl(var(--primary))] text-white' : 'bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'}`}>
            {d === 'all' ? (fa ? 'همه' : 'All') : d}
          </button>
        ))}
      </div>

      {/* Staff List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">
          <div className="text-4xl mb-3">👥</div>
          <p className="font-medium">{fa ? 'کارمندی ثبت نشده' : 'No employees yet'}</p>
          <button onClick={() => setShowNew(true)} className="mt-4 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm">
            {fa ? '+ کارمند جدید' : '+ New Employee'}
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[hsl(var(--muted)/0.5)]">
              <tr>
                {[fa?'کد':'Code', fa?'نام':'Name', fa?'دپارتمان':'Dept', fa?'سمت':'Position',
                  fa?'حقوق پایه':'Base', fa?'خالص':'Net Pay', fa?'وضعیت':'Status', ''].map(h => (
                  <th key={h} className="text-start px-4 py-3 text-xs font-semibold text-[hsl(var(--muted-foreground))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(emp => (
                <tr key={emp.id} className="border-t border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.3)]">
                  <td className="px-4 py-3 font-mono text-xs">{emp.code}</td>
                  <td className="px-4 py-3 font-medium">{fa ? emp.nameFa || emp.name : emp.name}</td>
                  <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">{emp.dept}</td>
                  <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">{emp.position}</td>
                  <td className="px-4 py-3">{emp.base.toLocaleString('fa-IR')}</td>
                  <td className="px-4 py-3 font-bold text-green-600">{calcNet(emp).toLocaleString('fa-IR')}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${emp.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {emp.active ? (fa?'فعال':'Active') : (fa?'غیرفعال':'Inactive')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(emp)} className="text-xs px-2 py-1 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.5)]">
                      {fa?'ویرایش':'Edit'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Employee Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-2xl p-6 shadow-2xl my-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg">👤 {fa ? 'کارمند جدید' : 'New Employee'}</h2>
              <button onClick={() => setShowNew(false)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>

            {/* Personal Info */}
            <div className="text-xs font-bold text-[hsl(var(--muted-foreground))] mb-2 uppercase">👤 {fa?'اطلاعات شخصی':'Personal Info'}</div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'نام و نام خانوادگی *':'Full Name *'}</label><input className={inp} /></div>
              <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'کد پرسنلی':'Employee Code'}</label><input className={inp} placeholder="EMP001" /></div>
              <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'کد ملی *':'National ID *'}</label><input className={inp} placeholder="0000000000" /></div>
              <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'شماره بیمه':'Insurance No.'}</label><input className={inp} /></div>
              <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'دپارتمان':'Department'}</label><input className={inp} /></div>
              <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'سمت/عنوان شغلی':'Position'}</label><input className={inp} /></div>
              <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'تاریخ استخدام':'Start Date'}</label><input className={inp} placeholder="1403/01/01" /></div>
              <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'شماره شبا (IBAN)':'IBAN'}</label><input className={inp} placeholder="IR..." /></div>
            </div>

            {/* Salary */}
            <div className="text-xs font-bold text-[hsl(var(--muted-foreground))] mb-2 uppercase">💰 {fa?'حقوق و مزایا':'Salary & Allowances'}</div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'حقوق پایه *':'Base Salary *'}</label><input type="number" className={inp} /></div>
              <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'مسکن':'Housing Allow.'}</label><input type="number" className={inp} defaultValue="0" /></div>
              <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'خواربار':'Food Allow.'}</label><input type="number" className={inp} defaultValue="0" /></div>
              <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'ایاب و ذهاب':'Transport Allow.'}</label><input type="number" className={inp} defaultValue="0" /></div>
              <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'سایر مزایا':'Other Allow.'}</label><input type="number" className={inp} defaultValue="0" /></div>
            </div>

            {/* Deductions */}
            <div className="text-xs font-bold text-[hsl(var(--muted-foreground))] mb-2 uppercase">📉 {fa?'کسورات':'Deductions'}</div>
            <div className="grid grid-cols-4 gap-3 mb-5">
              <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'بیمه (۷٪)':'Insurance (7%)'}</label><input type="number" className={inp} defaultValue="0" /></div>
              <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'مالیات':'Tax'}</label><input type="number" className={inp} defaultValue="0" /></div>
              <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'وام':'Loan'}</label><input type="number" className={inp} defaultValue="0" /></div>
              <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'سایر کسورات':'Other'}</label><input type="number" className={inp} defaultValue="0" /></div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowNew(false)} className="flex-1 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa?'انصراف':'Cancel'}</button>
              <button className="flex-1 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">✅ {fa?'ذخیره':'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
