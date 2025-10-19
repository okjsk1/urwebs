// 영어 단어 학습 위젯 - 테마별 학습
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight, Eye, Settings, Play, Pause, RotateCcw } from 'lucide-react';
import { WidgetProps, persistOrLocal, readLocal, showToast } from './utils/widget-helpers';

interface Word {
  id: string;
  english: string;
  korean: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  correct: number;
  wrong: number;
  streak: number;
  nextDue: number;
  createdAt: number;
}

interface EnglishWordsState {
  words: Word[];
  currentIndex: number;
  showAnswer: boolean;
  showSettings: boolean;
  selectedTheme: string;
  autoPlay: boolean;
  autoPlayInterval: number; // 초 단위
  isPlaying: boolean;
}

// 테마별 단어 데이터
const THEME_WORDS: Record<string, Word[]> = {
  elementary: [
    { id: 'e1', english: 'apple', korean: '사과', level: 'beginner', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'e2', english: 'book', korean: '책', level: 'beginner', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'e3', english: 'cat', korean: '고양이', level: 'beginner', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'e4', english: 'dog', korean: '개', level: 'beginner', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'e5', english: 'house', korean: '집', level: 'beginner', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'e6', english: 'water', korean: '물', level: 'beginner', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'e7', english: 'friend', korean: '친구', level: 'beginner', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'e8', english: 'happy', korean: '행복한', level: 'beginner', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
  ],
  middle: [
    { id: 'm1', english: 'beautiful', korean: '아름다운', level: 'intermediate', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'm2', english: 'important', korean: '중요한', level: 'intermediate', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'm3', english: 'difficult', korean: '어려운', level: 'intermediate', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'm4', english: 'interesting', korean: '흥미로운', level: 'intermediate', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'm5', english: 'comfortable', korean: '편안한', level: 'intermediate', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'm6', english: 'necessary', korean: '필요한', level: 'intermediate', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'm7', english: 'possible', korean: '가능한', level: 'intermediate', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'm8', english: 'different', korean: '다른', level: 'intermediate', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
  ],
  high: [
    { id: 'h1', english: 'serendipity', korean: '우연한 발견', level: 'advanced', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'h2', english: 'ephemeral', korean: '일시적인, 덧없는', level: 'advanced', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'h3', english: 'ubiquitous', korean: '어디에나 있는', level: 'advanced', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'h4', english: 'mellifluous', korean: '달콤한 소리의', level: 'advanced', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'h5', english: 'perspicacious', korean: '통찰력 있는', level: 'advanced', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'h6', english: 'luminous', korean: '빛나는', level: 'advanced', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'h7', english: 'resilient', korean: '탄력 있는', level: 'advanced', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'h8', english: 'eloquent', korean: '웅변의', level: 'advanced', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
  ],
  travel: [
    { id: 't1', english: 'passport', korean: '여권', level: 'intermediate', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 't2', english: 'airport', korean: '공항', level: 'intermediate', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 't3', english: 'hotel', korean: '호텔', level: 'beginner', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 't4', english: 'restaurant', korean: '레스토랑', level: 'intermediate', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 't5', english: 'ticket', korean: '표', level: 'beginner', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 't6', english: 'luggage', korean: '짐', level: 'intermediate', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 't7', english: 'currency', korean: '통화', level: 'intermediate', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 't8', english: 'souvenir', korean: '기념품', level: 'intermediate', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
  ],
  toiec: [
    { id: 'to1', english: 'meeting', korean: '회의', level: 'intermediate', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'to2', english: 'deadline', korean: '마감일', level: 'intermediate', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'to3', english: 'budget', korean: '예산', level: 'intermediate', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'to4', english: 'contract', korean: '계약', level: 'intermediate', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'to5', english: 'schedule', korean: '일정', level: 'intermediate', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'to6', english: 'presentation', korean: '발표', level: 'intermediate', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'to7', english: 'negotiation', korean: '협상', level: 'advanced', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'to8', english: 'investment', korean: '투자', level: 'intermediate', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
  ],
  toefl: [
    { id: 'tf1', english: 'hypothesis', korean: '가설', level: 'advanced', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'tf2', english: 'analysis', korean: '분석', level: 'advanced', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'tf3', english: 'synthesis', korean: '종합', level: 'advanced', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'tf4', english: 'evaluation', korean: '평가', level: 'advanced', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'tf5', english: 'interpretation', korean: '해석', level: 'advanced', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'tf6', english: 'comprehensive', korean: '포괄적인', level: 'advanced', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'tf7', english: 'sophisticated', korean: '정교한', level: 'advanced', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'tf8', english: 'substantial', korean: '상당한', level: 'advanced', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
  ],
  daily: [
    { id: 'd1', english: 'breakfast', korean: '아침식사', level: 'beginner', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'd2', english: 'exercise', korean: '운동', level: 'intermediate', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'd3', english: 'shopping', korean: '쇼핑', level: 'beginner', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'd4', english: 'weather', korean: '날씨', level: 'beginner', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'd5', english: 'transportation', korean: '교통수단', level: 'intermediate', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'd6', english: 'entertainment', korean: '오락', level: 'intermediate', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'd7', english: 'communication', korean: '소통', level: 'intermediate', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'd8', english: 'technology', korean: '기술', level: 'intermediate', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
  ],
  business: [
    { id: 'b1', english: 'entrepreneur', korean: '기업가', level: 'advanced', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'b2', english: 'innovation', korean: '혁신', level: 'intermediate', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'b3', english: 'strategy', korean: '전략', level: 'intermediate', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'b4', english: 'revenue', korean: '수익', level: 'intermediate', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'b5', english: 'efficiency', korean: '효율성', level: 'intermediate', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'b6', english: 'collaboration', korean: '협력', level: 'intermediate', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'b7', english: 'leadership', korean: '리더십', level: 'intermediate', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 'b8', english: 'productivity', korean: '생산성', level: 'intermediate', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
  ],
  science: [
    { id: 's1', english: 'experiment', korean: '실험', level: 'intermediate', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 's2', english: 'hypothesis', korean: '가설', level: 'advanced', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 's3', english: 'microscope', korean: '현미경', level: 'intermediate', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 's4', english: 'molecule', korean: '분자', level: 'intermediate', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 's5', english: 'ecosystem', korean: '생태계', level: 'intermediate', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 's6', english: 'evolution', korean: '진화', level: 'intermediate', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 's7', english: 'photosynthesis', korean: '광합성', level: 'advanced', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
    { id: 's8', english: 'metabolism', korean: '신진대사', level: 'advanced', correct: 0, wrong: 0, streak: 0, nextDue: Date.now(), createdAt: Date.now() },
  ]
};

const THEME_OPTIONS = [
  { value: 'elementary', label: '초등학생', emoji: '🎒' },
  { value: 'middle', label: '중학생', emoji: '📚' },
  { value: 'high', label: '고등학생', emoji: '🎓' },
  { value: 'travel', label: '해외여행', emoji: '✈️' },
  { value: 'toiec', label: '토익', emoji: '💼' },
  { value: 'toefl', label: '토플', emoji: '🎯' },
  { value: 'daily', label: '실생활', emoji: '🏠' },
  { value: 'business', label: '비즈니스', emoji: '💼' },
  { value: 'science', label: '과학', emoji: '🔬' },
];

export const EnglishWordsWidget = ({ widget, isEditMode, updateWidget }: WidgetProps) => {
  const [state, setState] = useState(() => {
    const saved = readLocal(widget.id, {
      words: THEME_WORDS.elementary,
      currentIndex: 0,
      showAnswer: false,
      showSettings: false,
      selectedTheme: 'elementary',
      autoPlay: true,
      autoPlayInterval: 10,
      isPlaying: true
    });
    return saved;
  });

  // 상태 저장
  useEffect(() => {
    persistOrLocal(widget.id, state, updateWidget);
  }, [widget.id, state, updateWidget]);

  // 자동 재생 타이머
  useEffect(() => {
    if (!state.autoPlay || !state.isPlaying || state.words.length === 0) return;

    const timer = setInterval(() => {
      setState(prev => ({
        ...prev,
        currentIndex: (prev.currentIndex + 1) % prev.words.length,
        showAnswer: false
      }));
    }, state.autoPlayInterval * 1000);

    return () => clearInterval(timer);
  }, [state.autoPlay, state.isPlaying, state.autoPlayInterval, state.words.length]);

  const currentWord = state.words[state.currentIndex];

  const nextWord = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.words.length,
      showAnswer: false
    }));
  }, []);

  const prevWord = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentIndex: prev.currentIndex === 0 ? prev.words.length - 1 : prev.currentIndex - 1,
      showAnswer: false
    }));
  }, []);

  const toggleAnswer = useCallback(() => {
    setState(prev => ({ ...prev, showAnswer: !prev.showAnswer }));
  }, []);

  const toggleAutoPlay = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  const changeTheme = useCallback((theme: string) => {
    setState(prev => ({
      ...prev,
      selectedTheme: theme,
      words: THEME_WORDS[theme] || THEME_WORDS.elementary,
      currentIndex: 0,
      showAnswer: false
    }));
  }, []);

  const changeInterval = useCallback((interval: number) => {
    setState(prev => ({ ...prev, autoPlayInterval: interval }));
  }, []);

  const resetProgress = useCallback(() => {
    setState(prev => ({
      ...prev,
      words: prev.words.map(word => ({
        ...word,
        correct: 0,
        wrong: 0,
        streak: 0
      })),
      currentIndex: 0,
      showAnswer: false
    }));
    showToast('학습 진도가 초기화되었습니다.');
  }, []);

  if (!currentWord) {
    return (
      <div className="p-3 h-full flex flex-col items-center justify-center text-center">
        <div className="text-2xl mb-2">📚</div>
        <div className="text-sm text-gray-500">단어를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="p-3 h-full flex flex-col">
      {/* 설정 패널 */}
      {isEditMode && state.showSettings && (
        <div className="mb-3 p-2 bg-gray-50 rounded-lg space-y-2 shrink-0">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">테마 선택</label>
            <div className="grid grid-cols-2 gap-1">
              {THEME_OPTIONS.map(theme => (
                <Button
                  key={theme.value}
                  size="sm"
                  variant={state.selectedTheme === theme.value ? 'default' : 'outline'}
                  className="h-6 text-xs justify-start"
                  onClick={() => changeTheme(theme.value)}
                >
                  <span className="mr-1">{theme.emoji}</span>
                  {theme.label}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">자동 재생 간격</label>
            <div className="flex gap-1">
              {[10, 20, 30].map(interval => (
                <Button
                  key={interval}
                  size="sm"
                  variant={state.autoPlayInterval === interval ? 'default' : 'outline'}
                  className="h-6 text-xs flex-1"
                  onClick={() => changeInterval(interval)}
                >
                  {interval}초
                </Button>
              ))}
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              className="h-6 text-xs flex-1"
              onClick={resetProgress}
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              진도 초기화
            </Button>
          </div>
        </div>
      )}

      {/* 단어 카드 */}
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-full">
          {/* 현재 단어 번호 표시 */}
          <div className="text-xs text-gray-500 mb-2">
            {state.currentIndex + 1} / {state.words.length}
          </div>
          
          <div className="text-2xl font-bold text-gray-800 mb-2">
            {currentWord.english}
          </div>
          <div className="text-sm text-gray-500 mb-4">
            {currentWord.level === 'beginner' && '🟢 초급'}
            {currentWord.level === 'intermediate' && '🟡 중급'}
            {currentWord.level === 'advanced' && '🔴 고급'}
          </div>
          
          {/* 답 항상 표시 */}
          <div className="text-lg text-blue-600 font-medium">
            {currentWord.korean}
          </div>
        </div>

        {/* 학습 통계 */}
        <div className="flex gap-4 text-xs text-gray-500">
          <span>정답: {currentWord.correct}</span>
          <span>오답: {currentWord.wrong}</span>
          <span>연속: {currentWord.streak}</span>
        </div>
      </div>

      {/* 네비게이션 및 컨트롤 */}
      <div className="flex items-center justify-between shrink-0">
        <Button
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={prevWord}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={toggleAutoPlay}
            title={state.isPlaying ? "일시정지" : "재생"}
          >
            {state.isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </Button>
          <div className="text-xs text-gray-500">
            {state.autoPlay && state.isPlaying ? `${state.autoPlayInterval}초` : '수동'}
          </div>
        </div>
        
        <Button
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={nextWord}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};