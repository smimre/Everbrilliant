'use client';
export const dynamic = 'force-dynamic';
import { TradingModule } from '@/modules/trading';
export default function RequestsPage() {
  return <TradingModule initialView="my-requests" />;
}
