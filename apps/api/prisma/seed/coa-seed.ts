// ══════════════════════════════════════════════════════════
// EVERBRILLIANT — Chart of Accounts + Financial Data Seed
// Run: npx ts-node --transpile-only -r tsconfig-paths/register prisma/seed/coa-seed.ts
// ══════════════════════════════════════════════════════════
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const CID = 1;   // گروه تجاری رضایی
const UID = 1;   // احمد رضایی

// ── Helpers ───────────────────────────────────────────────
const M  = (n: number) => BigInt(Math.round(n * 1_000_000));  // میلیون ریال → ریال
const D  = (s: string) => s;                                   // date string pass-through

// ── 1. Full Chart of Accounts (Iranian Standard COA) ─────
const COA = [
  // ── دارایی‌ها ──────────────────────────────────────────
  { code:'1000', name:'Assets',                   nameFa:'دارایی‌ها',                   type:'ASSET',     balance:M(1640) },
  { code:'1100', name:'Cash & Petty Cash',         nameFa:'موجودی نقد و تنخواه',         type:'ASSET',     balance:M(40)   },
  { code:'1110', name:'Bank Mellat (Current)',     nameFa:'بانک ملت — جاری',             type:'ASSET',     balance:M(185)  },
  { code:'1120', name:'Bank Melli (Current)',      nameFa:'بانک ملی — جاری',             type:'ASSET',     balance:M(42)   },
  { code:'1200', name:'Accounts Receivable',       nameFa:'حساب‌های دریافتنی',          type:'ASSET',     balance:M(280)  },
  { code:'1210', name:'Notes Receivable',          nameFa:'اسناد دریافتنی',              type:'ASSET',     balance:M(120)  },
  { code:'1300', name:'Inventory — Raw Materials', nameFa:'موجودی مواد اولیه',           type:'ASSET',     balance:M(95)   },
  { code:'1310', name:'Inventory — Finished Goods',nameFa:'موجودی کالای ساخته‌شده',    type:'ASSET',     balance:M(145)  },
  { code:'1320', name:'Inventory — WIP',           nameFa:'کالای در جریان ساخت',         type:'ASSET',     balance:M(35)   },
  { code:'1400', name:'Prepaid Expenses',          nameFa:'پیش‌پرداخت‌ها',              type:'ASSET',     balance:M(28)   },
  { code:'1500', name:'Fixed Assets (Net)',        nameFa:'دارایی‌های ثابت خالص',        type:'ASSET',     balance:M(670)  },
  // ── بدهی‌ها ────────────────────────────────────────────
  { code:'2000', name:'Liabilities',               nameFa:'بدهی‌ها',                     type:'LIABILITY', balance:M(1140) },
  { code:'2100', name:'Accounts Payable',          nameFa:'حساب‌های پرداختنی',          type:'LIABILITY', balance:M(320)  },
  { code:'2110', name:'Notes Payable',             nameFa:'اسناد پرداختنی',              type:'LIABILITY', balance:M(95)   },
  { code:'2200', name:'VAT Payable',               nameFa:'مالیات ارزش افزوده پرداختنی',type:'LIABILITY', balance:M(42)   },
  { code:'2210', name:'Income Tax Payable',        nameFa:'مالیات بر درآمد پرداختنی',   type:'LIABILITY', balance:M(38)   },
  { code:'2300', name:'Short-term Bank Loan',      nameFa:'وام کوتاه‌مدت بانکی',        type:'LIABILITY', balance:M(200)  },
  { code:'2400', name:'Long-term Loan',            nameFa:'وام بلندمدت',                 type:'LIABILITY', balance:M(400)  },
  { code:'2500', name:'Accrued Expenses',          nameFa:'هزینه‌های تعهدی',             type:'LIABILITY', balance:M(45)   },
  // ── حقوق صاحبان سهام ──────────────────────────────────
  { code:'3000', name:'Equity',                    nameFa:'حقوق صاحبان سهام',            type:'EQUITY',    balance:M(500)  },
  { code:'3100', name:'Paid-in Capital',           nameFa:'سرمایه ثبت‌شده',              type:'EQUITY',    balance:M(300)  },
  { code:'3200', name:'Retained Earnings',         nameFa:'سود انباشته',                  type:'EQUITY',    balance:M(200)  },
  // ── درآمدها ────────────────────────────────────────────
  { code:'4000', name:'Revenue',                   nameFa:'درآمدها',                      type:'REVENUE',   balance:M(1010) },
  { code:'4100', name:'Sales Revenue — Goods',    nameFa:'درآمد فروش کالا',              type:'REVENUE',   balance:M(850)  },
  { code:'4200', name:'Service Revenue',           nameFa:'درآمد خدمات',                  type:'REVENUE',   balance:M(120)  },
  { code:'4300', name:'Interest Income',           nameFa:'درآمد بهره',                   type:'REVENUE',   balance:M(15)   },
  { code:'4400', name:'Other Revenue',             nameFa:'سایر درآمدها',                 type:'REVENUE',   balance:M(25)   },
  // ── هزینه‌ها ────────────────────────────────────────────
  { code:'5000', name:'Expenses',                  nameFa:'هزینه‌ها',                     type:'EXPENSE',   balance:M(935)  },
  { code:'5100', name:'Cost of Goods Sold',        nameFa:'بهای تمام‌شده کالای فروش‌رفته',type:'EXPENSE',  balance:M(480)  },
  { code:'6100', name:'Salaries & Wages',          nameFa:'حقوق و دستمزد',                type:'EXPENSE',   balance:M(185)  },
  { code:'6110', name:'Social Security',           nameFa:'بیمه تأمین اجتماعی',           type:'EXPENSE',   balance:M(28)   },
  { code:'6200', name:'Rent',                      nameFa:'اجاره محل',                    type:'EXPENSE',   balance:M(72)   },
  { code:'6300', name:'Utilities',                 nameFa:'آب، برق و گاز',                type:'EXPENSE',   balance:M(18)   },
  { code:'6400', name:'Marketing & Advertising',   nameFa:'تبلیغات و بازاریابی',          type:'EXPENSE',   balance:M(35)   },
  { code:'6500', name:'Transport & Logistics',     nameFa:'حمل‌ونقل',                    type:'EXPENSE',   balance:M(42)   },
  { code:'6600', name:'Depreciation Expense',      nameFa:'هزینه استهلاک',                type:'EXPENSE',   balance:M(45)   },
  { code:'6700', name:'Bank Charges',              nameFa:'کارمزد بانکی',                 type:'EXPENSE',   balance:M(8)    },
  { code:'6800', name:'Other Expenses',            nameFa:'سایر هزینه‌ها',               type:'EXPENSE',   balance:M(22)   },
];

