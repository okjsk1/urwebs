# 영어 단어 학습 위젯 개선 요청

## 📋 현재 상황

영어 단어 학습 위젯(EnglishWordsWidget)의 기능을 고도화하고 버그를 수정하고자 합니다.

## 📂 전달 파일

### 1. 메인 위젯 파일
- `src/components/widgets/EnglishWordsWidget.tsx` (전체 코드 925줄)

### 2. 타입 정의
- `src/types/mypage.types.ts` (Widget 인터페이스)

### 3. 유틸리티 함수
- `src/components/widgets/utils/widget-helpers.ts` (persistOrLocal, readLocal, showToast 등)

### 4. 위젯 렌더링 컨텍스트 (참고용)
- `src/components/MyPage.tsx`의 `renderWidgetContent()` 함수 (라인 2540-3500)

## 🐛 반드시 고쳐야 할 버그

### 1. 상태 저장 문제
**현재 코드:**
```typescript
useEffect(() => {
  persistOrLocal(widget.id, state, updateWidget);
}, [widget.id, updateWidget]); // ❌ state 변경 시 저장 안됨
```

**수정 필요:**
```typescript
// 방법 1: state를 의존성에 추가
useEffect(() => {
  persistOrLocal(widget.id, state, updateWidget);
}, [widget.id, state, updateWidget]);

// 방법 2: 디바운스 적용 (권장)
useDebouncedEffect(() => {
  persistOrLocal(widget.id, state, updateWidget);
}, [widget.id, state], 300);
```

### 2. studyQueue 길이 0일 때 모듈로 연산 오류
**현재 코드:**
```typescript
currentIndex: (prev.currentIndex + 1) % prev.studyQueue.length
// ❌ length가 0이면 NaN 발생
```

**수정 필요:**
```typescript
const safeNext = (len: number, i: number) => (len > 0 ? (i + 1) % len : 0);
const safePrev = (len: number, i: number) => (len > 0 ? (i - 1 + len) % len : 0);

const nextWord = useCallback(() => {
  if (state.studyQueue.length === 0) return; // 방어 로직
  setState(p => ({
    ...p,
    currentIndex: safeNext(p.studyQueue.length, p.currentIndex),
    showAnswer: false,
    quizAnswer: '',
    quizResult: null,
    hintLevel: 2
  }));
}, [state.studyQueue.length]);
```

### 3. autoPlay 타이머 중복/메모리 누수
**수정 필요:**
- 타이머 시작/정지 명확화
- clearInterval 보장
- 탭 전환 시 visibilitychange로 일시 정지

### 4. FileReader 예외 처리
```typescript
catch (error) {
  const message = error instanceof Error ? error.message : '알 수 없는 오류';
  showToast(message, 'error');
}
```

### 5. 키보드 단축키 충돌
```typescript
if (e.target instanceof HTMLInputElement || 
    e.target instanceof HTMLTextAreaElement ||
    (e.target as HTMLElement).contentEditable === 'true') {
  return; // contentEditable도 예외 처리
}
```

## 🚀 SRS 고도화

### 1. 알고리즘 옵션 추가

**SM-2 알고리즘 (Anki 스타일):**
```typescript
function scheduleSM2(word: Word, quality: 0 | 1 | 2 | 3 | 4 | 5): Word {
  let ef = word.easeFactor ?? 2.5;
  let iv = word.interval ?? 0;
  let reps = (word.reps ?? 0) + 1;

  if (quality < 3) {
    // 실패
    reps = 0;
    iv = 1;
    word.lapses = (word.lapses ?? 0) + 1;
  } else {
    // 성공
    if (reps === 1) iv = 1;
    else if (reps === 2) iv = 6;
    else iv = Math.round(iv * ef);
    
    ef = Math.max(1.3, ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  }
  
  const nextDue = Date.now() + iv * 24 * 60 * 60 * 1000;
  return { ...word, easeFactor: ef, interval: iv, reps, nextDue };
}
```

**간소화된 버튼:**
- ❌ 모름 (quality = 0)
- 🤔 보통 (quality = 3)
- ✅ 완벽 (quality = 5)

