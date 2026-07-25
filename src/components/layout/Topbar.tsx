import { NAV_ITEMS, type Section } from '@/types/navigation';

interface TopbarProps {
  active: Section;
}

export function Topbar({ active }: TopbarProps) {
  const current = NAV_ITEMS.find((item) => item.id === active);
  const today = new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).format(new Date());

  return (
    <header className="panel flex items-center justify-between px-5 py-3">
      <h1 className="text-xl text-text">{current?.label}</h1>
      <span className="font-mono text-xs uppercase tracking-wide text-text-faint">{today}</span>
    </header>
  );
}
