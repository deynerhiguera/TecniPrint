import { useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface Identifiable {
  id: string;
}

export function useCollection<T extends Identifiable>(name: string, seed: T[] = []) {
  const [items, setItems] = useLocalStorage<T[]>(name, seed);

  const add = useCallback(
    (item: T) => setItems((prev) => [...prev, item]),
    [setItems],
  );

  const update = useCallback(
    (id: string, patch: Partial<T>) =>
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item))),
    [setItems],
  );

  const remove = useCallback(
    (id: string) => setItems((prev) => prev.filter((item) => item.id !== id)),
    [setItems],
  );

  const get = useCallback((id: string) => items.find((item) => item.id === id), [items]);

  return { items, setItems, add, update, remove, get };
}
