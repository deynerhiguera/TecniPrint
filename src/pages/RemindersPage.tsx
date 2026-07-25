import { Bell } from 'lucide-react';
import { PlaceholderPage } from '@/components/layout/PlaceholderPage';
import { useReminders } from '@/hooks/useReminders';

export function RemindersPage() {
  const { items } = useReminders();
  const pending = items.filter((reminder) => reminder.status === 'pending').length;

  return (
    <PlaceholderPage
      icon={<Bell className="size-6" />}
      title="Recordatorios de seguimiento"
      description={`${pending} recordatorio(s) pendiente(s). Se generan automáticamente 2 semanas después de completar un servicio.`}
    />
  );
}