### 2. 학습 큐 생성 개선
```typescript
function createStudyQueue(words: Word[], settings: StudySettings): Word[] {
  const now = Date.now();
  
  // 필터링
  let filtered = words;
  if (settings.levelFilter !== 'all') {
    filtered = filtered.filter(w => w.level === settings.levelFilter);
  }
  
  // 우선순위: 기한 지남 → 오늘 복습 → 새 단어
  const overdue = filtered.filter(w => w.nextDue < now - 24*60*60*1000);
  const dueToday = filtered.filter(w => w.nextDue >= now - 24*60*60*1000 && w.nextDue <= now);
  const newWords = filtered.filter(w => w.nextDue > now);
  
  const queue = [...overdue, ...dueToday, ...newWords.slice(0, settings.dailyLimit || 20)];
  
  if (settings.shuffle) {
    return shuffleArray(queue);
  }
  
  return queue;
}
```

### 3. 퀴즈 모드 강화

**객관식 (4지선다):**
```typescript
const generateChoices = (correctWord: Word, allWords: Word[]): string[] => {
  const sameLevel = allWords.filter(w => 
    w.level === correctWord.level && w.id !== correctWord.id
  );
  
  // 랜덤하게 3개 선택
  const shuffled = sameLevel.sort(() => Math.random() - 0.5);
  const wrong = shuffled.slice(0, 3).map(w => w.korean);
  
  const choices = [...wrong, correctWord.korean];
  return choices.sort(() => Math.random() - 0.5);
};
```

**부분 일치 허용:**
```typescript
const normalizeAnswer = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:]/g, '')
    .replace(/\s+/g, ' ');
};

const isCorrect = normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);
```

### 4. 힌트 체계 개선
```typescript
const hints = [
  { level: 1, text: `첫 글자: ${word.korean[0]}` },
  { level: 2, text: `글자 수: ${word.korean.length}자` },
  { level: 3, text: `초성: ${getChosung(word.korean)}` },
  { level: 4, text: `예문: ${word.example?.substring(0, 20)}...` }
];
```

## 📊 데이터 모델 확장

### Word 타입 확장
```typescript
type Word = {
  id: string;
  english: string;
  korean: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  correct: number;
  wrong: number;
  streak: number;
  createdAt: number;
  
  // SRS 필드 추가
  nextDue: number;                    // 다음 복습 예정 시간
  algorithm?: 'basic' | 'sm2';       // 사용 알고리즘
  easeFactor?: number;                // SM-2용 (기본 2.5)
  interval?: number;                  // 복습 간격 (일)
  reps?: number;                      // 연속 성공 횟수
  lapses?: number;                    // 실패 횟수
  
  // 선택적 필드
  tags?: string[];                    // 주제/출처 태그
  example?: string;                   // 예문
  pronunciation?: string;             // 발음기호
  memo?: string;                      // 개인 메모
};
```

### 설정 확장
```typescript
interface StudySettings {
  levelFilter: 'all' | 'beginner' | 'intermediate' | 'advanced';
  sortBy: 'default' | 'alphabetical' | 'difficulty' | 'due';
  sortOrder: 'asc' | 'desc';
  shuffle: boolean;
  duplicatePolicy: 'prevent' | 'overwrite' | 'merge';
  
  // 새로 추가
  algorithm: 'basic' | 'sm2';         // SRS 알고리즘
  dailyLimit: number;                 // 일일 학습량 (기본 20)
  density: 'compact' | 'comfortable'; // UI 밀도
  quizMode: 'subjective' | 'multiple'; // 퀴즈 방식
  enableTTS: boolean;                 // 음성 읽기
  ttsSpeed: number;                   // 읽기 속도 (0.5-2.0)
}
```

## 🎨 UX 개선 사항

### 1. 단축키
- `Space` / `Enter`: 답 보기/확인
- `H`: 힌트
- `S`: 셔플
- `1/2/3`: 난이도 선택 (❌/🤔/✅)
- `G`: 자동재생 토글
- `N`: 다음 단어
- `P`: 이전 단어

