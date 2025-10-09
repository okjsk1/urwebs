// 영어 단어 학습 관련 유틸리티 함수들
export interface Word {
  id: string;
  english: string;
  korean: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  correct: number;
  wrong: number;
  streak: number;
  nextDue: number;
  lastReviewedAt?: number;
  createdAt: number;
}

export interface StudySettings {
  levelFilter: 'all' | 'beginner' | 'intermediate' | 'advanced';
  sortBy: 'default' | 'alphabetical' | 'accuracy' | 'dueDate';
  sortOrder: 'asc' | 'desc';
  shuffle: boolean;
  showHint: boolean;
  duplicatePolicy: 'prevent' | 'overwrite';
}

export interface StudyStats {
  totalWords: number;
  totalCorrect: number;
  totalWrong: number;
  averageAccuracy: number;
  wordsDue: number;
  wordsMastered: number;
}

// SRS (Spaced Repetition System) 설정
export const SRS_CONFIG = {
  baseIntervals: {
    beginner: 2 * 60 * 60 * 1000, // 2시간
    intermediate: 6 * 60 * 60 * 1000, // 6시간
    advanced: 12 * 60 * 60 * 1000 // 12시간
  },
  maxStreak: 10,
  maxInterval: 30 * 24 * 60 * 60 * 1000 // 30일
};

// 정답 비교 (대소문자/공백 무시, 정확 일치)
export const isAnswerCorrect = (userAnswer: string, correctAnswer: string): boolean => {
  const normalizedUser = userAnswer.trim().toLowerCase();
  const normalizedCorrect = correctAnswer.trim().toLowerCase();
  
  // 여러 한국어 뜻 처리 (콤마로 구분)
  const correctAnswers = normalizedCorrect.split(',').map(answer => answer.trim());
  
  return correctAnswers.some(answer => answer === normalizedUser);
};

// 다음 복습 일정 계산
export const calculateNextDue = (word: Word, isCorrect: boolean): number => {
  const now = Date.now();
  const baseInterval = SRS_CONFIG.baseIntervals[word.level];
  
  if (isCorrect) {
    const newStreak = word.streak + 1;
    const interval = Math.min(baseInterval * Math.pow(2, newStreak - 1), SRS_CONFIG.maxInterval);
    return now + interval;
  } else {
    // 오답 시 기본 간격으로 리셋
    return now + baseInterval;
  }
};

// 복습 예정인 단어 필터링
export const getWordsDueForReview = (words: Word[]): Word[] => {
  const now = Date.now();
  return words.filter(word => word.nextDue <= now);
};

// 단어 정렬
export const sortWords = (words: Word[], sortBy: string, sortOrder: 'asc' | 'desc'): Word[] => {
  const sorted = [...words].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'alphabetical':
        comparison = a.english.localeCompare(b.english);
        break;
      case 'accuracy':
        const accuracyA = a.correct + a.wrong > 0 ? a.correct / (a.correct + a.wrong) : 0;
        const accuracyB = b.correct + b.wrong > 0 ? b.correct / (b.correct + b.wrong) : 0;
        comparison = accuracyA - accuracyB;
        break;
      case 'dueDate':
        comparison = a.nextDue - b.nextDue;
        break;
      case 'default':
      default:
        comparison = a.createdAt - b.createdAt;
        break;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });
  
  return sorted;
};

// 단어 필터링 (레벨별)
export const filterWordsByLevel = (words: Word[], level: string): Word[] => {
  if (level === 'all') return words;
  return words.filter(word => word.level === level);
};

// 단어 검색
export const searchWords = (words: Word[], query: string): Word[] => {
  if (!query.trim()) return words;
  
  const searchTerm = query.toLowerCase();
  return words.filter(word => 
    word.english.toLowerCase().includes(searchTerm) ||
    word.korean.toLowerCase().includes(searchTerm)
  );
};

// 단어 셔플
export const shuffleWords = (words: Word[]): Word[] => {
  const shuffled = [...words];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// 학습 통계 계산
export const calculateStudyStats = (words: Word[]): StudyStats => {
  const totalWords = words.length;
  const totalCorrect = words.reduce((sum, word) => sum + word.correct, 0);
  const totalWrong = words.reduce((sum, word) => sum + word.wrong, 0);
  const totalAttempts = totalCorrect + totalWrong;
  const averageAccuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;
  
  const now = Date.now();
  const wordsDue = words.filter(word => word.nextDue <= now).length;
  const wordsMastered = words.filter(word => word.streak >= 5).length;
  
  return {
    totalWords,
    totalCorrect,
    totalWrong,
    averageAccuracy: Math.round(averageAccuracy * 10) / 10,
    wordsDue,
    wordsMastered
  };
};

// 시간 포맷팅
export const formatTimeUntilDue = (nextDue: number): string => {
  const now = Date.now();
  const diff = nextDue - now;
  
  if (diff <= 0) return '복습 필요';
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 60) {
    return `${minutes}분 후`;
  } else if (hours < 24) {
    return `${hours}시간 후`;
  } else {
    return `${days}일 후`;
  }
};

