'use client';
export const dynamic = 'force-dynamic';
import { TradingModule } from '@/modules/trading';
export default function ContractsPage() {
  return <TradingModule initialView="my-contracts" />;
}
