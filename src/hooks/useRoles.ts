// 사용자 역할 관리 훅
import { useEffect, useState } from 'react';
import { onAuthStateChanged, getIdTokenResult } from 'firebase/auth';
import { auth } from '../firebase/config';

export interface UseRolesResult {
  roles: string[] | null;
  isAdmin: boolean;
  isOps: boolean;
  loading: boolean;
  error: string | null;
}

export function useRoles(): UseRolesResult {
  const [roles, setRoles] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setRoles([]);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        const tokenResult = await getIdTokenResult(user);
        const userRoles = (tokenResult.claims.roles as string[]) || [];
        setRoles(userRoles);
        setError(null);
      } catch (err) {
        console.error('역할 확인 실패:', err);
        setError(err instanceof Error ? err.message : '역할 확인 실패');
        setRoles([]);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return {
    roles,
    isAdmin: !!roles?.includes('admin'),
    isOps: !!roles?.includes('ops'),
    loading,
    error
  };
}
<<<<<<< HEAD
=======


>>>>>>> f18eacae9db3a659b475638dca7b7d0b0ae30bd6
