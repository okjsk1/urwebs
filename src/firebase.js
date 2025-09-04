// src/firebase.js

// Core
import { initializeApp, getApp, getApps } from "firebase/app";
// Auth
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// Firestore
import { initializeFirestore } from "firebase/firestore";
// (선택) Analytics
import { getAnalytics } from "firebase/analytics";

// ★ 하드코딩 값 (Firebase 콘솔 > 프로젝트 설정에서 복사한 값)
const firebaseConfig = {
  apiKey: "AIzaSyAyd8HeADxA__ZcmrWB_84ZACUS7O9lXJs",
  authDomain: "urwebs-3f562.firebaseapp.com",
  projectId: "urwebs-3f562",
  storageBucket: "urwebs-3f562.firebasestorage.app",
  messagingSenderId: "1017628927752",
  appId: "1:1017628927752:web:caf186d8ace8282810aebd",
  measurementId: "G-BT50LLBYE2",
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

// Analytics (브라우저 환경에서만, 선택)
let analytics = null;
if (typeof window !== "undefined") {
  try {
    analytics = getAnalytics(app);
  } catch {}
}

export { app, auth, provider, db, analytics };
