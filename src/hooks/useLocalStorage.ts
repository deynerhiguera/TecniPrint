import { useCallback, useEffect, useRef, useState } from 'react';
import { readStorage, writeStorage } from '@/lib/storage';

type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();

function subscribe(name: string, listener: Listener): () => void {
  let set = listeners.get(name);
  if (!set) {
    set = new Set();
    listeners.set(name, set);
  }
  set.add(listener);
  return () => set.delete(listener);
}

function notify(name: string): void {
  listeners.get(name)?.forEach((listener) => listener());
}

export function useLocalStorage<T>(name: string, fallback: T) {
  const [value, setValue] = useState<T>(() => readStorage(name, fallback));
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    return subscribe(name, () => {
      const next = readStorage(name, fallback);
      valueRef.current = next;
      setValue(next);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  const setAndPersist = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved = typeof next === 'function' ? (next as (prev: T) => T)(valueRef.current) : next;
      writeStorage(name, resolved);
      valueRef.current = resolved;
      setValue(resolved);
      notify(name);
    },
    [name],
  );

  return [value, setAndPersist] as const;
}
