import { Users, Wrench, Wallet, Bell } from 'lucide-react';
import { Panel } from '@/components/ui/Panel';
import { StatTile } from '@/components/dashboard/StatTile';
import { useClients } from '@/hooks/useClients';
import { useServices } from '@/hooks/useServices';
import { useReminders } from '@/hooks/useReminders';
import { getMonthlyStats } from '@/lib/stats';
import { formatCurrency, formatDate } from '@/lib/format';

export function DashboardPage() {
  const { items: clients, get: getClient } = useClients();
  const { items: services } = useServices();
  const { items: reminders } = useReminders();

  const { serviceCount, revenue } = getMonthlyStats(services);
  const pendingReminders = reminders.filter((reminder) => reminder.status === 'pending');

  const upcomingReminders = [...pendingReminders]
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  const recentServices = [...services]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Clientes"
          value={String(clients.length)}
          icon={<Users className="size-5" />}
          tone="neutral"
        />
        <StatTile
          label="Servicios este mes"
          value={String(serviceCount)}
          icon={<Wrench className="size-5" />}
          tone="accent"
        />
        <StatTile
          label="Ingresos este mes"
          value={formatCurrency(revenue)}
          icon={<Wallet className="size-5" />}
          tone="revenue"
        />
        <StatTile
          label="Recordatorios pendientes"
          value={String(pendingReminders.length)}
          icon={<Bell className="size-5" />}
          tone="warning"
        />
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel className="flex flex-col gap-3 p-4">
          <h2 className="text-lg text-text">Próximos recordatorios</h2>
          {upcomingReminders.length === 0 ? (
            <p className="font-mono text-sm text-text-muted">No hay recordatorios pendientes.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {upcomingReminders.map((reminder) => {
                const client = getClient(reminder.clientId);
                return (
                  <li
                    key={reminder.id}
                    className="flex items-center justify-between rounded-sm border border-panel-border bg-surface-raised px-3 py-2"
                  >
                    <span className="font-mono text-sm text-text">{client?.name ?? 'Cliente'}</span>
                    <span className="font-mono text-xs text-text-muted">
                      {formatDate(reminder.dueDate)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel className="flex flex-col gap-3 p-4">
          <h2 className="text-lg text-text">Servicios recientes</h2>
          {recentServices.length === 0 ? (
            <p className="font-mono text-sm text-text-muted">Aún no hay servicios registrados.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {recentServices.map((service) => {
                const client = getClient(service.clientId);
                return (
                  <li
                    key={service.id}
                    className="flex items-center justify-between rounded-sm border border-panel-border bg-surface-raised px-3 py-2"
                  >
                    <div className="flex flex-col">
                      <span className="font-mono text-sm text-text">{client?.name ?? 'Cliente'}</span>
                      <span className="font-mono text-xs text-text-muted">{service.serviceType}</span>
                    </div>
                    <span className="font-mono text-xs text-text-muted">{formatDate(service.date)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
