import { useCollection } from '@/hooks/useCollection';
import type { ServiceRecord } from '@/types';

export function useServices() {
  return useCollection<ServiceRecord>('services');
}
