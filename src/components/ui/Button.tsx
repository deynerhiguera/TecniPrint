import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-accent text-[#161618] hover:bg-accent-hover border-accent',
  secondary: 'bg-surface-raised text-text hover:bg-metal-light border-panel-border',
  ghost: 'bg-transparent text-text-muted hover:text-text border-transparent',
  danger: 'bg-danger/90 text-text hover:bg-danger border-danger',
};

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-sm border px-3 py-2',
        'font-heading text-sm font-semibold uppercase tracking-wide transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-40',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
