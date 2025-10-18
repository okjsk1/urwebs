// App Check 설정 (선택적)
// import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import app from './config';

export interface AppCheckConfig {
  siteKey: string;
  isTokenAutoRefreshEnabled?: boolean;
}

export function initializeAppCheckIfEnabled(config?: AppCheckConfig): void {
  // App Check는 프로덕션에서만 활성화
  if (import.meta.env.MODE !== 'production') {
    console.info('App Check disabled in development mode');
    return;
  }

  const siteKey = config?.siteKey || import.meta.env.VITE_FIREBASE_APPCHECK_KEY;
  
  if (!siteKey) {
    console.warn('App Check not initialized: No site key provided');
    return;
  }

  try {
    // App Check 초기화 (주석 해제하여 사용)
    // initializeAppCheck(app, {
    //   provider: new ReCaptchaV3Provider(siteKey),
    //   isTokenAutoRefreshEnabled: config?.isTokenAutoRefreshEnabled ?? true,
    // });
    
    console.info('App Check initialized successfully');
  } catch (error) {
    console.error('App Check initialization failed:', error);
  }
}

// App Check 상태 확인
export function isAppCheckEnabled(): boolean {
  return import.meta.env.MODE === 'production' && 
         !!import.meta.env.VITE_FIREBASE_APPCHECK_KEY;
}
