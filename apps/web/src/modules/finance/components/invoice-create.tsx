'use client';
import { useState, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateInvoice } from '@/hooks/use-finance';
import { useLocaleStore } from '@/store/locale.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Alert } from '@/components/ui/alert';
import { ArrowLeft, Plus, Trash2, Calculator } from 'lucide-react';

const VAT_RATE = 9;
const TOL_RATE = 1;

const itemSchema = z.object({
  desc: z.string().min(1),
  qty: z.number().min(0.001),
  unit: z.string().min(1),
  unitPrice: z.number().min(0),
  discountPct: z.number().min(0).max(100).default(0),
  hsCode: z.string().optional(),
});

const schema = z.object({
  invoiceType: z.enum(['type1', 'type2', 'type3']),
  buyerCompanyId: z.number().min(1),
  issuedAt: z.string().min(1),
  dueAt: z.string().optional(),
  note: z.string().optional(),
  items: z.array(itemSchema).min(1),
});

type FormData = z.infer<typeof schema>;

interface InvoiceCreateProps { onBack: () => void; onCreated: (id: string) => void; }

function calcRow(qty: number, unitPrice: number, discountPct: number) {
  const subtotal = qty * unitPrice;
  const discount = subtotal * (discountPct / 100);
  const net = subtotal - discount;
  const vat = Math.round(net * VAT_RATE / 100);
  const tol = Math.round(net * TOL_RATE / 100);
  const total = net + vat + tol;
  return { subtotal, discount, net, vat, tol, total };
}

