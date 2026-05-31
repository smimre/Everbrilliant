'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';

interface BankAccount {
  id: string;
  name: string;
  bankName: string;
  accountNo: string;
  iban?: string;
  currency: string;
  type: 'bank' | 'cash' | 'petty';
  balance: number;
}

interface Transaction {
  id: string;
  date: string;
  type: 'IN' | 'OUT';
  amount: number;
  currency: string;
  accountId: string;
  description: string;
  ref?: string;
  category: string;
}

export function Treasury() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showNewAcc, setShowNewAcc] = useState(false);
  const [showNewTxn, setShowNewTxn] = useState(false);
  const [selectedAcc, setSelectedAcc] = useState<string | null>(null);
  const inp = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]";

  const totalCash = accounts.reduce((s, a) => s + a.balance, 0);
  const txns = selectedAcc ? transactions.filter(t => t.accountId === selectedAcc) : transactions;
  const totalIn = txns.filter(t => t.type === 'IN').reduce((s, t) => s + t.amount, 0);
  const totalOut = txns.filter(t => t.type === 'OUT').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">🏦 {fa ? 'خزانه و بانک' : 'Treasury & Bank'}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{accounts.length} {fa ? 'حساب' : 'accounts'}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowNewTxn(true)} className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted)/0.5)]">
            💸 {fa ? 'تراکنش جدید' : 'New Transaction'}
          </button>
          <button onClick={() => setShowNewAcc(true)} className="px-3 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">
            🏦 {fa ? 'حساب جدید' : 'New Account'}
          </button>
        </div>
      </div>

      {/* Total Cash Banner */}
      <div className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 p-5 text-white">
        <div className="text-sm opacity-80 mb-1">{fa ? 'کل نقدینگی' : 'Total Liquidity'}</div>
        <div className="text-3xl font-bold">{totalCash.toLocaleString('fa-IR')}</div>
        <div className="text-sm opacity-70 mt-1">{fa ? 'ریال — همه حساب‌ها' : 'IRR — All accounts'}</div>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {accounts.map(acc => (
          <div key={acc.id} onClick={() => setSelectedAcc(selectedAcc === acc.id ? null : acc.id)}
            className={`rounded-xl border p-4 cursor-pointer transition-all ${
              selectedAcc === acc.id ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)]' : 'border-[hsl(var(--border))] bg-[hsl(var(--secondary))] hover:border-[hsl(var(--primary)/0.3)]'
            }`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{acc.type === 'cash' ? '💵' : acc.type === 'petty' ? '👛' : '🏦'}</span>
              <div>
                <div className="text-sm font-semibold">{acc.name}</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">{acc.bankName}</div>
              </div>
            </div>
            <div className="text-lg font-bold" style={{ color: acc.balance >= 0 ? '#10b981' : '#ef4444' }}>
              {acc.balance.toLocaleString('fa-IR')}
            </div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{acc.currency} | {acc.accountNo}</div>
          </div>
        ))}
        <button onClick={() => setShowNewAcc(true)}
          className="rounded-xl border-2 border-dashed border-[hsl(var(--border))] p-4 text-center text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary)/0.5)] hover:text-[hsl(var(--primary))] transition-colors">
          <div className="text-2xl mb-1">➕</div>
          <div className="text-xs">{fa ? 'افزودن حساب' : 'Add Account'}</div>
        </button>
      </div>

      {/* Transactions */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">💳 {fa ? 'تراکنش‌ها' : 'Transactions'}</h3>
          <div className="flex gap-4 text-sm">
            <span className="text-green-600">📥 {totalIn.toLocaleString('fa-IR')}</span>
            <span className="text-red-500">📤 {totalOut.toLocaleString('fa-IR')}</span>
          </div>
        </div>
        {txns.length === 0 ? (
          <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
            <div className="text-3xl mb-2">💸</div>
            <p className="text-sm">{fa ? 'تراکنشی ثبت نشده' : 'No transactions'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[hsl(var(--muted)/0.5)]">
                <tr>
                  {[fa?'تاریخ':'Date', fa?'شرح':'Description', fa?'نوع':'Type', fa?'مبلغ':'Amount', fa?'مرجع':'Ref'].map(h => (
                    <th key={h} className="text-start px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {txns.map(t => (
                  <tr key={t.id} className="border-t border-[hsl(var(--border)/0.5)] hover:bg-[hsl(var(--muted)/0.3)]">
                    <td className="px-4 py-2">{t.date}</td>
                    <td className="px-4 py-2">{t.description}</td>
                    <td className="px-4 py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${t.type === 'IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {t.type === 'IN' ? (fa ? '📥 دریافت' : '📥 In') : (fa ? '📤 پرداخت' : '📤 Out')}
                      </span>
                    </td>
                    <td className={`px-4 py-2 font-bold ${t.type === 'IN' ? 'text-green-600' : 'text-red-500'}`}>
                      {t.type === 'IN' ? '+' : '-'}{t.amount.toLocaleString('fa-IR')}
                    </td>
                    <td className="px-4 py-2 text-xs text-[hsl(var(--muted-foreground))]">{t.ref}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Account Modal */}
      {showNewAcc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg">🏦 {fa ? 'حساب جدید' : 'New Account'}</h2>
              <button onClick={() => setShowNewAcc(false)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'نوع حساب':'Account Type'}</label>
                <select className={inp}>
                  <option value="bank">{fa?'🏦 حساب بانکی':'🏦 Bank Account'}</option>
                  <option value="cash">{fa?'💵 صندوق نقد':'💵 Cash Box'}</option>
                  <option value="petty">{fa?'👛 تنخواه':'👛 Petty Cash'}</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'نام حساب *':'Account Name *'}</label>
                <input className={inp} placeholder={fa?'مثال: حساب جاری ملت':'e.g. Bank Mellat Current'} />
              </div>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'نام بانک':'Bank Name'}</label>
                <input className={inp} placeholder={fa?'بانک ملت، ملی، صادرات...':'Bank name'} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'شماره حساب':'Account No.'}</label>
                  <input className={inp} />
                </div>
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'ارز':'Currency'}</label>
                  <select className={inp}>
                    <option value="IRR">ریال (IRR)</option>
                    <option value="AED">درهم (AED)</option>
                    <option value="USD">دلار (USD)</option>
                    <option value="EUR">یورو (EUR)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'شماره شبا (IBAN)':'IBAN'}</label>
                <input className={inp} placeholder="IR..." />
              </div>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'موجودی اولیه':'Opening Balance'}</label>
                <input type="number" className={inp} defaultValue="0" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowNewAcc(false)} className="flex-1 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa?'انصراف':'Cancel'}</button>
              <button className="flex-1 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">✅ {fa?'ذخیره':'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* New Transaction Modal */}
      {showNewTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg">💸 {fa ? 'تراکنش جدید' : 'New Transaction'}</h2>
              <button onClick={() => setShowNewTxn(false)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'نوع':'Type'}</label>
                  <select className={inp}>
                    <option value="IN">📥 {fa?'دریافت':'Income'}</option>
                    <option value="OUT">📤 {fa?'پرداخت':'Expense'}</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'حساب':'Account'}</label>
                  <select className={inp}>
                    <option value="">{fa?'انتخاب حساب':'Select account'}</option>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'مبلغ *':'Amount *'}</label>
                <input type="number" className={inp} />
              </div>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'تاریخ':'Date'}</label>
                <input className={inp} placeholder={fa?'1403/06/15':'2024-09-05'} />
              </div>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'شرح':'Description'}</label>
                <input className={inp} />
              </div>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'شماره مرجع/چک':'Reference/Check No.'}</label>
                <input className={inp} />
              </div>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'دسته‌بندی':'Category'}</label>
                <select className={inp}>
                  <option>{fa?'فروش کالا/خدمات':'Sales'}</option>
                  <option>{fa?'خرید کالا/مواد اولیه':'Purchases'}</option>
                  <option>{fa?'حقوق و دستمزد':'Payroll'}</option>
                  <option>{fa?'اجاره':'Rent'}</option>
                  <option>{fa?'هزینه‌های عمومی':'General Expenses'}</option>
                  <option>{fa?'سرمایه‌گذاری':'Investment'}</option>
                  <option>{fa?'وام':'Loan'}</option>
                  <option>{fa?'سایر':'Other'}</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowNewTxn(false)} className="flex-1 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa?'انصراف':'Cancel'}</button>
              <button className="flex-1 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">✅ {fa?'ثبت تراکنش':'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
