import { StorageAdapter } from "@/types/storage";

const isBrowser = typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export const localStorageAdapter: StorageAdapter = {
  async get<T>(key: string) {
    if (!isBrowser) return null;
    const value = window.localStorage.getItem(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.warn("Failed to parse local storage value", key, error);
      return null;
    }
  },
  async set<T>(key: string, value: T) {
    if (!isBrowser) return;
    window.localStorage.setItem(key, JSON.stringify(value));
  },
  async remove(key: string) {
    if (!isBrowser) return;
    window.localStorage.removeItem(key);
  },
};
