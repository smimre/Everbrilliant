'use client';
export const dynamic = 'force-dynamic';
import { TradingModule } from '@/modules/trading';
export default function TendersPage() {
  return <TradingModule initialView="tender-browse" />;
}
