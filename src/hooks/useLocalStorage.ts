import { useEffect, useState } from 'react';
import { readStorage, writeStorage } from '@/lib/storage';

export function useLocalStorage<T>(name: string, fallback: T) {
  const [value, setValue] = useState<T>(() => readStorage(name, fallback));

  useEffect(() => {
    writeStorage(name, value);
  }, [name, value]);

  return [value, setValue] as const;
}
