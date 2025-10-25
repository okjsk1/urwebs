# MyPage 개선 사항 목록

## 🔴 긴급 개선 사항

### 1. **파일 크기 문제 (가장 중요)**
- 현재 상태: `MyPage.tsx`가 **4600줄 이상**으로 너무 큼
- 문제점:
  - 유지보수 어려움
  - 코드 가독성 저하
  - 성능 최적화 어려움
- 개선 방안:
  - `renderWidget` 함수를 별도 파일로 분리 (`WidgetRenderer.tsx`)
  - 페이지 관리 로직을 별도 컴포넌트로 분리 (`PageManager.tsx`)
  - 설정 관련 UI를 별도 컴포넌트로 분리 (`SettingsPanel.tsx`)
  - 위젯 추가 로직을 커스텀 훅으로 분리 (`useWidgetManagement.ts`)

### 2. **성능 최적화**
- 현재 상태: 불필요한 리렌더링 발생 가능
- 개선 방안:
  ```typescript
  // useMemo로 widgets 필터링 최적화
  const currentPageWidgets = useMemo(() => 
    widgets.filter(w => w.pageId === currentPageId),
    [widgets, currentPageId]
  );
  
  // useCallback으로 함수 메모이제이션
  const handleWidgetUpdate = useCallback((id: string, updates: Partial<Widget>) => {
    // ...
  }, [dependencies]);
  ```

### 3. **renderWidget 함수 분리**
- 현재 상태: 2000줄 이상의 거대한 switch 문
- 개선 방안:
  - 각 위젯별로 별도 파일로 분리
  - 위젯 팩토리 패턴 적용
  - 동적 import로 코드 스플리팅

## 🟡 중요 개선 사항

### 4. **코드 중복 제거**
- **발견된 중복**:
  - 위젯 추가 로직의 타입별 분기 처리 반복
  - 크기 계산 로직 중복 (`getWidgetDimensions` 호출 반복)
  - 로컬스토리지 저장/로드 로직 반복

- **개선 방안**:
  ```typescript
  // 위젯 크기 기본값 매핑
  const WIDGET_DEFAULT_SIZES: Record<string, WidgetSize> = {
    'todo': '2x2',
    'crypto': '1x2',
    'weather': '1x3',
    'qr_code': '1x1',
    // ...
  };
  
  // 위젯 추가 로직 단순화
  const addWidget = (type: string, targetColumn?: number) => {
    const size = WIDGET_DEFAULT_SIZES[type] || '1x1';
    const dimensions = getWidgetDimensions(size, subCellWidth, cellHeight, spacing);
    // ...
  };
  ```

### 5. **에러 처리 개선**
- 현재 상태: 일부 try-catch 블록이 있지만 불완전
- 개선 방안:
  - Error Boundary 추가
  - Toast 알림 표준화
  - 에러 로깅 시스템 구축

### 6. **타입 안정성 강화**
- 개선 방안:
  - Widget 타입을 더 구체적으로 정의
  - 위젯 타입별 Props 타입 정의
  - 제네릭 타입 활용

## 🟢 UX 개선 사항

### 7. **위젯 추가 UX 개선**
- 현재 기능: 정상 작동
- 추가 개선:
  - 위젯 검색 기능 추가
  - 최근 사용한 위젯 표시
  - 위젯 즐겨찾기 개수 표시

### 8. **드래그 앤 드롭 개선**
- 현재 기능: 정상 작동 (DraggableDashboardGrid)
- 추가 개선:
  - 드래그 중 위젯 스냅 가이드 개선
  - 컬럼별 자동 정렬 옵션
  - 드래그 취소 시 애니메이션

### 9. **모바일 반응형 개선**
- 개선 방안:
  - 모바일에서 위젯 크기 자동 조정
  - 터치 제스처 최적화
  - 모바일 메뉴 개선

### 10. **저장 기능 개선**
- 현재 상태: Firebase 저장 가능
- 개선 방안:
  - 자동 저장 기능 추가
  - 변경사항 표시 (unsaved changes)
  - 저장 상태 피드백 개선

## 💡 추가 기능 제안

### 11. **위젯 템플릿 기능**
- 사용자가 위젯 조합을 템플릿으로 저장
- 한 번에 여러 위젯 추가

### 12. **위젯 그룹화**
- 위젯을 그룹으로 묶어서 관리
- 그룹 단위 이동/삭제

### 13. **키보드 단축키 확장**
- 현재: Ctrl+Z, Ctrl+Y (undo/redo)
- 추가 제안:
  - `Ctrl+D`: 위젯 복제
  - `Ctrl+Del`: 위젯 삭제
  - `Ctrl+A`: 위젯 전체 선택
  - `Ctrl+S`: 저장

### 14. **위젯 상태 동기화**
- 여러 페이지 간 위젯 상태 공유
- 전역 설정 관리

### 15. **접근성 개선**
- ARIA 라벨 추가
- 키보드 네비게이션 개선
- 스크린 리더 지원

## 📊 우선순위

1. **최우선**: 파일 분리 및 컴포넌트 리팩토링 (MyPage.tsx 4600줄 → 여러 파일)
2. **우선**: 성능 최적화 (useMemo, useCallback)
3. **중요**: 코드 중복 제거
4. **추천**: UX 개선사항
5. **선택**: 추가 기능 제안

## 🎯 시작 지점

가장 먼저 해야 할 작업:
1. `renderWidget` 함수를 `WidgetRenderer.tsx`로 분리
2. 위젯별 렌더링 로직을 각각의 파일로 분리
3. 위젯 관리 로직을 커스텀 훅으로 분리

이렇게 하면 파일 크기가 크게 줄어들고 유지보수가 쉬워집니다!


