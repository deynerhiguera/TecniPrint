import { useMemo } from 'react';
import { differenceInCalendarDays } from 'date-fns';
import { CheckCircle2, History, Printer, Wrench, CalendarDays, Clock, PhoneCall, ArrowUpRight } from 'lucide-react';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { useReminders } from '@/hooks/useReminders';
import { useServices } from '@/hooks/useServices';
import { useClients } from '@/hooks/useClients';
import { formatDate } from '@/lib/format';
import type { Client, FollowUpReminder, ServiceRecord } from '@/types';

interface ReminderWithContext {
  reminder: FollowUpReminder;
  service?: ServiceRecord;
  client?: Client;
}

interface ReminderCardProps {
  entry: ReminderWithContext;
  muted?: boolean;
  onDismiss?: () => void;
  onViewService?: () => void;
}

function ReminderCard({ entry, muted = false, onDismiss, onViewService }: ReminderCardProps) {
  const { reminder, service, client } = entry;
  const machine = client?.machines[0];
  const daysAgo = service ? differenceInCalendarDays(new Date(), new Date(service.date)) : null;

  return (
    <div
      className={`flex flex-col gap-2 rounded-sm border border-panel-border p-4 ${
        muted ? 'bg-metal/40 opacity-70' : 'bg-surface-raised'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-heading text-base font-semibold text-text">
          {client?.name ?? 'Cliente eliminado'}
        </span>
        {!muted && daysAgo !== null && (
          <span className="flex items-center gap-1 font-mono text-xs text-warning">
            <Clock className="size-3.5" />
            hace {daysAgo} día{daysAgo === 1 ? '' : 's'}
          </span>
        )}
      </div>

      {machine && (
        <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
          <Printer className="size-3.5 text-text-faint" />
          {machine.brand} {machine.model}
        </div>
      )}

      {service && (
        <>
          <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
            <Wrench className="size-3.5 text-text-faint" />
            {service.serviceType}
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
            <CalendarDays className="size-3.5 text-text-faint" />
            Servicio del {formatDate(service.date)}
          </div>
        </>
      )}

      {muted && (
        <div className="flex items-center gap-2 font-mono text-xs text-text-faint">
          <History className="size-3.5" />
          Vencía el {formatDate(reminder.dueDate)}
        </div>
      )}

      {!muted && (
        <div className="mt-2 flex items-center gap-2">
          <Button onClick={onDismiss} className="px-3 py-1.5 text-xs">
            <PhoneCall className="size-3.5" />
            Contactar cliente
          </Button>
          <Button variant="secondary" onClick={onViewService} className="px-3 py-1.5 text-xs">
            <ArrowUpRight className="size-3.5" />
            Ver servicio
          </Button>
        </div>
      )}
    </div>
  );
}

interface RemindersPageProps {
  onSelectClient: (clientId: string) => void;
}

export function RemindersPage({ onSelectClient }: RemindersPageProps) {
  const reminders = useReminders();
  const services = useServices();
  const clients = useClients();

  const servicesById = useMemo(
    () => new Map(services.items.map((service) => [service.id, service])),
    [services.items],
  );
  const clientsById = useMemo(
    () => new Map(clients.items.map((client) => [client.id, client])),
    [clients.items],
  );

  const withContext = (reminder: FollowUpReminder): ReminderWithContext => ({
    reminder,
    service: servicesById.get(reminder.serviceId),
    client: clientsById.get(reminder.clientId),
  });

  const pending = reminders.items
    .filter((reminder) => reminder.status === 'pending')
    .map(withContext)
    .sort((a, b) => (a.reminder.dueDate < b.reminder.dueDate ? -1 : 1));

  const history = reminders.items
    .filter((reminder) => reminder.status !== 'pending')
    .map(withContext)
    .sort((a, b) => (a.reminder.dueDate > b.reminder.dueDate ? -1 : 1));

  const dismissReminder = (id: string) => {
    reminders.update(id, { status: 'dismissed' });
  };

  return (
    <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
      <Panel className="flex flex-col gap-3 p-4">
        <h2 className="text-lg text-text">Recordatorios pendientes</h2>
        {pending.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <CheckCircle2 className="size-8 text-revenue" />
            <p className="font-mono text-sm text-text-muted">Todo al día. No hay seguimientos pendientes.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {pending.map((entry) => (
              <ReminderCard
                key={entry.reminder.id}
                entry={entry}
                onDismiss={() => dismissReminder(entry.reminder.id)}
                onViewService={() => entry.client && onSelectClient(entry.client.id)}
              />
            ))}
          </div>
        )}
      </Panel>

      <Panel className="flex flex-col gap-3 p-4">
        <h2 className="text-lg text-text">Historial</h2>
        {history.length === 0 ? (
          <p className="py-10 text-center font-mono text-sm text-text-faint">—</p>
        ) : (
          <div className="flex flex-col gap-3">
            {history.map((entry) => (
              <ReminderCard key={entry.reminder.id} entry={entry} muted />
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
