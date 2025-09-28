import { cloudStorageAdapter } from "./cloud";
import { localStorageAdapter } from "./local";
import { StorageAdapter } from "@/types/storage";

export function createStorageAdapter(isAuthenticated: boolean): StorageAdapter {
  return isAuthenticated ? cloudStorageAdapter : localStorageAdapter;
}

export { localStorageAdapter, cloudStorageAdapter };
