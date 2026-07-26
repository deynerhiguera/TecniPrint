import {
  ArrowLeft,
  Phone,
  MapPin,
  Printer,
  Hash,
  Wrench,
  Wallet,
  Package,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatTile } from '@/components/dashboard/StatTile';
import { formatCurrency, formatDate } from '@/lib/format';
import { SERVICE_STATUS_LABEL, SERVICE_STATUS_TONE } from '@/lib/serviceStatus';
import type { Client, ServiceRecord } from '@/types';

interface ClientDetailProps {
  client: Client;
  services: ServiceRecord[];
  onBack: () => void;
  onEditClient: () => void;
  onDeleteClient: () => void;
  onAddService: () => void;
  onEditService: (service: ServiceRecord) => void;
  onDeleteService: (service: ServiceRecord) => void;
}

export function ClientDetail({
  client,
  services,
  onBack,
  onEditClient,
  onDeleteClient,
  onAddService,
  onEditService,
  onDeleteService,
}: ClientDetailProps) {
  const machine = client.machines[0];
  const completedServices = services.filter((service) => service.status === 'completed');
  const totalRevenue = completedServices.reduce((sum, service) => sum + service.total, 0);
  const totalMaterialsCost = completedServices.reduce(
    (sum, service) => sum + service.materialsCost,
    0,
  );

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-heading text-sm font-medium uppercase tracking-wide text-text-muted transition-colors hover:text-text"
        >
          <ArrowLeft className="size-4" />
          Volver
        </button>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={onEditClient}>
            <Pencil className="size-4" />
            Editar
          </Button>
          <Button variant="danger" onClick={onDeleteClient}>
            <Trash2 className="size-4" />
            Eliminar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel className="flex flex-col gap-3 p-4">
          <h2 className="text-lg text-text">{client.name}</h2>
          <div className="flex items-center gap-2 font-mono text-sm text-text-muted">
            <Phone className="size-4 text-text-faint" />
            {client.phone || 'Sin teléfono registrado'}
          </div>
          <div className="flex items-center gap-2 font-mono text-sm text-text-muted">
            <MapPin className="size-4 text-text-faint" />
            {client.address || 'Sin dirección registrada'}
          </div>
        </Panel>

        <Panel className="flex flex-col gap-3 p-4">
          <h2 className="text-lg text-text">Máquina</h2>
          {machine ? (
            <>
              <div className="flex items-center gap-2 font-mono text-sm text-text-muted">
                <Printer className="size-4 text-text-faint" />
                {machine.type} — {machine.brand} {machine.model}
              </div>
              <div className="flex items-center gap-2 font-mono text-sm text-text-muted">
                <Hash className="size-4 text-text-faint" />
                {machine.copyCounter.toLocaleString('es-CO')} copias
              </div>
              {machine.specs && (
                <p className="font-mono text-xs text-text-faint">{machine.specs}</p>
              )}
            </>
          ) : (
            <p className="font-mono text-sm text-text-faint">Sin máquina registrada.</p>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile
          label="Total de servicios"
          value={String(services.length)}
          icon={<Wrench className="size-5" />}
          tone="accent"
        />
        <StatTile
          label="Ingresos totales"
          value={formatCurrency(totalRevenue)}
          icon={<Wallet className="size-5" />}
          tone="revenue"
        />
        <StatTile
          label="Costo de materiales"
          value={formatCurrency(totalMaterialsCost)}
          icon={<Package className="size-5" />}
          tone="warning"
        />
      </div>

      <Panel className="flex-1 overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-panel-border px-4 py-3">
          <h2 className="text-lg text-text">Historial de servicios</h2>
          <Button onClick={onAddService}>
            <Plus className="size-4" />
            Agregar servicio
          </Button>
        </div>

        {services.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-mono text-sm text-text-muted">
              Aún no hay servicios registrados para este cliente.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left font-mono text-sm">
              <thead>
                <tr className="border-b border-panel-border text-xs uppercase tracking-wide text-text-muted">
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 font-medium">Descripción / errores</th>
                  <th className="px-4 py-3 font-medium">Repuestos</th>
                  <th className="px-4 py-3 font-medium">Materiales</th>
                  <th className="px-4 py-3 font-medium">Mano de obra</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr
                    key={service.id}
                    className="border-b border-panel-border/60 last:border-0 hover:bg-surface-raised"
                  >
                    <td className="px-4 py-3 text-text-muted">{formatDate(service.date)}</td>
                    <td className="px-4 py-3 text-text">{service.serviceType}</td>
                    <td className="max-w-[220px] px-4 py-3 text-text-muted">
                      <p className="truncate" title={service.description}>
                        {service.description || '—'}
                      </p>
                      {service.errorCodes.length > 0 && (
                        <p className="mt-1 truncate text-xs text-text-faint">
                          {service.errorCodes.join(', ')}
                        </p>
                      )}
                    </td>
                    <td className="max-w-[160px] px-4 py-3 text-text-muted">
                      <p
                        className="truncate"
                        title={service.partsUsed.map((part) => part.name).join(', ')}
                      >
                        {service.partsUsed.length > 0
                          ? service.partsUsed.map((part) => part.name).join(', ')
                          : '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {formatCurrency(service.materialsCost)}
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {formatCurrency(service.laborCost)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-text">
                      {formatCurrency(service.total)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={SERVICE_STATUS_TONE[service.status]}>
                        {SERVICE_STATUS_LABEL[service.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEditService(service)}
                          title="Editar"
                          className="rounded-sm p-1.5 text-text-muted transition-colors hover:bg-surface hover:text-text"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => onDeleteService(service)}
                          title="Eliminar"
                          className="rounded-sm p-1.5 text-text-muted transition-colors hover:bg-surface hover:text-danger"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
