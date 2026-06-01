'use client';
export const dynamic = 'force-dynamic';
import { ManufacturingModule } from '@/modules/manufacturing';
export default function Page() { return <ManufacturingModule initialView="work-orders" />; }
