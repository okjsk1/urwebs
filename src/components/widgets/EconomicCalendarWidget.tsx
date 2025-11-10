// 경제 캘린더 위젯 - FOMC, CPI 등 주요 경제 지표 발표 일정
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, Clock, Filter, RefreshCw } from 'lucide-react';
import { getEconomicCalendar, type EconomicEvent } from '../../services/finance/api';
import { WidgetProps, persistOrLocal, readLocal, showToast } from './utils/widget-helpers';
import { useDebouncedEffect } from '../../hooks/useDebouncedEffect';
import { uiPalette, typeScale } from '../../constants/uiTheme';

interface EconomicCalendarState {
  events: EconomicEvent[];
  period: 'week' | 'month' | 'custom';
  impactFilter: 'all' | 'high' | 'medium' | 'low';
  countryFilter: 'all' | 'US' | 'KR' | 'EU' | 'CN';
  lastUpdate: number;
}

type VariantKey = '1x1' | '1x2' | '1x3' | '2x1' | '2x2' | '3x1' | '3x2' | '3x3' | 'other';

const VARIANT_TOKENS: Record<VariantKey, {
  items: number;
  title: string;
  meta: string;
  pad: string;
  gap: string;
  headerPad: string;
  clampTitle: string;
  showDetailRow: boolean;
  showFilters: boolean;
}> = {
  '1x1': { items: 2, title: 'text-[11px] font-semibold', meta: 'text-[10px]', pad: 'p-1.5', gap: 'gap-0.5', headerPad: 'mb-1', clampTitle: 'line-clamp-1', showDetailRow: false, showFilters: false },
  '1x2': { items: 3, title: 'text-[11px] font-semibold', meta: 'text-[10px]', pad: 'p-1.5', gap: 'gap-0.5', headerPad: 'mb-1', clampTitle: 'line-clamp-1', showDetailRow: false, showFilters: false },
  '1x3': { items: 5, title: 'text-[12px] font-semibold', meta: 'text-[11px]', pad: 'p-2', gap: 'gap-1', headerPad: 'mb-1.5', clampTitle: 'line-clamp-1', showDetailRow: true, showFilters: false },
  '2x1': { items: 3, title: 'text-[12px] font-semibold', meta: 'text-[11px]', pad: 'p-2', gap: 'gap-1', headerPad: 'mb-1', clampTitle: 'line-clamp-1', showDetailRow: false, showFilters: false },
  '2x2': { items: 6, title: 'text-sm font-semibold', meta: 'text-xs', pad: 'p-2', gap: 'gap-1', headerPad: 'mb-2', clampTitle: 'line-clamp-1', showDetailRow: true, showFilters: true },
  '3x1': { items: 2, title: 'text-[12px] font-semibold', meta: 'text-[11px]', pad: 'p-2', gap: 'gap-1', headerPad: 'mb-1', clampTitle: 'line-clamp-1', showDetailRow: false, showFilters: false },
  '3x2': { items: 8, title: 'text-sm font-semibold', meta: 'text-xs', pad: 'p-2', gap: 'gap-1', headerPad: 'mb-2', clampTitle: 'line-clamp-1', showDetailRow: true, showFilters: true },
  '3x3': { items: 10, title: 'text-base font-semibold', meta: 'text-sm', pad: 'p-2.5', gap: 'gap-1.5', headerPad: 'mb-2', clampTitle: 'line-clamp-2', showDetailRow: true, showFilters: true },
  other: { items: 6, title: 'text-sm font-semibold', meta: 'text-xs', pad: 'p-2', gap: 'gap-1', headerPad: 'mb-2', clampTitle: 'line-clamp-1', showDetailRow: true, showFilters: true },
};

