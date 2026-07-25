import { Users } from 'lucide-react';
import { PlaceholderPage } from '@/components/layout/PlaceholderPage';
import { useClients } from '@/hooks/useClients';

export function ClientsPage() {
  const { items } = useClients();

  return (
    <PlaceholderPage
      icon={<Users className="size-6" />}
      title="Gestión de clientes"
      description={`${items.length} cliente(s) registrado(s). Aquí irá el listado, la ficha de cada cliente y sus máquinas.`}
    />
  );
}
