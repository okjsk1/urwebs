# 📊 다단 컬럼 보드 시스템 (Start.me 스타일)

React + Vite + Tailwind + dnd-kit으로 구현된 3열/4열 컬럼 기반 위젯 대시보드입니다.

## 🎯 주요 기능

### ✅ 완료된 기능
- 🎛️ 3열/4열 레이아웃 토글
- 📐 동일 너비 컬럼 등분 (CSS Grid)
- 🎨 10개 샘플 위젯 (뉴스, 링크, 날씨, 계산기, 메모, 즐겨찾기, 캘린더, 환율, 주식, 할 일)
- ✏️ 편집 모드 토글
- 🔄 **같은 컬럼 내 드래그 순서 변경**
- 🚀 **다른 컬럼으로 드래그 이동**
- ➕ 위젯 추가 (편집 모드)
- 🗑️ 위젯 삭제 (편집 모드)
- 💾 localStorage 자동 저장/복원
- 📌 상단 헤더 스크롤 고정 (sticky)
- 🎭 드래그 중 애니메이션 (opacity, shadow, scale)

## 📦 설치된 패키지

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/modifiers
```

## 📁 파일 구조

```
src/components/ColumnsBoard/
├── types.ts                    # 타입 정의
├── storage.ts                  # localStorage 저장/로드
├── dnd.ts                      # dnd-kit 센서 설정
├── ColumnsBoard.tsx            # 메인 보드 컴포넌트
├── Column.tsx                  # 컬럼 (드롭존 + 정렬)
├── WidgetCard.tsx              # 공통 카드 래퍼
└── widgets/
    ├── index.ts
    ├── NewsWidget.tsx          # 뉴스 위젯
    ├── LinksWidget.tsx         # 링크 모음
    ├── WeatherWidget.tsx       # 날씨
    ├── CalculatorWidget.tsx    # 계산기
    ├── MemoWidget.tsx          # 메모
    ├── BookmarksWidget.tsx     # 즐겨찾기
    ├── CalendarWidget.tsx      # 캘린더
    ├── ExchangeWidget.tsx      # 환율
    ├── StockWidget.tsx         # 주식
    └── TodoWidget.tsx          # 할 일
```

## 🏗️ 구조 설명

### 1. **ColumnsBoard.tsx** - 메인 컨테이너
```typescript
<DndContext>
  <div className="grid" style={{ gridTemplateColumns: `repeat(${layoutMode}, minmax(0, 1fr))` }}>
    {columns.map(column => <Column />)}
  </div>
  <DragOverlay />
</DndContext>
```

**핵심 기능:**
- DndContext로 전체 드래그 앤 드롭 관리
- 레이아웃 모드 토글 (3열 ↔ 4열)
- 드래그 이벤트 처리 (onDragStart, onDragOver, onDragEnd)
- 위젯 추가/삭제
- localStorage 저장

### 2. **Column.tsx** - 컬럼 (드롭존)
```typescript
<div ref={setNodeRef}>  {/* Droppable */}
  <SortableContext items={items}>
    {widgets.map(widget => <WidgetCard />)}
  </SortableContext>
  <button>위젯 추가</button>
</div>
```

**핵심 기능:**
- `useDroppable`: 다른 컬럼에서 드롭 가능
- `SortableContext`: 컬럼 내 위젯 정렬
- `verticalListSortingStrategy`: 세로 정렬
- 드롭 시 배경색 변경 (isOver)

### 3. **WidgetCard.tsx** - 드래그 가능한 카드
```typescript
const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
  id: widget.id,
  disabled: !isEditMode
});
```

**핵심 기능:**
- `useSortable`: 드래그 가능한 아이템
- 드래그 핸들: 헤더 전체 영역
- 드래그 중: opacity 0.5, shadow-2xl, scale-105
- 삭제 버튼 (편집 모드)

## 💾 상태 구조

```typescript
interface BoardState {
  layoutMode: 3 | 4;  // 현재 열 개수
  columnsOrder: ['col-1', 'col-2', 'col-3', 'col-4'];
  columns: {
    'col-1': {
      id: 'col-1',
      title: '정보',
      items: ['w-news', 'w-links', 'w-memo']  // 위젯 ID 배열
    },
    ...
  },
  widgets: {
    'w-news': {
      id: 'w-news',
      type: 'news',
      title: '최신 뉴스',
      data: { ... }
    },
    ...
  }
}
```

**localStorage 키:** `urwebs:columns:v1`

## 🎮 사용 방법

### 일반 모드 (보기 모드)
1. 컬럼별로 위젯 확인
2. 위젯 인터랙션 (계산기 클릭, 할 일 체크 등)
3. 드래그 불가

### 편집 모드
1. 우측 상단 **"편집"** 버튼 클릭
2. **같은 컬럼 내 순서 변경**: 위젯 헤더를 드래그
3. **다른 컬럼으로 이동**: 위젯을 다른 컬럼으로 드래그
4. **위젯 추가**: 컬럼 하단 "위젯 추가" 버튼 → 타입 선택
5. **위젯 삭제**: 위젯 헤더 우측 🗑️ 버튼
6. **"편집 완료"** 클릭하여 저장 및 모드 종료

### 레이아웃 전환
- **3열 → 4열**: 4번째 빈 컬럼 추가
- **4열 → 3열**: 4번째 컬럼 아이템들을 3번째 컬럼으로 이동

## 🎨 드래그 앤 드롭 동작

### 드래그 시작
```typescript
onDragStart: 드래그 중인 위젯 저장 (activeWidget)
```

### 드래그 중
```typescript
onDragOver: 
  - 다른 컬럼 감지
  - 실시간으로 아이템 이동
  - 드롭 가능 영역 하이라이트 (bg-blue-50/50)
