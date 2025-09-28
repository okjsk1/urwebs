import { useEffect, useState } from "react";
import { fetchSpotifyPlaylist } from "@/lib/sources/spotify";
import { WidgetComponentProps } from "@/types/widgets";
import { MusicItem } from "@/types/sources";

type MusicWidgetConfig = {
  query: string;
};

export function MusicWidget({ id, title, config }: WidgetComponentProps<MusicWidgetConfig>) {
  const [tracks, setTracks] = useState<MusicItem[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const result = await fetchSpotifyPlaylist(config.query);
      if (mounted) {
        setTracks(result);
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
        <h3 className="text-sm font-semibold text-slate-700">{title ?? "배경 음악"}</h3>
        <span className="text-xs text-slate-400">Spotify</span>
      </div>
      <ul className="space-y-3">
        {tracks.map((track) => (
          <li key={`${id}-${track.id}`} className="rounded-lg border border-slate-100 p-3">
            <p className="text-sm font-medium text-slate-700">{track.title}</p>
            {track.artist && <p className="text-xs text-slate-500">{track.artist}</p>}
            <a
              className="mt-1 inline-flex text-xs text-green-600 hover:underline"
              href={track.url}
              target="_blank"
              rel="noreferrer"
            >
              Spotify에서 듣기 ↗
            </a>
          </li>
        ))}
        {!tracks.length && (
          <li className="rounded-lg border border-dashed border-slate-200 p-3 text-center text-sm text-slate-400">
            추천 곡을 찾을 수 없습니다.
          </li>
        )}
      </ul>
    </section>
  );
}