export const EconomicCalendarWidget: React.FC<WidgetProps> = ({ widget, isEditMode, updateWidget }) => {
  const [state, setState] = useState<EconomicCalendarState>(() => {
    const saved = readLocal(widget.id, {
      events: [],
      period: 'week' as const,
      impactFilter: 'all' as const,
      countryFilter: 'all' as const,
      lastUpdate: Date.now()
    });
    return saved;
  });

  const [showCompactFilters, setShowCompactFilters] = useState(false);

  const widgetSize = useMemo(() => {
    const sizeInfo = (widget as any)?.gridSize ?? (widget as any)?.size;
    if (sizeInfo && typeof sizeInfo === 'object') {
      return {
        w: Number(sizeInfo.w) || 1,
        h: Number(sizeInfo.h) || 2,
      };
    }
    if (typeof sizeInfo === 'string') {
      const [w, h] = sizeInfo.split('x').map(Number);
      return { w: w || 1, h: h || 2 };
    }
    return { w: 1, h: 2 };
  }, [widget]);

  const variantKey = useMemo<VariantKey>(() => {
    const key = `${widgetSize.w}x${widgetSize.h}` as VariantKey;
    return VARIANT_TOKENS[key] ? key : 'other';
  }, [widgetSize.w, widgetSize.h]);

  const TOK = VARIANT_TOKENS[variantKey];

  useEffect(() => {
    if (TOK.showFilters) {
      setShowCompactFilters(false);
    }
  }, [variantKey, TOK.showFilters]);

  // 상태 저장 (디바운스)
  useDebouncedEffect(() => {
    persistOrLocal(widget.id, state, updateWidget);
  }, [widget.id, state], 300);

  // 이벤트 로드
  const loadEvents = useCallback(async () => {
    const now = Date.now();
    let from = now;
    let to = now;
    
    if (state.period === 'week') {
      to = now + 7 * 24 * 60 * 60 * 1000;
    } else if (state.period === 'month') {
      to = now + 30 * 24 * 60 * 60 * 1000;
    }
    
    try {
      const events = await getEconomicCalendar({
        from,
        to,
        country: state.countryFilter === 'all' ? undefined : state.countryFilter,
        impact: state.impactFilter === 'all' ? undefined : state.impactFilter
      });
      
      setState(prev => ({
        ...prev,
        events,
        lastUpdate: Date.now()
      }));
    } catch (error) {
      console.error('Failed to load events:', error);
      showToast('일정 로드 실패', 'error');
    }
  }, [state.period, state.impactFilter, state.countryFilter]);

  // 초기 로드 및 주기적 갱신
  useEffect(() => {
    loadEvents();
    const interval = setInterval(loadEvents, 60000); // 1분마다 갱신
    return () => clearInterval(interval);
  }, [loadEvents]);

  const getCountdown = useCallback((eventTime: number) => {
    const diff = eventTime - Date.now();
    if (diff < 0) return '지남';
    
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    
    if (days > 0) return `${days}일 ${hours}시간`;
    if (hours > 0) return `${hours}시간 ${mins}분`;
    return `${mins}분`;
  }, []);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-slate-900/10 border-slate-500 text-slate-800 dark:bg-slate-700/40 dark:border-slate-500 dark:text-slate-100';
      case 'medium':
        return 'bg-slate-900/8 border-slate-400 text-slate-700 dark:bg-slate-700/30 dark:border-slate-500 dark:text-slate-200';
      case 'low':
        return 'bg-slate-900/5 border-slate-300 text-slate-600 dark:bg-slate-700/20 dark:border-slate-600 dark:text-slate-300';
      default:
        return 'bg-slate-100 border-slate-300 text-slate-600 dark:bg-slate-800/30 dark:border-slate-700 dark:text-slate-300';
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high': return '●';
      case 'medium': return '◐';
      case 'low': return '○';
      default: return '•';
    }
  };

  const eventsToDisplay = useMemo(() => {
    if (!state.events?.length) return [] as EconomicEvent[];
    return state.events.slice(0, TOK.items);
  }, [state.events, TOK.items]);

  const metaBaseClass = `${TOK.meta}`;
  const titleTextClass = `${TOK.title} ${uiPalette.textStrong} leading-tight`;
  const metaTextClass = `${metaBaseClass} ${uiPalette.textMuted} leading-snug`;
  const countdownTextClass = `${metaBaseClass} ${uiPalette.textMuted} leading-snug`;
  const cardPaddingClass = TOK.pad;
  const badgeGapClass = TOK.gap;
  const hiddenCount = Math.max(0, state.events.length - eventsToDisplay.length);
  const borderThickness = (variantKey === '1x1' || variantKey === '1x2' || variantKey === '2x1' || variantKey === '3x1') ? 'border-l-2' : 'border-l-4';

  return (
    <div className={`h-full flex flex-col ${TOK.pad}`}>
      {/* 헤더 */}
      <div className={`flex items-center justify-between ${TOK.headerPad} shrink-0 relative`}>
        <div className={`flex items-center ${badgeGapClass}`}>
          <Calendar className={`${variantKey === '1x1' ? 'w-3 h-3' : 'w-4 h-4'} text-slate-500 dark:text-slate-300`} />
          <h4 className={titleTextClass}>경제 캘린더</h4>
        </div>
        {TOK.showFilters ? (
          <div className="flex items-center gap-1">
            <button
              onClick={loadEvents}
              className="p-1 hover:bg-gray-100 rounded"
              title="새로고침"
            >
              <RefreshCw className="w-3 h-3 text-gray-600" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowCompactFilters(prev => !prev)}
            className="p-1 hover:bg-gray-100 rounded"
            title="필터"
          >
            <Filter className="w-3 h-3 text-gray-600" />
          </button>
        )}

        {!TOK.showFilters && showCompactFilters && (
          <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded shadow-md p-2 w-40 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-gray-600">
              <span>필터</span>
              <button
                onClick={loadEvents}
                className="p-1 hover:bg-gray-100 rounded"
                title="새로고침"
              >
                <RefreshCw className="w-3 h-3 text-gray-600" />
              </button>
            </div>
            <select
              value={state.period}
              onChange={(e) => {
                setState(prev => ({ ...prev, period: e.target.value as any }));
                setShowCompactFilters(false);
              }}
              className="w-full text-[11px] px-2 py-1 border border-gray-300 rounded"
            >
              <option value="week">이번주</option>
              <option value="month">이번달</option>
            </select>
            <select
              value={state.impactFilter}
              onChange={(e) => {
                setState(prev => ({ ...prev, impactFilter: e.target.value as any }));
                setShowCompactFilters(false);
              }}
              className="w-full text-[11px] px-2 py-1 border border-gray-300 rounded"
            >
              <option value="all">전체</option>
              <option value="high">중요</option>
              <option value="medium">보통</option>
              <option value="low">낮음</option>
            </select>
            <select
              value={state.countryFilter}
              onChange={(e) => {
                setState(prev => ({ ...prev, countryFilter: e.target.value as any }));
                setShowCompactFilters(false);
              }}
              className="w-full text-[11px] px-2 py-1 border border-gray-300 rounded"
            >
              <option value="all">모든 국가</option>
              <option value="US">미국</option>
              <option value="KR">한국</option>
              <option value="EU">유럽</option>
              <option value="CN">중국</option>
            </select>
          </div>
        )}
      </div>

      {/* 필터 */}
      {TOK.showFilters && (
        <div className="grid grid-cols-3 gap-1 mb-2 shrink-0">
          <select
            value={state.period}
            onChange={(e) => setState(prev => ({ ...prev, period: e.target.value as any }))}
            className="text-xs px-2 py-1 border border-gray-300 rounded"
          >
            <option value="week">이번주</option>
            <option value="month">이번달</option>
          </select>
          <select
            value={state.impactFilter}
            onChange={(e) => setState(prev => ({ ...prev, impactFilter: e.target.value as any }))}
            className="text-xs px-2 py-1 border border-gray-300 rounded"
          >
            <option value="all">전체</option>
            <option value="high">중요</option>
            <option value="medium">보통</option>
            <option value="low">낮음</option>
          </select>
          <select
            value={state.countryFilter}
            onChange={(e) => setState(prev => ({ ...prev, countryFilter: e.target.value as any }))}
            className="text-xs px-2 py-1 border border-gray-300 rounded"
          >
            <option value="all">모든 국가</option>
            <option value="US">미국</option>
            <option value="KR">한국</option>
            <option value="EU">유럽</option>
            <option value="CN">중국</option>
          </select>
        </div>
      )}

      {/* 이벤트 목록 */}
      <div className={`flex-1 overflow-y-auto flex flex-col ${TOK.gap}`}>
        {eventsToDisplay.length === 0 ? (
          <div className={`${TOK.meta} py-3 text-center text-gray-500`}>
            예정된 이벤트가 없습니다
          </div>
        ) : (
          eventsToDisplay.map(event => (
            <div
              key={event.id}
              className={`${cardPaddingClass} rounded ${borderThickness} border ${getImpactColor(event.impact)}`}
            >
              <div className={`flex items-start justify-between mb-1`}>
                <div className="flex-1 min-w-0">
                  <div className={`flex items-center ${badgeGapClass} mb-0.5`}>
                    <span className={TOK.meta}>{getImpactBadge(event.impact)}</span>
                    <span className={`${titleTextClass} ${TOK.clampTitle}`}>{event.title}</span>
                  </div>
                  <div className={`${metaTextClass} truncate`}> 
                    {new Date(event.dt).toLocaleString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })} ({event.country})
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`flex items-center ${badgeGapClass} ${countdownTextClass}`}>
                    <Clock className="w-3 h-3" />
                    <span>{getCountdown(event.dt)}</span>
                  </div>
                </div>
              </div>
              
              {/* 지표 값 */}
              {TOK.showDetailRow && (event.consensus !== undefined || event.previous !== undefined || event.actual !== undefined) && (
                <div className={`flex flex-wrap gap-2 ${TOK.meta} text-gray-600 mt-1`}>
                  {event.previous !== undefined && (
                    <span>이전: {event.previous.toLocaleString()}</span>
                  )}
                  {event.consensus !== undefined && (
                    <span>예상: {event.consensus.toLocaleString()}</span>
                  )}
                  {event.actual !== undefined && (
                    <span className="font-bold">실제: {event.actual.toLocaleString()}</span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 하단 정보 */}
      <div className={`text-gray-500 text-center border-t border-gray-200 shrink-0 ${TOK.meta} mt-2 pt-2`}>
        {state.events.length}개 이벤트 예정
        {hiddenCount > 0 && (
          <span className={`ml-1 ${uiPalette.textMuted}`}>
            +{hiddenCount}건
          </span>
        )}
      </div>
    </div>
  );
};


















