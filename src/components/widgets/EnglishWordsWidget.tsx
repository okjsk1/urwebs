// 영어 단어 학습 위젯 - SRS, 플래시카드/퀴즈, 임포트/익스포트, 반응형
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Button } from '../ui/button';
import { useDebouncedEffect } from '../../hooks/useDebouncedEffect';
import { 
  ChevronLeft, 
  ChevronRight, 
  Shuffle, 
  Eye, 
  EyeOff, 
  Download, 
  Upload,
  Settings,
  BarChart3,
  Search,
  Filter,
  Edit,
  Trash2,
  Check,
  X
} from 'lucide-react';
import { 
  WidgetProps, 
  persistOrLocal, 
  readLocal, 
  showToast 
} from './utils/widget-helpers';
import {
  Word,
  StudySettings,
  StudyStats,
  isAnswerCorrect,
  calculateNextDue,
  sortWords,
  filterWordsByLevel,
  searchWords,
  shuffleWords,
  calculateStudyStats,
  formatTimeUntilDue,
  generateHint,
  findDuplicateWord,
  exportWordsToJSON,
  importWordsFromJSON,
  mergeWords,
  getLevelConfig,
  createStudyQueue
} from './utils/word-helpers';

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
  autoPlayInterval: number; // 초 단위
}

const DEFAULT_WORDS: Word[] = [
  {
    id: '1',
    english: 'serendipity',
    korean: '우연한 발견',
    level: 'advanced',
    correct: 0,
    wrong: 0,
    streak: 0,
    nextDue: Date.now(),
    createdAt: Date.now()
  },
  {
    id: '2',
    english: 'ephemeral',
    korean: '일시적인, 덧없는',
    level: 'advanced',
    correct: 0,
    wrong: 0,
    streak: 0,
    nextDue: Date.now(),
    createdAt: Date.now()
  },
  {
    id: '3',
    english: 'ubiquitous',
    korean: '어디에나 있는',
    level: 'advanced',
    correct: 0,
    wrong: 0,
    streak: 0,
    nextDue: Date.now(),
    createdAt: Date.now()
  },
  {
    id: '4',
    english: 'meticulous',
    korean: '꼼꼼한',
    level: 'intermediate',
    correct: 0,
    wrong: 0,
    streak: 0,
    nextDue: Date.now(),
    createdAt: Date.now()
  },
  {
    id: '5',
    english: 'resilient',
    korean: '회복력 있는',
    level: 'intermediate',
    correct: 0,
    wrong: 0,
    streak: 0,
    nextDue: Date.now(),
    createdAt: Date.now()
  }
];

const DEFAULT_SETTINGS: StudySettings = {
  levelFilter: 'all',
  sortBy: 'default',
  sortOrder: 'asc',
  shuffle: false,
  showHint: true,
  duplicatePolicy: 'prevent'
};

