'use client';
export const dynamic = 'force-dynamic';
import { TradingModule } from '@/modules/trading';
export default function ReportsPage() {
  return <TradingModule initialView="reports" />;
}
