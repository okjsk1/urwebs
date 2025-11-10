import React, { useState, useEffect } from 'react';
import { Quote } from 'lucide-react';
import { WidgetShell, WidgetProps } from './WidgetShell';
import { usePersist } from '../../hooks/usePersist';
import { uiPalette, typeScale } from '../../constants/uiTheme';

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

  const isWide = size === 'm' || size === 'l';
  const isSmall = size === 's';
  const containerPadding = isWide ? 'p-3' : isSmall ? 'p-1.5' : 'p-2';
  const textSpacing = isWide ? 'gap-3' : isSmall ? 'gap-1.5' : 'gap-2';
  const quoteTextClass = isWide
    ? `${typeScale.md} leading-relaxed`
    : isSmall
      ? `${typeScale.sm} leading-snug line-clamp-2`
      : `${typeScale.sm} leading-snug`;
  const authorTextClass = isWide ? `${typeScale.sm}` : `${typeScale.xs}`;
  const buttonSizeClass = isWide ? 'mt-4' : isSmall ? 'mt-2' : 'mt-3';

  const content = (
    <div className={`flex h-full flex-col items-center justify-center ${containerPadding} ${textSpacing} text-center min-h-0`}>
      {state.currentQuote ? (
        <>
          <p className={`font-medium ${quoteTextClass} ${uiPalette.textStrong}`}>
            "{state.currentQuote.text}"
          </p>
          <p className={`${authorTextClass} ${uiPalette.textMuted}`}>- {state.currentQuote.author}</p>
        </>
      ) : (
        <p className={`${typeScale.sm} ${uiPalette.textMuted}`}>명언을 불러오는 중...</p>
      )}
      <button
        onClick={fetchNewQuote}
        aria-label="새 명언 불러오기"
        className={`${buttonSizeClass} rounded-md ${isSmall ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1'} ${typeScale.xs} ${uiPalette.accentSoft} transition focus:outline-none focus:ring-2 focus:ring-sky-200/60`}
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
      icon={<Quote className={`w-4 h-4 ${uiPalette.textMuted}`} aria-hidden="true" />}
      title={title || '오늘의 명언'}
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
