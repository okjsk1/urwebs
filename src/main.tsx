
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { connectEmulatorsIfDev } from "./firebase/emulators";
import { validateEnvAtRuntime } from "./utils/envValidation";

// 환경변수 검증
validateEnvAtRuntime();

// 개발 환경에서 에뮬레이터 연결
connectEmulatorsIfDev();

// Service Worker 제거 (캐시 문제 해결)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
      console.log('Service Worker unregistered');
    }
  });
  
  // 모든 캐시 삭제
  if ('caches' in window) {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    });
  }
}

createRoot(document.getElementById("root")!).render(<App />);
  