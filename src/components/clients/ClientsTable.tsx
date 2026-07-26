import { Search, Plus, Eye, Pencil, Trash2, Users } from 'lucide-react';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/format';
import { SERVICE_STATUS_LABEL, SERVICE_STATUS_TONE } from '@/lib/serviceStatus';
import type { Client, ServiceRecord } from '@/types';

interface ClientsTableProps {
  clients: Client[];
  totalCount: number;
  search: string;
  onSearchChange: (value: string) => void;
  lastServiceByClient: Map<string, ServiceRecord>;
  onCreate: () => void;
  onView: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

export function ClientsTable({
  clients,
  totalCount,
  search,
  onSearchChange,
  lastServiceByClient,
  onCreate,
  onView,
  onEdit,
  onDelete,
}: ClientsTableProps) {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-faint" />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar por nombre, teléfono, dirección o máquina..."
            className="w-full rounded-sm border border-panel-border bg-surface-raised py-2 pl-9 pr-3 font-mono text-sm text-text placeholder:text-text-faint focus:border-accent focus:outline-none"
          />
        </div>
        <Button onClick={onCreate}>
          <Plus className="size-4" />
          Nuevo cliente
        </Button>
      </div>

      <Panel className="flex-1 overflow-hidden p-0">
        {totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-10 text-center">
            <div className="flex size-14 items-center justify-center rounded-full border border-panel-border bg-metal text-accent">
              <Users className="size-6" />
            </div>
            <h2 className="text-xl text-text">Aún no hay clientes</h2>
            <p className="max-w-sm font-mono text-sm text-text-muted">
              Registra tu primer cliente para empezar a llevar el control de sus máquinas y
              servicios.
            </p>
            <Button onClick={onCreate}>
              <Plus className="size-4" />
              Nuevo cliente
            </Button>
          </div>
        ) : clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-10 text-center">
            <p className="font-mono text-sm text-text-muted">
              No se encontraron clientes para &quot;{search}&quot;.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left font-mono text-sm">
              <thead>
                <tr className="border-b border-panel-border text-xs uppercase tracking-wide text-text-muted">
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Teléfono</th>
                  <th className="px-4 py-3 font-medium">Dirección</th>
                  <th className="px-4 py-3 font-medium">Máquina</th>
                  <th className="px-4 py-3 font-medium">Contador</th>
                  <th className="px-4 py-3 font-medium">Último servicio</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => {
                  const machine = client.machines[0];
                  const lastService = lastServiceByClient.get(client.id);
                  return (
                    <tr
                      key={client.id}
                      className="border-b border-panel-border/60 last:border-0 hover:bg-surface-raised"
                    >
                      <td className="px-4 py-3 text-text">{client.name}</td>
                      <td className="px-4 py-3 text-text-muted">{client.phone || '—'}</td>
                      <td className="px-4 py-3 text-text-muted">{client.address || '—'}</td>
                      <td className="px-4 py-3 text-text-muted">
                        {machine ? `${machine.brand} ${machine.model}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-text-muted">
                        {machine ? machine.copyCounter.toLocaleString('es-CO') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {lastService ? (
                          <div className="flex items-center gap-2">
                            <span className="text-text-muted">{formatDate(lastService.date)}</span>
                            <Badge tone={SERVICE_STATUS_TONE[lastService.status]}>
                              {SERVICE_STATUS_LABEL[lastService.status]}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-text-faint">Sin servicios</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onView(client)}
                            title="Ver detalle"
                            className="rounded-sm p-1.5 text-text-muted transition-colors hover:bg-surface hover:text-accent"
                          >
                            <Eye className="size-4" />
                          </button>
                          <button
                            onClick={() => onEdit(client)}
                            title="Editar"
                            className="rounded-sm p-1.5 text-text-muted transition-colors hover:bg-surface hover:text-text"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            onClick={() => onDelete(client)}
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
    </div>
  );
}
