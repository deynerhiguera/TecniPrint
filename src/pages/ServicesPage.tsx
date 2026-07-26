import { useMemo, useState } from 'react';
import { Search, Wrench, Wallet, Package, TrendingUp, Pencil, Trash2 } from 'lucide-react';
import { Panel } from '@/components/ui/Panel';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { StatTile } from '@/components/dashboard/StatTile';
import { ServiceFormModal } from '@/components/clients/ServiceFormModal';
import { useServices } from '@/hooks/useServices';
import { useClients } from '@/hooks/useClients';
import { useReminders } from '@/hooks/useReminders';
import { buildFollowUpReminder } from '@/lib/reminders';
import { formatCurrency, formatDate } from '@/lib/format';
import { SERVICE_STATUS_LABEL, SERVICE_STATUS_OPTIONS, SERVICE_STATUS_TONE } from '@/lib/serviceStatus';
import type { ServiceRecord, ServiceStatus } from '@/types';

const inputClass =
  'w-full rounded-sm border border-panel-border bg-surface-raised px-3 py-2 font-mono text-sm text-text placeholder:text-text-faint focus:border-accent focus:outline-none';

function monthLabel(yearMonth: string): string {
  const label = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' }).format(
    new Date(`${yearMonth}-01`),
  );
  return label.charAt(0).toUpperCase() + label.slice(1);
}

interface ServicesPageProps {
  onSelectClient: (clientId: string) => void;
}

