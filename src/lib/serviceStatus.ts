import type { ServiceStatus } from '@/types';

export const SERVICE_STATUS_OPTIONS: Array<{ value: ServiceStatus; label: string }> = [
  { value: 'scheduled', label: 'Pendiente' },
  { value: 'in_progress', label: 'En proceso' },
  { value: 'completed', label: 'Completado' },
];

export const SERVICE_STATUS_LABEL: Record<ServiceStatus, string> = {
  scheduled: 'Pendiente',
  in_progress: 'En proceso',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

export const SERVICE_STATUS_TONE: Record<
  ServiceStatus,
  'neutral' | 'accent' | 'success' | 'warning' | 'danger'
> = {
  scheduled: 'warning',
  in_progress: 'accent',
  completed: 'success',
  cancelled: 'danger',
};
