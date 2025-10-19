import React, { useMemo, useCallback, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200 dark:border-gray-800">
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
              (startOfWeek === 0 ? i === 0 : i === 6) ? "text-red-600" : i === 5 ? "text-blue-600" : "text-gray-700 dark:text-gray-300"
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

          return (
            <button
              key={date.toISOString()}
              type="button"
              role="gridcell"
              aria-selected={isSelected}
              tabIndex={idx === focusTargetIndex ? 0 : -1}
              onClick={() => handleSelect(date)}
              title={`${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`}
              className={[
                "flex flex-col items-center justify-center text-xs rounded min-h-[28px] border transition-colors",
                "border-gray-200 dark:border-gray-800",
                inCurrentMonth
                  ? "bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-gray-800 cursor-pointer"
                  : "bg-gray-50 dark:bg-gray-800/40 text-gray-400 dark:text-gray-500",
                weekendIndex === 0 && inCurrentMonth && !isTodayCell ? "text-red-600 font-semibold" : "",
                weekendIndex === 6 && inCurrentMonth && !isTodayCell ? "text-blue-600 font-semibold" : "",
                isTodayCell ? "bg-blue-500 text-white font-bold ring-2 ring-blue-300" : "",
                isSelected && !isTodayCell ? "outline outline-1 outline-blue-400" : "",
              ].join(" ")}
            >
              <span>{date.getDate()}</span>
            </button>
          );
        })}
      </div>

      {/* 오늘 표시 */}
      <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-200 dark:border-gray-800">
        오늘: {today.getFullYear()}년 {today.getMonth() + 1}월 {today.getDate()}일 (
        {weekdayFormatter.format(today)}요일)
      </div>
    </div>
  );
}