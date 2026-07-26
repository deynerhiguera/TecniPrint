import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { useReminders } from '@/hooks/useReminders';
import type { Section } from '@/types/navigation';
import { DashboardPage } from '@/pages/DashboardPage';
import { ClientsPage } from '@/pages/ClientsPage';
import { ServicesPage } from '@/pages/ServicesPage';
import { RemindersPage } from '@/pages/RemindersPage';
import { CatalogPage } from '@/pages/CatalogPage';
import { CalculatorPage } from '@/pages/CalculatorPage';
import { CalendarPage } from '@/pages/CalendarPage';

export default function App() {
  const [section, setSection] = useState<Section>('dashboard');
  const [pendingClientId, setPendingClientId] = useState<string | null>(null);
  const { items: reminders } = useReminders();
  const pendingReminders = reminders.filter((reminder) => reminder.status === 'pending').length;

  const handleSelectSection = (nextSection: Section) => {
    setSection(nextSection);
    setPendingClientId(null);
  };

  const navigateToClient = (clientId: string) => {
    setPendingClientId(clientId);
    setSection('clients');
  };

  return (
    <div className="flex min-h-screen gap-4 p-4">
      <Sidebar active={section} onSelect={handleSelectSection} reminderCount={pendingReminders} />
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <Topbar active={section} />
        {section === 'dashboard' && <DashboardPage />}
        {section === 'clients' && <ClientsPage initialClientId={pendingClientId} />}
        {section === 'services' && <ServicesPage onSelectClient={navigateToClient} />}
        {section === 'reminders' && <RemindersPage onSelectClient={navigateToClient} />}
        {section === 'catalog' && <CatalogPage />}
        {section === 'calculator' && <CalculatorPage />}
        {section === 'calendar' && <CalendarPage />}
      </div>
    </div>
  );
}
