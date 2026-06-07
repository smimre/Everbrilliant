import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;

  constructor(private config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(this.config.get('SMTP_PORT') || 587),
        secure: Number(this.config.get('SMTP_PORT') || 587) === 465,
        auth: { user, pass },
      });
      this.logger.log(`Email service ready — SMTP: ${host}`);
    } else {
      this.logger.warn('SMTP_HOST/SMTP_USER/SMTP_PASS not set — emails disabled (logged to console)');
    }
  }

  private get from(): string {
    const user = this.config.get<string>('SMTP_USER') || 'noreply@everbrilliant.com';
    const name = this.config.get<string>('SMTP_FROM_NAME') || 'EverBrilliant';
    return `"${name}" <${user}>`;
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (!to || !to.includes('@')) {
      this.logger.debug(`Skipping email — no valid address: "${to}"`);
      return;
    }

    if (!this.transporter) {
      this.logger.log(`[EMAIL STUB] To: ${to} | Subject: ${subject}`);
      return;
    }

    try {
      await this.transporter.sendMail({ from: this.from, to, subject, html });
      this.logger.log(`Email sent → ${to}: ${subject}`);
    } catch (err: any) {
      this.logger.error(`Failed to send email to ${to}: ${err.message}`);
    }
  }

  // ── Templates ────────────────────────────────────────────────

  private baseLayout(content: string, dir: 'rtl' | 'ltr' = 'ltr'): string {
    return `<!DOCTYPE html>
<html dir="${dir}" lang="${dir === 'rtl' ? 'fa' : 'en'}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Vazirmatn',Arial,sans-serif;background:#f1f5f9;color:#1e293b;font-size:14px;line-height:1.6}
  .wrap{max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
  .header{background:linear-gradient(135deg,#1e293b 0%,#334155 100%);padding:28px 32px;text-align:center}
  .logo{font-size:24px;font-weight:700;color:#fff;letter-spacing:-.5px}
  .tagline{font-size:11px;color:#94a3b8;margin-top:4px;letter-spacing:1px;text-transform:uppercase}
  .body{padding:32px}
  .footer{background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 32px;text-align:center;font-size:11px;color:#94a3b8}
  .btn{display:inline-block;padding:12px 28px;background:#3b82f6;color:#fff !important;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;margin:16px 0}
  .info-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:16px 0}
  .info-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f1f5f9;font-size:13px}
  .info-row:last-child{border-bottom:none}
  .key{color:#64748b}.val{font-weight:600;direction:ltr}
  .tag{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700}
  h2{font-size:20px;font-weight:700;margin-bottom:8px}
  p{margin:8px 0;color:#475569}
  .amount{font-size:22px;font-weight:900;color:#1e293b}
  .green{color:#10b981}.blue{color:#3b82f6}.amber{color:#f59e0b}
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="logo">🌟 EverBrilliant</div>
    <div class="tagline">International Trade Platform</div>
  </div>
  <div class="body">${content}</div>
  <div class="footer">
    © ${new Date().getFullYear()} EverBrilliant — Empowering Global Trade<br>
    <span style="color:#cbd5e1">This is an automated message. Please do not reply directly.</span>
  </div>
</div>
</body>
</html>`;
  }

  // ── Welcome Email ─────────────────────────────────────────────

  async sendWelcomeEmail(user: {
    name: string;
    email: string | null;
    phone: string;
  }, company: { name: string; country?: string | null }): Promise<void> {
    if (!user.email) return;

    const fa = company.country === 'IR' || company.country === 'Iran';
    const dir = fa ? 'rtl' : 'ltr';

    const content = fa
      ? `<h2>🎉 خوش آمدید، ${user.name}!</h2>
         <p>حساب کاربری شما در پلتفرم تجاری EverBrilliant با موفقیت ایجاد شد.</p>
         <div class="info-box">
           <div class="info-row"><span class="key">شرکت</span><span class="val">${company.name}</span></div>
           <div class="info-row"><span class="key">شماره موبایل</span><span class="val">${user.phone}</span></div>
           <div class="info-row"><span class="key">ایمیل</span><span class="val">${user.email}</span></div>
         </div>
         <p>با EverBrilliant می‌توانید فاکتورهای مالیاتی رسمی، قراردادهای تجاری، و مدیریت تجارت بین‌الملل را به سادگی انجام دهید.</p>
         <a class="btn" href="${this.config.get('WEB_URL') || 'https://app.everbrilliant.com'}/dashboard">ورود به داشبورد</a>
         <p style="font-size:12px;color:#94a3b8;margin-top:16px">اگر این حساب توسط شما ایجاد نشده است، این ایمیل را نادیده بگیرید.</p>`
      : `<h2>🎉 Welcome aboard, ${user.name}!</h2>
         <p>Your account on EverBrilliant has been successfully created.</p>
         <div class="info-box">
           <div class="info-row"><span class="key">Company</span><span class="val">${company.name}</span></div>
           <div class="info-row"><span class="key">Phone</span><span class="val">${user.phone}</span></div>
           <div class="info-row"><span class="key">Email</span><span class="val">${user.email}</span></div>
         </div>
         <p>EverBrilliant is your all-in-one platform for international trade — VAT invoices, trade contracts, supplier connections, and more.</p>
         <a class="btn" href="${this.config.get('WEB_URL') || 'https://app.everbrilliant.com'}/dashboard">Go to Dashboard</a>
         <p style="font-size:12px;color:#94a3b8;margin-top:16px">If you did not create this account, you can safely ignore this email.</p>`;

    const subject = fa ? 'خوش آمدید به EverBrilliant' : 'Welcome to EverBrilliant';
    await this.send(user.email, subject, this.baseLayout(content, dir));
  }

  // ── Password Reset Email ──────────────────────────────────────

  async sendPasswordResetEmail(user: {
    name: string;
    email: string | null;
    phone: string;
  }, code: string, fa = false): Promise<void> {
    if (!user.email) {
      // Log to console as fallback (SMS would go here)
      this.logger.log(`[PASSWORD RESET] Code for ${user.phone}: ${code}`);
      return;
    }

    const dir: 'rtl' | 'ltr' = fa ? 'rtl' : 'ltr';

    const content = fa
      ? `<h2>🔐 کد بازیابی رمز عبور</h2>
         <p>درخواست تغییر رمز عبور برای حساب <strong>${user.phone}</strong> دریافت شد.</p>
         <div class="info-box" style="text-align:center">
           <div style="font-size:36px;font-weight:900;letter-spacing:8px;color:#1e293b;direction:ltr;font-family:monospace">${code}</div>
           <p style="font-size:12px;color:#94a3b8;margin-top:8px">این کد تا ۱۵ دقیقه معتبر است</p>
         </div>
         <p>اگر این درخواست توسط شما نبوده است، حساب خود را ایمن کنید.</p>`
      : `<h2>🔐 Password Reset Code</h2>
         <p>A password reset was requested for account <strong>${user.phone}</strong>.</p>
         <div class="info-box" style="text-align:center">
           <div style="font-size:36px;font-weight:900;letter-spacing:8px;color:#1e293b;font-family:monospace">${code}</div>
           <p style="font-size:12px;color:#94a3b8;margin-top:8px">Valid for 15 minutes</p>
         </div>
         <p>If you did not request a password reset, please secure your account immediately.</p>`;

    const subject = fa ? 'کد بازیابی رمز عبور EverBrilliant' : 'EverBrilliant — Password Reset Code';
    await this.send(user.email, subject, this.baseLayout(content, dir));
  }

  // ── Invoice Email ─────────────────────────────────────────────

  async sendInvoiceEmail(invoice: {
    id: string;
    total: bigint | number;
    currency: string;
    status: string;
    issuedAt?: string | null;
    dueAt?: string | null;
    sellerCompany?: { name: string } | null;
    buyerCompany?: { name: string; country?: string | null } | null;
    buyerContactEmail?: string | null;
  }): Promise<void> {
    const buyerEmail = invoice.buyerContactEmail;
    if (!buyerEmail) return;

    const fa = invoice.buyerCompany?.country === 'IR';
    const dir: 'rtl' | 'ltr' = fa ? 'rtl' : 'ltr';
    const totalStr = Number(invoice.total).toLocaleString(fa ? 'fa-IR' : 'en-US');
    const sellerName = invoice.sellerCompany?.name || 'EverBrilliant';
    const buyerName = invoice.buyerCompany?.name || '';

    const content = fa
      ? `<h2>🧾 فاکتور جدید از ${sellerName}</h2>
         <p>${buyerName}، یک فاکتور رسمی برای شما صادر شده است.</p>
         <div class="info-box">
           <div class="info-row"><span class="key">شماره فاکتور</span><span class="val">${invoice.id}</span></div>
           <div class="info-row"><span class="key">فروشنده</span><span class="val">${sellerName}</span></div>
           ${invoice.issuedAt ? `<div class="info-row"><span class="key">تاریخ صدور</span><span class="val">${invoice.issuedAt}</span></div>` : ''}
           ${invoice.dueAt ? `<div class="info-row"><span class="key">سررسید</span><span class="val">${invoice.dueAt}</span></div>` : ''}
           <div class="info-row"><span class="key">مبلغ کل</span><span class="val amount">${totalStr} ${invoice.currency}</span></div>
         </div>
         <p>لطفاً به داشبورد خود وارد شوید تا فاکتور را مشاهده و پرداخت کنید.</p>
         <a class="btn" href="${this.config.get('WEB_URL') || 'https://app.everbrilliant.com'}/finance/invoices">مشاهده فاکتور</a>`
      : `<h2>🧾 New Invoice from ${sellerName}</h2>
         <p>Dear ${buyerName}, a new invoice has been issued for you.</p>
         <div class="info-box">
           <div class="info-row"><span class="key">Invoice No.</span><span class="val">${invoice.id}</span></div>
           <div class="info-row"><span class="key">Seller</span><span class="val">${sellerName}</span></div>
           ${invoice.issuedAt ? `<div class="info-row"><span class="key">Issue Date</span><span class="val">${invoice.issuedAt}</span></div>` : ''}
           ${invoice.dueAt ? `<div class="info-row"><span class="key">Due Date</span><span class="val">${invoice.dueAt}</span></div>` : ''}
           <div class="info-row"><span class="key">Total</span><span class="val amount">${totalStr} ${invoice.currency}</span></div>
         </div>
         <p>Please log in to your dashboard to view and pay the invoice.</p>
         <a class="btn" href="${this.config.get('WEB_URL') || 'https://app.everbrilliant.com'}/finance/invoices">View Invoice</a>`;

    const subject = fa
      ? `فاکتور ${invoice.id} از ${sellerName}`
      : `Invoice ${invoice.id} from ${sellerName}`;

    await this.send(buyerEmail, subject, this.baseLayout(content, dir));
  }

  // ── Trade Request Email ───────────────────────────────────────

  async sendTradeRequestEmail(request: {
    id: string;
    product: string;
    qty: number;
    unit: string;
    currency: string;
    deadline?: Date | null;
    note?: string | null;
    buyerCompany?: { name: string; country?: string | null } | null;
    sellerCompany?: {
      name: string;
      country?: string | null;
      users?: Array<{ email: string | null }>;
    } | null;
  }): Promise<void> {
    const sellerEmails = (request.sellerCompany?.users || [])
      .map(u => u.email)
      .filter((e): e is string => !!e && e.includes('@'));

    if (sellerEmails.length === 0) return;

    const fa = request.sellerCompany?.country === 'IR';
    const dir: 'rtl' | 'ltr' = fa ? 'rtl' : 'ltr';
    const buyerName = request.buyerCompany?.name || 'یک خریدار';
    const sellerName = request.sellerCompany?.name || '';
    const deadlineStr = request.deadline
      ? new Date(request.deadline).toLocaleDateString(fa ? 'fa-IR' : 'en-US')
      : null;

    const content = fa
      ? `<h2>📦 درخواست تجاری جدید</h2>
         <p>${sellerName}، یک درخواست خرید از <strong>${buyerName}</strong> برای شما ارسال شده است.</p>
         <div class="info-box">
           <div class="info-row"><span class="key">شناسه درخواست</span><span class="val">${request.id}</span></div>
           <div class="info-row"><span class="key">کالا / خدمات</span><span class="val">${request.product}</span></div>
           <div class="info-row"><span class="key">مقدار</span><span class="val">${request.qty} ${request.unit}</span></div>
           <div class="info-row"><span class="key">ارز</span><span class="val">${request.currency}</span></div>
           ${deadlineStr ? `<div class="info-row"><span class="key">مهلت</span><span class="val">${deadlineStr}</span></div>` : ''}
           ${request.note ? `<div class="info-row"><span class="key">توضیحات</span><span class="val" style="font-size:12px">${request.note}</span></div>` : ''}
         </div>
         <p>برای ارسال قیمت‌پیشنهادی وارد داشبورد خود شوید.</p>
         <a class="btn" href="${this.config.get('WEB_URL') || 'https://app.everbrilliant.com'}/trading">مشاهده درخواست</a>`
      : `<h2>📦 New Trade Request</h2>
         <p>Dear ${sellerName}, you have received a new purchase request from <strong>${buyerName}</strong>.</p>
         <div class="info-box">
           <div class="info-row"><span class="key">Request ID</span><span class="val">${request.id}</span></div>
           <div class="info-row"><span class="key">Product / Service</span><span class="val">${request.product}</span></div>
           <div class="info-row"><span class="key">Quantity</span><span class="val">${request.qty} ${request.unit}</span></div>
           <div class="info-row"><span class="key">Currency</span><span class="val">${request.currency}</span></div>
           ${deadlineStr ? `<div class="info-row"><span class="key">Deadline</span><span class="val">${deadlineStr}</span></div>` : ''}
           ${request.note ? `<div class="info-row"><span class="key">Notes</span><span class="val" style="font-size:12px">${request.note}</span></div>` : ''}
         </div>
         <p>Log in to your dashboard to submit a quote.</p>
         <a class="btn" href="${this.config.get('WEB_URL') || 'https://app.everbrilliant.com'}/trading">View Request</a>`;

    const subject = fa
      ? `درخواست خرید: ${request.product} از ${buyerName}`
      : `Trade Request: ${request.product} from ${buyerName}`;

    for (const email of sellerEmails) {
      await this.send(email, subject, this.baseLayout(content, dir));
    }
  }
}
