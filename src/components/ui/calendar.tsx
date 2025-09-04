"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react@0.487.0";

import { cn } from "./utils";

interface CalendarProps {
  className?: string;
  classNames?: {
    months?: string;
    caption?: string;
    head_cell?: string;
    cell?: string;
    day?: string;
  };
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  mode?: "single";
  showOutsideDays?: boolean;
}

function Calendar({
  className,
  classNames,
  selected,
  onSelect,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(() =>
    selected
      ? new Date(selected.getFullYear(), selected.getMonth(), 1)
      : new Date()
  );

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const weeks: (number | null)[][] = [];
  const days: (number | null)[] = Array(firstDay)
    .fill(null)
    .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  while (days.length % 7 !== 0) days.push(null);
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const isSelected = (day: number | null) => {
    if (!selected || day === null) return false;
    return (
      selected.getFullYear() === year &&
      selected.getMonth() === month &&
      selected.getDate() === day
    );
  };

  const handleSelect = (day: number | null) => {
    if (!onSelect || day === null) return;
    onSelect(new Date(year, month, day));
  };

  const cls = {
    months: "flex flex-col gap-1",
    caption: "flex items-center justify-between mb-2",
    head_cell:
      "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
    cell: "w-8 h-8 text-center",
    day: "w-8 h-8 p-0 text-sm rounded hover:bg-accent",
    ...classNames,
  };

  return (
    <div className={cn("p-3", className)}>
      <div className={cls.caption}>
        <button
          type="button"
          onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-sm font-medium">
          {year}년 {month + 1}월
        </div>
        <button
          type="button"
          onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className={cls.months}>
        <div className="grid grid-cols-7 gap-1">
          {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
            <div key={d} className={cls.head_cell}>
              {d}
            </div>
          ))}
        </div>
        {weeks.map((week, i) => (
          <div key={i} className="grid grid-cols-7 gap-1">
            {week.map((day, j) => (
              <button
                key={j}
                type="button"
                onClick={() => handleSelect(day)}
                className={cn(
                  cls.cell,
                  cls.day,
                  day === null && "pointer-events-none opacity-50",
                  isSelected(day) && "bg-primary text-primary-foreground"
                )}
              >
                {day ?? ""}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export { Calendar };

