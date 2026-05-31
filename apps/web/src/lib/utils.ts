import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number, locale = 'fa-IR'): string {
  return new Intl.NumberFormat(locale).format(n);
}

export function formatCurrency(amount: number, currency = 'IRR', locale = 'fa-IR'): string {
  return formatNumber(amount, locale) + ' ' + (currency === 'IRR' ? 'ریال' : currency);
}
