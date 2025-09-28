import { useEffect, useState } from "react";
import { fetchYoutubePlaylist } from "@/lib/sources/youtube";
import { WidgetComponentProps } from "@/types/widgets";
import { VideoItem } from "@/types/sources";

type VideosWidgetConfig = {
  query: string;
};

export function VideosWidget({ id, title, config }: WidgetComponentProps<VideosWidgetConfig>) {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      const result = await fetchYoutubePlaylist(config.query);
      if (mounted) {
        setVideos(result);
        setIsLoading(false);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [config.query]);

  return (
    <section className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">{title ?? "추천 영상"}</h3>
        {isLoading && <span className="text-xs text-slate-400">불러오는 중...</span>}
      </div>
      <ul className="flex-1 space-y-3 overflow-y-auto">
        {videos.map((video) => (
          <li key={`${id}-${video.id}`} className="rounded-lg border border-slate-100 p-3">
            <p className="text-sm font-medium text-slate-700">{video.title}</p>
            <a
              className="mt-1 inline-flex text-xs text-blue-500 hover:underline"
              href={video.url}
              target="_blank"
              rel="noreferrer"
            >
              YouTube에서 열기 ↗
            </a>
          </li>
        ))}
        {!videos.length && !isLoading && (
          <li className="rounded-lg border border-dashed border-slate-200 p-3 text-center text-sm text-slate-400">
            추천 영상을 찾을 수 없습니다.
          </li>
        )}
      </ul>
    </section>
  );
}
