import { StarterPackSection } from "@/types/widgets";

export const starterPackSections: StarterPackSection[] = [
  {
    slug: "work",
    title: "업무",
    description: "업무 효율을 높이는 실전 도구 모음",
    topics: [
      {
        slug: "product-manager",
        title: "프로덕트 매니저",
        description: "하루 업무를 체계적으로 관리하는 PM 전용 스타터팩",
        widgets: [
          {
            id: "pm-links",
            kind: "links",
            title: "협업 툴 바로가기",
            props: {
              links: [
                {
                  title: "Jira",
                  url: "https://jira.atlassian.com",
                  description: "이슈 및 스프린트 관리",
                },
                {
                  title: "Notion",
                  url: "https://www.notion.so",
                  description: "회의록과 문서 정리",
                },
                {
                  title: "Figma",
                  url: "https://www.figma.com",
                  description: "디자인 스펙 확인",
                },
              ],
            },
          },
          {
            id: "pm-checklist",
            kind: "checklist",
            props: {
              storageKey: "pm-daily",
              items: [
                { id: "1", label: "데일리 스탠드업 준비" },
                { id: "2", label: "이슈 업데이트 확인" },
                { id: "3", label: "팀 공지 작성" },
              ],
            },
          },
          {
            id: "pm-calendar",
            kind: "calendar",
            props: {
              highlightDates: [],
            },
          },
          {
            id: "pm-music",
            kind: "music",
            props: {
              query: "focus",
            },
          },
        ],
      },
      {
        slug: "remote-work",
        title: "원격 근무",
        description: "분산팀을 위한 협업 툴 모음",
        widgets: [
          {
            id: "remote-links",
            kind: "links",
            props: {
              links: [
                {
                  title: "Slack",
                  url: "https://slack.com",
                  description: "팀 커뮤니케이션",
                },
                {
                  title: "Zoom",
                  url: "https://zoom.us",
                  description: "화상회의",
                },
                {
                  title: "Linear",
                  url: "https://linear.app",
                  description: "이슈 트래킹",
                },
              ],
            },
          },
          {
            id: "remote-weather",
            kind: "weather",
            props: {
              city: "서울",
            },
          },
          {
            id: "remote-videos",
            kind: "videos",
            props: {
              query: "remote work",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "hobby",
    title: "취미",
    description: "주말 취미 생활을 위한 큐레이션",
    topics: [
      {
        slug: "camping",
        title: "캠핑 스타터팩",
        description: "초보 캠퍼를 위한 준비물과 정보",
        widgets: [
          {
            id: "camping-checklist",
            kind: "checklist",
            props: {
              storageKey: "camping",
              items: [
                { id: "tent", label: "텐트" },
                { id: "chair", label: "캠핑 의자" },
                { id: "lamp", label: "랜턴" },
              ],
            },
          },
          {
            id: "camping-map",
            kind: "map",
            props: {
              query: "캠핑장",
            },
          },
          {
            id: "camping-videos",
            kind: "videos",
            props: {
              query: "캠핑",
            },
          },
        ],
      },
      {
        slug: "photography",
        title: "사진 촬영",
        description: "촬영 계획과 영감을 한 번에",
        widgets: [
          {
            id: "photo-links",
            kind: "links",
            props: {
              links: [
                {
                  title: "500px",
                  url: "https://500px.com",
                  description: "사진 영감",
                },
                {
                  title: "Lightroom Presets",
                  url: "https://www.adobe.com/kr/products/photoshop-lightroom.html",
                  description: "프리셋 관리",
                },
              ],
            },
          },
          {
            id: "photo-calendar",
            kind: "calendar",
            props: {},
          },
        ],
      },
    ],
  },
  {
    slug: "study",
    title: "학습",
    description: "학습 루틴을 잡아주는 학습 스타터팩",
    topics: [
      {
        slug: "investment",
        title: "투자 공부",
        description: "퇴근 후 투자 공부를 위한 루틴",
        widgets: [
          {
            id: "invest-links",
            kind: "links",
            props: {
              links: [
                {
                  title: "Investopedia",
                  url: "https://www.investopedia.com",
                },
                {
                  title: "네이버 증권",
                  url: "https://finance.naver.com",
                },
              ],
            },
          },
          {
            id: "invest-checklist",
            kind: "checklist",
            props: {
              items: [
                { id: "news", label: "오늘의 시장 뉴스 체크" },
                { id: "note", label: "학습 노트 작성" },
              ],
            },
          },
          {
            id: "invest-videos",
            kind: "videos",
            props: {
              query: "투자",
            },
          },
        ],
      },
      {
        slug: "architecture",
        title: "건축사 자격증",
        description: "건축사 시험 준비를 위한 계획",
        widgets: [
          {
            id: "arch-links",
            kind: "links",
            props: {
              links: [
                { title: "대한건축사협회", url: "https://www.kira.or.kr" },
                { title: "국가평생교육진흥원", url: "https://www.cb.or.kr" },
              ],
            },
          },
          {
            id: "arch-calendar",
            kind: "calendar",
            props: {
              highlightDates: ["2024-09-21"],
            },
          },
        ],
      },
    ],
  },
  {
    slug: "growth",
    title: "자기계발",
    description: "꾸준히 성장하는 나를 위한 루틴",
    topics: [
      {
        slug: "reading",
        title: "독서 루틴",
        description: "매일 30분 독서를 위한 위젯",
        widgets: [
          {
            id: "reading-checklist",
            kind: "checklist",
            props: {
              items: [
                { id: "select", label: "읽을 책 선정" },
                { id: "note", label: "독서 노트 작성" },
                { id: "share", label: "동료와 인사이트 공유" },
              ],
            },
          },
          {
            id: "reading-music",
            kind: "music",
            props: {
              query: "reading",
            },
          },
        ],
      },
      {
        slug: "mindfulness",
        title: "마인드풀니스",
        description: "명상과 감정 기록을 위한 루틴",
        widgets: [
          {
            id: "mindfulness-links",
            kind: "links",
            props: {
              links: [
                { title: "Insight Timer", url: "https://insighttimer.com" },
                { title: "Headspace", url: "https://www.headspace.com" },
              ],
            },
          },
          {
            id: "mindfulness-calendar",
            kind: "calendar",
            props: {},
          },
        ],
      },
    ],
  },
  {
    slug: "daily",
    title: "일상",
    description: "매일을 더 편하게 만들어주는 일상 스타터팩",
    topics: [
      {
        slug: "family",
        title: "가족 일정",
        description: "가족과 공유하는 일정 및 준비물",
        widgets: [
          {
            id: "family-calendar",
            kind: "calendar",
            props: {},
          },
          {
            id: "family-checklist",
            kind: "checklist",
            props: {
              items: [
                { id: "lunch", label: "도시락 준비" },
                { id: "homework", label: "아이 숙제 확인" },
              ],
            },
          },
          {
            id: "family-weather",
            kind: "weather",
            props: {
              city: "인천",
            },
          },
        ],
      },
      {
        slug: "personal",
        title: "나의 하루",
        description: "개인 루틴과 영감을 한 곳에서",
        widgets: [
          {
            id: "personal-links",
            kind: "links",
            props: {
              links: [
                { title: "네이버 메일", url: "https://mail.naver.com" },
                { title: "구글 캘린더", url: "https://calendar.google.com" },
              ],
            },
          },
          {
            id: "personal-music",
            kind: "music",
            props: {
              query: "chill",
            },
          },
          {
            id: "personal-map",
            kind: "map",
            props: {
              query: "카페",
            },
          },
        ],
      },
    ],
  },
];

export function findSection(sectionSlug: string) {
  return starterPackSections.find((section) => section.slug === sectionSlug);
}

export function findTopic(sectionSlug: string, topicSlug: string) {
  const section = findSection(sectionSlug);
  if (!section) return undefined;
  return section.topics.find((topic) => topic.slug === topicSlug);
}
