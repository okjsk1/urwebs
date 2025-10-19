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
        console.log('사용자 이메일:', user.email);
        console.log('토큰 클레임:', tokenResult.claims);
        console.log('사용자 역할:', userRoles);
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

  const isEmailAdmin = auth.currentUser?.email === 'okjsk1@gmail.com' || auth.currentUser?.email === 'okjsk2@gmail.com';
  
  // 디버깅: 관리자 상태 확인
  console.log('관리자 상태 확인:');
  console.log('- 이메일 기반 관리자:', isEmailAdmin);
  console.log('- 역할 기반 관리자:', !!roles?.includes('admin'));
  console.log('- 최종 관리자 여부:', !!roles?.includes('admin') || isEmailAdmin);

  return {
    roles,
    isAdmin: !!roles?.includes('admin') || isEmailAdmin,
    isOps: !!roles?.includes('ops'),
    loading,
    error
  };
}