### 2. 모바일 제스처
- 스와이프 좌: 이전 단어
- 스와이프 우: 다음 단어
- 탭: 답 보기

### 3. TTS (음성 읽기)
```typescript
const speakWord = (text: string, lang = 'en-US', rate = 1.0) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    speechSynthesis.speak(utterance);
  }
};
```

### 4. 가상 스크롤 (성능 개선)
```typescript
import { FixedSizeList } from 'react-window';

// 단어 목록이 많을 때
<FixedSizeList
  height={400}
  itemCount={filteredWords.length}
  itemSize={60}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      {/* 단어 아이템 렌더링 */}
    </div>
  )}
</FixedSizeList>
```

## 📥 CSV 임포트/익스포트

### CSV 포맷
```csv
english,korean,level,tags,example
serendipity,우연한 발견,advanced,"학습,일상",It was pure serendipity.
ephemeral,일시적인,advanced,학습,Beauty is ephemeral.
```

### 중복 정책
- `prevent`: 중복 단어 건너뛰기
- `overwrite`: 기존 단어 덮어쓰기
- `merge`: 통계 합산 (correct, wrong 합산)

## 🎯 최종 목표

1. ✅ **안정성**: 버그 없는 안정적인 동작
2. 📚 **효율성**: SRS로 효과적인 학습
3. 🎨 **사용성**: 직관적이고 편리한 UI
4. ⚡ **성능**: 1천개 단어에도 부드러운 동작
5. ♿ **접근성**: 스크린리더 지원

## 📤 GPT에게 전달할 내용

```
안녕하세요! 영어 단어 학습 위젯을 개선하고 싶습니다.

[첨부 파일]
1. src/components/widgets/EnglishWordsWidget.tsx (전체)
2. src/components/widgets/utils/widget-helpers.ts
3. src/types/mypage.types.ts

[현재 문제점]
1. 상태 저장이 안됨 (의존성 배열에 state 누락)
2. studyQueue 길이 0일 때 모듈로 연산 NaN 발생
3. autoPlay 타이머 메모리 누수 가능성

[개선 요청사항]
1. 버그 수정 (위 3가지)
2. SM-2 알고리즘 옵션 추가
3. 학습 큐 우선순위 개선 (기한 지남 → 오늘 복습 → 새 단어)
4. 퀴즈 객관식 모드 추가 (4지선다)
5. 힌트 체계 강화 (첫 글자, 글자 수, 초성, 예문)
6. TTS 음성 읽기 기능
7. CSV 임포트/익스포트
8. 가상 스크롤로 성능 개선
9. 키보드 단축키 및 모바일 제스처
10. 접근성 개선 (aria-live)

[유지해야 할 것]
- 기존 calculateNextDue, createStudyQueue 함수 구조
- persistOrLocal, readLocal 유틸리티 사용
- 기존 데이터 마이그레이션 (구버전 호환)

상세 스펙은 첨부된 마크다운 문서를 참고해주세요.
```

---

## 🔍 참고: 현재 위젯 구조

### 주요 함수
- `addWord()`: 단어 추가
- `deleteWord()`: 단어 삭제
- `updateWord()`: 단어 수정
- `calculateNextDue()`: 다음 복습 시간 계산 (SRS)
- `createStudyQueue()`: 학습 큐 생성
- `exportWords()`: JSON/TXT 내보내기
- `importWords()`: JSON/TXT 가져오기
- `searchWords()`: 단어 검색
- `nextWord()`, `prevWord()`: 네비게이션

### 현재 상태 구조
```typescript
interface EnglishWordsState {
  words: Word[];
  studyQueue: Word[];
  currentIndex: number;
  studyMode: 'flashcard' | 'quiz';
  showAnswer: boolean;
  quizAnswer: string;
  quizResult: 'correct' | 'wrong' | null;
  settings: StudySettings;
  searchQuery: string;
  showSettings: boolean;
  showStats: boolean;
  showAddForm: boolean;
  newWord: Partial<Word>;
  editingWord: string | null;
  hintLevel: number;
  autoPlay: boolean;
  autoPlayInterval: number;
}
```

---

이 문서를 GPT에게 함께 전달하면 됩니다!
















