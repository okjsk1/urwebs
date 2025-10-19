// 인증 및 권한 관리 유틸리티
import { onAuthStateChanged, getIdTokenResult, User } from 'firebase/auth';
import { auth } from '../firebase/config';

export interface AuthResult {
  ok: boolean;
  reason?: 'no-auth' | 'no-roles' | 'insufficient-permissions';
  roles?: string[];
  user?: User | null;
}

export interface RoleCheckResult {
  hasRole: boolean;
  roles: string[];
  user: User | null;
}

// 특정 역할이 필요한 기능에 대한 권한 확인
export async function requireRole(allowedRoles: string[]): Promise<AuthResult> {
  const user = auth.currentUser;
  
  if (!user) {
    return { ok: false, reason: 'no-auth', user: null };
  }

  try {
    const token = await getIdTokenResult(user);
    const roles: string[] = token.claims.roles || [];
    
    // 이메일 기반 관리자 확인 추가
    const isEmailAdmin = user.email === 'okjsk1@gmail.com';
    
    // 역할 기반 권한 확인
    const hasRolePermission = roles.length > 0 && allowedRoles.some(role => roles.includes(role));
    
    // 이메일 기반 관리자 권한 확인 (admin 또는 ops 역할이 필요한 경우)
    const hasEmailPermission = isEmailAdmin && (allowedRoles.includes('admin') || allowedRoles.includes('ops'));
    
    const hasPermission = hasRolePermission || hasEmailPermission;
    
    console.log('권한 확인 상세:', {
      userEmail: user.email,
      roles,
      isEmailAdmin,
      hasRolePermission,
      hasEmailPermission,
      hasPermission,
      allowedRoles
    });
    
    if (!hasPermission) {
      return { ok: false, reason: roles.length === 0 ? 'no-roles' : 'insufficient-permissions', roles, user };
    }
    
    return { 
      ok: true,
      roles: isEmailAdmin ? ['admin', ...roles] : roles, 
      user 
    };
  } catch (error) {
    console.error('권한 확인 중 오류:', error);
    return { ok: false, reason: 'no-roles', user };
  }
}

// 관리자 권한 확인 (admin 또는 ops 역할)
export async function requireAdmin(): Promise<AuthResult> {
  return requireRole(['admin', 'ops']);
}

// 슈퍼 관리자 권한 확인 (admin 역할만)
export async function requireSuperAdmin(): Promise<AuthResult> {
  return requireRole(['admin']);
}

// 사용자 역할 확인
export async function checkUserRoles(): Promise<RoleCheckResult> {
  const user = auth.currentUser;
  
  if (!user) {
    return { hasRole: false, roles: [], user: null };
  }

  try {
    const token = await getIdTokenResult(user);
    const roles: string[] = token.claims.roles || [];
    
    // 이메일 기반 관리자 확인 추가
    const isEmailAdmin = user.email === 'okjsk1@gmail.com';
    const finalRoles = isEmailAdmin ? ['admin', ...roles] : roles;
    
    return { 
      hasRole: finalRoles.length > 0, 
      roles: finalRoles, 
      user 
    };
  } catch (error) {
    console.error('역할 확인 중 오류:', error);
    return { hasRole: false, roles: [], user };
  }
}

// 인증 상태 변경 감지
export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// 권한 기반 탭 필터링
export function filterTabsByRole<T extends { requiredRoles?: string[] }>(
  tabs: T[], 
  userRoles: string[]
): T[] {
  return tabs.filter(tab => 
    !tab.requiredRoles || 
    tab.requiredRoles.some(role => userRoles.includes(role))
  );
}

// 권한 거부 로깅
export function logAccessDenied(
  resource: string, 
  userEmail: string | null, 
  userRoles: string[], 
  requiredRoles: string[]
) {
  const logData = {
    timestamp: new Date().toISOString(),
    event: 'access_denied',
    resource,
    userEmail,
    userRoles,
    requiredRoles,
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  console.warn('접근 거부:', logData);
  
  // 실제 운영 환경에서는 Analytics나 Audit 서비스로 전송
  // analytics.track('access_denied', logData);
}

// 권한 승인 로깅
export function logAccessGranted(
  resource: string, 
  userEmail: string | null, 
  userRoles: string[]
) {
  const logData = {
    timestamp: new Date().toISOString(),
    event: 'access_granted',
    resource,
    userEmail,
    userRoles,
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  console.log('접근 승인:', logData);
  
  // 실제 운영 환경에서는 Analytics나 Audit 서비스로 전송
  // analytics.track('access_granted', logData);
}


