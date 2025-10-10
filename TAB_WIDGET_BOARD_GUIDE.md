# 📊 탭형 위젯 보드 시스템

React + Vite + Tailwind + react-grid-layout으로 구현된 탭 기반 위젯 대시보드입니다.

## 🎯 주요 기능

### ✅ 완료된 기능
- ✨ 상단에 3개의 탭 (페이지 1, 페이지 2, 페이지 3)
- 📐 4열(4칸) 고정 그리드 레이아웃
- 📦 위젯 크기: 1x1, 2x1, 3x1, 4x1 등 셀 단위 배치/리사이즈
- ✏️ 편집 모드 토글 (드래그/리사이즈 제어)
- 💾 탭별 레이아웃 localStorage 독립 저장/복원
- 📌 상단 탭 바 스크롤 고정 (sticky)
- 🎨 위젯과 탭 바 겹침 방지
- 🔄 드래그 앤 드롭으로 위젯 위치 변경
- 📏 모서리 드래그로 위젯 크기 조절

## 📦 설치된 패키지

```bash
npm install react-grid-layout react-resizable
```

## 📁 파일 구조

```
src/
├── components/
│   ├── PageTabs.tsx           # 상단 탭 바 컴포넌트
│   ├── FourColBoard.tsx        # 4열 그리드 보드
│   └── SampleWidgets.tsx       # 샘플 위젯 컴포넌트들
├── pages/
│   └── PageWithTabs.tsx        # 메인 페이지 (탭 + 보드 조합)
└── index.css                   # React Grid Layout 스타일
```

## 🎨 컴포넌트 설명

### 1. PageTabs.tsx
상단 탭 바 컴포넌트

**Props:**
- `tabs`: 탭 이름 배열
- `activeTab`: 현재 활성 탭
- `onChange`: 탭 변경 핸들러
- `isEditMode`: 편집 모드 여부
- `onToggleEdit`: 편집 모드 토글 핸들러

**특징:**
- `sticky top-0` + `z-[1000]`
- `bg-white/85` + `backdrop-blur-md` (반투명 배경)
- 편집/편집 완료 토글 버튼

### 2. FourColBoard.tsx
4열 고정 그리드 보드

**Props:**
- `tabId`: 현재 탭 ID (localStorage 키로 사용)
- `isEditMode`: 편집 모드 여부
- `renderWidget`: 위젯 렌더링 함수

**설정:**
- `cols={4}` 모든 브레이크포인트에서 4열 고정
- `rowHeight={90}` 행 높이 90px
- `margin={[12, 12]}` 위젯 간격
- `compactType="vertical"` 세로로 자동 정렬
- `draggableHandle=".widget-drag-handle"` 헤더만 드래그 가능

**localStorage:**
- 키: `urwebs:board:${tabId}:v1`
- 탭별로 독립적인 레이아웃 저장

### 3. SampleWidgets.tsx
샘플 위젯 6개

**위젯 목록:**
1. **WeatherWidget** - 날씨 정보
2. **NewsWidget** - 뉴스 목록
3. **CalendarWidget** - 일정 캘린더
4. **TimerWidget** - 포모도로 타이머
5. **FinanceWidget** - 주식 정보
6. **MemoWidget** - 메모장 (작은 크기)
7. **MemoLargeWidget** - 메모장 (큰 크기)

**공통 구조:**
- Card 스타일: `rounded-2xl`, `shadow-lg`
- 헤더: `.widget-drag-handle` 클래스 (드래그 가능 영역)
- 편집 모드에서 "드래그" 안내 표시

### 4. PageWithTabs.tsx
메인 페이지 (모든 것을 조합)

**구조:**
```
PageWithTabs
├── PageTabs (상단 고정)
└── main (컨텐츠 영역)
    ├── 편집 모드 안내 (선택적)
    └── FourColBoard
```

**패딩:**
- `pt-[56px]` - 탭 바 높이만큼 상단 패딩 적용

## 📋 기본 레이아웃

### 페이지 1
- **weather** (1x2) - x:0, y:0
- **news** (3x1) - x:1, y:0
- **calendar** (2x2) - x:2, y:1
- **timer** (1x1) - x:0, y:2

### 페이지 2
- **finance** (2x2) - x:0, y:0
- **memo** (2x1) - x:2, y:0

### 페이지 3
- **memo-large** (4x2) - x:0, y:0 (전체 너비)

## 🎮 사용 방법

### 일반 모드 (보기 모드)
1. 탭 클릭으로 페이지 전환
2. 스크롤하여 위젯 내용 확인
3. 위젯 드래그/리사이즈 불가 (읽기 전용)