// 힌트 생성 (한국어 뜻의 일부를 마스킹)
export const generateHint = (korean: string, showCount: number = 2): string => {
  const words = korean.split('');
  return words.map((char, index) => 
    index < showCount ? char : (char === ',' ? ',' : '●')
  ).join('');
};

// 중복 단어 검사
export const findDuplicateWord = (words: Word[], english: string): Word | null => {
  return words.find(word => 
    word.english.toLowerCase() === english.toLowerCase()
  ) || null;
};

// JSON 내보내기 형식 생성
export const exportWordsToJSON = (words: Word[]): string => {
  const exportData = words.map(word => ({
    english: word.english,
    korean: word.korean,
    level: word.level,
    correct: word.correct,
    wrong: word.wrong,
    streak: word.streak,
    nextDue: word.nextDue,
    createdAt: word.createdAt
  }));
  
  return JSON.stringify(exportData, null, 2);
};

// JSON 가져오기 검증 및 변환
export const importWordsFromJSON = (jsonString: string): Partial<Word>[] => {
  try {
    const data = JSON.parse(jsonString);
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid format: expected array');
    }
    
    return data.map((item, index) => {
      if (!item.english || !item.korean || !item.level) {
        throw new Error(`Invalid word at index ${index}: missing required fields`);
      }
      
      if (!['beginner', 'intermediate', 'advanced'].includes(item.level)) {
        throw new Error(`Invalid level at index ${index}: must be beginner, intermediate, or advanced`);
      }
      
      return {
        id: `imported-${Date.now()}-${index}`,
        english: item.english.trim(),
        korean: item.korean.trim(),
        level: item.level,
        correct: Number(item.correct) || 0,
        wrong: Number(item.wrong) || 0,
        streak: Number(item.streak) || 0,
        nextDue: Number(item.nextDue) || Date.now(),
        createdAt: Number(item.createdAt) || Date.now()
      };
    });
  } catch (error) {
    throw new Error(`Import failed: ${error.message}`);
  }
};

// 단어 병합 (중복 처리)
export const mergeWords = (
  existingWords: Word[], 
  newWords: Partial<Word>[], 
  duplicatePolicy: 'prevent' | 'overwrite'
): Word[] => {
  const result = [...existingWords];
  
  newWords.forEach(newWord => {
    const duplicate = findDuplicateWord(result, newWord.english!);
    
    if (duplicate) {
      if (duplicatePolicy === 'overwrite') {
        const index = result.findIndex(w => w.id === duplicate.id);
        result[index] = { ...duplicate, ...newWord } as Word;
      }
      // 'prevent' 정책의 경우 무시
    } else {
      result.push(newWord as Word);
    }
  });
  
  return result;
};

// 레벨 색상 및 라벨
export const getLevelConfig = (level: string) => {
  switch (level) {
    case 'beginner':
      return { color: 'bg-green-100 text-green-800', label: '초급' };
    case 'intermediate':
      return { color: 'bg-yellow-100 text-yellow-800', label: '중급' };
    case 'advanced':
      return { color: 'bg-red-100 text-red-800', label: '고급' };
    default:
      return { color: 'bg-gray-100 text-gray-800', label: '기타' };
  }
};

// 학습 큐 생성 (SRS 기반)
export const createStudyQueue = (words: Word[], settings: StudySettings): Word[] => {
  let filteredWords = filterWordsByLevel(words, settings.levelFilter);
  
  if (settings.sortBy === 'dueDate') {
    // 복습 예정인 단어 우선
    const dueWords = getWordsDueForReview(filteredWords);
    const otherWords = filteredWords.filter(word => word.nextDue > Date.now());
    
    const sortedDueWords = sortWords(dueWords, 'dueDate', 'asc');
    const sortedOtherWords = sortWords(otherWords, settings.sortBy, settings.sortOrder);
    
    filteredWords = [...sortedDueWords, ...sortedOtherWords];
  } else {
    filteredWords = sortWords(filteredWords, settings.sortBy, settings.sortOrder);
  }
  
  if (settings.shuffle) {
    filteredWords = shuffleWords(filteredWords);
  }
  
  return filteredWords;
};
