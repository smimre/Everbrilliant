'use client';
export const dynamic = 'force-dynamic';
import { TradingModule } from '@/modules/trading';
export default function InboxPage() {
  return <TradingModule initialView="incoming-req" />;
}
