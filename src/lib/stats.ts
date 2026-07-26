import { isSameMonth } from 'date-fns';
import { parseLocalDate } from '@/lib/format';
import type { ServiceRecord } from '@/types';

export interface MonthlyStats {
  serviceCount: number;
  revenue: number;
}

export function getMonthlyStats(services: ServiceRecord[], reference = new Date()): MonthlyStats {
  const thisMonth = services.filter((service) =>
    isSameMonth(parseLocalDate(service.date), reference),
  );
  const completedThisMonth = thisMonth.filter((service) => service.status === 'completed');
  return {
    serviceCount: thisMonth.length,
    revenue: completedThisMonth.reduce((sum, service) => sum + service.total, 0),
  };
}