export const EnglishWordsWidget: React.FC<WidgetProps> = ({ widget, isEditMode, updateWidget }) => {
  const [state, setState] = useState<EnglishWordsState>(() => {
    const saved = readLocal(widget.id, {
      words: DEFAULT_WORDS,
      studyQueue: [],
      currentIndex: 0,
      studyMode: 'flashcard' as const,
      showAnswer: false,
      quizAnswer: '',
      quizResult: null,
      settings: DEFAULT_SETTINGS,
      searchQuery: '',
      showSettings: false,
      showStats: false,
      showAddForm: false,
      newWord: { level: 'intermediate' },
      editingWord: null,
      hintLevel: 2,
      autoPlay: false,
      autoPlayInterval: 3 // 기본 3초
    });
    // words와 studyQueue가 배열인지 확인하고 아니면 기본값 사용
    return {
      ...saved,
      words: Array.isArray(saved.words) ? saved.words : DEFAULT_WORDS,
      studyQueue: Array.isArray(saved.studyQueue) ? saved.studyQueue : []
    };
  });

  const quizInputRef = useRef<HTMLInputElement>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 상태 저장 (디바운스 적용)
  useDebouncedEffect(() => {
    persistOrLocal(widget.id, state, updateWidget);
  }, [widget.id, state], 300);

  // 학습 큐 업데이트
  useEffect(() => {
    const queue = createStudyQueue(state.words, state.settings);
    setState(prev => ({ 
      ...prev, 
      studyQueue: queue,
      currentIndex: Math.min(prev.currentIndex, queue.length - 1)
    }));
  }, [state.words, state.settings]);

  // 자동 재생 기능
  useEffect(() => {
    // 기존 타이머 정리
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
    
    // 자동재생 조건 확인
    if (state.autoPlay && state.studyMode === 'flashcard' && state.studyQueue.length > 0) {
      autoPlayTimerRef.current = setInterval(() => {
        setState(prev => {
          if (prev.studyQueue.length === 0) return prev; // 안전 체크
          return {
            ...prev,
            currentIndex: safeNext(prev.studyQueue.length, prev.currentIndex),
            showAnswer: false
          };
        });
      }, state.autoPlayInterval * 1000);
    }

    // 클린업
    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
    };
  }, [state.autoPlay, state.autoPlayInterval, state.studyMode, state.studyQueue.length]);

  // 키보드 단축키
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target instanceof HTMLInputElement || 
          target instanceof HTMLTextAreaElement ||
          target.contentEditable === 'true') {
        return; // contentEditable도 예외 처리
      }
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          prevWord();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextWord();
          break;
        case 'Enter':
          if (state.studyMode === 'quiz' && state.quizAnswer) {
            e.preventDefault();
            checkQuizAnswer();
          }
          break;
        case ' ':
          e.preventDefault();
          toggleAutoPlay();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [state.studyMode, state.quizAnswer]);

  const currentWord = state.studyQueue[state.currentIndex];

  const addWord = useCallback(() => {
    const { english, korean, level } = state.newWord;
    
    if (!english?.trim()) {
      showToast('영어 단어를 입력하세요', 'error');
      return;
    }
    
    if (!korean?.trim()) {
      showToast('한국어 뜻을 입력하세요', 'error');
      return;
    }

    const duplicate = findDuplicateWord(state.words, english.trim());
    if (duplicate && state.settings.duplicatePolicy === 'prevent') {
      showToast('이미 존재하는 단어입니다', 'error');
      return;
    }

    const newWord: Word = {
      id: Date.now().toString(),
      english: english.trim(),
      korean: korean.trim(),
      level: (level as any) || 'intermediate',
      correct: 0,
      wrong: 0,
      streak: 0,
      nextDue: Date.now(),
      createdAt: Date.now()
    };

    if (duplicate && state.settings.duplicatePolicy === 'overwrite') {
      setState(prev => ({
        ...prev,
        words: prev.words.map(w => w.id === duplicate.id ? { ...w, ...newWord } : w),
        newWord: { level: 'intermediate' },
        showAddForm: false
      }));
      showToast('단어가 업데이트되었습니다', 'success');
    } else {
      setState(prev => ({
        ...prev,
        words: [...prev.words, newWord],
        newWord: { level: 'intermediate' },
        showAddForm: false
      }));
      showToast('단어가 추가되었습니다', 'success');
    }
  }, [state.newWord, state.words, state.settings.duplicatePolicy]);

  const updateWord = useCallback((id: string, updates: Partial<Word>) => {
    setState(prev => ({
      ...prev,
      words: prev.words.map(word => 
        word.id === id ? { ...word, ...updates } : word
      ),
      editingWord: null
    }));
    showToast('단어가 업데이트되었습니다', 'success');
  }, []);

  const deleteWord = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      words: prev.words.filter(word => word.id !== id),
      currentIndex: Math.min(prev.currentIndex, prev.studyQueue.length - 2)
    }));
    showToast('단어가 삭제되었습니다', 'success');
  }, []);

  // 안전한 인덱스 이동 함수
  const safeNext = (len: number, i: number) => (len > 0 ? (i + 1) % len : 0);
  const safePrev = (len: number, i: number) => (len > 0 ? (i - 1 + len) % len : 0);

  const nextWord = useCallback(() => {
    setState(prev => {
      if (prev.studyQueue.length === 0) return prev; // 방어 로직
      return {
        ...prev,
        currentIndex: safeNext(prev.studyQueue.length, prev.currentIndex),
        showAnswer: false,
        quizAnswer: '',
        quizResult: null,
        hintLevel: 2
      };
    });
  }, []);

  const prevWord = useCallback(() => {
    setState(prev => {
      if (prev.studyQueue.length === 0) return prev; // 방어 로직
      return {
        ...prev,
        currentIndex: safePrev(prev.studyQueue.length, prev.currentIndex),
        showAnswer: false,
        quizAnswer: '',
        quizResult: null,
        hintLevel: 2
      };
    });
  }, []);

  const toggleAnswer = useCallback(() => {
    setState(prev => ({ ...prev, showAnswer: !prev.showAnswer }));
  }, []);

  const checkQuizAnswer = useCallback(() => {
    if (!state.quizAnswer.trim() || !currentWord) return;

    const isCorrect = isAnswerCorrect(state.quizAnswer, currentWord.korean);
    const now = Date.now();

    setState(prev => ({
      ...prev,
      quizResult: isCorrect ? 'correct' : 'wrong',
      words: prev.words.map(word => 
        word.id === currentWord.id 
          ? {
              ...word,
              correct: word.correct + (isCorrect ? 1 : 0),
              wrong: word.wrong + (isCorrect ? 0 : 1),
              streak: isCorrect ? word.streak + 1 : 0,
              nextDue: calculateNextDue(word, isCorrect),
              lastReviewedAt: now
            }
          : word
      )
    }));

    if (isCorrect) {
      showToast('정답입니다!', 'success');
    } else {
      showToast('틀렸습니다', 'error');
    }
  }, [state.quizAnswer, currentWord]);

  const shuffleQueue = useCallback(() => {
    setState(prev => ({
      ...prev,
      studyQueue: shuffleWords(prev.studyQueue),
      currentIndex: 0
    }));
    showToast('단어 순서가 섞였습니다', 'success');
  }, []);

  const showMoreHint = useCallback(() => {
    setState(prev => ({ ...prev, hintLevel: Math.min(prev.hintLevel + 1, 5) }));
  }, []);

  const toggleAutoPlay = useCallback(() => {
    setState(prev => ({ ...prev, autoPlay: !prev.autoPlay }));
  }, []);

  const updateAutoPlayInterval = useCallback((interval: number) => {
    setState(prev => ({ ...prev, autoPlayInterval: interval }));
  }, []);

  const exportWords = useCallback(() => {
    try {
      const jsonData = exportWordsToJSON(state.words);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `english-words-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('단어가 내보내기되었습니다', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : '내보내기 실패';
      showToast(message, 'error');
    }
  }, [state.words]);

  const importWords = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonString = e.target?.result as string;
        const importedWords = importWordsFromJSON(jsonString);
        const mergedWords = mergeWords(state.words, importedWords, state.settings.duplicatePolicy);
        
        setState(prev => ({
          ...prev,
          words: mergedWords
        }));
        showToast(`${importedWords.length}개 단어가 가져와졌습니다`, 'success');
      } catch (error) {
        const message = error instanceof Error ? error.message : '알 수 없는 오류';
        showToast(`가져오기 실패: ${message}`, 'error');
      }
    };
    reader.readAsText(file);
  }, [state.words, state.settings.duplicatePolicy]);

  const studyStats = useMemo(() => calculateStudyStats(state.words), [state.words]);

  const filteredWords = useMemo(() => {
    let filtered = searchWords(state.words, state.searchQuery);
    return filtered;
  }, [state.words, state.searchQuery]);

  return (
    <div className="p-3">
      {/* 헤더 제거 - 단어와 발음기호만 표시 */}

      {/* 상단 컨트롤 */}
      <div className="flex flex-wrap gap-1 mb-3">
        <Button
          size="sm"
          variant={state.studyMode === 'flashcard' ? 'default' : 'outline'}
          className="h-6 text-xs"
          onClick={() => setState(prev => ({ ...prev, studyMode: 'flashcard' }))}
          aria-label="플래시카드 모드"
        >
          플래시카드
        </Button>
        <Button
          size="sm"
          variant={state.studyMode === 'quiz' ? 'default' : 'outline'}
          className="h-6 text-xs"
          onClick={() => setState(prev => ({ ...prev, studyMode: 'quiz' }))}
          aria-label="퀴즈 모드"
        >
          퀴즈
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-xs"
          onClick={() => setState(prev => ({ ...prev, showSettings: !prev.showSettings }))}
          aria-label="설정"
        >
          <Settings className="w-3 h-3" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-xs"
          onClick={() => setState(prev => ({ ...prev, showStats: !prev.showStats }))}
          aria-label="통계"
        >
          <BarChart3 className="w-3 h-3" />
        </Button>
      </div>

      {/* 통계 대시보드 */}
      {state.showStats && (
        <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center">
              <div className="font-bold text-blue-800">{studyStats.totalWords}</div>
              <div className="text-blue-600">총 단어</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-blue-800">{studyStats.wordsDue}</div>
              <div className="text-blue-600">복습 필요</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-blue-800">{studyStats.averageAccuracy}%</div>
              <div className="text-blue-600">정답률</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-blue-800">{studyStats.wordsMastered}</div>
              <div className="text-blue-600">마스터</div>
            </div>
          </div>
        </div>
      )}

      {/* 설정 패널 */}
      {state.showSettings && (
        <div className="mb-3 p-2 bg-gray-50 rounded space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <select
              value={state.settings.levelFilter}
              onChange={(e) => setState(prev => ({
                ...prev,
                settings: { ...prev.settings, levelFilter: e.target.value as any }
              }))}
              className="text-xs px-2 py-1 border border-gray-300 rounded"
              aria-label="레벨 필터"
            >
              <option value="all">전체</option>
              <option value="beginner">초급</option>
              <option value="intermediate">중급</option>
              <option value="advanced">고급</option>
            </select>
            <select
              value={state.settings.sortBy}
              onChange={(e) => setState(prev => ({
                ...prev,
                settings: { ...prev.settings, sortBy: e.target.value as any }
              }))}
              className="text-xs px-2 py-1 border border-gray-300 rounded"
              aria-label="정렬 기준"
            >
              <option value="default">추가순</option>
              <option value="alphabetical">알파벳순</option>
              <option value="accuracy">정답률</option>
              <option value="dueDate">복습 예정</option>
            </select>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={state.settings.shuffle}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  settings: { ...prev.settings, shuffle: e.target.checked }
                }))}
                className="w-3 h-3"
              />
              셔플
            </label>
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={state.settings.duplicatePolicy === 'overwrite'}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  settings: { 
                    ...prev.settings, 
                    duplicatePolicy: e.target.checked ? 'overwrite' : 'prevent' 
                  }
                }))}
                className="w-3 h-3"
              />
              중복 덮어쓰기
            </label>
          </div>
        </div>
      )}

      {/* 학습 카드 */}
      {currentWord && (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <span className={`px-2 py-1 rounded-full text-xs ${getLevelConfig(currentWord.level).color}`}>
                {getLevelConfig(currentWord.level).label}
              </span>
              <div className="text-right text-xs text-gray-500">
                <div>{state.currentIndex + 1} / {state.studyQueue.length}</div>
                <div>{formatTimeUntilDue(currentWord.nextDue)}</div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800 mb-2">
                {currentWord.english}
              </div>
              
              {state.studyMode === 'flashcard' ? (
                <div>
                  {state.showAnswer ? (
                    <div className="text-sm text-gray-600 mb-2">
                      {currentWord.korean}
                    </div>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-6 text-xs"
                      onClick={toggleAnswer}
                      aria-label="답 보기"
                    >
                      {state.showAnswer ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                      {state.showAnswer ? '숨기기' : '답 보기'}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    ref={quizInputRef}
                    type="text"
                    value={state.quizAnswer}
                    onChange={(e) => setState(prev => ({ ...prev, quizAnswer: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && checkQuizAnswer()}
                    placeholder="한국어 뜻을 입력하세요"
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    aria-label="한국어 뜻 입력"
                  />
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      className="flex-1 h-6 text-xs"
                      onClick={checkQuizAnswer}
                      disabled={!state.quizAnswer.trim()}
                    >
                      확인
                    </Button>
                    {state.settings.showHint && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 text-xs"
                        onClick={showMoreHint}
                      >
                        힌트
                      </Button>
                    )}
                  </div>
                  
                  {state.settings.showHint && state.hintLevel > 2 && (
                    <div className="text-xs text-gray-600 p-2 bg-gray-100 rounded">
                      힌트: {generateHint(currentWord.korean, state.hintLevel)}
                    </div>
                  )}
                  
                  {state.quizResult && (
                    <div className={`text-xs p-2 rounded ${
                      state.quizResult === 'correct' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {state.quizResult === 'correct' 
                        ? `정답입니다! (연속 ${currentWord.streak + 1}번째 정답)` 
                        : `틀렸습니다. 정답: ${currentWord.korean}`}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 통계 */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-green-50 p-2 rounded text-center">
              <div className="text-green-600 font-medium">{currentWord.correct}</div>
              <div className="text-green-600">정답</div>
            </div>
            <div className="bg-red-50 p-2 rounded text-center">
              <div className="text-red-600 font-medium">{currentWord.wrong}</div>
              <div className="text-red-600">오답</div>
            </div>
            <div className="bg-blue-50 p-2 rounded text-center">
              <div className="text-blue-600 font-medium">{currentWord.streak}</div>
              <div className="text-blue-600">연속</div>
            </div>
          </div>

          {/* 자동 재생 컨트롤 */}
          {state.studyMode === 'flashcard' && (
            <div className="flex items-center justify-center gap-2 p-2 bg-gray-50 rounded">
              <Button 
                size="sm" 
                variant={state.autoPlay ? "default" : "outline"}
                className="h-6 text-xs"
                onClick={toggleAutoPlay}
                aria-label="자동 재생"
              >
                {state.autoPlay ? '⏸️' : '▶️'}
                {state.autoPlay ? '정지' : '자동재생'}
              </Button>
              {state.autoPlay && (
                <select
                  value={state.autoPlayInterval}
                  onChange={(e) => updateAutoPlayInterval(Number(e.target.value))}
                  className="text-xs px-1 py-1 border border-gray-300 rounded"
                  aria-label="자동 재생 간격"
                >
                  <option value={1}>1초</option>
                  <option value={2}>2초</option>
                  <option value={3}>3초</option>
                  <option value={5}>5초</option>
                  <option value={10}>10초</option>
                </select>
              )}
            </div>
          )}

          {/* 네비게이션 */}
          <div className="flex justify-between items-center">
            <Button 
              size="sm" 
              variant="outline" 
              className="h-6 text-xs"
              onClick={prevWord}
              disabled={state.studyQueue.length <= 1 || state.autoPlay}
              aria-label="이전 단어"
            >
              <ChevronLeft className="w-3 h-3 mr-1" />
              이전
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-6 text-xs"
              onClick={shuffleQueue}
              disabled={state.autoPlay}
              aria-label="단어 섞기"
            >
              <Shuffle className="w-3 h-3 mr-1" />
              섞기
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-6 text-xs"
              onClick={nextWord}
              disabled={state.studyQueue.length <= 1 || state.autoPlay}
              aria-label="다음 단어"
            >
              다음
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* 편집 모드 */}
      {isEditMode && (
        <div className="mt-4 space-y-3">
          {/* 검색 및 단어 관리 */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
              <input
                type="text"
                value={state.searchQuery}
                onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
                placeholder="단어 검색..."
                className="w-full pl-7 pr-2 py-1 text-xs border border-gray-300 rounded"
                aria-label="단어 검색"
              />
            </div>

            {/* 단어 목록 */}
            <div className="max-h-32 overflow-y-auto space-y-1">
              {filteredWords.map(word => (
                <div key={word.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                  <div className="flex-1">
                    <div className="font-medium">{word.english}</div>
                    <div className="text-gray-600">{word.korean}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-1 py-0.5 rounded text-xs ${getLevelConfig(word.level).color}`}>
                        {getLevelConfig(word.level).label}
                      </span>
                      <span className="text-gray-500">
                        정답률: {word.correct + word.wrong > 0 ? Math.round((word.correct / (word.correct + word.wrong)) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setState(prev => ({ ...prev, editingWord: word.id }))}
                      className="text-blue-500 hover:text-blue-700"
                      aria-label="단어 편집"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => deleteWord(word.id)}
                      className="text-red-500 hover:text-red-700"
                      aria-label="단어 삭제"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 단어 추가/편집 폼 */}
          {!state.showAddForm && !state.editingWord && (
            <Button
              size="sm"
              variant="outline"
              className="w-full h-6 text-xs"
              onClick={() => setState(prev => ({ ...prev, showAddForm: true }))}
            >
              <Plus className="w-3 h-3 mr-1" />
              단어 추가
            </Button>
          )}

          {(state.showAddForm || state.editingWord) && (
            <div className="space-y-2 p-2 bg-gray-50 rounded">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={state.newWord.english || ''}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    newWord: { ...prev.newWord, english: e.target.value }
                  }))}
                  placeholder="영어 단어"
                  className="text-xs px-2 py-1 border border-gray-300 rounded"
                  aria-label="영어 단어 입력"
                />
                <input
                  type="text"
                  value={state.newWord.korean || ''}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    newWord: { ...prev.newWord, korean: e.target.value }
                  }))}
                  placeholder="한국어 뜻 (예: 일시적인, 덧없는)"
                  className="text-xs px-2 py-1 border border-gray-300 rounded"
                  aria-label="한국어 뜻 입력"
                />
              </div>
              <select
                value={state.newWord.level || 'intermediate'}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  newWord: { ...prev.newWord, level: e.target.value as any }
                }))}
                className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
                aria-label="레벨 선택"
              >
                <option value="beginner">초급</option>
                <option value="intermediate">중급</option>
                <option value="advanced">고급</option>
              </select>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  className="flex-1 h-6 text-xs"
                  onClick={addWord}
                >
                  {state.editingWord ? '수정' : '추가'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs"
                  onClick={() => setState(prev => ({
                    ...prev,
                    showAddForm: false,
                    editingWord: null,
                    newWord: { level: 'intermediate' }
                  }))}
                >
                  취소
                </Button>
              </div>
            </div>
          )}

          {/* 임포트/익스포트 */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-6 text-xs"
              onClick={exportWords}
            >
              <Download className="w-3 h-3 mr-1" />
              내보내기
            </Button>
            <label className="flex-1">
              <Button
                size="sm"
                variant="outline"
                className="w-full h-6 text-xs"
                asChild
              >
                <span>
                  <Upload className="w-3 h-3 mr-1" />
                  가져오기
                </span>
              </Button>
              <input
                type="file"
                accept=".json"
                onChange={importWords}
                className="hidden"
                aria-label="JSON 파일 가져오기"
              />
            </label>
          </div>
        </div>
      )}

      {/* 빈 상태 */}
      {state.words.length === 0 && (
        <div className="text-center text-gray-500 text-xs py-8">
          <div className="text-2xl mb-2">📝</div>
          <div>단어가 없습니다.</div>
          <div className="text-gray-400 mt-1">편집 모드에서 단어를 추가해보세요.</div>
        </div>
      )}
    </div>
  );
};
