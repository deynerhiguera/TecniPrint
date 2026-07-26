import { useMemo, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Wrench, Printer, ArrowUpRight, CalendarDays } from 'lucide-react';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useServices } from '@/hooks/useServices';
import { useClients } from '@/hooks/useClients';
import { cn } from '@/lib/cn';
import { formatCurrency, parseLocalDate } from '@/lib/format';
import { SERVICE_STATUS_LABEL, SERVICE_STATUS_TONE } from '@/lib/serviceStatus';
import type { ServiceRecord } from '@/types';

const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

interface CalendarPageProps {
  onSelectClient: (clientId: string) => void;
}

export function CalendarPage({ onSelectClient }: CalendarPageProps) {
  const { items: services } = useServices();
  const { items: clients } = useClients();

  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const clientsById = useMemo(
    () => new Map(clients.map((client) => [client.id, client])),
    [clients],
  );

  const servicesByDate = useMemo(() => {
    const map = new Map<string, ServiceRecord[]>();
    for (const service of services) {
      const list = map.get(service.date) ?? [];
      list.push(service);
      map.set(service.date, list);
    }
    return map;
  }, [services]);

  const monthServicesCount = useMemo(
    () =>
      services.filter((service) => isSameMonth(parseLocalDate(service.date), currentMonth)).length,
    [services, currentMonth],
  );

  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });
  const leadingBlanks = getDay(startOfMonth(currentMonth));
  const monthLabel = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' }).format(
    currentMonth,
  );

  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentMonth(startOfMonth(new Date()));
    setSelectedDate(null);
  };

  const handleSelectDay = (day: Date) => {
    setSelectedDate((prev) => (prev && isSameDay(prev, day) ? null : day));
  };

  const selectedDayServices = selectedDate
    ? (servicesByDate.get(format(selectedDate, 'yyyy-MM-dd')) ?? [])
    : [];

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Panel className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            title="Mes anterior"
            className="rounded-sm p-2 text-text-muted transition-colors hover:bg-surface-raised hover:text-text"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            onClick={goToNextMonth}
            title="Mes siguiente"
            className="rounded-sm p-2 text-text-muted transition-colors hover:bg-surface-raised hover:text-text"
          >
            <ChevronRight className="size-5" />
          </button>
          <Button variant="secondary" onClick={goToToday} className="ml-2 px-3 py-1.5 text-xs">
            Hoy
          </Button>
        </div>
        <h1 className="font-heading text-2xl font-bold uppercase tracking-wide text-text">
          {monthLabel}
        </h1>
        <div className="flex items-center gap-2 font-mono text-sm text-text-muted">
          <Wrench className="size-4 text-accent" />
          {monthServicesCount} servicio{monthServicesCount === 1 ? '' : 's'} este mes
        </div>
      </Panel>

      <Panel className="flex-1 p-4">
        <div className="grid grid-cols-7 gap-2">
          {DAY_LABELS.map((label) => (
            <div
              key={label}
              className="pb-2 text-center font-mono text-xs uppercase tracking-wide text-text-muted"
            >
              {label}
            </div>
          ))}

          {Array.from({ length: leadingBlanks }).map((_, index) => (
            <div key={`blank-${index}`} className="min-h-24 rounded-sm" />
          ))}

          {monthDays.map((day) => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const dayServices = servicesByDate.get(dayKey) ?? [];
            const hasServices = dayServices.length > 0;
            const isSelected = selectedDate !== null && isSameDay(day, selectedDate);
            const today = isToday(day);

            return (
              <button
                key={dayKey}
                onClick={() => handleSelectDay(day)}
                disabled={!hasServices}
                className={cn(
                  'flex min-h-24 flex-col items-start gap-1 rounded-sm border p-2 text-left transition-colors',
                  today ? 'border-accent' : 'border-panel-border',
                  hasServices
                    ? 'cursor-pointer bg-surface-raised hover:border-accent/60'
                    : 'cursor-default bg-transparent',
                  isSelected && 'ring-1 ring-accent',
                )}
              >
                <span
                  className={cn(
                    'font-mono text-xs',
                    today ? 'font-semibold text-accent' : 'text-text-muted',
                  )}
                >
                  {format(day, 'd')}
                </span>
                <div className="flex w-full flex-col gap-1">
                  {dayServices.slice(0, 2).map((service) => (
                    <span
                      key={service.id}
                      className="block w-full truncate rounded-sm bg-accent/15 px-1.5 py-0.5 text-[10px] text-accent"
                    >
                      {clientsById.get(service.clientId)?.name ?? 'Cliente'}
                    </span>
                  ))}
                  {dayServices.length > 2 && (
                    <span className="font-mono text-[10px] text-text-faint">
                      +{dayServices.length - 2} más
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {monthServicesCount === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 pt-10 text-center">
            <div className="flex size-14 items-center justify-center rounded-full border border-panel-border bg-metal text-accent">
              <CalendarDays className="size-6" />
            </div>
            <p className="max-w-sm font-mono text-sm text-text-muted">
              No hay servicios agendados este mes.
            </p>
          </div>
        )}
      </Panel>

      {selectedDate && selectedDayServices.length > 0 && (
        <Panel className="flex flex-col gap-3 p-4">
          <h2 className="text-lg text-text">
            {new Intl.DateTimeFormat('es-CO', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }).format(selectedDate)}
          </h2>
          <div className="flex flex-col gap-2">
            {selectedDayServices.map((service) => {
              const client = clientsById.get(service.clientId);
              const machine = client?.machines[0];
              return (
                <div
                  key={service.id}
                  className="flex items-center justify-between rounded-sm border border-panel-border bg-surface-raised px-4 py-3"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-heading text-base font-semibold text-text">
                      {client?.name ?? 'Cliente eliminado'}
                    </span>
                    {machine && (
                      <span className="flex items-center gap-1.5 font-mono text-xs text-text-muted">
                        <Printer className="size-3.5 text-text-faint" />
                        {machine.brand} {machine.model}
                      </span>
                    )}
                    <span className="font-mono text-xs text-text-muted">{service.serviceType}</span>
                    <Badge tone={SERVICE_STATUS_TONE[service.status]} className="w-fit">
                      {SERVICE_STATUS_LABEL[service.status]}
                    </Badge>
                  </div>
                  <div className="flex flex-col items-end gap-1 font-mono text-xs text-text-muted">
                    <span>Materiales: {formatCurrency(service.materialsCost)}</span>
                    <span>Mano de obra: {formatCurrency(service.laborCost)}</span>
                    <span className="text-sm font-semibold text-text">
                      Total: {formatCurrency(service.total)}
                    </span>
                    {client && (
                      <Button
                        variant="secondary"
                        onClick={() => onSelectClient(client.id)}
                        className="mt-1 px-2 py-1 text-xs"
                      >
                        <ArrowUpRight className="size-3.5" />
                        Ver cliente
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      )}
    </div>
  );
}
