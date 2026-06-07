// Client-only — dynamically imported via button click handlers

async function htmlToPDF(html: string, filename: string): Promise<void> {
  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ]);

  const iframe = document.createElement('iframe');
  Object.assign(iframe.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    width: '794px',
    height: '1px',
    opacity: '0',
    pointerEvents: 'none',
    zIndex: '-1',
  });
  document.body.appendChild(iframe);

  try {
    await new Promise<void>((resolve) => {
      iframe.onload = () => resolve();
      const doc = iframe.contentDocument!;
      doc.open();
      doc.write(html);
      doc.close();
      if (doc.readyState === 'complete') resolve();
    });

    // Wait for external fonts (Google Fonts CDN)
    await new Promise(r => setTimeout(r, 2000));

    const body = iframe.contentDocument!.body;
    const scrollH = Math.max(body.scrollHeight, 1);
    iframe.style.height = scrollH + 'px';

    const canvas = await html2canvas(body, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      windowWidth: 794,
      width: 794,
      height: scrollH,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgH = (canvas.height / canvas.width) * pdfW;

    let heightLeft = imgH;
    let yOffset = 0;

    pdf.addImage(imgData, 'JPEG', 0, yOffset, pdfW, imgH);
    heightLeft -= pageH;

    while (heightLeft > 0) {
      yOffset -= pageH;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, yOffset, pdfW, imgH);
      heightLeft -= pageH;
    }

    pdf.save(filename);
  } finally {
    document.body.removeChild(iframe);
  }
}

// ── Balance Sheet ─────────────────────────────────────────────

interface BSData {
  assets: Array<{ code: string; name: string; nameFa: string; balance: string }>;
  liabilities: Array<{ code: string; name: string; nameFa: string; balance: string }>;
  equity: Array<{ code: string; name: string; nameFa: string; balance: string }>;
  totalAssets: string;
  totalLiabilities: string;
  totalEquity: string;
  isBalanced: boolean;
}