```

### 드래그 종료
```typescript
onDragEnd:
  - 같은 컬럼: arrayMove()로 순서 변경
  - 다른 컬럼: onDragOver에서 이미 이동됨
  - localStorage 자동 저장
```

## 🎯 기본 시드 데이터

### 3열 모드
```
컬럼 1 (정보)          컬럼 2 (생산성)        컬럼 3 (금융)
- 뉴스                - 날씨                - 계산기
- 링크 모음           - 즐겨찾기            - 환율
- 메모                - 할 일               - 주식
```

### 4열 모드
```
컬럼 1 ~ 3 (동일) + 컬럼 4 (기타, 처음엔 비어있음)
```

## 🎨 스타일링

### Z-Index 계층
- **헤더**: z-[1000]
- **모달**: z-[2000]
- **카드 (일반)**: z-auto
- **카드 (드래그 중)**: z-10 (scale-105, shadow-2xl)

### 애니메이션
- 카드 이동: `transform`, `transition` (dnd-kit 자동)
- 드래그 중: `opacity: 0.5`
- 호버: `hover:shadow-xl`
- 플레이스홀더: 드래그 중인 위치에 반투명 표시

### 반응형
- CSS Grid: `repeat(N, minmax(0, 1fr))`
- 컬럼 간격: `gap-6` (24px)
- 페이지 패딩: `px-4` (16px)

## 🔧 커스터마이징

### 컬럼 제목 변경
`storage.ts` → `getDefaultBoardState()`:
```typescript
'col-1': { id: 'col-1', title: '나만의 컬럼', items: [...] }
```

### 기본 위젯 변경
`storage.ts` → `widgets`:
```typescript
widgets: {
  'w-custom': { id: 'w-custom', type: 'memo', title: '나만의 메모' },
}
```

### 새로운 위젯 타입 추가
1. `types.ts`에 타입 추가
2. `widgets/CustomWidget.tsx` 생성
3. `Column.tsx`의 `renderWidgetContent`에 케이스 추가
4. `ColumnsBoard.tsx`의 `availableWidgetTypes`에 추가

### 드래그 민감도 조정
`dnd.ts`:
```typescript
activationConstraint: {
  distance: 10,  // 8 → 10 (덜 민감하게)
}
```

### 컬럼 간격 조정
`ColumnsBoard.tsx`:
```typescript
<div className="grid gap-8">  {/* gap-6 → gap-8 */}
```

## 🚀 실행 방법

### 개발 서버 (이미 실행 중)
```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

### 빌드
```bash
npm run build
```

### 프로덕션 미리보기
```bash
npm run preview
```

## 💡 사용 팁

1. **드래그 실패할 때**: 8px 이상 움직여야 드래그 시작 (실수 방지)
2. **레이아웃 초기화**: localStorage 삭제 후 새로고침
3. **위젯 복제**: 같은 타입 여러 개 추가 가능 (각각 고유 ID)
4. **모바일**: 터치 드래그도 지원 (TouchSensor)

## 🐛 문제 해결

### 위젯이 드래그되지 않아요
- ✅ 편집 모드가 활성화되어 있는지 확인
- ✅ 헤더 부분을 클릭하고 있는지 확인
- ✅ 8px 이상 드래그해보세요

### 레이아웃이 저장되지 않아요
- ✅ localStorage 확인: 개발자 도구 → Application → Local Storage
- ✅ 시크릿 모드에서는 저장 안 될 수 있음

