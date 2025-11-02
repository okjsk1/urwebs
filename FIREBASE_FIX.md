# 🔥 Firebase 에러 해결 가이드

## ❗ 즉시 해야 할 일

Firebase 콘솔에서 보안 규칙을 업데이트해야 합니다!

### 📝 단계별 가이드

1. **Firebase 콘솔 접속**
   - https://console.firebase.google.com/
   - 프로젝트: `urwebs-3f562` 선택

2. **Firestore Database → 규칙 탭**
   - 왼쪽 메뉴: "Firestore Database" 클릭
   - 상단 탭: "규칙" 클릭

3. **규칙 복사 & 붙여넣기**
   - 프로젝트 루트의 `firestore.rules` 파일 열기
   - 전체 내용 복사 (Ctrl+A → Ctrl+C)
   - Firebase 콘솔의 규칙 편집기에 붙여넣기 (Ctrl+V)

4. **게시**
   - "게시" 버튼 클릭
   - "규칙이 게시되었습니다" 메시지 확인

5. **앱 새로고침**
   - 브라우저에서 F5 또는 새로고침
   - 에러가 해결되었는지 확인

## 🔍 현재 발생하는 에러

### 1. "Missing or insufficient permissions"
- **원인**: 보안 규칙이 Firebase에 배포되지 않음
- **해결**: 위의 단계 따라하기

### 2. "Unsupported field value: undefined"
- **상태**: ✅ 이미 수정 완료
- **해결**: 코드에서 undefined 값 제거됨

### 3. "조회수 증가 실패"
- **원인**: 조회수 증가 규칙 문제
- **해결**: 보안 규칙 업데이트 필요

## ✅ 수정된 내용

1. **관심 페이지 기능**: undefined 값 필터링 추가
2. **Firestore 보안 규칙**: 조회수/좋아요 증가 규칙 단순화
3. **에러 처리**: 더 명확한 에러 메시지

## 🚀 빠른 해결 방법

```bash
# Firebase CLI가 설치되어 있다면:
firebase deploy --only firestore:rules
```

## 📞 문제가 계속되면

1. 브라우저 콘솔(F12)의 에러 메시지 스크린샷
2. Firebase 콘솔 → Firestore Database → 규칙 탭 스크린샷
3. 위 두 가지를 확인하여 추가 조치

