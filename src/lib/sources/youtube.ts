import { VideoItem } from "@/types/sources";

const mockVideos: VideoItem[] = [
  {
    id: "1",
    title: "프로덕트 매니저를 위한 우선순위 설정",
    url: "https://www.youtube.com/watch?v=example1",
  },
  {
    id: "2",
    title: "캠핑 장비 초보자 가이드",
    url: "https://www.youtube.com/watch?v=example2",
  },
  {
    id: "3",
    title: "퇴근 후 투자 공부 루틴",
    url: "https://www.youtube.com/watch?v=example3",
  },
];

export async function fetchYoutubePlaylist(query: string): Promise<VideoItem[]> {
  return mockVideos.filter((video) => video.title.includes(query));
}
