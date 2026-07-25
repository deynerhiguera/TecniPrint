import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { useReminders } from '@/hooks/useReminders';
import type { Section } from '@/types/navigation';
import { ClientsPage } from '@/pages/ClientsPage';
import { ServicesPage } from '@/pages/ServicesPage';
import { RemindersPage } from '@/pages/RemindersPage';
import { CatalogPage } from '@/pages/CatalogPage';
import { CalculatorPage } from '@/pages/CalculatorPage';
import { CalendarPage } from '@/pages/CalendarPage';

const PAGES: Record<Section, () => React.JSX.Element> = {
  clients: ClientsPage,
  services: ServicesPage,
  reminders: RemindersPage,
  catalog: CatalogPage,
  calculator: CalculatorPage,
  calendar: CalendarPage,
};

export default function App() {
  const [section, setSection] = useState<Section>('clients');
  const { items: reminders } = useReminders();
  const pendingReminders = reminders.filter((reminder) => reminder.status === 'pending').length;

  const Page = PAGES[section];

  return (
    <div className="flex min-h-screen gap-4 p-4">
      <Sidebar active={section} onSelect={setSection} reminderCount={pendingReminders} />
      <div className="flex flex-1 flex-col gap-4">
        <Topbar active={section} />
        <Page />
      </div>
    </div>
  );
}