export function ServicesPage({ onSelectClient }: ServicesPageProps) {
  const services = useServices();
  const clients = useClients();
  const reminders = useReminders();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ServiceStatus | 'all'>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [editingService, setEditingService] = useState<ServiceRecord | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmService, setConfirmService] = useState<ServiceRecord | undefined>(undefined);

  const clientsById = useMemo(
    () => new Map(clients.items.map((client) => [client.id, client])),
    [clients.items],
  );

  const monthOptions = useMemo(() => {
    const months = new Set(services.items.map((service) => service.date.slice(0, 7)));
    return Array.from(months)
      .sort((a, b) => (a < b ? 1 : -1))
      .map((value) => ({ value, label: monthLabel(value) }));
  }, [services.items]);

  const filteredServices = useMemo(() => {
    let result = services.items;

    if (monthFilter !== 'all') {
      result = result.filter((service) => service.date.slice(0, 7) === monthFilter);
    }
    if (statusFilter !== 'all') {
      result = result.filter((service) => service.status === statusFilter);
    }

    const query = search.trim().toLowerCase();
    if (query) {
      result = result.filter((service) => {
        const client = clientsById.get(service.clientId);
        const haystack = [
          client?.name ?? '',
          service.serviceType,
          service.description,
          service.errorCodes.join(' '),
          service.partsUsed.map((part) => part.name).join(' '),
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      });
    }

    return [...result].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [services.items, monthFilter, statusFilter, search, clientsById]);

  const summary = useMemo(() => {
    const completed = filteredServices.filter((service) => service.status === 'completed');
    const revenue = completed.reduce((sum, service) => sum + service.total, 0);
    const materialsCost = completed.reduce((sum, service) => sum + service.materialsCost, 0);
    return {
      count: filteredServices.length,
      revenue,
      materialsCost,
      profit: revenue - materialsCost,
    };
  }, [filteredServices]);

  const openEdit = (service: ServiceRecord) => {
    setEditingService(service);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingService(undefined);
  };

  const editingClient = editingService ? clientsById.get(editingService.clientId) : undefined;

  const handleSaveService = (service: ServiceRecord, newCopyCount: number) => {
    services.update(service.id, service);

    if (editingClient) {
      const machine = editingClient.machines[0];
      if (machine && newCopyCount !== machine.copyCounter) {
        clients.update(editingClient.id, {
          machines: [{ ...machine, copyCounter: newCopyCount }, ...editingClient.machines.slice(1)],
          updatedAt: new Date().toISOString(),
        });
      }
    }

    if (service.status === 'completed') {
      const hasReminder = reminders.items.some((reminder) => reminder.serviceId === service.id);
      if (!hasReminder) {
        reminders.add(buildFollowUpReminder(service));
      }
    }

    closeModal();
  };

  const handleDeleteService = () => {
    if (!confirmService) return;
    services.remove(confirmService.id);
    reminders.setItems((prev) => prev.filter((reminder) => reminder.serviceId !== confirmService.id));
    setConfirmService(undefined);
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-faint" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por cliente, tipo, descripción, errores o repuestos..."
            className={`${inputClass} pl-9`}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as ServiceStatus | 'all')}
          className={`${inputClass} w-auto`}
        >
          <option value="all">Todos los estados</option>
          {SERVICE_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={monthFilter}
          onChange={(event) => setMonthFilter(event.target.value)}
          className={`${inputClass} w-auto`}
        >
          <option value="all">Todos los meses</option>
          {monthOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Servicios"
          value={String(summary.count)}
          icon={<Wrench className="size-5" />}
          tone="neutral"
        />
        <StatTile
          label="Ingresos (completados)"
          value={formatCurrency(summary.revenue)}
          icon={<Wallet className="size-5" />}
          tone="revenue"
        />
        <StatTile
          label="Costo de materiales"
          value={formatCurrency(summary.materialsCost)}
          icon={<Package className="size-5" />}
          tone="warning"
        />
        <StatTile
          label="Ganancia neta"
          value={formatCurrency(summary.profit)}
          icon={<TrendingUp className="size-5" />}
          tone="accent"
        />
      </div>

      <Panel className="flex-1 overflow-hidden p-0">
        {services.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-10 text-center">
            <div className="flex size-14 items-center justify-center rounded-full border border-panel-border bg-metal text-accent">
              <Wrench className="size-6" />
            </div>
            <h2 className="text-xl text-text">Aún no hay servicios registrados</h2>
            <p className="max-w-sm font-mono text-sm text-text-muted">
              Los servicios se registran desde la ficha de cada cliente.
            </p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-10 text-center">
            <p className="font-mono text-sm text-text-muted">
              No se encontraron servicios con los filtros seleccionados.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left font-mono text-sm">
              <thead>
                <tr className="border-b border-panel-border text-xs uppercase tracking-wide text-text-muted">
                  <th className="whitespace-nowrap px-4 py-3 font-medium">Fecha</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium">Cliente</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium">Máquina</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 font-medium">Descripción</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium">Códigos de error</th>
                  <th className="px-4 py-3 font-medium">Repuestos</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium">Materiales</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium">Mano de obra</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium">Total</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium">Estado</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service) => {
                  const client = clientsById.get(service.clientId);
                  const machine = client?.machines[0];
                  const partsText = service.partsUsed.map((part) => part.name).join(', ');
                  return (
                    <tr
                      key={service.id}
                      className="border-b border-panel-border/60 last:border-0 hover:bg-surface-raised"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-text-muted">
                        {formatDate(service.date)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {client ? (
                          <button
                            onClick={() => onSelectClient(client.id)}
                            className="text-accent transition-colors hover:underline"
                          >
                            {client.name}
                          </button>
                        ) : (
                          <span className="text-text-faint">Cliente eliminado</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-text-muted">
                        {machine ? `${machine.brand} ${machine.model}` : '—'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-text">{service.serviceType}</td>
                      <td className="max-w-45 px-4 py-3 text-text-muted">
                        <p className="truncate" title={service.description}>
                          {service.description || '—'}
                        </p>
                      </td>
                      <td className="max-w-40 whitespace-nowrap px-4 py-3">
                        {service.errorCodes.length > 0 ? (
                          <p className="truncate font-mono text-xs text-danger" title={service.errorCodes.join(', ')}>
                            {service.errorCodes.join(', ')}
                          </p>
                        ) : (
                          <span className="text-text-faint">—</span>
                        )}
                      </td>
                      <td className="max-w-40 px-4 py-3 text-text-muted">
                        <p className="truncate" title={partsText}>
                          {partsText || '—'}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-text-muted">
                        {formatCurrency(service.materialsCost)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-text-muted">
                        {formatCurrency(service.laborCost)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-semibold text-text">
                        {formatCurrency(service.total)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <Badge tone={SERVICE_STATUS_TONE[service.status]}>
                          {SERVICE_STATUS_LABEL[service.status]}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(service)}
                            title="Editar"
                            className="rounded-sm p-1.5 text-text-muted transition-colors hover:bg-surface hover:text-text"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            onClick={() => setConfirmService(service)}
                            title="Eliminar"
                            className="rounded-sm p-1.5 text-text-muted transition-colors hover:bg-surface hover:text-danger"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <ServiceFormModal
        open={modalOpen}
        service={editingService}
        clientId={editingClient?.id ?? ''}
        machine={editingClient?.machines[0]}
        onClose={closeModal}
        onSave={handleSaveService}
      />

      <ConfirmDialog
        open={confirmService !== undefined}
        title="Confirmar eliminación"
        message={
          confirmService
            ? `Se eliminará el servicio "${confirmService.serviceType}" del ${formatDate(confirmService.date)}. Esta acción no se puede deshacer.`
            : ''
        }
        onConfirm={handleDeleteService}
        onCancel={() => setConfirmService(undefined)}
      />
    </div>
  );
}
