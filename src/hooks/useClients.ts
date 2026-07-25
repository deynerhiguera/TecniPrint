import { useCollection } from '@/hooks/useCollection';
import type { Client } from '@/types';

export function useClients() {
  return useCollection<Client>('clients');
}