function generateBalanceSheetHTML(d: BSData, fa: boolean): string {
  const n = (v: string | number) => Number(v).toLocaleString(fa ? 'fa-IR' : 'en-US');
  const dir = fa ? 'rtl' : 'ltr';
  const date = new Date().toLocaleDateString(fa ? 'fa-IR' : 'en-US');

  const rows = (items: BSData['assets']) =>
    items.map(i => `<tr>
      <td style="color:#94a3b8;font-family:monospace;font-size:10px;width:50px;padding:7px 14px">${i.code}</td>
      <td style="color:#475569;padding:7px 14px">${fa ? i.nameFa : i.name}</td>
      <td style="text-align:${fa ? 'left' : 'right'};font-weight:600;direction:ltr;padding:7px 14px">${n(i.balance)}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html dir="${dir}" lang="${fa ? 'fa' : 'en'}">
<head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700;900&display=swap" rel="stylesheet">
<title>${fa ? 'ترازنامه' : 'Balance Sheet'}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Vazirmatn',Arial,sans-serif;background:#fff;color:#1e293b;font-size:12px;direction:${dir};padding:28px}
.header{text-align:center;margin-bottom:20px;border-bottom:2px solid #1e293b;padding-bottom:14px}
.title{font-size:22px;font-weight:900;margin-bottom:4px}
.subtitle{font-size:11px;color:#64748b}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:18px}
.section{border:1px solid #e2e8f0;border-radius:8px;overflow:hidden}
.sec-hdr{padding:9px 14px;font-weight:700;font-size:10px;text-transform:uppercase}
table{width:100%;border-collapse:collapse}
tr.tot td{font-weight:700;background:#f8fafc;border-top:2px solid #e2e8f0;padding:7px 14px}
.grand{background:#eff6ff;border-radius:8px;padding:14px 18px;margin-top:14px}
.grand .row{display:flex;justify-content:space-between;margin:4px 0;font-size:13px;font-weight:700}
.badge{background:#dcfce7;border:1px solid #86efac;border-radius:6px;padding:9px;text-align:center;font-weight:700;color:#15803d;margin-bottom:14px;font-size:11px}
.badge.bad{background:#fee2e2;border-color:#fca5a5;color:#dc2626}
@media print{@page{margin:10mm}}
</style></head>
<body>
<div class="header">
  <div class="title">📊 ${fa ? 'ترازنامه' : 'Balance Sheet'}</div>
  <div class="subtitle">${fa ? `تاریخ: ${date}` : `As of ${date}`}</div>
</div>
<div class="badge${d.isBalanced ? '' : ' bad'}">
  ${d.isBalanced ? '✅' : '❌'} ${d.isBalanced
    ? (fa ? 'ترازنامه متعادل — دارایی‌ها = بدهی‌ها + حقوق صاحبان سهام' : 'Balanced — Assets = Liabilities + Equity')
    : (fa ? 'ترازنامه متعادل نیست!' : 'Balance sheet is NOT balanced!')}
</div>
<div class="grid">
  <div class="section">
    <div class="sec-hdr" style="background:#eff6ff;color:#1d4ed8">🏛️ ${fa ? 'دارایی‌ها' : 'Assets'}</div>
    <table><tbody>${rows(d.assets)}</tbody>
      <tr class="tot"><td></td><td>${fa ? 'جمع دارایی‌ها' : 'Total Assets'}</td><td style="color:#1d4ed8;direction:ltr;text-align:${fa?'left':'right'}">${n(d.totalAssets)}</td></tr>
    </table>
  </div>
  <div style="display:flex;flex-direction:column;gap:14px">
    <div class="section">
      <div class="sec-hdr" style="background:#fef2f2;color:#dc2626">📤 ${fa ? 'بدهی‌ها' : 'Liabilities'}</div>
      <table><tbody>${rows(d.liabilities)}</tbody>
        <tr class="tot"><td></td><td>${fa ? 'جمع بدهی‌ها' : 'Total Liabilities'}</td><td style="color:#dc2626;direction:ltr;text-align:${fa?'left':'right'}">${n(d.totalLiabilities)}</td></tr>
      </table>
    </div>
    <div class="section">
      <div class="sec-hdr" style="background:#f5f3ff;color:#7c3aed">⚖️ ${fa ? 'حقوق صاحبان سهام' : 'Equity'}</div>
      <table><tbody>${rows(d.equity)}</tbody>
        <tr class="tot"><td></td><td>${fa ? 'جمع حقوق' : 'Total Equity'}</td><td style="color:#7c3aed;direction:ltr;text-align:${fa?'left':'right'}">${n(d.totalEquity)}</td></tr>
      </table>
    </div>
  </div>
</div>
<div class="grand">
  <div class="row"><span>🏛️ ${fa ? 'جمع دارایی‌ها' : 'Total Assets'}</span><span style="color:#1d4ed8;direction:ltr">${n(d.totalAssets)}</span></div>
  <div class="row"><span>📤+⚖️ ${fa ? 'جمع بدهی + حقوق' : 'Total Liabilities + Equity'}</span><span style="color:#7c3aed;direction:ltr">${n(Number(d.totalLiabilities) + Number(d.totalEquity))}</span></div>
</div>
</body></html>`;
}

// ── Income Statement ──────────────────────────────────────────

interface ISData {
  revenue: Array<{ code: string; name: string; nameFa: string; amount: string }>;
  expenses: Array<{ code: string; name: string; nameFa: string; amount: string }>;
  totalRev: number;
  totalExp: number;
  grossProfit: number;
  tax: number;
  netProfit: number;
  from: string;
  to: string;
}

function generateIncomeStatementHTML(d: ISData, fa: boolean): string {
  const n = (v: number) => v.toLocaleString(fa ? 'fa-IR' : 'en-US');
  const dir = fa ? 'rtl' : 'ltr';

  const revRows = d.revenue.map(r => `<tr>
    <td style="color:#94a3b8;font-family:monospace;font-size:10px;width:50px;padding:7px 14px">${r.code}</td>
    <td style="color:#475569;padding:7px 14px">${fa ? r.nameFa : r.name}</td>
    <td style="text-align:${fa?'left':'right'};font-weight:600;direction:ltr;padding:7px 14px">${n(Number(r.amount))}</td>
  </tr>`).join('');

  const expRows = d.expenses.map(e => `<tr>
    <td style="color:#94a3b8;font-family:monospace;font-size:10px;width:50px;padding:7px 14px">${e.code}</td>
    <td style="color:#475569;padding:7px 14px">${fa ? e.nameFa : e.name}</td>
    <td style="text-align:${fa?'left':'right'};font-weight:600;direction:ltr;padding:7px 14px">(${n(Number(e.amount))})</td>
  </tr>`).join('');

  const profColor = (v: number) => v >= 0 ? '#15803d' : '#dc2626';
  const profBg = (v: number) => v >= 0 ? '#dcfce7' : '#fee2e2';

  return `<!DOCTYPE html>
<html dir="${dir}" lang="${fa ? 'fa' : 'en'}">
<head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700;900&display=swap" rel="stylesheet">
<title>${fa ? 'صورت سود و زیان' : 'Income Statement'}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Vazirmatn',Arial,sans-serif;background:#fff;color:#1e293b;font-size:12px;direction:${dir};padding:28px}
.header{text-align:center;margin-bottom:20px;border-bottom:2px solid #1e293b;padding-bottom:14px}
.title{font-size:22px;font-weight:900;margin-bottom:4px}
.subtitle{font-size:11px;color:#64748b}
.wrap{border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:18px}
.sec-hdr{padding:8px 14px;font-weight:700;font-size:10px;text-transform:uppercase}
table{width:100%;border-collapse:collapse}
tr+tr td{border-top:1px solid #f1f5f9}
tr.tot td{font-weight:700;background:#f8fafc;border-top:2px solid #e2e8f0;padding:7px 14px}
tr.prow td{font-weight:900;font-size:13px;padding:9px 14px}
.cards{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-top:16px}
.card{border-radius:8px;padding:14px;text-align:center;border:1px solid #e2e8f0}
.card .val{font-size:16px;font-weight:900;margin-top:4px}
.card .lbl{font-size:10px;color:#64748b;margin-top:4px}
@media print{@page{margin:10mm}}
</style></head>
<body>
<div class="header">
  <div class="title">📈 ${fa ? 'صورت سود و زیان' : 'Income Statement'}</div>
  <div class="subtitle">${fa ? `دوره: ${d.from} تا ${d.to}` : `Period: ${d.from} to ${d.to}`}</div>
</div>
<div class="wrap">
  <div class="sec-hdr" style="background:#dcfce7;color:#15803d">📈 ${fa ? 'درآمدها' : 'Revenue'}</div>
  <table><tbody>${revRows}</tbody>
    <tr class="tot"><td></td><td>${fa ? 'جمع درآمدها' : 'Total Revenue'}</td><td style="color:#15803d;direction:ltr;text-align:${fa?'left':'right'}">${n(d.totalRev)}</td></tr>
    <tr style="background:#fee2e2"><td colspan="3"><div style="padding:6px 14px;font-weight:700;font-size:10px;text-transform:uppercase;color:#dc2626">📉 ${fa ? 'هزینه‌ها' : 'Expenses'}</div></td></tr>
    ${expRows.replace(/<tr>/g, '<tr>')}
    <tr class="tot"><td></td><td>${fa ? 'جمع هزینه‌ها' : 'Total Expenses'}</td><td style="direction:ltr;text-align:${fa?'left':'right'}">(${n(d.totalExp)})</td></tr>
    <tr class="prow" style="background:${profBg(d.grossProfit)};color:${profColor(d.grossProfit)}">
      <td></td><td>📊 ${fa ? 'سود ناخالص' : 'Gross Profit'}</td>
      <td style="direction:ltr;text-align:${fa?'left':'right'}">${n(d.grossProfit)}</td>
    </tr>
    <tr><td style="padding:7px 14px;color:#94a3b8;font-size:10px"></td>
      <td style="padding:7px 14px;color:#475569">${fa ? 'مالیات (۲۵٪)' : 'Income Tax (25%)'}</td>
      <td style="padding:7px 14px;direction:ltr;text-align:${fa?'left':'right'};font-weight:600">(${n(d.tax)})</td></tr>
    <tr class="prow" style="background:${profBg(d.netProfit)};color:${profColor(d.netProfit)}">
      <td></td><td>🏆 ${fa ? 'سود/زیان خالص' : 'Net Profit / Loss'}</td>
      <td style="direction:ltr;text-align:${fa?'left':'right'}">${n(d.netProfit)}</td>
    </tr>
  </table>
</div>
<div class="cards">
  <div class="card" style="background:#dcfce7;border-color:#86efac">
    <div class="val" style="color:#15803d">${n(d.totalRev)}</div>
    <div class="lbl">📈 ${fa ? 'کل درآمد' : 'Total Revenue'}</div>
  </div>
  <div class="card" style="background:#eff6ff;border-color:#bfdbfe">
    <div class="val" style="color:#1d4ed8">${n(d.grossProfit)}</div>
    <div class="lbl">📊 ${fa ? 'سود ناخالص' : 'Gross Profit'}</div>
  </div>
  <div class="card" style="background:${profBg(d.netProfit)};border-color:${d.netProfit>=0?'#86efac':'#fca5a5'}">
    <div class="val" style="color:${profColor(d.netProfit)}">${n(d.netProfit)}</div>
    <div class="lbl">🏆 ${fa ? 'سود خالص' : 'Net Profit'}</div>
  </div>
</div>
</body></html>`;
}

// ── Contract ──────────────────────────────────────────────────

function generateContractHTML(c: any, fa: boolean): string {
  const dir = fa ? 'rtl' : 'ltr';
  const STATUS: Record<string, { label: string; labelFa: string; color: string }> = {
    DRAFT:         { label: 'Draft',         labelFa: 'پیش‌نویس',    color: '#f59e0b' },
    UNDER_REVIEW:  { label: 'Under Review',  labelFa: 'در بررسی',    color: '#8b5cf6' },
    READY_TO_SIGN: { label: 'Needs Signing', labelFa: 'نیاز به امضا', color: '#ef4444' },
    ACTIVE:        { label: 'Active',        labelFa: 'فعال',          color: '#3b82f6' },
    COMPLETED:     { label: 'Completed',     labelFa: 'تکمیل شده',   color: '#10b981' },
    EXPIRED:       { label: 'Expired',       labelFa: 'منقضی شده',   color: '#94a3b8' },
    CANCELLED:     { label: 'Cancelled',     labelFa: 'لغو شده',     color: '#ef4444' },
  };
  const st = (c.status || '').toUpperCase();
  const info = STATUS[st] || STATUS.DRAFT;
  const fmtD = (iso: string) => {
    try { return new Date(iso).toLocaleDateString(fa ? 'fa-IR' : 'en-US'); } catch { return iso || '—'; }
  };
  const date = new Date().toLocaleDateString(fa ? 'fa-IR' : 'en-US');
  const amtFmt = c.amountIRR
    ? `${Number(c.amountIRR).toLocaleString(fa ? 'fa-IR' : 'en-US')} ${c.currency || 'IRR'}`
    : null;

  const detailRow = (k: string, v: string | null) =>
    v ? `<div style="display:flex;justify-content:space-between;padding:9px 16px;border-top:1px solid #f1f5f9;font-size:11px">
      <span style="color:#64748b">${k}</span><span style="font-weight:600">${v}</span>
    </div>` : '';

  const sigBox = (role: string, signed: boolean, at: string | null, isSignedLabel: string, pendingLabel: string) => `
    <div style="border:1px solid ${signed ? '#86efac' : '#fde68a'};background:${signed ? '#dcfce7' : '#fefce8'};border-radius:8px;padding:16px;text-align:center">
      <div style="font-weight:700;margin-bottom:12px">${role}</div>
      <div style="height:48px;border-bottom:1px solid #94a3b8;margin-bottom:10px"></div>
      <div style="font-size:11px;color:${signed ? '#15803d' : '#b45309'}">
        ${signed ? `✅ ${isSignedLabel}${at ? ' — ' + fmtD(at) : ''}` : `⏳ ${pendingLabel}`}
      </div>
    </div>`;

  return `<!DOCTYPE html>
<html dir="${dir}" lang="${fa ? 'fa' : 'en'}">
<head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700;900&display=swap" rel="stylesheet">
<title>${fa ? 'قرارداد تجاری' : 'Trade Contract'} — ${c.title || ''}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Vazirmatn',Arial,sans-serif;background:#fff;color:#1e293b;font-size:12px;direction:${dir};padding:28px}
.hdr{border:2px solid #1e293b;border-radius:8px;padding:18px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center}
.sec{border:1px solid #e2e8f0;border-radius:8px;margin-bottom:16px;overflow:hidden}
.sec-t{padding:10px 16px;font-weight:700;font-size:10px;text-transform:uppercase;background:#f8fafc;color:#64748b}
.sig-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:18px}
@media print{@page{margin:10mm}}
</style></head>
<body>
<div class="hdr">
  <div>
    <div style="font-size:18px;font-weight:900">📄 ${fa ? 'قرارداد تجاری' : 'Trade Contract'}</div>
    <div style="font-size:14px;font-weight:700;margin-top:6px">${c.title || (fa ? 'بدون عنوان' : 'Untitled')}</div>
  </div>
  <div style="text-align:${fa ? 'left' : 'right'}">
    <div style="font-size:10px;color:#94a3b8;margin-bottom:4px">${fa ? 'وضعیت' : 'Status'}</div>
    <div style="display:inline-block;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;background:${info.color}20;color:${info.color}">
      ${fa ? info.labelFa : info.label}
    </div>
    <div style="font-size:10px;color:#94a3b8;margin-top:8px">${fa ? 'تاریخ چاپ' : 'Print Date'}: ${date}</div>
  </div>
</div>

<div class="sec">
  <div class="sec-t">📋 ${fa ? 'مشخصات قرارداد' : 'Contract Details'}</div>
  ${detailRow(fa ? 'ارزش قرارداد' : 'Contract Value', amtFmt)}
  ${detailRow(fa ? 'ارز' : 'Currency', c.currency || null)}
  ${detailRow(fa ? 'شرایط پرداخت' : 'Payment Terms', c.terms || null)}
  ${detailRow(fa ? 'تاریخ تحویل' : 'Delivery Date', c.deliveryDate ? fmtD(c.deliveryDate) : null)}
  ${detailRow(fa ? 'تاریخ ایجاد' : 'Created', c.createdAt ? fmtD(c.createdAt) : null)}
</div>

<div class="sig-grid">
  ${sigBox(fa ? '🏢 خریدار' : '🏢 Buyer', c.signedBuyer, c.signedBuyerAt, fa ? 'امضا شده' : 'Signed', fa ? 'در انتظار امضا' : 'Pending Signature')}
  ${sigBox(fa ? '🏭 فروشنده' : '🏭 Seller', c.signedSeller, c.signedSellerAt, fa ? 'امضا شده' : 'Signed', fa ? 'در انتظار امضا' : 'Pending Signature')}
</div>

<div style="margin-top:24px;padding:10px 16px;background:#f8fafc;border-radius:8px;font-size:10px;color:#94a3b8;text-align:center">
  ${fa ? 'این سند به صورت الکترونیکی صادر شده است | EverBrilliant Trade Platform' : 'Generated electronically | EverBrilliant Trade Platform'}
</div>
</body></html>`;
}

// ── Public exports ────────────────────────────────────────────

export async function exportInvoicePDF(html: string, invoiceNo: string): Promise<void> {
  await htmlToPDF(html, `invoice-${invoiceNo}.pdf`);
}

export async function exportBalanceSheetPDF(data: BSData, fa: boolean): Promise<void> {
  await htmlToPDF(generateBalanceSheetHTML(data, fa), `balance-sheet-${Date.now()}.pdf`);
}

export async function exportIncomeStatementPDF(data: ISData, fa: boolean): Promise<void> {
  await htmlToPDF(generateIncomeStatementHTML(data, fa), `income-statement-${Date.now()}.pdf`);
}

export async function exportContractPDF(contract: any, fa: boolean): Promise<void> {
  const title = (contract.title || 'contract').replace(/\s+/g, '-').toLowerCase();
  await htmlToPDF(generateContractHTML(contract, fa), `contract-${title}-${Date.now()}.pdf`);
}
