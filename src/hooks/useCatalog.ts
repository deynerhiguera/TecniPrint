import { useCollection } from '@/hooks/useCollection';
import { defaultCatalog } from '@/data/defaultCatalog';
import type { PriceCatalogItem } from '@/types';

export function useCatalog() {
  return useCollection<PriceCatalogItem>('catalog', defaultCatalog);
}
