// ══════════════════════════════════════════════
// EVERBRILLIANT — Database Seed
// ══════════════════════════════════════════════
import { PrismaClient, Plan, Priority, RequestStatus, InvoiceStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Everbrilliant database...\n');

  // ── 1. Permissions ────────────────────────
  console.log('📋 Creating permissions...');
  const permissions = [
    // Trading
    { key: 'req_view',      label: 'View Requests',     labelFa: 'مشاهده درخواست‌ها',    module: 'trading' },
    { key: 'req_create',    label: 'Create Requests',   labelFa: 'ایجاد درخواست',         module: 'trading' },
    { key: 'req_approve',   label: 'Approve Requests',  labelFa: 'تأیید درخواست',          module: 'trading' },
    { key: 'req_delete',    label: 'Delete Requests',   labelFa: 'حذف درخواست',            module: 'trading' },
    { key: 'quote_view',    label: 'View Quotes',       labelFa: 'مشاهده قیمت‌ها',         module: 'trading' },
    { key: 'quote_create',  label: 'Create Quotes',     labelFa: 'ایجاد قیمت',             module: 'trading' },
    { key: 'contract_view', label: 'View Contracts',    labelFa: 'مشاهده قراردادها',       module: 'trading' },
    { key: 'contract_sign', label: 'Sign Contracts',    labelFa: 'امضای قرارداد',          module: 'trading' },
    { key: 'tender_view',   label: 'View Tenders',      labelFa: 'مشاهده مزایده‌ها',       module: 'trading' },
    { key: 'tender_bid',    label: 'Place Bids',        labelFa: 'شرکت در مزایده',         module: 'trading' },
    { key: 'tender_manage', label: 'Manage Tenders',    labelFa: 'مدیریت مزایده',          module: 'trading' },
    { key: 'conn_manage',   label: 'Manage Connections',labelFa: 'مدیریت اتصالات',         module: 'trading' },
    { key: 'crm_view',      label: 'View CRM',          labelFa: 'مشاهده CRM',              module: 'trading' },
    { key: 'crm_manage',    label: 'Manage CRM',        labelFa: 'مدیریت CRM',              module: 'trading' },
    // Finance
    { key: 'invoice_view',  label: 'View Invoices',     labelFa: 'مشاهده فاکتورها',        module: 'finance' },
    { key: 'invoice_create',label: 'Create Invoices',   labelFa: 'صدور فاکتور',             module: 'finance' },
    { key: 'invoice_print', label: 'Print Invoices',    labelFa: 'چاپ فاکتور',              module: 'finance' },
    { key: 'pay_view',      label: 'View Payments',     labelFa: 'مشاهده پرداخت‌ها',       module: 'finance' },
    { key: 'pay_confirm',   label: 'Confirm Payments',  labelFa: 'تأیید پرداخت',           module: 'finance' },
    { key: 'acc_view',      label: 'View Accounting',   labelFa: 'مشاهده حسابداری',        module: 'finance' },
    { key: 'acc_manage',    label: 'Manage Accounting', labelFa: 'مدیریت حسابداری',        module: 'finance' },
    { key: 'hr_view',       label: 'View HR',           labelFa: 'مشاهده پرسنل',           module: 'finance' },
    { key: 'hr_manage',     label: 'Manage HR',         labelFa: 'مدیریت پرسنل',           module: 'finance' },
    { key: 'inv_view',      label: 'View Inventory',    labelFa: 'مشاهده انبار',           module: 'finance' },
    { key: 'inv_manage',    label: 'Manage Inventory',  labelFa: 'مدیریت انبار',           module: 'finance' },
    { key: 'report_view',   label: 'View Reports',      labelFa: 'مشاهده گزارشات',         module: 'finance' },
    { key: 'budget_view',   label: 'View Budget',       labelFa: 'مشاهده بودجه',           module: 'finance' },
    { key: 'budget_manage', label: 'Manage Budget',     labelFa: 'مدیریت بودجه',           module: 'finance' },
    // Automation
    { key: 'letter_view',   label: 'View Letters',      labelFa: 'مشاهده مکاتبات',         module: 'automation' },
    { key: 'letter_create', label: 'Create Letters',    labelFa: 'ایجاد مکاتبه',           module: 'automation' },
    { key: 'wf_view',       label: 'View Workflows',    labelFa: 'مشاهده گردش‌کار',        module: 'automation' },
    { key: 'wf_create',     label: 'Create Workflow',   labelFa: 'ایجاد درخواست',          module: 'automation' },
    { key: 'wf_approve',    label: 'Approve Workflow',  labelFa: 'تأیید درخواست',          module: 'automation' },
    { key: 'meeting_view',  label: 'View Meetings',     labelFa: 'مشاهده جلسات',           module: 'automation' },
    { key: 'meeting_create',label: 'Create Meetings',   labelFa: 'ایجاد جلسه',             module: 'automation' },
    { key: 'task_view',     label: 'View Tasks',        labelFa: 'مشاهده وظایف',           module: 'automation' },
    { key: 'task_manage',   label: 'Manage Tasks',      labelFa: 'مدیریت وظایف',           module: 'automation' },
    // Admin
    { key: 'user_manage',   label: 'Manage Users',      labelFa: 'مدیریت کاربران',         module: 'admin' },
    { key: 'role_manage',   label: 'Manage Roles',      labelFa: 'مدیریت نقش‌ها',          module: 'admin' },
    { key: 'company_manage',label: 'Manage Company',    labelFa: 'مدیریت شرکت',            module: 'admin' },
    { key: 'audit_view',    label: 'View Audit Logs',   labelFa: 'مشاهده لاگ‌ها',          module: 'admin' },
    { key: 'api_manage',    label: 'Manage API Keys',   labelFa: 'مدیریت API',             module: 'admin' },
  ];

  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { key: p.key },
      update: { label: p.label, labelFa: p.labelFa, module: p.module },
      create: p,
    });
  }
  console.log(`  ✅ ${permissions.length} permissions`);

  // ── 2. System Roles ──────────────────────
  console.log('👑 Creating roles...');
  const allPermKeys = permissions.map((p) => p.key);

  const roles = [
    {
      name: 'company_admin',
      label: 'Company Admin',
      labelFa: 'ادمین شرکت',
      isSystem: true,
      isDefault: false,
      perms: allPermKeys,
    },
    {
      name: 'owner',
      label: 'Owner',
      labelFa: 'مدیرعامل',
      isSystem: true,
      perms: allPermKeys,
    },
    {
      name: 'finance',
      label: 'Finance Manager',
      labelFa: 'مدیر مالی',
      isSystem: true,
      perms: ['invoice_view','invoice_create','invoice_print','pay_view','pay_confirm','acc_view','acc_manage','hr_view','report_view','budget_view'],
    },
    {
      name: 'purchase',
      label: 'Buyer',
      labelFa: 'کارشناس خرید',
      isSystem: true,
      perms: ['req_view','req_create','quote_view','contract_view','tender_view','tender_bid','conn_manage','crm_view'],
    },
    {
      name: 'sales',
      label: 'Sales',
      labelFa: 'کارشناس فروش',
      isSystem: true,
      perms: ['req_view','quote_view','quote_create','contract_view','contract_sign','tender_view','crm_view','crm_manage','invoice_view'],
    },
    {
      name: 'logistics_mgr',
      label: 'Logistics Manager',
      labelFa: 'مدیر حمل',
      isSystem: true,
      perms: ['req_view','contract_view','invoice_view','report_view'],
    },
    {
      name: 'viewer',
      label: 'Viewer',
      labelFa: 'ناظر',
      isSystem: true,
      isDefault: true,
      perms: ['req_view','quote_view','contract_view','invoice_view','report_view'],
    },
    {
      name: 'sys_admin',
      label: 'System Admin',
      labelFa: 'ادمین سیستم',
      isSystem: true,
      perms: allPermKeys,
    },
  ];

  const roleMap: Record<string, number> = {};
  for (const r of roles) {
    // upsert with null in composite unique key fails in Prisma 5 — use findFirst instead
    const existing = await prisma.role.findFirst({ where: { name: r.name, companyId: null } });
    const role = existing
      ? await prisma.role.update({ where: { id: existing.id }, data: { label: r.label, labelFa: r.labelFa } })
      : await prisma.role.create({ data: { name: r.name, label: r.label, labelFa: r.labelFa, isSystem: r.isSystem ?? false, isDefault: r.isDefault ?? false } });
    roleMap[r.name] = role.id;

    // Assign permissions
    for (const key of r.perms) {
      const perm = await prisma.permission.findUnique({ where: { key } });
      if (perm) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
          update: {},
          create: { roleId: role.id, permissionId: perm.id },
        });
      }
    }
  }
  console.log(`  ✅ ${roles.length} roles with permissions`);

  // ── 3. Demo Companies ─────────────────────
  console.log('🏢 Creating demo companies...');
  const companies = [
    {
      id: 1,
      name: 'گروه تجاری رضایی',
      legalName: 'شرکت سهامی خاص گروه تجاری رضایی',
      nationalId: '10101234567',
      economicCode: '4113456789012',
      regNo: '12345',
      postalCode: '1234567891',
      address: 'تهران، خیابان ولیعصر، پلاک ۱۲',
      city: 'تهران',
      country: 'Iran',
      plan: Plan.PRO,
      vatRegistered: true,
      vatRate: 10,
    },
    {
      id: 2,
      name: 'شرکت بازرگانی الفا',
      legalName: 'شرکت با مسئولیت محدود بازرگانی الفا',
      nationalId: '10320987654',
      economicCode: '4113987654321',
      regNo: '98765',
      postalCode: '4567890123',
      address: 'اصفهان، خیابان چهارباغ، پلاک ۴۵',
      city: 'اصفهان',
      country: 'Iran',
      plan: Plan.STARTER,
      vatRegistered: true,
      vatRate: 10,
    },
    {
      id: 3,
      name: 'مهر پارس',
      legalName: 'شرکت سهامی خاص مهر پارس',
      nationalId: '10480112233',
      economicCode: '4114112233441',
      regNo: '33441',
      country: 'Iran',
      plan: Plan.FREE,
      vatRegistered: true,
      vatRate: 10,
    },
    {
      id: 4,
      name: 'ارمغان لجستیک',
      legalName: 'شرکت با مسئولیت محدود ارمغان لجستیک',
      nationalId: '10260445566',
      economicCode: '4115445566778',
      regNo: '44556',
      address: 'تهران، جاده مخصوص کرج، کیلومتر ۵',
      country: 'Iran',
      plan: Plan.PRO,
      vatRegistered: true,
      vatRate: 10,
    },
  ];

  for (const co of companies) {
    await prisma.company.upsert({
      where: { id: co.id },
      update: {},
      create: co as any,
    });
  }
  console.log(`  ✅ ${companies.length} companies`);

  // ── 4. Demo Users ─────────────────────────
  console.log('👤 Creating demo users...');
  const hash123 = await bcrypt.hash('Admin@1234', 12);
  const hash456 = await bcrypt.hash('User@5678', 12);

  const users = [
    { id: 1, name: 'احمد رضایی',    phone: '09121111111', password: hash123, companyId: 1, roleId: roleMap['company_admin'], isCompanyAdmin: true, jobTitle: 'مدیرعامل', department: 'مدیریت' },
    { id: 2, name: 'علی کریمی',     phone: '09121111112', password: hash456, companyId: 1, roleId: roleMap['purchase'],      jobTitle: 'کارشناس خرید', department: 'بازرگانی' },
    { id: 3, name: 'فاطمه رضایی',   phone: '09121111113', password: hash456, companyId: 1, roleId: roleMap['finance'],       jobTitle: 'مدیر مالی', department: 'مالی' },
    { id: 4, name: 'حسین موسوی',    phone: '09121111114', password: hash456, companyId: 1, roleId: roleMap['sales'],         jobTitle: 'کارشناس فروش', department: 'فروش' },
    { id: 5, name: 'مریم احمدی',    phone: '09122222221', password: hash123, companyId: 2, roleId: roleMap['company_admin'], isCompanyAdmin: true, jobTitle: 'مدیرعامل', department: 'مدیریت' },
    { id: 6, name: 'رضا محمدی',     phone: '09123333331', password: hash123, companyId: 3, roleId: roleMap['company_admin'], isCompanyAdmin: true, jobTitle: 'مدیرعامل', department: 'مدیریت' },
    { id: 7, name: 'ناصر ارمغان',   phone: '09124444441', password: hash123, companyId: 4, roleId: roleMap['company_admin'], isCompanyAdmin: true, jobTitle: 'مدیرعامل', department: 'مدیریت' },
    { id: 99, name: 'System Admin', phone: '09000000000', password: hash123, companyId: 1, roleId: roleMap['sys_admin'],     isCompanyAdmin: true, jobTitle: 'System Admin', department: 'IT' },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {},
      create: u as any,
    });
  }
  console.log(`  ✅ ${users.length} users`);

  // ── 5. Company Connections ────────────────
  console.log('🔗 Creating connections...');
  const connections = [
    { companyAId: 1, companyBId: 2, type: 'buyer_seller', status: 'active' },
    { companyAId: 1, companyBId: 3, type: 'partner', status: 'active' },
    { companyAId: 1, companyBId: 4, type: 'logistics', status: 'active' },
  ];
  for (const c of connections) {
    await prisma.companyConnection.upsert({
      where: { companyAId_companyBId: { companyAId: c.companyAId, companyBId: c.companyBId } },
      update: {},
      create: c,
    });
  }
  console.log(`  ✅ ${connections.length} connections`);

  // ── 6. Chart of Accounts ──────────────────
  console.log('📚 Creating chart of accounts...');
  const coa = [
    { code: '1000', name: 'Assets',        nameFa: 'دارایی‌ها',          type: 'ASSET',     companyId: 1 },
    { code: '1100', name: 'Cash',           nameFa: 'نقد و بانک',          type: 'ASSET',     companyId: 1 },
    { code: '1200', name: 'Receivables',    nameFa: 'حساب‌های دریافتنی', type: 'ASSET',     companyId: 1 },
    { code: '1300', name: 'Inventory',      nameFa: 'موجودی کالا',         type: 'ASSET',     companyId: 1 },
    { code: '2000', name: 'Liabilities',    nameFa: 'بدهی‌ها',             type: 'LIABILITY', companyId: 1 },
    { code: '2100', name: 'Payables',       nameFa: 'حساب‌های پرداختنی',  type: 'LIABILITY', companyId: 1 },
    { code: '2200', name: 'Tax Payable',    nameFa: 'مالیات پرداختنی',    type: 'LIABILITY', companyId: 1 },
    { code: '3000', name: 'Equity',         nameFa: 'حقوق صاحبان سهام',   type: 'EQUITY',    companyId: 1 },
    { code: '4000', name: 'Revenue',        nameFa: 'درآمد',                type: 'REVENUE',   companyId: 1 },
    { code: '4100', name: 'Sales Revenue',  nameFa: 'درآمد فروش',          type: 'REVENUE',   companyId: 1 },
    { code: '5000', name: 'Expenses',       nameFa: 'هزینه‌ها',            type: 'EXPENSE',   companyId: 1 },
    { code: '5100', name: 'COGS',           nameFa: 'بهای تمام‌شده',       type: 'EXPENSE',   companyId: 1 },
    { code: '5200', name: 'Salaries',       nameFa: 'حقوق و دستمزد',       type: 'EXPENSE',   companyId: 1 },
    { code: '5300', name: 'VAT Expense',    nameFa: 'مالیات ارزش افزوده', type: 'EXPENSE',   companyId: 1 },
  ];

  for (const acc of coa) {
    await prisma.account.upsert({
      where: { code_companyId: { code: acc.code, companyId: acc.companyId } },
      update: {},
      create: acc as any,
    });
  }
  console.log(`  ✅ ${coa.length} accounts`);

  // ── 7. Demo Employees ─────────────────────
  console.log('👥 Creating employees...');
  const employees = [
    { staffCode: 'P-001', name: 'احمد رضایی',  department: 'مدیریت', jobTitle: 'مدیرعامل',      baseSalary: BigInt(50000000), hireDate: '1398/01/01', companyId: 1 },
    { staffCode: 'P-002', name: 'علی کریمی',    department: 'بازرگانی', jobTitle: 'کارشناس خرید', baseSalary: BigInt(25000000), hireDate: '1399/03/15', companyId: 1 },
    { staffCode: 'P-003', name: 'فاطمه رضایی',  department: 'مالی',    jobTitle: 'مدیر مالی',     baseSalary: BigInt(35000000), hireDate: '1399/06/01', companyId: 1 },
    { staffCode: 'P-004', name: 'حسین موسوی',   department: 'فروش',   jobTitle: 'کارشناس فروش',  baseSalary: BigInt(22000000), hireDate: '1400/01/10', companyId: 1 },
  ];

  for (const e of employees) {
    await prisma.employee.upsert({
      where: { staffCode_companyId: { staffCode: e.staffCode, companyId: e.companyId } },
      update: {},
      create: e as any,
    });
  }
  console.log(`  ✅ ${employees.length} employees`);

  // ── 8. Demo Trade Request ─────────────────
  console.log('📋 Creating demo requests...');
  const req = await prisma.tradeRequest.upsert({
    where: { id: 'REQ-001' },
    update: {},
    create: {
      id: 'REQ-001',
      buyerCompanyId: 1,
      sellerCompanyId: 2,
      product: 'روغن پالم RBD — درجه A',
      qty: 20,
      unit: 'تن',
      amountIRR: BigInt(3700000000),
      currency: 'IRR',
      status: RequestStatus.APPROVED,
      priority: Priority.HIGH,
      hsCode: '1511.10.00',
      createdById: 1,
    },
  });

  // Demo invoice
  await prisma.invoice.upsert({
    where: { id: 'TINV-1403-00001' },
    update: {},
    create: {
      id: 'TINV-1403-00001',
      sellerCompanyId: 2,
      buyerCompanyId: 1,
      requestId: 'REQ-001',
      subtotal: BigInt(3700000000),
      discountTotal: BigInt(0),
      vatAmount: BigInt(333000000),
      tolAmount: BigInt(37000000),
      taxAmount: BigInt(370000000),
      total: BigInt(4070000000),
      paid: BigInt(4070000000),
      remaining: BigInt(0),
      status: InvoiceStatus.PAID,
      currency: 'IRR',
      issuedAt: '۱۴۰۳/۰۲/۱۵',
      dueAt: '۱۴۰۳/۰۳/۱۵',
      taxSerial: '14030215-001',
      taxSystemRef: 'TS-ABC123456789',
      items: {
        create: [{
          row: 1,
          desc: 'روغن پالم RBD — درجه A',
          qty: 20,
          unit: 'تن',
          unitPrice: BigInt(185000000),
          discount: BigInt(0),
          netPrice: BigInt(185000000),
          subtotalRow: BigInt(3700000000),
          vatPct: 9,
          tolPct: 1,
          taxPct: 10,
          vatAmount: BigInt(333000000),
          tolAmount: BigInt(37000000),
          taxAmount: BigInt(370000000),
          totalRow: BigInt(4070000000),
          hsCode: '1511.10.00',
        }],
      },
    },
  });
  console.log('  ✅ Demo request + invoice');

  // ── Summary ───────────────────────────────
  console.log('\n══════════════════════════════════════');
  console.log('✅ DATABASE SEEDED SUCCESSFULLY');
  console.log('══════════════════════════════════════');
  console.log('\n🔑 Demo Credentials:');
  console.log('  Admin:    09121111111 / Admin@1234');
  console.log('  User:     09121111112 / User@5678');
  console.log('  Finance:  09121111113 / User@5678');
  console.log('  Sales:    09121111114 / User@5678');
  console.log('  Company2: 09122222221 / Admin@1234');
  console.log('  SysAdmin: 09000000000 / Admin@1234');
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
