import { Tags } from 'lucide-react';
import { PlaceholderPage } from '@/components/layout/PlaceholderPage';
import { useCatalog } from '@/hooks/useCatalog';

export function CatalogPage() {
  const { items } = useCatalog();

  return (
    <PlaceholderPage
      icon={<Tags className="size-6" />}
      title="Catálogo de precios"
      description={`${items.length} tipo(s) de servicio en el catálogo. Aquí se podrán editar los precios base de cada servicio.`}
    />
  );
}
