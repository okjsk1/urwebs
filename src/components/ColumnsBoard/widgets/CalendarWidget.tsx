import React, { useMemo, useCallback, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2, X } from "lucide-react";
import { useFitScale } from "../../../hooks/useFitScale";

// 한국 공휴일 데이터 (2024-2025)
const HOLIDAYS = {
  "2024": {
    "1": [1], // 신정
    "2": [9, 10, 11, 12], // 설날 연휴
    "3": [1], // 삼일절
    "4": [10], // 국회의원선거일
    "5": [6], // 어린이날
    "6": [6], // 현충일
    "8": [15], // 광복절
    "9": [16, 17, 18], // 추석 연휴
    "10": [3], // 개천절
    "12": [25] // 성탄절
  },
  "2025": {
    "1": [1], // 신정
    "2": [28, 29, 30], // 설날 연휴
    "3": [1], // 삼일절
    "5": [5], // 어린이날
    "6": [6], // 현충일
    "8": [15], // 광복절
    "9": [5, 6, 7, 8], // 추석 연휴
    "10": [3], // 개천절
    "12": [25] // 성탄절
  }
};

// 공휴일 이름 매핑
const HOLIDAY_NAMES: Record<string, string> = {
  "1-1": "신정",
  "2-9": "설날",
  "2-10": "설날",
  "2-11": "설날",
  "2-12": "설날",
  "2-28": "설날",
  "2-29": "설날", 
  "2-30": "설날",
  "3-1": "삼일절",
  "4-10": "국회의원선거일",
  "5-5": "어린이날",
  "5-6": "어린이날",
  "6-6": "현충일",
  "8-15": "광복절",
  "9-5": "추석",
  "9-6": "추석",
  "9-7": "추석",
  "9-8": "추석",
  "9-16": "추석",
  "9-17": "추석",
  "9-18": "추석",
  "10-3": "개천절",
  "12-25": "성탄절"
};

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD 형식
  time?: string; // HH:MM 형식 (선택사항)
  description?: string;
  color?: string;
}

type CalendarWidgetProps = {
  value?: Date | null;                 // 선택된 날짜(옵션)
  onSelectDate?: (date: Date) => void; // 날짜 클릭 콜백
  locale?: string;                     // e.g., "ko-KR"
  startOfWeek?: 0 | 1;                 // 0=일요일 시작, 1=월요일 시작
  className?: string;
  size?: '1x1' | '1x2' | '2x2' | '4x4';        // 위젯 크기
  events?: CalendarEvent[];            // 일정 목록
  onAddEvent?: (event: Omit<CalendarEvent, 'id'>) => void; // 일정 추가 콜백
  onEditEvent?: (event: CalendarEvent) => void; // 일정 수정 콜백
  onDeleteEvent?: (eventId: string) => void; // 일정 삭제 콜백
};

function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth() + 1, 0); }
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function setMonthSafe(d: Date, delta: number) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + delta);
  return x;
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}
function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

// 공휴일 확인 함수
function isHoliday(date: Date): boolean {
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString();
  const day = date.getDate();
  
  return HOLIDAYS[year]?.[month]?.includes(day) || false;
}

// 공휴일 이름 가져오기
function getHolidayName(date: Date): string | null {
  const month = (date.getMonth() + 1).toString();
  const day = date.getDate().toString();
  return HOLIDAY_NAMES[`${month}-${day}`] || null;
}

// 주말 확인 함수 (토요일, 일요일)
function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // 일요일(0) 또는 토요일(6)
}

