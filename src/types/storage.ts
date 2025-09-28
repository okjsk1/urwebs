import { StarterPackTopic } from "./widgets";

export interface StarterPackState {
  topic: StarterPackTopic;
  widgetState: Record<string, unknown>;
}

export interface StorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  sync?(key: string, value: unknown): Promise<void>;
}