// ── 2. Journal Entries + Lines ────────────────────────────
// Each entry is balanced (totalDebit == totalCredit)
const ENTRIES = [
  {
    entryNo: 'JE-1403-001', date: D('1403/01/01'),
    description: 'ثبت موجودی اول دوره — Opening Balances',
    ref: 'OB-1403',
    lines: [
      // DEBIT: assets
      { dr: '1100', amt: M(40)   },
      { dr: '1110', amt: M(185)  },
      { dr: '1120', amt: M(42)   },
      { dr: '1200', amt: M(280)  },
      { dr: '1210', amt: M(120)  },
      { dr: '1300', amt: M(95)   },
      { dr: '1310', amt: M(145)  },
      { dr: '1320', amt: M(35)   },
      { dr: '1400', amt: M(28)   },
      { dr: '1500', amt: M(670)  },
      // CREDIT: liabilities + equity
      { cr: '2100', amt: M(320)  },
      { cr: '2110', amt: M(95)   },
      { cr: '2200', amt: M(42)   },
      { cr: '2210', amt: M(38)   },
      { cr: '2300', amt: M(200)  },
      { cr: '2400', amt: M(400)  },
      { cr: '2500', amt: M(45)   },
      { cr: '3100', amt: M(300)  },
      { cr: '3200', amt: M(200)  },
    ],
  },
  {
    entryNo: 'JE-1403-002', date: D('1403/02/10'),
    description: 'فروش کالا نقدی — Cash sale of goods',
    ref: 'SI-1403-001',
    lines: [
      { dr: '1110', amt: M(85)  },   // بانک ملت
      { cr: '4100', amt: M(77)  },   // درآمد فروش (قبل از مالیات)
      { cr: '2200', amt: M(8)   },   // مالیات ارزش افزوده ۹٪
    ],
  },
  {
    entryNo: 'JE-1403-003', date: D('1403/02/15'),
    description: 'خرید مواد اولیه از تأمین‌کننده — Raw material purchase on credit',
    ref: 'PI-1403-001',
    lines: [
      { dr: '1300', amt: M(45)  },   // موجودی مواد اولیه
      { cr: '2100', amt: M(45)  },   // حساب پرداختنی
    ],
  },
  {
    entryNo: 'JE-1403-004', date: D('1403/03/01'),
    description: 'پرداخت حقوق اسفند ماه — Salary payment',
    ref: 'PAY-1403-003',
    lines: [
      { dr: '6100', amt: M(18.5) },  // حقوق
      { dr: '6110', amt: M(2.8)  },  // بیمه
      { cr: '1110', amt: M(21.3) },  // بانک ملت
    ],
  },
  {
    entryNo: 'JE-1403-005', date: D('1403/03/15'),
    description: 'دریافت از مشتری — Customer payment received',
    ref: 'REC-1403-001',
    lines: [
      { dr: '1110', amt: M(120) },   // بانک ملت
      { cr: '1200', amt: M(120) },   // حساب دریافتنی
    ],
  },
  {
    entryNo: 'JE-1403-006', date: D('1403/04/01'),
    description: 'هزینه اجاره سه‌ماهه — Quarterly rent',
    ref: 'EXP-1403-001',
    lines: [
      { dr: '6200', amt: M(18)  },   // اجاره
      { cr: '1110', amt: M(18)  },   // بانک ملت
    ],
  },
  {
    entryNo: 'JE-1403-007', date: D('1403/04/20'),
    description: 'فروش خدمات — Service invoice',
    ref: 'SI-1403-012',
    lines: [
      { dr: '1200', amt: M(65.3) },  // حساب دریافتنی
      { cr: '4200', amt: M(59.4) },  // درآمد خدمات
      { cr: '2200', amt: M(5.9)  },  // مالیات ارزش افزوده
    ],
  },
  {
    entryNo: 'JE-1403-008', date: D('1403/05/01'),
    description: 'هزینه استهلاک فصل — Quarterly depreciation',
    ref: 'DEP-1403-Q2',
    lines: [
      { dr: '6600', amt: M(11.25) }, // هزینه استهلاک
      { cr: '1500', amt: M(11.25) }, // کاهش ارزش دارایی ثابت
    ],
  },
];

