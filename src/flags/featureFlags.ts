/**
 * Feature Flag 시스템
 * 환경변수 또는 원격 설정으로 기능 토글 관리
 */

type FlagName = 'STEALTH';

interface FlagValue {
  enabled: boolean;
  config?: Record<string, any>;
}

// 플래그 기본값 (기본적으로 모두 off)
const defaultFlags: Record<FlagName, FlagValue> = {
  STEALTH: {
    enabled: false,
  },
};

// 환경변수에서 플래그 읽기
function getFlagFromEnv(flagName: FlagName): boolean {
  const envKey = `FEATURE_${flagName}`;
  const envValue = import.meta.env[envKey] || import.meta.env[`VITE_${envKey}`];
  
  if (envValue === 'true' || envValue === '1') {
    return true;
  }
  if (envValue === 'false' || envValue === '0') {
    return false;
  }
  
  return defaultFlags[flagName].enabled;
}

// 로컬 스토리지에서 플래그 읽기 (개발/테스트용)
function getFlagFromLocalStorage(flagName: FlagName): boolean | null {
  try {
    const stored = localStorage.getItem(`feature:${flagName}`);
    if (stored === 'true') return true;
    if (stored === 'false') return false;
  } catch {
    // localStorage 접근 불가 시 null 반환
  }
  return null;
}

/**
 * 특정 플래그의 활성화 여부 확인
 */
export function getFlag(flagName: FlagName): boolean {
  // 1. 로컬 스토리지 우선 (개발/테스트용)
  const localValue = getFlagFromLocalStorage(flagName);
  if (localValue !== null) {
    return localValue;
  }
  
  // 2. 환경변수 확인
  const envValue = getFlagFromEnv(flagName);
  if (envValue !== defaultFlags[flagName].enabled) {
    return envValue;
  }
  
  // 3. 기본값 반환
  return defaultFlags[flagName].enabled;
}

/**
 * 플래그 설정값 전체 반환 (설정 포함)
 */
export function getFlagConfig(flagName: FlagName): FlagValue {
  const enabled = getFlag(flagName);
  return {
    ...defaultFlags[flagName],
    enabled,
  };
}

/**
 * 로컬 스토리지에 플래그 설정 (개발/테스트용)
 * 실제 운영에서는 환경변수 또는 원격 설정 사용
 */
export function setFlag(flagName: FlagName, enabled: boolean): void {
  try {
    localStorage.setItem(`feature:${flagName}`, enabled ? 'true' : 'false');
    // 설정 변경 이벤트 발행 (필요시)
    window.dispatchEvent(new CustomEvent('featureFlagChanged', {
      detail: { flagName, enabled },
    }));
  } catch (error) {
    console.warn(`Failed to set feature flag ${flagName}:`, error);
  }
}

/**
 * 플래그 변경 리스너 등록
 */
export function subscribe(
  flagName: FlagName,
  callback: (enabled: boolean) => void
): () => void {
  const handler = (event: CustomEvent) => {
    if (event.detail?.flagName === flagName) {
      callback(event.detail.enabled);
    }
  };
  
  window.addEventListener('featureFlagChanged', handler as EventListener);
  
  // 초기값 전달
  callback(getFlag(flagName));
  
  // 구독 해제 함수 반환
  return () => {
    window.removeEventListener('featureFlagChanged', handler as EventListener);
  };
}

/**
 * 모든 플래그 상태 확인 (디버깅용)
 */
export function getAllFlags(): Record<FlagName, boolean> {
  const flags = Object.keys(defaultFlags) as FlagName[];
  return flags.reduce((acc, flagName) => {
    acc[flagName] = getFlag(flagName);
    return acc;
  }, {} as Record<FlagName, boolean>);
}

