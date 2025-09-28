import { MusicItem } from "@/types/sources";

const mockTracks: MusicItem[] = [
  {
    id: "focus-1",
    title: "Deep Work Beats",
    artist: "Flow State",
    url: "https://open.spotify.com/track/focus-1",
  },
  {
    id: "camp-1",
    title: "Campfire Vibes",
    artist: "Outdoor Sessions",
    url: "https://open.spotify.com/track/camp-1",
  },
];

export async function fetchSpotifyPlaylist(query: string): Promise<MusicItem[]> {
  return mockTracks.filter((track) => track.title.includes(query));
}
