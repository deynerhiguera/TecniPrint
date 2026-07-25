import { useCollection } from '@/hooks/useCollection';
import type { FollowUpReminder } from '@/types';

export function useReminders() {
  return useCollection<FollowUpReminder>('reminders');
}