### 편집 모드
1. 우측 상단 **"편집"** 버튼 클릭
2. 위젯 헤더를 드래그하여 위치 변경
3. 위젯 우측 하단 모서리를 드래그하여 크기 조절
4. **"편집 완료"** 버튼으로 저장 및 모드 종료

## 🎨 스타일링

### Z-Index 계층
- **탭 바**: z-[1000] (최상단)
- **위젯 (일반)**: z-index: 1
- **위젯 (드래그 중)**: z-index: 10
- **Placeholder**: z-index: 2

### 애니메이션
- 위젯 이동: `transition: all 200ms ease`
- 드래그 중: `opacity: 0.9`
- Placeholder: 파란색 반투명 영역

## 🔧 커스터마이징

### 탭 개수 변경
`PageWithTabs.tsx`:
```typescript
const TABS = ['페이지 1', '페이지 2', '페이지 3', '페이지 4']; // 탭 추가
```

### 행 높이 변경
`FourColBoard.tsx`:
```typescript
rowHeight={120}  // 90 → 120으로 변경
```

### 열 개수 변경
`FourColBoard.tsx`:
```typescript
cols={{ lg: 6, md: 6, sm: 6, xs: 6, xxs: 6 }}  // 4 → 6으로 변경
```

### 위젯 간격 조정
```typescript
margin={[16, 16]}  // [12, 12] → [16, 16]
```

### 새로운 위젯 추가
1. `SampleWidgets.tsx`에 컴포넌트 추가
2. `PageWithTabs.tsx`의 `renderWidget` 함수에 케이스 추가
3. `FourColBoard.tsx`의 `DEFAULT_LAYOUTS`에 레이아웃 추가

## 🚀 실행 방법

### 개발 서버 실행
```bash
npm run dev
```

### 빌드
```bash
npm run build
```

### 프로덕션 미리보기
```bash
npm run preview
```

## 📱 반응형

- **데스크톱**: 4열 유지
- **태블릿**: 4열 유지
- **모바일**: 4열 유지 (행 높이 조정으로 가독성 확보)

편집 모드가 아닐 때는 드래그가 비활성화되어 모바일에서 스크롤이 방해받지 않습니다.

## 🔒 LocalStorage 키 구조

```
urwebs:board:페이지 1:v1
urwebs:board:페이지 2:v1
urwebs:board:페이지 3:v1
```

각 탭마다 독립적인 레이아웃이 저장됩니다.

## 💡 사용 팁

1. **위젯 이동**: 헤더(제목 부분)를 드래그
2. **크기 조절**: 우측 하단 모서리 드래그
3. **레이아웃 저장**: 편집 완료 시 자동 저장
4. **초기화**: localStorage 삭제 후 새로고침

## 🐛 문제 해결

### 위젯이 드래그되지 않아요
- 편집 모드가 활성화되어 있는지 확인
- 헤더 부분(드래그 핸들)을 클릭하고 있는지 확인

### 레이아웃이 저장되지 않아요
- 브라우저 개발자 도구 → Application → Local Storage 확인
- 시크릿 모드에서는 저장되지 않을 수 있음

### 위젯이 겹쳐요
- `preventCollision={false}`로 설정되어 있어 겹칠 수 있음
- 필요시 `true`로 변경

### 탭 바가 위젯과 겹쳐요
- `pt-[56px]` 패딩이 제거되지 않았는지 확인
- 탭 바 `z-[1000]` 확인

## 🎯 다음 단계

### 추가 기능 아이디어
1. ➕ 위젯 추가/삭제 기능
2. 🎨 위젯 배경색 커스터마이징
3. 💾 서버 동기화 (Firebase)
4. 📤 레이아웃 내보내기/가져오기
5. 🔐 사용자별 레이아웃 저장
6. 📊 더 많은 위젯 타입
7. 🌙 다크 모드 지원

## 📚 참고 자료

- [react-grid-layout 문서](https://github.com/react-grid-layout/react-grid-layout)
- [react-resizable 문서](https://github.com/react-grid-layout/react-resizable)
- [Tailwind CSS](https://tailwindcss.com/)

## 🎉 완료!

이제 완전히 작동하는 탭형 위젯 보드 시스템이 준비되었습니다!

테스트 방법:
1. `npm run dev` 실행
2. 브라우저에서 자동으로 탭 보드 페이지 열림
3. "편집" 버튼 클릭하여 편집 모드 진입
4. 위젯을 드래그하거나 크기 조절
5. "편집 완료" 클릭하여 저장

즐거운 코딩 되세요! 🚀




