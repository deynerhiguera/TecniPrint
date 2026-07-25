import { useCollection } from '@/hooks/useCollection';
import { defaultServices } from '@/data/defaultServices';
import type { ServiceRecord } from '@/types';

export function useServices() {
  return useCollection<ServiceRecord>('services', defaultServices);
}
