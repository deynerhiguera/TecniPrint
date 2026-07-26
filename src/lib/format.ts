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

// Dates in this app are calendar-day identifiers ('YYYY-MM-DD', sometimes dressed up as a
// 'T00:00:00.000Z' ISO string) — never a real moment in time. Parsing them with `new Date(str)`
// reads the date-only form as UTC midnight, which in a negative-UTC-offset timezone (Bogotá,
// this app's own locale) silently shifts every date back one calendar day. Always go through
// this instead of `new Date(isoDate)` when the value represents a calendar day.
export function parseLocalDate(isoDate: string): Date {
  const [year, month, day] = isoDate.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDate(isoDate: string): string {
  return dateFormatter.format(parseLocalDate(isoDate));
}
