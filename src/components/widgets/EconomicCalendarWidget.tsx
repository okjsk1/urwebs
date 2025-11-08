// 경제 캘린더 위젯 - FOMC, CPI 등 주요 경제 지표 발표 일정
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../ui/button';
import { Calendar, Clock, Filter } from 'lucide-react';
import { getEconomicCalendar, type EconomicEvent } from '../../services/finance/api';
import { WidgetProps, persistOrLocal, readLocal, showToast } from './utils/widget-helpers';
import { useDebouncedEffect } from '../../hooks/useDebouncedEffect';

interface EconomicCalendarState {
  events: EconomicEvent[];
  period: 'week' | 'month' | 'custom';
  impactFilter: 'all' | 'high' | 'medium' | 'low';
  countryFilter: 'all' | 'US' | 'KR' | 'EU' | 'CN';
  lastUpdate: number;
}

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

  const isCompact = widgetSize.w === 1 && widgetSize.h === 1;

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
      case 'high': return 'bg-red-50 border-red-400 text-red-700';
      case 'medium': return 'bg-yellow-50 border-yellow-400 text-yellow-700';
      case 'low': return 'bg-green-50 border-green-400 text-green-700';
      default: return 'bg-gray-50 border-gray-300 text-gray-700';
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const eventsToDisplay = useMemo(() => {
    if (!state.events?.length) return [] as EconomicEvent[];
    return isCompact ? state.events.slice(0, 4) : state.events;
  }, [state.events, isCompact]);

  const titleTextClass = isCompact ? 'text-[11px] font-semibold text-gray-800 leading-tight' : 'text-sm font-semibold text-gray-800';
  const metaTextClass = isCompact ? 'text-[10px] text-gray-600 leading-tight' : 'text-xs text-gray-600';
  const countdownTextClass = isCompact ? 'text-[10px] text-blue-600' : 'text-xs text-blue-600';
  const cardPaddingClass = isCompact ? 'p-1.5' : 'p-2';
  const badgeGapClass = isCompact ? 'gap-0.5' : 'gap-1';
  const hiddenCount = Math.max(0, state.events.length - eventsToDisplay.length);

  return (
    <div className={`h-full flex flex-col ${isCompact ? 'p-1.5' : 'p-2'}`}>
      {/* 헤더 */}
      <div className={`flex items-center justify-between ${isCompact ? 'mb-1' : 'mb-2'} shrink-0`}>
        <div className={`flex items-center ${badgeGapClass}`}>
          <Calendar className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'} text-blue-600`} />
          <h4 className={titleTextClass}>경제 캘린더</h4>
        </div>
        <button
          onClick={loadEvents}
          className={`${isCompact ? 'p-0.5' : 'p-1'} hover:bg-gray-100 rounded`}
          title="새로고침"
        >
          <Filter className={`${isCompact ? 'w-2.5 h-2.5' : 'w-3 h-3'} text-gray-600`} />
        </button>
      </div>

      {/* 필터 */}
      {isEditMode && !isCompact && (
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
      <div className={`flex-1 overflow-y-auto ${isCompact ? 'space-y-1' : 'space-y-1.5'}`}>
        {eventsToDisplay.length === 0 ? (
          <div className={`${isCompact ? 'text-[11px] py-3' : 'text-xs py-4'} text-center text-gray-500`}>
            예정된 이벤트가 없습니다
          </div>
        ) : (
          eventsToDisplay.map(event => (
            <div
              key={event.id}
              className={`${cardPaddingClass} rounded ${isCompact ? 'border-l-2' : 'border-l-4'} border ${getImpactColor(event.impact)}`}
            >
              <div className={`flex items-start justify-between ${isCompact ? 'mb-0.5' : 'mb-1'}`}>
                <div className="flex-1 min-w-0">
                  <div className={`flex items-center ${badgeGapClass} mb-0.5`}>
                    <span className={isCompact ? 'text-[10px]' : 'text-xs'}>{getImpactBadge(event.impact)}</span>
                    <span className={`${titleTextClass} line-clamp-1`}>{event.title}</span>
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
                    <Clock className={`${isCompact ? 'w-2.5 h-2.5' : 'w-3 h-3'}`} />
                    <span>{getCountdown(event.dt)}</span>
                  </div>
                </div>
              </div>
              
              {/* 지표 값 */}
              {!isCompact && (event.consensus !== undefined || event.previous !== undefined || event.actual !== undefined) && (
                <div className="flex gap-2 text-xs text-gray-600 mt-1">
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
              {isCompact && event.actual !== undefined && (
                <div className="text-[10px] text-gray-600 mt-0.5">
                  실제: {event.actual.toLocaleString()}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 하단 정보 */}
      <div className={`text-gray-500 text-center border-t border-gray-200 shrink-0 ${isCompact ? 'text-[10px] mt-1 pt-1' : 'text-xs mt-2 pt-2'}`}>
        {state.events.length}개 이벤트 예정
        {hiddenCount > 0 && (
          <span className="ml-1 text-blue-500">
            +{hiddenCount}건
          </span>
        )}
      </div>
    </div>
  );
};


















