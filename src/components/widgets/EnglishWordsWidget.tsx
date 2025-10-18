// 영어 단어 학습 위젯 - 컴팩트 버전
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight, Eye, Plus } from 'lucide-react';
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
  showAddForm: boolean;
  newWord: Partial<Word>;
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
  }
];

export const EnglishWordsWidget: React.FC<WidgetProps> = ({ widget, isEditMode, updateWidget }) => {
  const [state, setState] = useState<EnglishWordsState>(() => {
    const saved = readLocal(widget.id, {
      words: DEFAULT_WORDS,
      currentIndex: 0,
      showAnswer: false,
      showAddForm: false,
      newWord: { level: 'intermediate' }
    });
    return saved;
  });

  // 상태 저장
  useEffect(() => {
    persistOrLocal(widget.id, state, updateWidget);
  }, [widget.id, state, updateWidget]);

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

  const addWord = useCallback(() => {
    const { english, korean } = state.newWord;
    
    if (!english?.trim()) {
      showToast('영어 단어를 입력하세요', 'error');
      return;
    }
    
    if (!korean?.trim()) {
      showToast('한국어 뜻을 입력하세요', 'error');
      return;
    }

    const newWord: Word = {
      id: Date.now().toString(),
      english: english.trim(),
      korean: korean.trim(),
      level: (state.newWord.level as any) || 'intermediate',
      correct: 0,
      wrong: 0,
      streak: 0,
      nextDue: Date.now(),
      createdAt: Date.now()
    };

    setState(prev => ({
      ...prev,
      words: [...prev.words, newWord],
      newWord: { level: 'intermediate' },
      showAddForm: false
    }));
    showToast('단어가 추가되었습니다', 'success');
  }, [state.newWord]);

  return (
    <div className="p-1 h-full flex flex-col">
      {/* 컴팩트 헤더 */}
      <div className="text-center mb-1 flex-shrink-0">
        <div className="text-sm mb-0.5">📚</div>
        <h4 className="font-semibold text-xs text-gray-800 dark:text-gray-100">영어 단어</h4>
      </div>

      {/* 현재 단어 표시 - 컴팩트 버전 */}
      {currentWord && (
        <div className="flex-1 flex flex-col justify-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-2 rounded text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
              {state.currentIndex + 1} / {state.words.length}
            </div>
            <div className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-1">
              {currentWord.english}
            </div>
            {state.showAnswer ? (
              <div className="text-xs text-gray-600 dark:text-gray-300">
                {currentWord.korean}
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="h-5 text-xs px-2"
                onClick={() => setState(prev => ({ ...prev, showAnswer: !prev.showAnswer }))}
              >
                <Eye className="w-3 h-3 mr-1" />
                답 보기
              </Button>
            )}
          </div>
          
          {/* 네비게이션 */}
          <div className="flex justify-between items-center mt-1">
            <Button
              size="sm"
              variant="outline"
              className="h-4 text-xs px-1"
              onClick={prevWord}
              disabled={state.words.length <= 1}
            >
              <ChevronLeft className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-4 text-xs px-1"
              onClick={nextWord}
              disabled={state.words.length <= 1}
            >
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {/* 편집 모드에서만 표시되는 컨트롤 */}
      {isEditMode && (
        <div className="mt-1 flex-shrink-0">
          <Button
            size="sm"
            variant="outline"
            className="w-full h-4 text-xs"
            onClick={() => setState(prev => ({ ...prev, showAddForm: !prev.showAddForm }))}
          >
            <Plus className="w-3 h-3 mr-1" />
            단어 추가
          </Button>
        </div>
      )}

      {/* 단어 추가 폼 */}
      {isEditMode && state.showAddForm && (
        <div className="mt-1 space-y-1 p-1 bg-gray-50 dark:bg-gray-700 rounded flex-shrink-0">
          <input
            type="text"
            value={state.newWord.english || ''}
            onChange={(e) => setState(prev => ({
              ...prev,
              newWord: { ...prev.newWord, english: e.target.value }
            }))}
            placeholder="영어 단어"
            className="w-full text-xs px-1 py-0.5 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-600 dark:text-gray-100"
          />
          <input
            type="text"
            value={state.newWord.korean || ''}
            onChange={(e) => setState(prev => ({
              ...prev,
              newWord: { ...prev.newWord, korean: e.target.value }
            }))}
            placeholder="한국어 뜻"
            className="w-full text-xs px-1 py-0.5 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-600 dark:text-gray-100"
          />
          <div className="flex gap-1">
            <Button
              size="sm"
              className="flex-1 h-4 text-xs"
              onClick={addWord}
            >
              추가
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-4 text-xs"
              onClick={() => setState(prev => ({
                ...prev,
                showAddForm: false,
                newWord: { level: 'intermediate' }
              }))}
            >
              취소
            </Button>
          </div>
        </div>
      )}

      {/* 빈 상태 */}
      {!currentWord && (
        <div className="text-center text-gray-500 text-xs py-4 flex-1 flex flex-col justify-center">
          <div className="text-2xl mb-2">📝</div>
          <div>단어가 없습니다.</div>
          <div className="text-gray-400 mt-1">편집 모드에서 단어를 추가해보세요.</div>
        </div>
      )}
    </div>
  );
};