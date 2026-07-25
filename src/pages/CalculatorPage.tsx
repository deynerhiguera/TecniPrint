import { Calculator } from 'lucide-react';
import { PlaceholderPage } from '@/components/layout/PlaceholderPage';

export function CalculatorPage() {
  return (
    <PlaceholderPage
      icon={<Calculator className="size-6" />}
      title="Calculadora de costos y ganancias"
      description="Aquí irá el cálculo de materiales, mano de obra, total y margen de ganancia por servicio."
    />
  );
}
