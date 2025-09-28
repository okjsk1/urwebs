import { VideoItem } from "@/types/sources";

const mockVideos: VideoItem[] = [
  {
    id: "fe-1",
    title: "React와 Vue 상태관리 비교",
    url: "https://www.youtube.com/watch?v=example-fe",
  },
  {
    id: "devops-1",
    title: "Docker · Kubernetes DevOps 파이프라인 구축",
    url: "https://www.youtube.com/watch?v=example-devops",
  },
  {
    id: "design-1",
    title: "Figma로 디자인 시스템 설계하기",
    url: "https://www.youtube.com/watch?v=example-design",
  },
];

export async function fetchYoutubePlaylist(query: string): Promise<VideoItem[]> {
  return mockVideos.filter((video) => video.title.includes(query));
}
