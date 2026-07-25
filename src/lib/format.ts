// Adjust locale/currency to match where the shop operates.
const CURRENCY_LOCALE = 'es-CO';
const CURRENCY_CODE = 'COP';

const currencyFormatter = new Intl.NumberFormat(CURRENCY_LOCALE, {
  style: 'currency',
  currency: CURRENCY_CODE,
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat(CURRENCY_LOCALE, {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate));
}
