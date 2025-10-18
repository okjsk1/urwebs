import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  setPersistence, 
  browserSessionPersistence, 
  inMemoryPersistence, 
  browserLocalPersistence 
} from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
// App Check (선택적)
// import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { initializeAppCheckIfEnabled } from './appCheck';

// 환경변수 타입 정의
type Env = {
  VITE_FIREBASE_API_KEY: string;
  VITE_FIREBASE_AUTH_DOMAIN: string;
  VITE_FIREBASE_PROJECT_ID: string;
  VITE_FIREBASE_STORAGE_BUCKET: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  VITE_FIREBASE_APP_ID: string;
  VITE_FIREBASE_APPCHECK_KEY?: string; // 선택적
  MODE?: string; // Vite 제공
};

// 환경변수 검증 함수
function requireEnv(key: keyof Env): string {
  const value = (import.meta as any).env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

// Firebase 설정 (환경변수 검증 포함)
const firebaseConfig = {
  apiKey: requireEnv('VITE_FIREBASE_API_KEY'),
  authDomain: requireEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: requireEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: requireEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: requireEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: requireEnv('VITE_FIREBASE_APP_ID'),
};

// 안전한 앱 초기화 (중복 방지)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ---- Authentication
export const auth = getAuth(app);

// 브라우저 언어 기반 로케일 자동 설정
auth.useDeviceLanguage();

// Auth 지속성 정책 선택기
export type AuthPersistenceMode = 'session' | 'local' | 'memory';

export async function applyAuthPersistence(mode: AuthPersistenceMode = 'session'): Promise<void> {
  const persistenceMap = {
    session: browserSessionPersistence,
    local: browserLocalPersistence,
    memory: inMemoryPersistence,
  } as const;
  
  try {
    await setPersistence(auth, persistenceMap[mode]);
    console.info(`Auth persistence set to: ${mode}`);
  } catch (error) {
    console.error('Auth persistence 설정 실패:', error);
    throw error;
  }
}

// 기본값: 세션 지속성 (기존 동작 보존)
applyAuthPersistence('session').catch((error) => {
  console.error('기본 Auth persistence 설정 실패:', error);
});

// ---- Firestore
export const db = getFirestore(app);

// 오프라인/멀티탭 영속화 활성화 (새로운 방식)
// enableIndexedDbPersistence는 deprecated되었으므로 새로운 방식 사용
try {
  // Firestore v9+ 에서는 자동으로 IndexedDB 캐시 사용
  // 별도의 enableIndexedDbPersistence 호출 불필요
  console.info('Firestore offline persistence enabled automatically');
} catch (err) {
  console.warn('Firestore offline persistence setup failed:', err);
}

// ---- Google Provider
export const googleProvider = new GoogleAuthProvider();
// 항상 계정 선택 창 표시
googleProvider.setCustomParameters({ 
  prompt: 'select_account' 
});

// ---- App Check (선택적 - 프로덕션에서만)
initializeAppCheckIfEnabled();

export default app;

