import { WidgetComponentProps } from "@/types/widgets";

type CalendarWidgetConfig = {
  highlightDates?: string[];
};

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

function normalizeDateKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function buildCalendar(date: Date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const leading = firstDay.getDay();
  const trailing = 6 - lastDay.getDay();

  const days: (Date | null)[] = [];
  for (let i = 0; i < leading; i += 1) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d += 1) {
    days.push(new Date(date.getFullYear(), date.getMonth(), d));
  }
  for (let i = 0; i < trailing; i += 1) days.push(null);
  return days;
}

export function CalendarWidgetV2({ id, title, config }: WidgetComponentProps<CalendarWidgetConfig>) {
  const today = new Date();
  const dates = buildCalendar(today);
  const highlight = new Set(
    (config.highlightDates ?? []).map((value) => normalizeDateKey(new Date(value))),
  );

  const titleLabel = today.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
  });

  return (
    <section
      aria-labelledby={`${id}-title`}
      className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="mb-4 flex items-baseline justify-between">
        <h3 id={`${id}-title`} className="text-sm font-semibold text-slate-700">
          {title ?? "캘린더"}
        </h3>
        <time className="text-xs text-slate-400" dateTime={today.toISOString()}>
          {titleLabel}
        </time>
      </div>
      <div className="grid flex-1 grid-cols-7 gap-1 text-center text-xs">
        {weekdays.map((weekday) => (
          <span key={weekday} className="font-medium text-slate-400">
            {weekday}
          </span>
        ))}
        {dates.map((date, index) => (
          <span
            key={index}
            className={`flex h-8 items-center justify-center rounded-full text-sm ${
              date
                ? highlight.has(normalizeDateKey(date))
                  ? "bg-blue-100 font-semibold text-blue-600"
                  : "text-slate-600"
                : "text-transparent"
            }`}
          >
            {date ? date.getDate() : ""}
          </span>
        ))}
      </div>
    </section>
  );
}
