// Auth 지속성 관리 훅
import { useEffect, useState } from 'react';
import { applyAuthPersistence, AuthPersistenceMode } from '../firebase/config';

export interface UseAuthPersistenceResult {
  currentMode: AuthPersistenceMode | null;
  isLoading: boolean;
  error: string | null;
  setPersistence: (mode: AuthPersistenceMode) => Promise<void>;
}

export function useAuthPersistence(): UseAuthPersistenceResult {
  const [currentMode, setCurrentMode] = useState<AuthPersistenceMode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setPersistence = async (mode: AuthPersistenceMode): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await applyAuthPersistence(mode);
      setCurrentMode(mode);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '지속성 설정 실패';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 모드 확인 (기본값: session)
  useEffect(() => {
    setCurrentMode('session');
  }, []);

  return {
    currentMode,
    isLoading,
    error,
    setPersistence
  };
}

