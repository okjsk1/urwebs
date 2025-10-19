// Firebase 에뮬레이터 연결 (개발 환경에서만)
import { connectFirestoreEmulator } from 'firebase/firestore';
import { connectAuthEmulator } from 'firebase/auth';
import { db, auth } from './config';

export function connectEmulatorsIfDev(): void {
  if (import.meta.env.MODE === 'development') {
    try {
      // Firestore 에뮬레이터 연결 (중복 연결 방지)
      if (db && db._delegate && db._delegate._databaseId && !db._delegate._databaseId.projectId.includes('demo-')) {
        connectFirestoreEmulator(db, 'localhost', 8080);
      }
      
      // Auth 에뮬레이터 연결 (중복 연결 방지)
      if (auth && auth.config && !auth.config.emulator) {
        connectAuthEmulator(auth, 'http://localhost:9099', { 
          disableWarnings: true 
        });
      }
      
      console.info('🔥 Firebase emulators connected');
      console.info('  - Firestore: localhost:8080');
      console.info('  - Auth: localhost:9099');
    } catch (error) {
      // 이미 연결된 경우 등 예외 상황
      if (error instanceof Error && error.message.includes('already been started')) {
        console.info('🔥 Firebase emulators already connected');
      } else {
        console.warn('Firebase emulator connection failed:', error);
      }
    }
  }
}

// 에뮬레이터 상태 확인
export function isEmulatorMode(): boolean {
  return import.meta.env.MODE === 'development';
}
