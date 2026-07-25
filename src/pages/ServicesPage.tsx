import { Wrench } from 'lucide-react';
import { PlaceholderPage } from '@/components/layout/PlaceholderPage';
import { useServices } from '@/hooks/useServices';

export function ServicesPage() {
  const { items } = useServices();

  return (
    <PlaceholderPage
      icon={<Wrench className="size-6" />}
      title="Historial de servicios"
      description={`${items.length} servicio(s) registrado(s). Aquí irá el registro de tipo, descripción, códigos de error, repuestos y costos.`}
    />
  );
}