// ── 3. Bank Account + Transactions ───────────────────────
const BANK = {
  id: 'bank-mellat-co1',
  companyId: CID,
  bankName: 'بانک ملت',
  accountNo: '4012-888-1234567-1',
  iban: 'IR820120000000004012888001',
  currency: 'IRR',
  balance: M(185 + 85 - 21.3 + 120 - 18),  // = ~M(370.7) after journal ops
};

const BANK_TXS = [
  { type:'credit',  amount:M(350),  description:'واریز سرمایه اولیه — Initial capital deposit',  date:new Date('2024-03-20'), ref:'OB' },
  { type:'credit',  amount:M(85),   description:'دریافت از فروش نقدی SI-1403-001',              date:new Date('2024-05-01'), ref:'SI-1403-001' },
  { type:'debit',   amount:M(21.3), description:'پرداخت حقوق PAY-1403-003',                    date:new Date('2024-05-21'), ref:'PAY-1403-003' },
  { type:'credit',  amount:M(120),  description:'دریافت مشتری REC-1403-001',                   date:new Date('2024-06-04'), ref:'REC-1403-001' },
  { type:'debit',   amount:M(18),   description:'پرداخت اجاره EXP-1403-001',                    date:new Date('2024-06-21'), ref:'EXP-1403-001' },
  { type:'debit',   amount:M(45),   description:'پرداخت به تأمین‌کننده — Supplier payment',    date:new Date('2024-07-05'), ref:'AP-PAY-001' },
  { type:'credit',  amount:M(95),   description:'دریافت وجه قرارداد CNT-002',                   date:new Date('2024-07-18'), ref:'CNT-002' },
  { type:'debit',   amount:M(8),    description:'هزینه حمل‌ونقل محموله',                        date:new Date('2024-07-25'), ref:'TRN-001' },
];

