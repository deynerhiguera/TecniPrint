import type { ReactNode } from 'react';
import { Panel } from '@/components/ui/Panel';

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: ReactNode;
}

export function PlaceholderPage({ title, description, icon }: PlaceholderPageProps) {
  return (
    <Panel className="flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center">
      <div className="flex size-14 items-center justify-center rounded-full border border-panel-border bg-metal text-accent">
        {icon}
      </div>
      <h2 className="text-2xl text-text">{title}</h2>
      <p className="max-w-sm font-mono text-sm text-text-muted">{description}</p>
    </Panel>
  );
}
