'use client';
export const dynamic = 'force-dynamic';
import { AutomationModule } from '@/modules/automation';
export default function TasksPage() {
  return <AutomationModule initialView="tasks" />;
}
