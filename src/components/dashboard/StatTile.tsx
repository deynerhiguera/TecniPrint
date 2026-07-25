import type { ReactNode } from 'react';
import { Panel } from '@/components/ui/Panel';
import { cn } from '@/lib/cn';

interface StatTileProps {
  label: string;
  value: string;
  icon: ReactNode;
  tone?: 'neutral' | 'accent' | 'revenue' | 'warning';
}

const toneClasses: Record<NonNullable<StatTileProps['tone']>, string> = {
  neutral: 'text-text',
  accent: 'text-accent',
  revenue: 'text-revenue',
  warning: 'text-warning',
};

const iconWrapClasses: Record<NonNullable<StatTileProps['tone']>, string> = {
  neutral: 'bg-metal text-text-muted',
  accent: 'bg-accent/10 text-accent',
  revenue: 'bg-revenue/10 text-revenue',
  warning: 'bg-warning/10 text-warning',
};

export function StatTile({ label, value, icon, tone = 'neutral' }: StatTileProps) {
  return (
    <Panel className="flex items-center gap-4 p-4">
      <div
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-sm',
          iconWrapClasses[tone],
        )}
      >
        {icon}
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="font-mono text-xs uppercase tracking-wide text-text-muted">{label}</span>
        <span className={cn('font-mono text-2xl font-semibold', toneClasses[tone])}>{value}</span>
      </div>
    </Panel>
  );
}
