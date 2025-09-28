import { StorageAdapter } from "@/types/storage";

type MemoryStore = Record<string, unknown>;
const memoryStore: MemoryStore = {};

export const cloudStorageAdapter: StorageAdapter = {
  async get<T>(key: string) {
    return (memoryStore[key] as T | undefined) ?? null;
  },
  async set<T>(key: string, value: T) {
    memoryStore[key] = value;
  },
  async remove(key: string) {
    delete memoryStore[key];
  },
  async sync(key: string, value: unknown) {
    memoryStore[key] = value;
  },
};
