# Button 컴포넌트 사용 예시

## 🚀 개선된 Button 컴포넌트 기능

### ✅ 주요 개선사항
- **import 버전 표기 제거**: 번들러 호환성 개선
- **forwardRef + 기본 type="button"**: 폼 내부 submit 방지 및 접근성 향상
- **loading 상태 지원**: aria-busy/disabled/data-loading으로 스타일·보조공학 대응
- **fullWidth 옵션**: 카드/모바일 레이아웃 지원
- **aria-invalid 제거**: 의미 있는 케이스로 제한

## 📝 사용 예시

### 기본 사용법
```tsx
import { Button } from './components/ui/button';

// 기본 버튼
<Button>클릭하세요</Button>

// 다양한 variant
<Button variant="default">기본</Button>
<Button variant="destructive">삭제</Button>
<Button variant="outline">아웃라인</Button>
<Button variant="secondary">보조</Button>
<Button variant="ghost">고스트</Button>
<Button variant="link">링크</Button>
```

### 크기 옵션
```tsx
<Button size="sm">작은 버튼</Button>
<Button size="default">기본 버튼</Button>
<Button size="lg">큰 버튼</Button>
<Button size="icon">아이콘 버튼</Button>
```

### 로딩 상태
```tsx
import { useState } from 'react';

function MyComponent() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await fetch('/api/submit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      loading={loading}
      onClick={handleSubmit}
    >
      {loading ? '처리 중...' : '제출하기'}
    </Button>
  );
}
```

### 전체 너비 버튼
```tsx
// 카드나 모바일 레이아웃에서 유용
<Button fullWidth>전체 너비 버튼</Button>

// 로딩과 함께 사용
<Button fullWidth loading={isLoading}>
  로그인
</Button>
```

### 아이콘과 함께 사용
```tsx
import { Plus, Save, Trash2 } from 'lucide-react';

<Button>
  <Plus className="w-4 h-4" />
  추가하기
</Button>

<Button variant="outline">
  <Save className="w-4 h-4" />
  저장
</Button>

<Button variant="destructive">
  <Trash2 className="w-4 h-4" />
  삭제
</Button>
```

### asChild 사용 (Radix Slot)
```tsx
import { Link } from 'react-router-dom';

<Button asChild>
  <Link to="/dashboard">대시보드로 이동</Link>
</Button>

<Button asChild variant="outline">
  <a href="https://example.com" target="_blank" rel="noopener noreferrer">
    외부 링크
  </a>
</Button>
```

### 폼에서 사용
```tsx
function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="이름" />
      <input type="email" placeholder="이메일" />
      
      {/* type="button"이 기본값이므로 의도치 않은 submit 방지 */}
      <Button 
        type="button" 
        variant="outline"
        onClick={handleReset}
      >
        초기화
      </Button>
      
      <Button 
        type="submit"
        loading={isSubmitting}
        fullWidth
      >
        {isSubmitting ? '전송 중...' : '전송하기'}
      </Button>
    </form>
  );
}
```

### 접근성 고려
```tsx
// aria-label과 함께 사용
<Button aria-label="메뉴 열기">
  <Menu className="w-4 h-4" />
</Button>

// aria-describedby로 설명 추가
<Button 
  aria-describedby="delete-warning"
  variant="destructive"
>
  삭제
</Button>
<p id="delete-warning">이 작업은 되돌릴 수 없습니다.</p>
```

### 커스텀 스타일링
```tsx
// className으로 추가 스타일
<Button className="bg-gradient-to-r from-blue-500 to-purple-600">
  그라데이션 버튼
</Button>

// 로딩 상태에서 추가 스타일
<Button 
  loading={loading}
  className="min-w-[120px]" // 로딩 중 너비 고정
>
  로그인
</Button>
```

## 🎨 스타일 특징

### 로딩 스피너
- `currentColor` 사용으로 variant에 자동 맞춤
- `aria-hidden="true"`로 스크린 리더에서 숨김
- `data-loading` 속성으로 추가 스타일링 가능

### 포커스 관리
- `focus-visible:ring-ring/50`로 키보드 포커스 시각화
- `aria-busy`로 로딩 상태 스크린 리더 알림
- `disabled` 상태에서 포인터 이벤트 비활성화

### 반응형 디자인
- `fullWidth` 옵션으로 모바일 친화적
- `has-[>svg]:px-3` 등으로 아이콘 있을 때 패딩 조정
- `whitespace-nowrap`로 텍스트 줄바꿈 방지

## 🔧 개발자 팁

### 로딩 상태 관리
```tsx
// 좋은 예: 명확한 상태 관리
const [loading, setLoading] = useState(false);

// 나쁜 예: 불필요한 aria-invalid
<Button aria-invalid="true">버튼</Button>
```

### 성능 최적화
```tsx
// forwardRef로 ref 전달 최적화
const MyButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => (
  <Button ref={ref} {...props} />
));
```

### 타입 안전성
```tsx
// ButtonProps 인터페이스로 타입 안전성 확보
interface CustomButtonProps extends ButtonProps {
  customProp?: string;
}
```

이제 Button 컴포넌트는 현대적이고 접근성이 뛰어난 UI 컴포넌트가 되었습니다! 🎉

