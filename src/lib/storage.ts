const NAMESPACE = 'tallerpro';

export function storageKey(name: string): string {
  return `${NAMESPACE}:${name}`;
}

export function readStorage<T>(name: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(storageKey(name));
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(name: string, value: T): void {
  localStorage.setItem(storageKey(name), JSON.stringify(value));
}
