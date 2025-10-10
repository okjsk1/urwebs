import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase 설정
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Authentication 인스턴스
export const auth = getAuth(app);

// 브라우저 세션이 끝나면 로그아웃되도록 설정 (새로고침은 유지, 브라우저 닫으면 로그아웃)
setPersistence(auth, browserSessionPersistence).catch((error) => {
  console.error('Firebase persistence 설정 실패:', error);
});

// Firestore 인스턴스
export const db = getFirestore(app);

// Google 로그인 provider
export const googleProvider = new GoogleAuthProvider();
// 항상 계정 선택 창 표시
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;

