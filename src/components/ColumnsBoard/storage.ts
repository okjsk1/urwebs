import { BoardState } from './types';

const STORAGE_KEY = 'urwebs:columns:v1';

// 기본 시드 데이터
export const getDefaultBoardState = (): BoardState => ({
  layoutMode: 3,
  columnsOrder: ['col-1', 'col-2', 'col-3'],
  columns: {
    'col-1': {
      id: 'col-1',
      title: '정보',
      items: ['w-news', 'w-links', 'w-memo']
    },
    'col-2': {
      id: 'col-2',
      title: '생산성',
      items: ['w-weather', 'w-bookmarks', 'w-todo']
    },
    'col-3': {
      id: 'col-3',
      title: '금융',
      items: ['w-todo', 'w-exchange', 'w-stock']
    }
  },
  widgets: {
    'w-news': { id: 'w-news', type: 'news', title: '최신 뉴스' },
    'w-links': { id: 'w-links', type: 'links', title: '링크 모음' },
    'w-memo': { id: 'w-memo', type: 'memo', title: '빠른 메모' },
    'w-weather': { id: 'w-weather', type: 'weather', title: '날씨' },
    'w-bookmarks': { id: 'w-bookmarks', type: 'bookmarks', title: '즐겨찾기' },
    'w-todo': { id: 'w-todo', type: 'todo', title: '할일' },
    'w-exchange': { id: 'w-exchange', type: 'exchange', title: '환율' },
    'w-stock': { id: 'w-stock', type: 'stock', title: '주식' },
  }
});

// localStorage에서 로드
export const loadBoardState = (): BoardState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('보드 상태 로드 실패:', error);
  }
  return getDefaultBoardState();
};

// localStorage에 저장
export const saveBoardState = (state: BoardState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('보드 상태 저장 실패:', error);
  }
};

// 3열 ↔ 4열 전환 로직
export const switchLayoutMode = (currentState: BoardState, newMode: 3 | 4): BoardState => {
  if (currentState.layoutMode === newMode) return currentState;

  const newState = { ...currentState, layoutMode: newMode };

  if (newMode === 4) {
    // 3열 → 4열: 4번째 컬럼 추가
    if (!currentState.columnsOrder.includes('col-4')) {
      newState.columnsOrder = [...currentState.columnsOrder, 'col-4'];
      newState.columns = {
        ...currentState.columns,
        'col-4': { id: 'col-4', title: '기타', items: [] }
      };
    }
  } else {
    // 4열 → 3열: 4번째 컬럼의 아이템들을 3번째 컬럼으로 이동
    if (currentState.columns['col-4']) {
      const col4Items = currentState.columns['col-4'].items;
      newState.columns = { ...currentState.columns };
      newState.columns['col-3'] = {
        ...newState.columns['col-3'],
        items: [...newState.columns['col-3'].items, ...col4Items]
      };
      newState.columnsOrder = currentState.columnsOrder.filter(id => id !== 'col-4');
    }
  }

  return newState;
};































