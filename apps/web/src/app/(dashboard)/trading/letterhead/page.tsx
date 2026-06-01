'use client';
export const dynamic = 'force-dynamic';
import { TradingModule } from '@/modules/trading';
export default function Page() { return <TradingModule initialView="letterhead" />; }
