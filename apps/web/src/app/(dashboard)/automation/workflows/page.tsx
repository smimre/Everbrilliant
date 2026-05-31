'use client';
export const dynamic = 'force-dynamic';
import { AutomationModule } from '@/modules/automation';
export default function WorkflowsPage() {
  return <AutomationModule initialView="workflows" />;
}
