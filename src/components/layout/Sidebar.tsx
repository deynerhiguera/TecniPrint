import {
  LayoutDashboard,
  Users,
  Wrench,
  Bell,
  Tags,
  Calculator,
  CalendarDays,
  Cog,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { NAV_ITEMS, type Section } from '@/types/navigation';

const ICONS: Record<Section, typeof Users> = {
  dashboard: LayoutDashboard,
  clients: Users,
  services: Wrench,
  reminders: Bell,
  catalog: Tags,
  calculator: Calculator,
  calendar: CalendarDays,
};

interface SidebarProps {
  active: Section;
  onSelect: (section: Section) => void;
  reminderCount?: number;
}

export function Sidebar({ active, onSelect, reminderCount = 0 }: SidebarProps) {
  return (
    <aside className="panel panel-rivets flex w-60 shrink-0 flex-col gap-1 p-3">
      <div className="mb-3 flex items-center gap-2 px-1">
        <Cog className="size-6 text-accent" strokeWidth={2} />
        <span className="font-heading text-lg font-bold tracking-wide text-text">
          TECNI<span className="text-accent">PRINT</span>
        </span>
      </div>

      {NAV_ITEMS.map((item) => {
        const Icon = ICONS[item.id];
        const isActive = item.id === active;
        const isReminders = item.id === 'reminders';
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={cn(
              'flex items-center gap-3 rounded-sm border border-transparent px-3 py-2.5 text-left',
              'font-heading text-sm font-medium tracking-wide transition-colors',
              isActive
                ? 'border-accent/40 bg-accent/10 text-accent'
                : 'text-text-muted hover:bg-surface-raised hover:text-text',
            )}
          >
            <Icon className="size-4 shrink-0" strokeWidth={2} />
            <span className="flex-1">{item.label}</span>
            {isReminders && reminderCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-warning font-mono text-[11px] font-semibold text-[#161618]">
                {reminderCount}
              </span>
            )}
          </button>
        );
      })}
    </aside>
  );
}
