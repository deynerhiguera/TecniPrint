import type { PriceCatalogItem } from '@/types';

export const defaultCatalog: PriceCatalogItem[] = [
  { id: 'cat-diagnostico', serviceType: 'Diagnóstico', basePrice: 15000 },
  { id: 'cat-mantenimiento', serviceType: 'Mantenimiento preventivo', basePrice: 40000 },
  { id: 'cat-limpieza', serviceType: 'Limpieza general', basePrice: 25000 },
  { id: 'cat-toner', serviceType: 'Cambio de tóner', basePrice: 20000 },
  { id: 'cat-drum', serviceType: 'Cambio de drum', basePrice: 60000 },
  { id: 'cat-fusor', serviceType: 'Reparación de fusor', basePrice: 80000 },
  { id: 'cat-instalacion', serviceType: 'Instalación', basePrice: 35000 },
  { id: 'cat-otro', serviceType: 'Otro', basePrice: 0 },
];
