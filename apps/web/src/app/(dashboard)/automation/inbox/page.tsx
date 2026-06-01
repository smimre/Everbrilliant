'use client';
export const dynamic = 'force-dynamic';
import { AutomationModule } from '@/modules/automation';
export default function AutoInboxPage() {
  return <AutomationModule initialView="letters" initialLetterFilter="incoming" />;
}