export function CalendarWidget({
  value,
  onSelectDate,
  locale = "ko-KR",
  startOfWeek = 0,
  className = "",
  size = "1x1",
  events = [],
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
}: CalendarWidgetProps) {
  const today = useMemo(() => new Date(), []);
  const [currentDate, setCurrentDate] = useState(() => value ?? today);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  
  // 일정 데이터를 localStorage에서 관리
  const [localEvents, setLocalEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('calendar_events');
    return saved ? JSON.parse(saved) : [];
  });

  // 일정 데이터 저장
  useEffect(() => {
    localStorage.setItem('calendar_events', JSON.stringify(localEvents));
  }, [localEvents]);

  // 외부에서 전달된 events와 로컬 events를 병합
  const allEvents = useMemo(() => {
    const mergedEvents = [...localEvents];
    
    // 외부 events 추가 (중복 제거)
    events.forEach(event => {
      if (!mergedEvents.find(e => e.id === event.id)) {
        mergedEvents.push(event);
      }
    });
    
    return mergedEvents;
  }, [localEvents, events]);

  // 일정 관련 함수들
  const getEventsForDate = useCallback((date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return allEvents.filter(event => event.date === dateStr);
  }, [allEvents]);

  const handleDateClick = useCallback((date: Date) => {
    if (size === '4x4') {
      setSelectedDate(date);
      setShowEventForm(true);
      setEditingEvent(null);
    }
    onSelectDate?.(date);
  }, [size, onSelectDate]);

  const handleAddEvent = useCallback((eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: Date.now().toString(),
    };
    
    // 로컬 상태에 추가
    setLocalEvents(prev => [...prev, newEvent]);
    
    // 외부 콜백도 호출
    onAddEvent?.(newEvent);
    
    setShowEventForm(false);
    setSelectedDate(null);
  }, [onAddEvent]);

  const handleEditEvent = useCallback((event: CalendarEvent) => {
    setEditingEvent(event);
    setShowEventForm(true);
  }, []);

  const handleDeleteEvent = useCallback((eventId: string) => {
    // 로컬 상태에서 제거
    setLocalEvents(prev => prev.filter(e => e.id !== eventId));
    
    // 외부 콜백도 호출
    onDeleteEvent?.(eventId);
  }, [onDeleteEvent]);

  const handleUpdateEvent = useCallback((updatedEvent: CalendarEvent) => {
    // 로컬 상태 업데이트
    setLocalEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
    
    // 외부 콜백도 호출
    onEditEvent?.(updatedEvent);
    
    setShowEventForm(false);
    setSelectedDate(null);
    setEditingEvent(null);
  }, [onEditEvent]);

  // 크기별 스타일 설정
  const getSizeStyles = () => {
    switch (size) {
      case '1x1':
        return {
          container: "p-0 overflow-hidden",
          wrapper: "px-1.5 py-1 gap-1",
          header: "mb-0 pb-0 h-[16px]",
          monthText: "text-[9px] font-semibold leading-none",
          navButton: "p-0",
          navIcon: "w-2.5 h-2.5",
          todayButton: "px-0.5 py-0 text-[7px] leading-tight",
          weekdayHeader: "text-[6px] py-0 leading-none h-[10px]",
          dateCell: "h-[10px] text-[6px] leading-none",
          todayText: "text-[6px] leading-tight",
          legend: "text-[6px] gap-1 mt-0.5 leading-tight"
        };
      case '1x2':
        return {
          container: "p-2",
          wrapper: "gap-2",
          header: "mb-2 pb-2",
          monthText: "text-sm font-bold",
          navButton: "p-1",
          navIcon: "w-4 h-4",
          todayButton: "px-2 py-1 text-xs",
          weekdayHeader: "text-xs py-1",
          dateCell: "min-h-[24px] text-xs",
          todayText: "text-xs",
          legend: "text-xs gap-3 mt-2"
        };
      case '2x2':
        return {
          container: "p-3",
          wrapper: "gap-3",
          header: "mb-2 pb-2",
          monthText: "text-xl font-bold",
          navButton: "p-1",
          navIcon: "w-5 h-5",
          todayButton: "px-2 py-1 text-sm",
          weekdayHeader: "text-base py-1",
          dateCell: "min-h-[36px] text-base",
          todayText: "text-sm",
          legend: "text-sm gap-3 mt-2"
        };
      case '4x4':
        return {
          container: "p-4",
          wrapper: "gap-3",
          header: "mb-3 pb-3",
          monthText: "text-lg font-bold",
          navButton: "p-2",
          navIcon: "w-5 h-5",
          todayButton: "px-3 py-2 text-sm",
          weekdayHeader: "text-sm py-2",
          dateCell: "min-h-[40px] text-sm",
          todayText: "text-sm",
          legend: "text-sm gap-4 mt-3"
        };
      default:
        return {
          container: "p-2",
          wrapper: "gap-2",
          header: "mb-2 pb-2",
          monthText: "text-sm font-bold",
          navButton: "p-1",
          navIcon: "w-4 h-4",
          todayButton: "px-2 py-1 text-xs",
          weekdayHeader: "text-xs py-1",
          dateCell: "min-h-[24px] text-xs",
          todayText: "text-xs",
          legend: "text-xs gap-3 mt-2"
        };
    }
  };

  const styles = getSizeStyles();

  // 현재 월 이름/요일 이름 생성 (국제화)
  const fmtMonth = useMemo(
    () => new Intl.DateTimeFormat(locale, { year: "numeric", month: "long" }),
    [locale]
  );
  const weekdayFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: "short" }),
    [locale]
  );

  const weekdayOrder = useMemo(() => {
    // 일~토를 현재 locale로, startOfWeek 기준으로 회전
    const base = Array.from({ length: 7 }, (_, i) => {
      // 2020-02-02는 일요일이었음; 여기에 i일씩 더해 요일 라벨 생성
      return weekdayFormatter.format(new Date(2020, 1, 2 + i));
    });
    return startOfWeek === 0 ? base : [...base.slice(1), base[0]];
  }, [weekdayFormatter, startOfWeek]);

  // 캘린더 그리드(6주=42칸) 만들기: 이전/다음달 패딩 포함
  const grid = useMemo(() => {
    const first = startOfMonth(currentDate);
    const last = endOfMonth(currentDate);

    // 기본 getDay: 0(일)~6(토). startOfWeek 반영해서 앞쪽 패딩 계산
    const firstDow = (first.getDay() - startOfWeek + 7) % 7;
    const totalDays = last.getDate();

    const days: { date: Date; inCurrentMonth: boolean }[] = [];

    // 앞쪽 패딩(이전달)
    for (let i = 0; i < firstDow; i++) {
      const d = addDays(first, -(firstDow - i));
      days.push({ date: d, inCurrentMonth: false });
    }
    // 이번달
    for (let i = 1; i <= totalDays; i++) {
      days.push({ date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i), inCurrentMonth: true });
    }
    // 뒤쪽 패딩(다음달) → 42칸 채우기
    while (days.length % 7 !== 0) {
      const d = addDays(last, days.length - (firstDow + totalDays) + 1);
      days.push({ date: d, inCurrentMonth: false });
    }
    // 항상 6행(42칸)
    while (days.length < 42) {
      const d = addDays(days[days.length - 1].date, 1);
      days.push({ date: d, inCurrentMonth: false });
    }
    return days;
  }, [currentDate, startOfWeek]);

  const goPrevMonth = useCallback(() => setCurrentDate(d => setMonthSafe(d, -1)), []);
  const goNextMonth = useCallback(() => setCurrentDate(d => setMonthSafe(d, +1)), []);
  const goToday = useCallback(() => setCurrentDate(today), [today]);

  const handleSelect = (d: Date) => {
    setCurrentDate(d);
    onSelectDate?.(d);
  };

  // roving tabIndex: 선택된 날짜 또는 오늘에 포커스
  const focusTargetIndex = useMemo(() => {
    const target = value ?? (isSameMonth(currentDate, today) ? today : null);
    if (!target) return -1;
    return grid.findIndex(g => isSameDay(g.date, target));
  }, [grid, value, currentDate, today]);

  const calendarContent = (
    <>
      {/* 헤더 */}
      <div className={`flex items-center justify-between ${styles.header} ${size === '1x1' ? 'border-b border-gray-200 dark:border-gray-700' : 'border-b border-gray-200 dark:border-gray-700'}`}>
        <div className={`flex ${size === '1x1' ? 'gap-0' : 'gap-1'}`}>
          <button
            onClick={goPrevMonth}
            className={`${styles.navButton} hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors`}
            aria-label="이전 달"
            type="button"
          >
            <ChevronLeft className={`${styles.navIcon} text-gray-600 dark:text-gray-300`} />
          </button>
          <button
            onClick={goNextMonth}
            className={`${styles.navButton} hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors`}
            aria-label="다음 달"
            type="button"
          >
            <ChevronRight className={`${styles.navIcon} text-gray-600 dark:text-gray-300`} />
          </button>
        </div>
        <div className={`${styles.monthText} text-gray-800 dark:text-gray-100 select-none ${size === '1x1' ? 'truncate max-w-[80px]' : ''}`}>
          {size === '1x1' 
            ? `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`
            : fmtMonth.format(currentDate)
          }
        </div>
        {size !== '1x1' && (
          <button
            onClick={goToday}
            className={`${styles.todayButton} rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800`}
            type="button"
          >
            오늘
          </button>
        )}
      </div>

      {/* 요일 헤더 */}
      <div className={`grid grid-cols-7 ${size === '1x1' ? 'gap-0 mb-0' : 'gap-0.5 mb-1'} ${size === '1x1' ? 'flex-shrink-0' : ''}`} role="row">
        {weekdayOrder.map((label, i) => (
          <div
            key={label}
            className={`weekday-label text-center font-bold ${styles.weekdayHeader} ${
              (startOfWeek === 0 ? i === 0 : i === 6) ? "text-red-600 dark:text-red-400" : 
              i === 5 ? "text-blue-600 dark:text-blue-400" : 
              "text-gray-700 dark:text-gray-300"
            }`}
            role="columnheader"
            aria-label={label}
          >
            {label}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 (6주 고정) */}
      <div className={`grid grid-cols-7 ${size === '1x1' ? 'gap-0' : 'gap-0.5'} ${size === '1x1' ? 'flex-1 min-h-0' : 'flex-1'}`} style={size === '1x1' ? { gridTemplateRows: 'repeat(6, 1fr)' } : undefined}>
        {grid.map(({ date, inCurrentMonth }, idx) => {
          const weekendIndex = (idx % 7); // 0~6
          const isTodayCell = isSameDay(date, today);
          const isSelected = value ? isSameDay(date, value) : false;
          const isHolidayDate = isHoliday(date);
          const isWeekendDate = isWeekend(date);
          const holidayName = getHolidayName(date);
          const dayEvents = size === '4x4' ? getEventsForDate(date) : [];

          return (
            <button
              key={date.toISOString()}
              type="button"
              role="gridcell"
              aria-selected={isSelected}
              tabIndex={idx === focusTargetIndex ? 0 : -1}
              onClick={() => handleDateClick(date)}
              title={`${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일${holidayName ? ` (${holidayName})` : ''}`}
                 className={[
                   `day-cell flex flex-col items-center justify-center rounded transition-colors relative ${styles.dateCell}`,
                   size === '1x1' ? "border-0" : "border border-gray-200 dark:border-gray-700",
                   size === '1x1' ? "min-h-0 w-full h-full" : "min-h-[36px] min-w-[36px]", // 1x1은 작게, 나머지는 터치 타겟 ≥ 36px
                   inCurrentMonth
                     ? "bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-gray-800 cursor-pointer hover:border-blue-300"
                     : "bg-gray-50 dark:bg-gray-800/40 text-gray-400 dark:text-gray-500",
                   // 공휴일 스타일 (빨간색)
                   isHolidayDate && inCurrentMonth && !isTodayCell ? "text-red-600 font-bold bg-red-50 dark:bg-red-900/20" : "",
                   // 주말 스타일 (일요일은 빨간색, 토요일은 파란색 - 텍스트 색만)
                   weekendIndex === 0 && inCurrentMonth && !isTodayCell && !isHolidayDate ? "text-red-600 dark:text-red-400" : "",
                   weekendIndex === 6 && inCurrentMonth && !isTodayCell && !isHolidayDate ? "text-blue-600 dark:text-blue-400" : "",
                  // 오늘 스타일 (가독성 강화)
                  isTodayCell ? (size === '1x1' ? "bg-blue-600 text-white font-bold" : "bg-blue-600 text-white font-bold ring-2 ring-blue-400 ring-offset-1") : "",
                  // 선택된 날짜 스타일 (가독성 강화)
                  isSelected && !isTodayCell ? (size === '1x1' ? "bg-blue-100 dark:bg-blue-900/30" : "bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500 ring-1 ring-blue-300") : "",
                 ].join(" ")}
            >
              <span>{date.getDate()}</span>
              {/* 공휴일 표시 */}
              {isHolidayDate && inCurrentMonth && size !== '1x1' && (
                <div className={`absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full`}></div>
              )}
              {/* 일정 표시 (4x4 크기일 때만) */}
              {size === '4x4' && dayEvents.length > 0 && inCurrentMonth && (
                <div className="absolute bottom-0 left-0 right-0 p-1">
                  <div className="flex flex-col gap-0.5">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={`text-[8px] px-1 py-0.5 rounded truncate ${
                          event.color || 'bg-blue-100 text-blue-800'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditEvent(event);
                        }}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[8px] text-gray-500 text-center">
                        +{dayEvents.length - 2}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 오늘 표시 */}
      {size !== '1x1' && (
        <div className={`${styles.todayText} text-center text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-200 dark:border-gray-800`}>
          오늘: {today.getFullYear()}년 {today.getMonth() + 1}월 {today.getDate()}일 (
          {weekdayFormatter.format(today)}요일)
        </div>
      )}

      {/* 범례 */}
      {size !== '1x1' && (
        <div className={`flex items-center justify-center ${styles.legend} text-gray-500 dark:text-gray-400`}>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>공휴일</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>일요일</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>토요일</span>
          </div>
        </div>
      )}

      {/* 일정 추가/편집 폼 (4x4 크기일 때만) */}
      {size === '4x4' && showEventForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingEvent ? '일정 수정' : '일정 추가'}
              </h3>
              <button
                onClick={() => {
                  setShowEventForm(false);
                  setSelectedDate(null);
                  setEditingEvent(null);
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <EventForm
              selectedDate={selectedDate}
              event={editingEvent}
              onSave={editingEvent ? handleUpdateEvent : handleAddEvent}
              onDelete={editingEvent ? handleDeleteEvent : undefined}
              onCancel={() => {
                setShowEventForm(false);
                setSelectedDate(null);
                setEditingEvent(null);
              }}
            />
          </div>
        </div>
      )}
    </>
  );

  return (
    <div
      ref={containerRef}
      className={`${styles.container} h-full flex flex-col bg-white dark:bg-gray-900 rounded-lg ${className} overflow-hidden`}
      role="grid"
      aria-label="달력"
    >
      <div
        ref={contentRef}
        className={`flex flex-col flex-1 ${styles.wrapper || ''} ${compactTypoClass}`}
        style={
          isCompactSize
            ? { transform: `scale(${scale})`, transformOrigin: 'top left' }
            : undefined
        }
      >
        {calendarContent}
      </div>
    </div>
  );
}

// 일정 폼 컴포넌트
function EventForm({ 
  selectedDate, 
  event, 
  onSave, 
  onCancel 
}: {
  selectedDate: Date | null;
  event: CalendarEvent | null;
  onSave: (eventData: CalendarEvent) => void;
  onCancel: () => void;
  onDelete?: (eventId: string) => void;
}) {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    time: event?.time || '',
    description: event?.description || '',
    color: event?.color || 'bg-blue-100 text-blue-800'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !selectedDate) return;

    const eventData: CalendarEvent = {
      id: event?.id || Date.now().toString(),
      title: formData.title.trim(),
      date: selectedDate.toISOString().split('T')[0],
      time: formData.time || undefined,
      description: formData.description || undefined,
      color: formData.color
    };

    onSave(eventData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          날짜
        </label>
        <div className="p-2 bg-gray-50 rounded border text-sm">
          {selectedDate?.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          제목 *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="일정 제목을 입력하세요"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          시간 (선택사항)
        </label>
        <input
          type="time"
          value={formData.time}
          onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          설명 (선택사항)
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder="일정 설명을 입력하세요"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          색상
        </label>
        <div className="flex gap-2">
          {[
            { value: 'bg-blue-100 text-blue-800', label: '파란색' },
            { value: 'bg-green-100 text-green-800', label: '초록색' },
            { value: 'bg-red-100 text-red-800', label: '빨간색' },
            { value: 'bg-yellow-100 text-yellow-800', label: '노란색' },
            { value: 'bg-purple-100 text-purple-800', label: '보라색' },
            { value: 'bg-gray-100 text-gray-800', label: '회색' }
          ].map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
              className={`px-3 py-1 rounded text-sm ${
                formData.color === color.value ? 'ring-2 ring-blue-500' : ''
              } ${color.value}`}
            >
              {color.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        {event && onDelete && (
          <button
            type="button"
            onClick={() => {
              if (confirm('이 일정을 삭제하시겠습니까?')) {
                onDelete(event.id);
                onCancel();
              }
            }}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-medium"
          >
            <Trash2 className="w-4 h-4 inline mr-1" />
            삭제
          </button>
        )}
        <button
          type="submit"
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded font-medium"
        >
          {event ? '수정' : '추가'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
        >
          취소
        </button>
      </div>
    </form>
  );
}