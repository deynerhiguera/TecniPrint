import { addDays } from 'date-fns';
import { generateId } from '@/lib/id';
import type { FollowUpReminder, ServiceRecord } from '@/types';

export const FOLLOW_UP_DAYS = 14;

export function buildFollowUpReminder(service: ServiceRecord): FollowUpReminder {
  return {
    id: generateId(),
    serviceId: service.id,
    clientId: service.clientId,
    dueDate: addDays(new Date(service.date), FOLLOW_UP_DAYS).toISOString(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
}
