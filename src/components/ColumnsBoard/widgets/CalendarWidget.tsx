import React, { useMemo, useCallback, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

type CalendarWidgetProps = {
  value?: Date | null;                 // 선택된 날짜(옵션)
  onSelectDate?: (date: Date) => void; // 날짜 클릭 콜백
  locale?: string;                     // e.g., "ko-KR"
  startOfWeek?: 0 | 1;                 // 0=일요일 시작, 1=월요일 시작
  className?: string;
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
}: CalendarWidgetProps) {
  const today = useMemo(() => new Date(), []);
  const [currentDate, setCurrentDate] = useState(() => value ?? today);

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

  return (
    <div
      className={`p-2 h-full flex flex-col bg-white dark:bg-gray-900 rounded-lg ${className}`}
      role="grid"
      aria-label="달력"
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-1">
          <button
            onClick={goPrevMonth}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            aria-label="이전 달"
            type="button"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={goNextMonth}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            aria-label="다음 달"
            type="button"
          >
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        <div className="text-base font-bold text-gray-800 dark:text-gray-100 select-none">
          {fmtMonth.format(currentDate)}
        </div>
        <button
          onClick={goToday}
          className="px-2 py-1 text-xs rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          type="button"
        >
          오늘
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-0.5 mb-1" role="row">
        {weekdayOrder.map((label, i) => (
          <div
            key={label}
            className={`text-center text-xs font-bold py-1 ${
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
      <div className="grid grid-cols-7 gap-0.5 flex-1">
        {grid.map(({ date, inCurrentMonth }, idx) => {
          const weekendIndex = (idx % 7); // 0~6
          const isTodayCell = isSameDay(date, today);
          const isSelected = value ? isSameDay(date, value) : false;
          const isHolidayDate = isHoliday(date);
          const isWeekendDate = isWeekend(date);
          const holidayName = getHolidayName(date);

          return (
            <button
              key={date.toISOString()}
              type="button"
              role="gridcell"
              aria-selected={isSelected}
              tabIndex={idx === focusTargetIndex ? 0 : -1}
              onClick={() => handleSelect(date)}
              title={`${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일${holidayName ? ` (${holidayName})` : ''}`}
              className={[
                "flex flex-col items-center justify-center text-xs rounded min-h-[28px] border transition-colors relative",
                "border-gray-200 dark:border-gray-700",
                inCurrentMonth
                  ? "bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-gray-800 cursor-pointer"
                  : "bg-gray-50 dark:bg-gray-800/40 text-gray-400 dark:text-gray-500",
                // 공휴일 스타일 (빨간색)
                isHolidayDate && inCurrentMonth && !isTodayCell ? "text-red-600 font-bold bg-red-50 dark:bg-red-900/20" : "",
                // 주말 스타일 (일요일은 빨간색, 토요일은 파란색)
                weekendIndex === 0 && inCurrentMonth && !isTodayCell && !isHolidayDate ? "text-red-500 font-semibold" : "",
                weekendIndex === 6 && inCurrentMonth && !isTodayCell && !isHolidayDate ? "text-blue-500 font-semibold" : "",
                // 오늘 스타일
                isTodayCell ? "bg-blue-500 text-white font-bold ring-2 ring-blue-300" : "",
                // 선택된 날짜 스타일
                isSelected && !isTodayCell ? "outline outline-1 outline-blue-400" : "",
              ].join(" ")}
            >
              <span>{date.getDate()}</span>
              {/* 공휴일 표시 */}
              {isHolidayDate && inCurrentMonth && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* 오늘 표시 */}
      <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-200 dark:border-gray-800">
        오늘: {today.getFullYear()}년 {today.getMonth() + 1}월 {today.getDate()}일 (
        {weekdayFormatter.format(today)}요일)
      </div>

      {/* 범례 */}
      <div className="flex items-center justify-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
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
    </div>
  );
}