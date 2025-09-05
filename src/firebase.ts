// Firebase initialization

// Core
import { initializeApp, getApp, getApps } from "firebase/app";
// Auth
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// Firestore
import { initializeFirestore } from "firebase/firestore";
// (optional) Analytics
import { getAnalytics } from "firebase/analytics";

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
