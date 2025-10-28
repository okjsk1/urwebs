import { useState, useEffect } from 'react';

type PersistOptions<T> = { key: string; initialValue: T };

export function usePersist<T>(key: string, initialValue: T): readonly [T, React.Dispatch<React.SetStateAction<T>>];
export function usePersist<T>(options: PersistOptions<T>): readonly [T, React.Dispatch<React.SetStateAction<T>>];
export function usePersist<T>(keyOrOptions: string | PersistOptions<T>, maybeInitialValue?: T) {
  const key = typeof keyOrOptions === 'string' ? keyOrOptions : keyOrOptions.key;
  const initialValue = (typeof keyOrOptions === 'string' ? maybeInitialValue : keyOrOptions.initialValue) as T;

  const [state, setState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      const parsed = item ? JSON.parse(item) : undefined;
      return (parsed === undefined ? initialValue : parsed) as T;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue as T;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState] as const;
}