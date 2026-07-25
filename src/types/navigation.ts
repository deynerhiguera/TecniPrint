export type Section = 'clients' | 'services' | 'reminders' | 'catalog' | 'calculator' | 'calendar';

export interface NavItem {
  id: Section;
  label: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'clients', label: 'Clientes' },
  { id: 'services', label: 'Historial de servicios' },
  { id: 'reminders', label: 'Recordatorios' },
  { id: 'catalog', label: 'Catálogo de precios' },
  { id: 'calculator', label: 'Calculadora' },
  { id: 'calendar', label: 'Calendario' },
];
