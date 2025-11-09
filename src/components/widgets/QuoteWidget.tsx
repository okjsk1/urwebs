import React, { useState, useEffect } from 'react';
import { Quote } from 'lucide-react';
import { WidgetShell, WidgetProps } from './WidgetShell';
import { usePersist } from '../../hooks/usePersist';

interface QuoteState {
  currentQuote: { text: string; author: string } | null;
  lastFetched: number;
}

const defaultQuotes = [
  { text: "성공은 최종적인 것이 아니며, 실패는 치명적인 것이 아니다. 중요한 것은 계속하려는 용기이다.", author: "윈스턴 처칠" },
  { text: "가장 큰 영광은 한 번도 넘어지지 않는 것이 아니라, 넘어질 때마다 일어서는 것이다.", author: "넬슨 만델라" },
  { text: "미래를 예측하는 가장 좋은 방법은 미래를 창조하는 것이다.", author: "피터 드러커" },
  { text: "행동이 항상 행복을 가져다주지는 않지만, 행동 없이는 행복이 없다.", author: "벤자민 디즈레일리" },
  { text: "인생은 용감한 모험이거나 아무것도 아니다.", author: "헬렌 켈러" },
  { text: "꿈을 이루고자 하는 용기만 있으면, 모든 꿈을 이룰 수 있다.", author: "월트 디즈니" },
  { text: "성공의 비밀은 시작하는 것이다.", author: "마크 트웨인" },
  { text: "어제는 역사이고, 내일은 미스터리이며, 오늘은 선물이다.", author: "엘리너 루즈벨트" },
];

interface QuoteWidgetProps extends WidgetProps {
  embedded?: boolean;
}

export function QuoteWidget({
  id,
  title,
  size = 's',
  onRemove,
  onResize,
  onPin,
  embedded = false,
  isPinned
}: QuoteWidgetProps) {
  const [state, setState] = usePersist<QuoteState>(`uw_quote_${id}`, {
    currentQuote: null,
    lastFetched: 0,
  });

  const fetchNewQuote = () => {
    const randomIndex = Math.floor(Math.random() * defaultQuotes.length);
    setState(prev => ({
      ...prev,
      currentQuote: defaultQuotes[randomIndex],
      lastFetched: Date.now(),
    }));
  };

  useEffect(() => {
    if (!state.currentQuote) {
      fetchNewQuote();
    }
  }, [state.currentQuote]);

  const content = (
    <div className="flex h-full flex-col items-center justify-center p-2 text-center">
      {state.currentQuote ? (
        <>
          <p className="mb-2 line-clamp-3 text-sm font-medium text-gray-800">
            "{state.currentQuote.text}"
          </p>
          <p className="text-xs text-gray-500">- {state.currentQuote.author}</p>
        </>
      ) : (
        <p className="text-sm text-gray-500">명언을 불러오는 중...</p>
      )}
      <button
        onClick={fetchNewQuote}
        aria-label="새 명언 불러오기"
        className="mt-3 rounded-md p-1 text-xs text-indigo-600 transition hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
      >
        새 명언
      </button>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <WidgetShell
      icon={<Quote className="w-4 h-4 text-gray-600" aria-hidden="true" />}
      title={title || '영감 명언'}
      size={size ?? 's'}
      onRemove={onRemove ? () => onRemove(id) : undefined}
      onResize={onResize ? (newSize) => onResize(id, newSize) : undefined}
      onPin={onPin ? () => onPin(id) : undefined}
      isPinned={isPinned}
    >
      {content}
    </WidgetShell>
  );
}