export function InvoiceCreatePage({ onBack, onCreated }: InvoiceCreateProps) {
  const { lang } = useLocaleStore();
  const { mutateAsync, isPending } = useCreateInvoice();
  const [submitError, setSubmitError] = useState('');

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      invoiceType: 'type1',
      issuedAt: new Date().toLocaleDateString('fa-IR'),
      items: [{ desc: '', qty: 1, unit: 'تن', unitPrice: 0, discountPct: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchedItems = watch('items');

  const totals = useCallback(() => {
    let subtotal = 0, discountTotal = 0, vat = 0, tol = 0;
    (watchedItems || []).forEach(item => {
      const r = calcRow(Number(item.qty) || 0, Number(item.unitPrice) || 0, Number(item.discountPct) || 0);
      subtotal += r.net;
      discountTotal += r.discount;
      vat += r.vat;
      tol += r.tol;
    });
    return { subtotal, discountTotal, vatAmount: vat, tolAmount: tol, taxAmount: vat + tol, total: subtotal + vat + tol };
  }, [watchedItems]);

  const fmt = (n: number) => new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US').format(Math.round(n));

  const onSubmit = async (data: FormData) => {
    try {
      setSubmitError('');
      const t = totals();
      const items = data.items.map((item, i) => {
        const r = calcRow(item.qty, item.unitPrice, item.discountPct || 0);
        return { row: i + 1, desc: item.desc, qty: item.qty, unit: item.unit, unitPrice: item.unitPrice,
          discount: r.discount, netPrice: r.net, subtotalRow: r.net,
          vatPct: VAT_RATE, tolPct: TOL_RATE, taxPct: VAT_RATE + TOL_RATE,
          vatAmount: r.vat, tolAmount: r.tol, taxAmount: r.vat + r.tol, totalRow: r.total,
          hsCode: item.hsCode };
      });
      const result = await mutateAsync({ invoiceType: data.invoiceType, buyerCompanyId: data.buyerCompanyId,
        issuedAt: data.issuedAt, dueAt: data.dueAt, note: data.note, items });
      onCreated(result.id);
    } catch (e: any) {
      setSubmitError(e.message);
    }
  };

  const t = { title: lang === 'fa' ? 'صدور فاکتور جدید' : 'New Invoice',
    addRow: lang === 'fa' ? '+ افزودن ردیف' : '+ Add Row',
    submit: lang === 'fa' ? 'صدور فاکتور' : 'Issue Invoice' };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-3">
        <Button type="button" variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold">🧾 {t.title}</h1>
      </div>

      {submitError && <Alert type="error">{submitError}</Alert>}

      {/* Header Fields */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-5 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Select label={lang === 'fa' ? 'نوع فاکتور' : 'Invoice Type'} {...register('invoiceType')}
          options={[{value:'type1',label:'Type 1 — رسمی'},{value:'type2',label:'Type 2 — ساده'},{value:'type3',label:'Type 3 — صادراتی'}]} />
        <Input label={lang === 'fa' ? 'تاریخ صدور' : 'Issue Date'} {...register('issuedAt')} error={errors.issuedAt?.message} />
        <Input label={lang === 'fa' ? 'تاریخ سررسید' : 'Due Date'} {...register('dueAt')} />
        <Input label={lang === 'fa' ? 'یادداشت' : 'Note'} {...register('note')} />
      </div>

      {/* Items */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] overflow-hidden">
        <div className="px-5 py-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)]">
          <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase">
            <div className="col-span-4">{lang === 'fa' ? 'شرح کالا' : 'Description'}</div>
            <div className="col-span-1">{lang === 'fa' ? 'تعداد' : 'Qty'}</div>
            <div className="col-span-1">{lang === 'fa' ? 'واحد' : 'Unit'}</div>
            <div className="col-span-2">{lang === 'fa' ? 'قیمت واحد' : 'Unit Price'}</div>
            <div className="col-span-1">{lang === 'fa' ? 'تخفیف٪' : 'Disc%'}</div>
            <div className="col-span-2">{lang === 'fa' ? 'مبلغ کل' : 'Total'}</div>
            <div className="col-span-1"></div>
          </div>
        </div>

        <div className="divide-y divide-[hsl(var(--border))]">
          {fields.map((field, i) => {
            const item = watchedItems?.[i];
            const r = item ? calcRow(Number(item.qty)||0, Number(item.unitPrice)||0, Number(item.discountPct)||0) : null;
            return (
              <div key={field.id} className="px-5 py-3 grid grid-cols-12 gap-2 items-center">
                <div className="col-span-4"><Input {...register(`items.${i}.desc`)} placeholder={lang === 'fa' ? 'نام کالا / خدمت' : 'Item name'} /></div>
                <div className="col-span-1"><Input type="number" step="0.001" {...register(`items.${i}.qty`, { valueAsNumber: true })} /></div>
                <div className="col-span-1"><Input {...register(`items.${i}.unit`)} /></div>
                <div className="col-span-2"><Input type="number" {...register(`items.${i}.unitPrice`, { valueAsNumber: true })} /></div>
                <div className="col-span-1"><Input type="number" step="0.01" {...register(`items.${i}.discountPct`, { valueAsNumber: true })} /></div>
                <div className="col-span-2 text-end">
                  <p className="font-bold text-sm tabular-nums">{r ? fmt(r.total) : '0'}</p>
                  <p className="text-xs text-[hsl(var(--warning))]">{r ? `+${fmt(r.vat + r.tol)} ${lang === 'fa' ? 'م.ا.ا' : 'VAT'}` : ''}</p>
                </div>
                <div className="col-span-1 flex justify-end">
                  {fields.length > 1 && (
                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(i)}>
                      <Trash2 className="h-3.5 w-3.5 text-[hsl(var(--destructive))]" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-5 py-3 border-t border-[hsl(var(--border))]">
          <Button type="button" variant="ghost" size="sm" onClick={() => append({ desc:'', qty:1, unit:'تن', unitPrice:0, discountPct:0 })}>
            <Plus className="h-4 w-4" />{t.addRow}
          </Button>
        </div>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-72 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4 space-y-2">
          {[
            { label: lang === 'fa' ? 'جمع کالا' : 'Subtotal', value: totals().subtotal },
            { label: lang === 'fa' ? 'مالیات ارزش افزوده (۹٪)' : 'VAT (9%)', value: totals().vatAmount, color: 'text-[hsl(var(--warning))]' },
            { label: lang === 'fa' ? 'عوارض شهرداری (۱٪)' : 'Municipal Tax (1%)', value: totals().tolAmount, color: 'text-[hsl(var(--warning))]' },
          ].map(row => (
            <div key={row.label} className="flex justify-between text-sm">
              <span className="text-[hsl(var(--muted-foreground))]">{row.label}</span>
              <span className={`tabular-nums ${row.color||''}`}>{fmt(row.value)} ریال</span>
            </div>
          ))}
          <div className="border-t border-[hsl(var(--border))] pt-2 flex justify-between font-bold">
            <span>{lang === 'fa' ? 'مبلغ قابل پرداخت' : 'Total Due'}</span>
            <span className="tabular-nums text-[hsl(var(--primary))]">{fmt(totals().total)} ریال</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onBack}>{lang === 'fa' ? 'انصراف' : 'Cancel'}</Button>
        <Button type="submit" loading={isPending}><Calculator className="h-4 w-4" />{t.submit}</Button>
      </div>
    </form>
  );
}
