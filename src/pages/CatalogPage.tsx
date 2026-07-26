import { useState } from 'react';
import type { ReactNode } from 'react';
import { Tags, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useCatalog } from '@/hooks/useCatalog';
import { cn } from '@/lib/cn';
import { generateId } from '@/lib/id';
import { formatCurrency } from '@/lib/format';
import type { PriceCatalogItem } from '@/types';

const inputClass =
  'w-full rounded-sm border border-panel-border bg-surface-raised px-3 py-2 font-mono text-sm text-text placeholder:text-text-faint focus:border-accent focus:outline-none';
// Same as inputClass but without a baked-in width, for the inline-edit row where flex-1/w-32
// need to win — combining them with inputClass's own w-full has no effect since Tailwind's
// cascade order (not class order) decides the winner, and w-full always wins.
const rowInputClass = inputClass.replace('w-full ', '');

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-xs uppercase tracking-wide text-text-muted">{label}</span>
      {children}
    </label>
  );
}

interface EditDraft {
  serviceType: string;
  basePrice: string;
}

export function CatalogPage() {
  const catalog = useCatalog();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft>({ serviceType: '', basePrice: '' });
  const [editError, setEditError] = useState<string | null>(null);
  const [deletingItem, setDeletingItem] = useState<PriceCatalogItem | null>(null);

  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [addError, setAddError] = useState<string | null>(null);

  const sortedItems = [...catalog.items].sort((a, b) =>
    a.serviceType.localeCompare(b.serviceType, 'es'),
  );

  const startEdit = (item: PriceCatalogItem) => {
    setEditingId(item.id);
    setEditDraft({ serviceType: item.serviceType, basePrice: String(item.basePrice) });
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError(null);
  };

  const saveEdit = (id: string) => {
    const name = editDraft.serviceType.trim();
    const price = Number(editDraft.basePrice);
    if (!name) {
      setEditError('El nombre es obligatorio.');
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setEditError('El precio debe ser un número positivo.');
      return;
    }
    catalog.update(id, { serviceType: name, basePrice: price });
    setEditingId(null);
    setEditError(null);
  };

  const handleAdd = () => {
    const name = newName.trim();
    const price = Number(newPrice);
    if (!name) {
      setAddError('El nombre es obligatorio.');
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setAddError('El precio debe ser un número positivo.');
      return;
    }
    catalog.add({ id: generateId(), serviceType: name, basePrice: price });
    setNewName('');
    setNewPrice('');
    setAddError(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingItem) return;
    catalog.remove(deletingItem.id);
    setDeletingItem(null);
  };

  return (
    <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-3">
      <Panel className="flex flex-col gap-3 p-4 lg:col-span-2">
        <h2 className="text-lg text-text">Catálogo de precios</h2>

        {sortedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <div className="flex size-14 items-center justify-center rounded-full border border-panel-border bg-metal text-accent">
              <Tags className="size-6" />
            </div>
            <p className="max-w-sm font-mono text-sm text-text-muted">
              Aún no hay tipos de servicio en el catálogo. Agrega el primero desde el formulario.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {sortedItems.map((item) => {
              const isEditing = editingId === item.id;
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-2 rounded-sm border border-panel-border bg-surface-raised px-4 py-3"
                >
                  {isEditing ? (
                    <>
                      <input
                        value={editDraft.serviceType}
                        onChange={(event) =>
                          setEditDraft((prev) => ({ ...prev, serviceType: event.target.value }))
                        }
                        className={cn('flex-1', rowInputClass)}
                      />
                      <input
                        type="number"
                        min={0}
                        value={editDraft.basePrice}
                        onChange={(event) =>
                          setEditDraft((prev) => ({ ...prev, basePrice: event.target.value }))
                        }
                        className={cn('w-32', rowInputClass)}
                      />
                      <button
                        onClick={() => saveEdit(item.id)}
                        title="Guardar"
                        className="rounded-sm p-1.5 text-text-muted transition-colors hover:bg-surface hover:text-revenue"
                      >
                        <Check className="size-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        title="Cancelar"
                        className="rounded-sm p-1.5 text-text-muted transition-colors hover:bg-surface hover:text-text"
                      >
                        <X className="size-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-1 flex-col">
                        <span className="font-heading text-base font-semibold text-text">
                          {item.serviceType}
                        </span>
                        <span className="font-mono text-sm text-accent">
                          {formatCurrency(item.basePrice)}
                        </span>
                      </div>
                      <button
                        onClick={() => startEdit(item)}
                        title="Editar"
                        className="rounded-sm p-1.5 text-text-muted transition-colors hover:bg-surface hover:text-text"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => setDeletingItem(item)}
                        title="Eliminar"
                        className="rounded-sm p-1.5 text-text-muted transition-colors hover:bg-surface hover:text-danger"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </>
                  )}
                </div>
              );
            })}
            {editingId && editError && (
              <p className="font-mono text-xs text-danger">{editError}</p>
            )}
          </div>
        )}
      </Panel>

      <Panel className="flex h-fit flex-col gap-4 p-4">
        <h2 className="text-lg text-text">Nuevo servicio</h2>
        <Field label="Tipo de servicio">
          <input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            className={inputClass}
            placeholder="Ej. Cambio de rodillo"
          />
        </Field>
        <Field label="Precio (COP)">
          <input
            type="number"
            min={0}
            value={newPrice}
            onChange={(event) => setNewPrice(event.target.value)}
            className={inputClass}
            placeholder="0"
          />
        </Field>
        {addError && <p className="font-mono text-xs text-danger">{addError}</p>}
        <Button onClick={handleAdd}>
          <Plus className="size-4" />
          Agregar servicio
        </Button>
      </Panel>

      <ConfirmDialog
        open={deletingItem !== null}
        title="Confirmar eliminación"
        message={
          deletingItem
            ? `Se eliminará "${deletingItem.serviceType}" del catálogo. Esta acción no se puede deshacer.`
            : ''
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingItem(null)}
      />
    </div>
  );
}
