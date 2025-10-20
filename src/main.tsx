
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { connectEmulatorsIfDev } from "./firebase/emulators";
import { validateEnvAtRuntime } from "./utils/envValidation";

// 환경변수 검증
validateEnvAtRuntime();

// 개발 환경에서 에뮬레이터 연결
connectEmulatorsIfDev();

// Service Worker 등록 (오프라인 지원)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
  