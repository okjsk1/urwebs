// src/firebase.js

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAyd8HeAdXA...ZcmrWB_84ZACUS7O9lXJs", // 여기에 웹 API 키를 입력
  authDomain: "urwebs-3f562.firebaseapp.com",
  projectId: "urwebs-3f562", // 여기에 프로젝트 ID를 입력
  storageBucket: "urwebs-3f562.appspot.com",
  messagingSenderId: "1017628927752", // 여기에 프로젝트 번호를 입력
  appId: "1:1017628927752:web:caf186d8ace8282810aebd",
  measurementId: "G-BT50LLBYE2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };