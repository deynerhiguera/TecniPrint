import { useState } from 'react';
import type { ReactNode } from 'react';
import { Calculator, Plus, Trash2 } from 'lucide-react';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { useCatalog } from '@/hooks/useCatalog';
import { cn } from '@/lib/cn';
import { generateId } from '@/lib/id';
import { formatCurrency } from '@/lib/format';

const inputClass =
  'w-full rounded-sm border border-panel-border bg-surface-raised px-3 py-2 font-mono text-sm text-text placeholder:text-text-faint focus:border-accent focus:outline-none';
// Same as inputClass but without a baked-in width, for the material row where flex-1/w-32 need
// to win — combining them with inputClass's own w-full has no effect since Tailwind's cascade
// order (not class order) decides the winner, and w-full always wins.
const rowInputClass = inputClass.replace('w-full ', '');

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-xs uppercase tracking-wide text-text-muted">{label}</span>
      {children}
    </label>
  );
}

function ResultRow({ label, value, tone }: { label: string; value: string; tone?: 'warning' }) {
  return (
    <div className="flex items-center justify-between font-mono text-sm">
      <span className="text-text-muted">{label}</span>
      <span className={tone === 'warning' ? 'text-warning' : 'text-text'}>{value}</span>
    </div>
  );
}

interface MaterialRow {
  id: string;
  description: string;
  cost: string;
}

export function CalculatorPage() {
  const { items: catalogItems } = useCatalog();

  const [catalogItemId, setCatalogItemId] = useState('');
  const [laborCost, setLaborCost] = useState('0');
  const [materials, setMaterials] = useState<MaterialRow[]>([]);
  const [marginPercent, setMarginPercent] = useState('0');

  const handleCatalogChange = (id: string) => {
    setCatalogItemId(id);
    const item = catalogItems.find((catalogItem) => catalogItem.id === id);
    if (item) setLaborCost(String(item.basePrice));
  };

  const addMaterial = () => {
    setMaterials((prev) => [...prev, { id: generateId(), description: '', cost: '0' }]);
  };

  const updateMaterial = (id: string, patch: Partial<MaterialRow>) => {
    setMaterials((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const removeMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((row) => row.id !== id));
  };

  const materialsCost = materials.reduce((sum, row) => sum + (Number(row.cost) || 0), 0);
  const laborCostNumber = Number(laborCost) || 0;
  const marginPercentNumber = Number(marginPercent) || 0;
  const subtotal = materialsCost + laborCostNumber;
  const marginAmount = laborCostNumber * (marginPercentNumber / 100);
  const total = subtotal + marginAmount;
  const netProfit = total - materialsCost;
  const profitPercentage = total > 0 ? (netProfit / total) * 100 : 0;

  const isZeroState = catalogItemId === '' && materials.length === 0 && laborCostNumber === 0;

  return (
    <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
      <Panel className="flex h-fit flex-col gap-4 p-5">
        <h2 className="text-lg text-text">Datos del servicio</h2>

        <Field label="Tipo de servicio">
          <select
            value={catalogItemId}
            onChange={(event) => handleCatalogChange(event.target.value)}
            className={inputClass}
          >
            <option value="">Sin seleccionar</option>
            {catalogItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.serviceType} — {formatCurrency(item.basePrice)}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Mano de obra">
          <input
            type="number"
            min={0}
            value={laborCost}
            onChange={(event) => setLaborCost(event.target.value)}
            className={inputClass}
          />
        </Field>

        <div className="border-t border-panel-border pt-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-text-muted">
              Materiales
            </h3>
            <Button variant="secondary" onClick={addMaterial} className="px-2 py-1 text-xs">
              <Plus className="size-3.5" />
              Agregar material
            </Button>
          </div>

          {materials.length === 0 ? (
            <p className="font-mono text-xs text-text-faint">No se han agregado materiales.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {materials.map((row) => (
                <div key={row.id} className="flex items-center gap-2">
                  <input
                    value={row.description}
                    onChange={(event) =>
                      updateMaterial(row.id, { description: event.target.value })
                    }
                    className={cn('flex-1', rowInputClass)}
                    placeholder="Descripción"
                  />
                  <input
                    type="number"
                    min={0}
                    value={row.cost}
                    onChange={(event) => updateMaterial(row.id, { cost: event.target.value })}
                    className={cn('w-32', rowInputClass)}
                    placeholder="Costo"
                  />
                  <button
                    onClick={() => removeMaterial(row.id)}
                    title="Quitar material"
                    className="rounded-sm p-2 text-text-muted transition-colors hover:bg-surface hover:text-danger"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Field label="Margen de ganancia (%)">
          <input
            type="number"
            min={0}
            value={marginPercent}
            onChange={(event) => setMarginPercent(event.target.value)}
            className={inputClass}
          />
        </Field>
      </Panel>

      <Panel className="flex h-fit flex-col gap-4 p-5">
        <h2 className="text-lg text-text">Resultado</h2>

        {isZeroState ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <div className="flex size-14 items-center justify-center rounded-full border border-panel-border bg-metal text-accent">
              <Calculator className="size-6" />
            </div>
            <p className="max-w-xs font-mono text-sm text-text-muted">
              Selecciona un tipo de servicio o agrega materiales para ver el cálculo.
            </p>
          </div>
        ) : (
          <>
            {materials.length > 0 && (
              <div className="flex flex-col gap-1.5 border-b border-panel-border pb-3">
                <span className="font-mono text-xs uppercase tracking-wide text-text-muted">
                  Materiales
                </span>
                {materials.map((row) => (
                  <div key={row.id} className="flex items-center justify-between font-mono text-sm">
                    <span className="text-text-muted">{row.description || 'Sin descripción'}</span>
                    <span className="text-text">{formatCurrency(Number(row.cost) || 0)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <ResultRow label="Costo de materiales" value={formatCurrency(materialsCost)} />
              <ResultRow label="Mano de obra" value={formatCurrency(laborCostNumber)} />
              <ResultRow label="Subtotal" value={formatCurrency(subtotal)} />
              {marginAmount > 0 && (
                <ResultRow
                  label={`Margen (${marginPercentNumber}%)`}
                  value={formatCurrency(marginAmount)}
                  tone="warning"
                />
              )}
            </div>

            <div className="border-t border-panel-border pt-4">
              <span className="font-mono text-xs uppercase tracking-wide text-text-muted">
                Total a cobrar
              </span>
              <div className="font-mono text-3xl font-bold text-accent">
                {formatCurrency(total)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-panel-border pt-4">
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-xs uppercase tracking-wide text-text-muted">
                  Ganancia neta
                </span>
                <span className="font-mono text-lg font-semibold text-revenue">
                  {formatCurrency(netProfit)}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-xs uppercase tracking-wide text-text-muted">
                  % de ganancia
                </span>
                <span className="font-mono text-lg font-semibold text-revenue">
                  {profitPercentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </>
        )}
      </Panel>
    </div>
  );
}
