import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { generateId } from '@/lib/id';
import type { Client, Machine } from '@/types';

const MACHINE_TYPES = ['Fotocopiadora', 'Impresora', 'Multifunción', 'Plóter'];

const inputClass =
  'w-full rounded-sm border border-panel-border bg-surface-raised px-3 py-2 font-mono text-sm text-text placeholder:text-text-faint focus:border-accent focus:outline-none';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-xs uppercase tracking-wide text-text-muted">{label}</span>
      {children}
    </label>
  );
}

interface ClientFormModalProps {
  open: boolean;
  client?: Client;
  onClose: () => void;
  onSave: (client: Client) => void;
}

export function ClientFormModal({ open, client, onClose, onSave }: ClientFormModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [machineType, setMachineType] = useState(MACHINE_TYPES[0]);
  const [machineBrand, setMachineBrand] = useState('');
  const [machineModel, setMachineModel] = useState('');
  const [machineSpecs, setMachineSpecs] = useState('');
  const [copyCount, setCopyCount] = useState('0');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const machine = client?.machines[0];
    setName(client?.name ?? '');
    setPhone(client?.phone ?? '');
    setAddress(client?.address ?? '');
    setMachineType(machine?.type ?? MACHINE_TYPES[0]);
    setMachineBrand(machine?.brand ?? '');
    setMachineModel(machine?.model ?? '');
    setMachineSpecs(machine?.specs ?? '');
    setCopyCount(machine ? String(machine.copyCounter) : '0');
    setError(null);
  }, [open, client]);

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }

    const now = new Date().toISOString();
    const existingMachine = client?.machines[0];
    const machine: Machine = {
      id: existingMachine?.id ?? generateId(),
      type: machineType,
      brand: machineBrand.trim(),
      model: machineModel.trim(),
      serialNumber: existingMachine?.serialNumber,
      copyCounter: Number(copyCount) || 0,
      specs: machineSpecs.trim() || undefined,
    };

    const savedClient: Client = {
      id: client?.id ?? generateId(),
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      machines: client ? [machine, ...client.machines.slice(1)] : [machine],
      notes: client?.notes,
      createdAt: client?.createdAt ?? now,
      updatedAt: now,
    };

    onSave(savedClient);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={client ? 'Editar cliente' : 'Nuevo cliente'}
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
        <Field label="Nombre *">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClass}
            placeholder="Nombre del cliente o negocio"
          />
        </Field>
        {error && <p className="-mt-2 font-mono text-xs text-danger">{error}</p>}

        <div className="grid grid-cols-2 gap-4">
          <Field label="Teléfono">
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className={inputClass}
              placeholder="+57 300 000 0000"
            />
          </Field>
          <Field label="Dirección">
            <input
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              className={inputClass}
              placeholder="Dirección"
            />
          </Field>
        </div>

        <div className="mt-2 border-t border-panel-border pt-4">
          <h3 className="mb-3 font-heading text-sm font-semibold uppercase tracking-wide text-text-muted">
            Máquina
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tipo">
              <select
                value={machineType}
                onChange={(event) => setMachineType(event.target.value)}
                className={inputClass}
              >
                {MACHINE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Contador de copias">
              <input
                type="number"
                min={0}
                value={copyCount}
                onChange={(event) => setCopyCount(event.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Marca">
              <input
                value={machineBrand}
                onChange={(event) => setMachineBrand(event.target.value)}
                className={inputClass}
                placeholder="Ricoh, Xerox, HP..."
              />
            </Field>
            <Field label="Modelo">
              <input
                value={machineModel}
                onChange={(event) => setMachineModel(event.target.value)}
                className={inputClass}
                placeholder="MP 2014, WorkCentre 5945..."
              />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Especificaciones">
              <textarea
                value={machineSpecs}
                onChange={(event) => setMachineSpecs(event.target.value)}
                className={inputClass}
                rows={2}
                placeholder="Notas técnicas, capacidad, accesorios..."
              />
            </Field>
          </div>
        </div>
      </div>
    </Modal>
  );
}
