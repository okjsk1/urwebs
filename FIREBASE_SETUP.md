# Firebase 구글 로그인 설정 가이드

## 1. Firebase 프로젝트 생성 또는 확인

1. [Firebase Console](https://console.firebase.google.com/)에 접속합니다
2. 기존 프로젝트가 있다면 선택하고, 없다면 "프로젝트 추가"를 클릭합니다
3. 프로젝트 이름을 입력하고 생성합니다

## 2. Firebase 웹 앱 추가

1. Firebase 프로젝트 설정 페이지로 이동합니다
2. "앱 추가" 버튼을 클릭하고 **웹** 아이콘(`</>`)을 선택합니다
3. 앱 닉네임을 입력합니다 (예: "Urwebs")
4. "앱 등록" 버튼을 클릭합니다
5. **Firebase 설정 정보를 복사해둡니다** (다음 단계에서 사용)

## 3. Authentication 설정

1. Firebase Console 왼쪽 메뉴에서 **"Authentication"**을 클릭합니다
2. "시작하기" 버튼을 클릭합니다
3. "Sign-in method" 탭으로 이동합니다
4. **Google** 로그인 제공업체를 찾아 클릭합니다
5. "사용 설정" 토글을 켭니다
6. 프로젝트 지원 이메일을 선택합니다
7. "저장" 버튼을 클릭합니다

## 4. 환경변수 설정

1. 프로젝트 루트 디렉토리에 `.env` 파일을 생성합니다
2. Firebase 웹 앱 설정에서 복사한 정보를 다음과 같이 입력합니다:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
```

## 5. 승인된 도메인 추가 (배포 시)

1. Firebase Console의 Authentication > Settings > Authorized domains로 이동합니다
2. "도메인 추가" 버튼을 클릭합니다
3. 배포할 도메인을 추가합니다 (예: your-site.vercel.app)

## 6. 테스트

1. 개발 서버를 재시작합니다:
   ```bash
   npm run dev
   ```

2. 브라우저에서 애플리케이션을 열고 "Google로 로그인" 버튼을 클릭합니다

3. Google 계정으로 로그인하여 정상 작동 확인합니다

## 주의사항

- `.env` 파일은 절대 Git에 커밋하지 마세요 (이미 .gitignore에 추가됨)
- 배포 시에는 호스팅 플랫폼(Vercel, Netlify 등)의 환경변수 설정에서 동일한 값들을 설정해야 합니다
- API Key는 공개되어도 Firebase 보안 규칙으로 보호되지만, 도메인 제한을 설정하는 것이 좋습니다

## 문제 해결

### "Firebase: Error (auth/unauthorized-domain)" 오류가 발생하는 경우
- Firebase Console > Authentication > Settings > Authorized domains에 현재 도메인이 추가되어 있는지 확인하세요

### 환경변수가 인식되지 않는 경우
- 개발 서버를 재시작해보세요
- `.env` 파일이 프로젝트 루트에 있는지 확인하세요
- 환경변수 이름이 `VITE_`로 시작하는지 확인하세요 (Vite 프로젝트에서 필수)