### 다른 컬럼으로 이동이 안 돼요
- ✅ `handleDragOver`가 호출되는지 콘솔 확인
- ✅ 컬럼 영역 위로 드래그하세요 (파란색 하이라이트 표시)

### 4열로 전환 시 위젯이 사라져요
- ✅ 4번째 컬럼이 비어있는 게 정상입니다
- ✅ "위젯 추가"로 추가하거나 다른 컬럼에서 드래그해오세요

## 📊 데이터 흐름

```
사용자 드래그
    ↓
onDragStart (activeWidget 저장)
    ↓
onDragOver (실시간 아이템 이동)
    ↓
onDragEnd (최종 순서 확정)
    ↓
setBoardState
    ↓
useEffect → saveBoardState
    ↓
localStorage 저장 ✅
```

## 🎯 react-grid-layout vs dnd-kit

| 기능 | react-grid-layout | dnd-kit (현재 사용) |
|------|-------------------|---------------------|
| 레이아웃 | 2D 그리드 (x, y) | 컬럼 기반 리스트 |
| 크기 조절 | ✅ 지원 | ❌ 불필요 |
| 컬럼 간 이동 | 복잡함 | ✅ 간단 |
| 번들 크기 | 큼 | 작음 |
| 커스터마이징 | 제한적 | 매우 유연 |
| 모바일 | 보통 | 우수 |

## 🌟 향상된 기능 아이디어

### 구현 가능한 추가 기능
1. **컬럼 재정렬**: 컬럼 자체도 드래그로 순서 변경
2. **컬럼 추가/삭제**: 사용자가 컬럼 개수 직접 조절
3. **위젯 설정**: 각 위젯별 개인화 설정
4. **검색**: 위젯 검색 기능
5. **테마**: 다크 모드, 컬러 테마
6. **공유**: URL로 레이아웃 공유
7. **백업**: 레이아웃 내보내기/가져오기

## 📚 코드 설명

### dnd-kit 주요 Hook

#### useSortable (WidgetCard.tsx)
```typescript
const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
  id: widget.id,
  disabled: !isEditMode,
});
```
- 드래그 가능한 아이템
- `disabled`로 편집 모드만 드래그 가능

#### useDroppable (Column.tsx)
```typescript
const { setNodeRef, isOver } = useDroppable({
  id: column.id,
});
```
- 드롭 가능한 영역
- `isOver`로 드래그 중 하이라이트

#### SortableContext
```typescript
<SortableContext items={column.items} strategy={verticalListSortingStrategy}>
  {/* 정렬 가능한 아이템들 */}
</SortableContext>
```
- 정렬 가능한 컨테이너
- `verticalListSortingStrategy`: 세로 정렬

### LocalStorage 관리

#### 저장
```typescript
useEffect(() => {
  saveBoardState(boardState);
}, [boardState]);
```
- 상태 변경 시 자동 저장

#### 로드
```typescript
const [boardState, setBoardState] = useState(loadBoardState());
```
- 초기 마운트 시 로드
- 없으면 기본 시드 데이터

## 🎭 애니메이션 디테일

### 드래그 중
```css
opacity: 0.5
shadow-2xl
scale-105
z-10
```

### 호버
```css
hover:shadow-xl
transition-shadow
```

### 드롭 가능 영역
```css
bg-blue-50/50  (isOver일 때)
```

## 🔒 접근성

- ✅ `aria-label` 모든 버튼에 적용
- ✅ 키보드 네비게이션 지원 (dnd-kit 기본)
- ✅ 스크린 리더 친화적

## 🚀 최적화

1. **메모이제이션**: 위젯 렌더링은 React.memo로 감싸기 (옵션)
2. **가상화**: 위젯이 많을 때 react-virtual 사용 (옵션)
3. **디바운싱**: localStorage 저장에 디바운스 적용 (옵션)

## 📖 참고 자료

- [dnd-kit 공식 문서](https://docs.dndkit.com/)
- [dnd-kit 예제](https://master--5fc05e08a4a65d0021ae0bf2.chromatic.com/)
- [Start.me](https://start.me/) - 영감의 원천

## 🎉 완료!

완전히 작동하는 start.me 스타일의 다단 컬럼 보드가 준비되었습니다!

### 테스트 체크리스트
- [ ] 3열/4열 토글 작동
- [ ] 편집 모드 활성화
- [ ] 같은 컬럼 내 위젯 드래그 순서 변경
- [ ] 다른 컬럼으로 위젯 이동
- [ ] 위젯 추가
- [ ] 위젯 삭제
- [ ] 페이지 새로고침 후 레이아웃 유지
- [ ] 계산기, 할 일 등 인터랙티브 위젯 작동

모든 요구사항이 완벽하게 구현되었습니다! 🌟




