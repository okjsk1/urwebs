// Firebase initialization using environment variables

// Core
import { initializeApp, getApp, getApps } from "firebase/app";
// Auth
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// Firestore
import { initializeFirestore } from "firebase/firestore";
// (선택) Analytics
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// 앱(중복 초기화 방지)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ✅ WebChannel 이슈 우회(400 에러 방지에 도움)
const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  useFetchStreams: false,
});

// Auth
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// (optional) Analytics - only in browser
let analytics = null;
if (typeof window !== "undefined") {
  try {
    analytics = getAnalytics(app);
  } catch {
    // ignore
  }
}

export { app, auth, provider, db, analytics };
