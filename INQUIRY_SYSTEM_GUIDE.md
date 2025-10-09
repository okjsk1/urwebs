# 📋 문의 시스템 가이드

Firebase Firestore를 사용한 문의 게시판 시스템입니다.

## ✨ 주요 기능

### 1. **사용자 문의 작성**
- 메인 페이지의 "문의하기" 메뉴에서 문의 작성
- Firestore 데이터베이스에 자동 저장
- 이메일 없이 바로 저장됨

### 2. **관리자 문의 관리**
- 관리자 계정(okjsk1@gmail.com)으로 로그인하면 "문의 관리" 버튼 표시
- 실시간으로 문의 내역 확인
- 문의 읽음/상태 변경/삭제 기능

## 🔧 구현 내용

### 1. ContactPage.tsx
문의 작성 시 Firestore에 저장:
```typescript
await addDoc(collection(db, 'inquiries'), {
  name: '이름',
  email: '이메일',
  subject: '제목',
  category: '유형',
  message: '내용',
  priority: '우선순위',
  status: 'pending',
  createdAt: serverTimestamp(),
  inquiryNumber: 'INQ-123456',
  isRead: false
});
```

### 2. AdminInquiriesPage.tsx
관리자 전용 문의 관리 페이지:
- Firestore 실시간 조회
- 필터링 및 검색
- 상태 관리 (대기중/답변완료/종료)
- 읽음 처리 및 삭제

### 3. Header.tsx
관리자 계정일 때만 "문의 관리" 버튼 표시:
```typescript
const isAdmin = currentUser?.email === 'okjsk1@gmail.com';
```

## 📊 Firestore 데이터 구조

### Collection: `inquiries`

```json
{
  "name": "홍길동",
  "email": "user@example.com",
  "subject": "문의 제목",
  "category": "general",
  "message": "문의 내용",
  "priority": "medium",
  "status": "pending",
  "createdAt": Timestamp,
  "inquiryNumber": "INQ-123456",
  "isRead": false
}
```

### 필드 설명

| 필드 | 타입 | 설명 |
|------|------|------|
| name | string | 문의자 이름 |
| email | string | 문의자 이메일 |
| subject | string | 문의 제목 |
| category | string | general, bug, feature, account, business |
| message | string | 문의 내용 |
| priority | string | low, medium, high |
| status | string | pending, replied, closed |
| createdAt | Timestamp | 생성 시간 |
| inquiryNumber | string | 문의 번호 (INQ-XXXXXX) |
| isRead | boolean | 읽음 여부 |

## 🚀 사용 방법

### 일반 사용자
1. 메뉴에서 "문의하기" 클릭
2. 문의 내용 작성
3. "문의 보내기" 버튼 클릭
4. Firestore에 자동 저장 ✅

### 관리자 (okjsk1@gmail.com)
1. okjsk1@gmail.com 계정으로 로그인
2. 헤더에 "문의 관리" 버튼 표시됨
3. 클릭하여 관리자 페이지 이동
4. 문의 목록 확인
5. 문의 클릭하여 상세 내용 확인
6. 상태 변경, 읽음 처리, 삭제 가능
7. "답변하기" 버튼으로 이메일 클라이언트 열기

## 🎯 장점

✅ **설정 불필요**: 이메일 API 키 없이 바로 사용
✅ **실시간**: Firestore 실시간 동기화
✅ **관리 편리**: 한 곳에서 모든 문의 관리
✅ **무료**: Firebase 무료 플랜 사용 (일일 제한 있음)
✅ **검색**: 이름, 이메일, 제목으로 검색 가능
✅ **필터**: 상태별, 유형별 필터링

## 🔒 보안

- 관리자 페이지는 **okjsk1@gmail.com**만 접근 가능
- Firestore 보안 규칙 설정 필요 (아래 참고)

### Firestore 보안 규칙 설정

Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // inquiries 컬렉션
    match /inquiries/{document} {
      // 모든 사용자가 생성 가능
      allow create: if true;
      
      // 관리자만 읽기, 수정, 삭제 가능
      allow read, update, delete: if request.auth != null && 
        request.auth.token.email == 'okjsk1@gmail.com';
    }
  }
}
```

## 📝 추가 기능 아이디어

1. ✉️ 답변 시 자동 이메일 전송 (Cloud Functions)
2. 📊 통계 대시보드
3. 🏷️ 태그 시스템
4. 📎 파일 첨부 기능
5. 💬 댓글 기능

## ❓ 자주 묻는 질문

### Q: 이메일은 어떻게 보내나요?
A: "답변하기" 버튼을 누르면 기본 이메일 클라이언트가 열립니다. 또는 Firebase Cloud Functions로 자동 답변 시스템을 구축할 수 있습니다.

### Q: 다른 관리자를 추가하려면?
A: `Header.tsx`와 `AdminInquiriesPage.tsx`의 이메일 체크 조건에 추가:
```typescript
const isAdmin = currentUser?.email === 'okjsk1@gmail.com' || 
                currentUser?.email === 'admin2@gmail.com';
```

### Q: 문의 내역이 안 보여요
A: Firestore 규칙이 설정되지 않았거나, 관리자 계정으로 로그인하지 않았을 수 있습니다.

## 🎉 완료!

이제 완전히 작동하는 문의 게시판 시스템이 구축되었습니다!

