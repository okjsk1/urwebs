import { WidgetComponentProps } from "@/types/widgets";

type MapWidgetConfig = {
  query: string;
};

export function MapWidget({ id, title, config }: WidgetComponentProps<MapWidgetConfig>) {
  return (
    <section className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">{title ?? "지도"}</h3>
        <span className="text-xs text-slate-400">네이버 지도</span>
      </div>
      <iframe
        key={id}
        title={title ?? "지도"}
        className="h-64 flex-1 rounded-lg border border-slate-100"
        src={`https://map.naver.com/v5/search/${encodeURIComponent(config.query)}`}
      />
      <a
        className="mt-2 inline-flex text-xs text-blue-500 hover:underline"
        href={`https://map.naver.com/v5/search/${encodeURIComponent(config.query)}`}
        target="_blank"
        rel="noreferrer"
      >
        큰 지도에서 보기 ↗
      </a>
    </section>
  );
}
