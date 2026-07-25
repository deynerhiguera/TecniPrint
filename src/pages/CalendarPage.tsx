import { CalendarDays } from 'lucide-react';
import { PlaceholderPage } from '@/components/layout/PlaceholderPage';

export function CalendarPage() {
  return (
    <PlaceholderPage
      icon={<CalendarDays className="size-6" />}
      title="Calendario mensual"
      description="Aquí irá la vista mensual con los servicios agendados y completados por día."
    />
  );
}
