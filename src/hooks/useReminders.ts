import { useCollection } from '@/hooks/useCollection';
import { defaultReminders } from '@/data/defaultReminders';
import type { FollowUpReminder } from '@/types';

export function useReminders() {
  return useCollection<FollowUpReminder>('reminders', defaultReminders);
}
