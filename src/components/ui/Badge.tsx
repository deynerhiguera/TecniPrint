import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
}

const toneClasses: Record<NonNullable<BadgeProps['tone']>, string> = {
  neutral: 'bg-metal text-text-muted border-panel-border',
  accent: 'bg-accent/15 text-accent border-accent/40',
  success: 'bg-revenue/15 text-revenue border-revenue/40',
  warning: 'bg-warning/15 text-warning border-warning/40',
  danger: 'bg-danger/15 text-danger border-danger/40',
};

export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5',
        'font-mono text-xs uppercase tracking-wide',
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