// ═════════════════════════════════════════════════════════
async function main() {
  console.log('🌱 Seeding Chart of Accounts & Financial Data for company', CID, '\n');

  // ── Step 1: Upsert all accounts ───────────────────────
  console.log(`📚 Upserting ${COA.length} accounts...`);
  for (const acc of COA) {
    await prisma.account.upsert({
      where:  { code_companyId: { code: acc.code, companyId: CID } },
      update: { name: acc.name, nameFa: acc.nameFa, type: acc.type as any, balance: acc.balance, isActive: true },
      create: { ...acc, companyId: CID, type: acc.type as any },
    });
  }
  console.log(`  ✅ ${COA.length} accounts upserted`);

  // ── Step 2: Build accountId lookup map ────────────────
  const acctRows = await prisma.account.findMany({ where: { companyId: CID } });
  const acctMap  = new Map(acctRows.map(a => [a.code, a.id]));

  // ── Step 3: Journal entries + lines ──────────────────
  console.log(`📒 Creating ${ENTRIES.length} journal entries...`);
  for (const e of ENTRIES) {
    // Skip if already exists
    const exists = await prisma.journalEntry.findFirst({ where: { entryNo: e.entryNo, companyId: CID } });
    if (exists) { console.log(`  ⏭  ${e.entryNo} already exists`); continue; }

    const totalDebit  = e.lines.filter(l => l.dr).reduce((s, l) => s + l.amt, BigInt(0));
    const totalCredit = e.lines.filter(l => l.cr).reduce((s, l) => s + l.amt, BigInt(0));

    // Verify balance
    if (totalDebit !== totalCredit) {
      console.warn(`  ⚠️  ${e.entryNo} is unbalanced! Dr=${totalDebit} Cr=${totalCredit}`);
    }

    await prisma.journalEntry.create({
      data: {
        entryNo:     e.entryNo,
        date:        e.date,
        ref:         e.ref,
        description: e.description,
        companyId:   CID,
        status:      'POSTED',
        totalDebit,
        totalCredit,
        source:      'COA_SEED',
        createdById: UID,
        postedAt:    new Date(),
        lines: {
          create: e.lines.map(l => ({
            debitAccountId:  l.dr ? (acctMap.get(l.dr) ?? null) : null,
            creditAccountId: l.cr ? (acctMap.get(l.cr) ?? null) : null,
            debit:  l.dr ? l.amt : BigInt(0),
            credit: l.cr ? l.amt : BigInt(0),
          })),
        },
      },
    });
    console.log(`  ✅ ${e.entryNo}: ${e.description}`);
  }

  // ── Step 4: Bank account + transactions ──────────────
  console.log('\n🏦 Setting up bank account...');
  await prisma.bankAccount.upsert({
    where:  { id: BANK.id },
    update: { balance: BANK.balance },
    create: BANK as any,
  });

  const existingTxCount = await prisma.bankTransaction.count({ where: { accountId: BANK.id } });
  if (existingTxCount === 0) {
    let running = BigInt(0);
    for (const tx of BANK_TXS) {
      running = tx.type === 'credit' ? running + tx.amount : running - tx.amount;
      await prisma.bankTransaction.create({
        data: { accountId: BANK.id, type: tx.type, amount: tx.amount, balanceAfter: running, description: tx.description, ref: tx.ref, date: tx.date },
      });
    }
    console.log(`  ✅ ${BANK_TXS.length} bank transactions`);
  } else {
    console.log(`  ⏭  ${existingTxCount} transactions already exist`);
  }

  // ── Summary ───────────────────────────────────────────
  const [assets, liab, eq, rev, exp] = await Promise.all([
    prisma.account.aggregate({ where: { companyId: CID, type: 'ASSET'     }, _sum: { balance: true } }),
    prisma.account.aggregate({ where: { companyId: CID, type: 'LIABILITY' }, _sum: { balance: true } }),
    prisma.account.aggregate({ where: { companyId: CID, type: 'EQUITY'    }, _sum: { balance: true } }),
    prisma.account.aggregate({ where: { companyId: CID, type: 'REVENUE'   }, _sum: { balance: true } }),
    prisma.account.aggregate({ where: { companyId: CID, type: 'EXPENSE'   }, _sum: { balance: true } }),
  ]);

  const fmt = (b: bigint | null) => ((Number(b ?? 0)) / 1_000_000).toFixed(0) + 'M ریال';

  console.log('\n📊 Balance Sheet Check:');
  console.log(`  Assets     : ${fmt(assets._sum.balance)}`);
  console.log(`  Liabilities: ${fmt(liab._sum.balance)}`);
  console.log(`  Equity     : ${fmt(eq._sum.balance)}`);
  const le = (Number(liab._sum.balance ?? 0) + Number(eq._sum.balance ?? 0));
  const a  = Number(assets._sum.balance ?? 0);
  console.log(`  L+E        : ${(le / 1_000_000).toFixed(0)}M ریال`);
  console.log(`  Balanced?  : ${Math.abs(a - le) < 1000 ? '✅ YES' : '❌ NO (diff: ' + Math.abs(a - le) + ')'}`);
  console.log('\n📈 Income Statement:');
  console.log(`  Revenue    : ${fmt(rev._sum.balance)}`);
  console.log(`  Expenses   : ${fmt(exp._sum.balance)}`);
  const profit = Number(rev._sum.balance ?? 0) - Number(exp._sum.balance ?? 0);
  console.log(`  Net Profit : ${(profit / 1_000_000).toFixed(0)}M ریال`);
  console.log('\n🎉 COA seed complete!\n');
}

main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
