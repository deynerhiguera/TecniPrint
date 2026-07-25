import { useCollection } from '@/hooks/useCollection';
import { defaultClients } from '@/data/defaultClients';
import type { Client } from '@/types';

export function useClients() {
  return useCollection<Client>('clients', defaultClients);
}
