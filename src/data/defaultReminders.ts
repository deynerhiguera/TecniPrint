import type { FollowUpReminder } from '@/types';

export const defaultReminders: FollowUpReminder[] = [
  {
    id: 'reminder-1',
    serviceId: 'service-3',
    clientId: 'client-3',
    dueDate: '2026-07-12T00:00:00.000Z',
    status: 'pending',
    createdAt: '2026-06-28T10:15:00.000Z',
  },
  {
    id: 'reminder-2',
    serviceId: 'service-1',
    clientId: 'client-1',
    dueDate: '2026-07-27T00:00:00.000Z',
    status: 'pending',
    createdAt: '2026-07-13T16:20:00.000Z',
  },
  {
    id: 'reminder-3',
    serviceId: 'service-2',
    clientId: 'client-2',
    dueDate: '2026-08-01T00:00:00.000Z',
    status: 'pending',
    createdAt: '2026-07-18T11:00:00.000Z',
  },
  {
    id: 'reminder-4',
    serviceId: 'service-4',
    clientId: 'client-4',
    dueDate: '2026-08-05T00:00:00.000Z',
    status: 'pending',
    createdAt: '2026-07-22T13:45:00.000Z',
  },
  {
    id: 'reminder-5',
    serviceId: 'service-5',
    clientId: 'client-5',
    dueDate: '2026-06-15T00:00:00.000Z',
    status: 'done',
    notes: 'Se llamó al cliente, todo funcionando bien.',
    createdAt: '2026-06-01T17:20:00.000Z',
  },
];
