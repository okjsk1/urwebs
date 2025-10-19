# Firebase 설정 및 운영 가이드

## 🔧 환경변수 설정

### 필수 환경변수
```bash
# .env 파일에 다음 변수들을 설정하세요
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 선택적 환경변수
```bash
# App Check (프로덕션에서 봇 방어용)
VITE_FIREBASE_APPCHECK_KEY=your_recaptcha_site_key
```

## 🛡️ 보안 설정

### 1. Auth 지속성 정책
```typescript
import { applyAuthPersistence } from './firebase/config';

// 보안 민감 페이지 (관리자 등)
await applyAuthPersistence('session'); // 브라우저 닫으면 로그아웃

// 일반 사용자 편의
await applyAuthPersistence('local'); // 로컬에 저장

// 최고 보안 (메모리만)
await applyAuthPersistence('memory'); // 페이지 새로고침 시 로그아웃
```

### 2. Custom Claims 설정
Firebase Admin SDK로 사용자 역할 설정:
```javascript
// Firebase Functions 또는 Admin SDK
const admin = require('firebase-admin');

await admin.auth().setCustomUserClaims(uid, {
  roles: ['admin', 'ops']
});
```

### 3. Firestore 보안 규칙
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 관리자만 접근 가능
    match /admin/{document} {
      allow read, write: if request.auth != null && 
        request.auth.token.roles.hasAny(['admin', 'ops']);
    }
    
    // 사용자 데이터
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
  }
}
```

## 🚀 개발 환경

### 에뮬레이터 사용
```bash
# Firebase CLI 설치
npm install -g firebase-tools

# 에뮬레이터 시작
firebase emulators:start

# 개발 서버 시작 (에뮬레이터 자동 연결)
npm run dev
```

### 환경변수 검증
```bash
# 빌드 전 환경변수 검증
npm run validate-env

# 빌드 시 자동 검증
npm run build
```

## 📱 운영 환경

### 1. App Check 설정
```bash
# reCAPTCHA v3 사이트 키 발급
# https://www.google.com/recaptcha/admin

# 환경변수 설정
VITE_FIREBASE_APPCHECK_KEY=your_recaptcha_site_key
```

### 2. 빌드 및 배포
```bash
# 환경변수 검증 후 빌드
npm run build

# 빌드 결과물 배포
# (Vercel, Netlify, Firebase Hosting 등)
```

## 🔍 모니터링 및 디버깅

### 로그 확인
- **개발**: 브라우저 콘솔에서 Firebase 로그 확인
- **운영**: Firebase Console > Functions > Logs

### 일반적인 문제 해결

#### 1. 환경변수 누락
```
Error: Missing required environment variable: VITE_FIREBASE_API_KEY
```
**해결**: `.env` 파일에 누락된 변수 추가

#### 2. 에뮬레이터 연결 실패
```
Warning: Firebase emulator connection failed
```
**해결**: `firebase emulators:start` 실행 확인

#### 3. App Check 실패
```
Error: App Check initialization failed
```
**해결**: reCAPTCHA 사이트 키 확인 및 도메인 설정

#### 4. 권한 오류
```
Error: Missing or insufficient permissions
```
**해결**: Firestore 보안 규칙 및 Custom Claims 확인

## 📊 성능 최적화

### 1. 오프라인 지원
- IndexedDB 영속화 자동 활성화
- 멀티탭 지원 (`forceOwnership: false`)

### 2. 캐싱 전략
- Auth 토큰 자동 갱신
- Firestore 오프라인 캐시

### 3. 번들 최적화
- 필요한 Firebase 모듈만 import
- Tree shaking 지원

## 🔐 보안 체크리스트

- [ ] 모든 환경변수 설정 완료
- [ ] Firestore 보안 규칙 적용
- [ ] Custom Claims 설정
- [ ] App Check 활성화 (프로덕션)
- [ ] Auth 지속성 정책 적용
- [ ] HTTPS 강제 (프로덕션)
- [ ] CORS 설정 확인

## 📞 지원

문제가 발생하면:
1. 환경변수 검증: `npm run validate-env`
2. Firebase Console에서 로그 확인
3. 브라우저 개발자 도구에서 오류 확인
4. Firebase 문서 참조: https://firebase.google.com/docs