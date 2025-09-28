import { useEffect, useState } from "react";
import { fetchWeatherSummary } from "@/lib/sources/weather";
import { WidgetComponentProps } from "@/types/widgets";

type WeatherWidgetConfig = {
  city?: string;
};

export function WeatherWidgetV2({ id, title, config }: WidgetComponentProps<WeatherWidgetConfig>) {
  const [city, setCity] = useState(config.city ?? "서울");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [temperature, setTemperature] = useState<number | null>(null);
  const [condition, setCondition] = useState<string>("");
  const [icon, setIcon] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const summary = await fetchWeatherSummary(city);
        if (mounted) {
          setTemperature(summary.temperature);
          setCondition(summary.condition);
          setIcon(summary.icon);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError((err as Error).message);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [city]);

  return (
    <section className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">{title ?? "오늘의 날씨"}</h3>
        <select
          aria-label="도시 선택"
          className="rounded border border-slate-200 bg-white px-2 py-1 text-xs"
          value={city}
          onChange={(event) => setCity(event.target.value)}
        >
          {[
            "서울",
            "부산",
            "대구",
            "인천",
            "광주",
            "대전",
            "울산",
            "제주",
          ].map((option) => (
            <option key={`${id}-${option}`} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-1">
        {isLoading && <p className="text-xs text-slate-400">데이터 불러오는 중...</p>}
        {error && <p className="text-xs text-red-500">{error}</p>}
        {!isLoading && !error && temperature !== null && (
          <>
            <span className="text-4xl">{icon}</span>
            <p className="text-2xl font-semibold text-slate-700">{temperature}°C</p>
            <p className="text-sm text-slate-500">{city} · {condition}</p>
          </>
        )}
      </div>
    </section>
  );
}
