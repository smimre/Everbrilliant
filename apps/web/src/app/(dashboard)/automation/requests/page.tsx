'use client';
export const dynamic = 'force-dynamic';
import { AutomationModule } from '@/modules/automation';
export default function AutoRequestsPage() {
  return <AutomationModule initialView="requests" />;
}
