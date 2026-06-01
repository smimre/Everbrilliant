'use client';
export const dynamic = 'force-dynamic';
import { FinanceModule } from '@/modules/finance';
export default function Page() { return <FinanceModule initialView="coa" />; }
