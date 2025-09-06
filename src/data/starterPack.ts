export interface StarterPackLink {
  label: string;
  url: string;
}

export interface StarterPackCategory {
  title: string;
  links: StarterPackLink[];
}

export const STARTER_PACK_CATEGORIES: StarterPackCategory[] = [
  {
    title: "설계",
    links: [
      { label: "ArchDaily", url: "https://www.archdaily.com/" },
      { label: "Dezeen", url: "https://www.dezeen.com/" },
      {
        label: "Wallpaper*",
        url: "https://www.wallpaper.com/",
      },
    ],
  },
  {
    title: "자료",
    links: [
      { label: "VMSPACE", url: "https://vmspace.com/" },
      {
        label: "Pinterest 건축",
        url: "https://www.pinterest.co.kr/search/pins/?q=architecture",
      },
      { label: "Google Drive", url: "https://drive.google.com/" },
    ],
  },
  {
    title: "경력",
    links: [
      { label: "잡코리아", url: "https://www.jobkorea.co.kr/" },
      { label: "사람인", url: "https://www.saramin.co.kr/" },
      { label: "LinkedIn", url: "https://www.linkedin.com/" },
    ],
  },
  {
    title: "커뮤니티",
    links: [
      { label: "카카오 오픈채팅", url: "https://open.kakao.com/" },
      {
        label: "Reddit r/architecture",
        url: "https://www.reddit.com/r/architecture/",
      },
      {
        label: "디씨인사이드 건축",
        url: "https://gall.dcinside.com/board/lists?id=architecture",
      },
    ],
  },
];
