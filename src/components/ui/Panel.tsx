import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  rivets?: boolean;
}

export function Panel({ rivets = true, className, children, ...props }: PanelProps) {
  return (
    <div className={cn('panel', rivets && 'panel-rivets', className)} {...props}>
      {children}
    </div>
  );
}
