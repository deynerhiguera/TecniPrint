import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useCatalog } from '@/hooks/useCatalog';
import { cn } from '@/lib/cn';
import { generateId } from '@/lib/id';
import { formatCurrency } from '@/lib/format';
import { SERVICE_STATUS_OPTIONS } from '@/lib/serviceStatus';
import type { Machine, ServicePart, ServiceRecord, ServiceStatus } from '@/types';

const inputClass =
  'w-full rounded-sm border border-panel-border bg-surface-raised px-3 py-2 font-mono text-sm text-text placeholder:text-text-faint focus:border-accent focus:outline-none';
// Same as inputClass but without a baked-in width, for rows that need flex-1/w-32/w-20 instead —
// combining those with inputClass's own w-full is a no-op since Tailwind's cascade order (not
// class order) decides the winner, and w-full always wins.
const rowInputClass = inputClass.replace('w-full ', '');

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-xs uppercase tracking-wide text-text-muted">{label}</span>
      {children}
    </label>
  );
}

interface PartRow {
  id: string;
  name: string;
  cost: string;
  quantity: string;
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

interface ServiceFormModalProps {
  open: boolean;
  service?: ServiceRecord;
  clientId: string;
  machine?: Machine;
  onClose: () => void;
  onSave: (service: ServiceRecord, newCopyCount: number) => void;
}

export function ServiceFormModal({
  open,
  service,
  clientId,
  machine,
  onClose,
  onSave,
}: ServiceFormModalProps) {
  const { items: catalogItems } = useCatalog();

  const [catalogItemId, setCatalogItemId] = useState('');
  const [date, setDate] = useState(todayIsoDate());
  const [status, setStatus] = useState<ServiceStatus>('scheduled');
  const [description, setDescription] = useState('');
  const [errorCodesText, setErrorCodesText] = useState('');
  const [parts, setParts] = useState<PartRow[]>([]);
  const [laborCost, setLaborCost] = useState('0');
  const [newCopyCount, setNewCopyCount] = useState('0');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (service) {
      setCatalogItemId(service.catalogItemId ?? '');
      setDate(service.date);
      setStatus(service.status);
      setDescription(service.description);
      setErrorCodesText(service.errorCodes.join(', '));
      setParts(
        service.partsUsed.map((part) => ({
          id: part.id,
          name: part.name,
          cost: String(part.cost),
          quantity: String(part.quantity),
        })),
      );
      setLaborCost(String(service.laborCost));
      setNewCopyCount(String(machine?.copyCounter ?? 0));
    } else {
      setCatalogItemId('');
      setDate(todayIsoDate());
      setStatus('scheduled');
      setDescription('');
      setErrorCodesText('');
      setParts([]);
      setLaborCost('0');
      setNewCopyCount(String(machine?.copyCounter ?? 0));
    }
  }, [open, service, machine]);

  const materialsCost = parts.reduce(
    (sum, part) => sum + (Number(part.cost) || 0) * (Number(part.quantity) || 1),
    0,
  );
  const laborCostNumber = Number(laborCost) || 0;
  const total = materialsCost + laborCostNumber;

  const handleCatalogChange = (id: string) => {
    setCatalogItemId(id);
    const item = catalogItems.find((catalogItem) => catalogItem.id === id);
    if (item) setLaborCost(String(item.basePrice));
  };

  const addPart = () => {
    setParts((prev) => [...prev, { id: generateId(), name: '', cost: '0', quantity: '1' }]);
  };

  const updatePart = (id: string, patch: Partial<PartRow>) => {
    setParts((prev) => prev.map((part) => (part.id === id ? { ...part, ...patch } : part)));
  };

  const removePart = (id: string) => {
    setParts((prev) => prev.filter((part) => part.id !== id));
  };

  const handleSubmit = () => {
    const catalogItem = catalogItems.find((item) => item.id === catalogItemId);
    if (!catalogItem) {
      setError('Selecciona un tipo de servicio.');
      return;
    }

    const now = new Date().toISOString();
    const errorCodes = errorCodesText
      .split(',')
      .map((code) => code.trim())
      .filter(Boolean);
    const partsUsed: ServicePart[] = parts
      .filter((part) => part.name.trim())
      .map((part) => ({
        id: part.id,
        name: part.name.trim(),
        cost: Number(part.cost) || 0,
        quantity: Number(part.quantity) || 1,
      }));
    const computedMaterialsCost = partsUsed.reduce(
      (sum, part) => sum + part.cost * part.quantity,
      0,
    );

    const savedService: ServiceRecord = {
      id: service?.id ?? generateId(),
      clientId,
      machineId: machine?.id,
      catalogItemId,
      serviceType: catalogItem.serviceType,
      description: description.trim(),
      errorCodes,
      partsUsed,
      materialsCost: computedMaterialsCost,
      laborCost: laborCostNumber,
      total: computedMaterialsCost + laborCostNumber,
      date,
      status,
      createdAt: service?.createdAt ?? now,
      updatedAt: now,
    };

    onSave(savedService, Number(newCopyCount) || 0);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={service ? 'Editar servicio' : 'Nuevo servicio'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Guardar</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Tipo de servicio *">
          <select
            value={catalogItemId}
            onChange={(event) => handleCatalogChange(event.target.value)}
            className={inputClass}
          >
            <option value="" disabled>
              Selecciona un tipo de servicio
            </option>
            {catalogItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.serviceType} — {formatCurrency(item.basePrice)}
              </option>
            ))}
          </select>
        </Field>
        {error && <p className="-mt-2 font-mono text-xs text-danger">{error}</p>}

        <div className="grid grid-cols-2 gap-4">
          <Field label="Fecha">
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Estado">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as ServiceStatus)}
              className={inputClass}
            >
              {SERVICE_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Descripción / códigos de error">
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className={inputClass}
            rows={3}
            placeholder="Detalle del trabajo realizado"
          />
        </Field>
        <Field label="Códigos de error (separados por coma)">
          <input
            value={errorCodesText}
            onChange={(event) => setErrorCodesText(event.target.value)}
            className={inputClass}
            placeholder="E-32, C2557..."
          />
        </Field>

        <div className="border-t border-panel-border pt-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-text-muted">
              Repuestos utilizados
            </h3>
            <Button variant="secondary" onClick={addPart} className="px-2 py-1 text-xs">
              <Plus className="size-3.5" />
              Agregar repuesto
            </Button>
          </div>

          {parts.length === 0 ? (
            <p className="font-mono text-xs text-text-faint">No se han agregado repuestos.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {parts.map((part) => (
                <div key={part.id} className="flex items-center gap-2">
                  <input
                    value={part.name}
                    onChange={(event) => updatePart(part.id, { name: event.target.value })}
                    className={cn('flex-1', rowInputClass)}
                    placeholder="Nombre del repuesto"
                  />
                  <input
                    type="number"
                    min={0}
                    value={part.cost}
                    onChange={(event) => updatePart(part.id, { cost: event.target.value })}
                    className={cn('w-32', rowInputClass)}
                    placeholder="Costo"
                  />
                  <input
                    type="number"
                    min={1}
                    value={part.quantity}
                    onChange={(event) => updatePart(part.id, { quantity: event.target.value })}
                    className={cn('w-20', rowInputClass)}
                    placeholder="Cant."
                  />
                  <button
                    onClick={() => removePart(part.id)}
                    title="Quitar repuesto"
                    className="rounded-sm p-2 text-text-muted transition-colors hover:bg-surface hover:text-danger"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Mano de obra">
            <input
              type="number"
              min={0}
              value={laborCost}
              onChange={(event) => setLaborCost(event.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Nuevo contador de copias">
            <input
              type="number"
              min={0}
              value={newCopyCount}
              onChange={(event) => setNewCopyCount(event.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="flex items-center justify-between rounded-sm border border-panel-border bg-surface-raised px-4 py-3 font-mono text-sm">
          <div className="flex gap-4 text-text-muted">
            <span>Materiales: {formatCurrency(materialsCost)}</span>
            <span>Mano de obra: {formatCurrency(laborCostNumber)}</span>
          </div>
          <span className="text-lg font-semibold text-accent">Total: {formatCurrency(total)}</span>
        </div>
      </div>
    </Modal>
  );
}
