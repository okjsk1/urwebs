import { StarterPackGroup, StarterPackSection, WidgetInstance } from "@/types/widgets";

const pmLinks: WidgetInstance = {
  id: "pm-links",
  kind: "links",
  title: "협업 툴 바로가기",
  props: {
    links: [
      { title: "Jira", url: "https://jira.atlassian.com", description: "이슈 및 스프린트 관리" },
      { title: "Notion", url: "https://www.notion.so", description: "회의록과 문서 정리" },
      { title: "Figma", url: "https://www.figma.com", description: "디자인 스펙 확인" },
    ],
  },
};

const pmChecklist: WidgetInstance = {
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
};

const pmCalendar: WidgetInstance = {
  id: "pm-calendar",
  kind: "calendar",
  props: {
    highlightDates: [],
  },
};

const pmMusic: WidgetInstance = {
  id: "pm-music",
  kind: "music",
  props: {
    query: "focus",
  },
};

const pmGroups: StarterPackGroup[] = [
  {
    slug: "alignment",
    title: "팀 협업 준비",
    description: "팀과의 협업을 위한 핵심 도구를 빠르게 모았습니다.",
    widgets: [pmLinks, pmChecklist],
  },
  {
    slug: "planning",
    title: "계획과 집중",
    description: "일정을 정리하고 몰입을 돕는 위젯입니다.",
    widgets: [pmCalendar, pmMusic],
  },
];

const remoteLinks: WidgetInstance = {
  id: "remote-links",
  kind: "links",
  props: {
    links: [
      { title: "Slack", url: "https://slack.com", description: "팀 커뮤니케이션" },
      { title: "Zoom", url: "https://zoom.us", description: "화상회의" },
      { title: "Linear", url: "https://linear.app", description: "이슈 트래킹" },
    ],
  },
};

const remoteWeather: WidgetInstance = {
  id: "remote-weather",
  kind: "weather",
  props: {
    city: "서울",
  },
};

const remoteVideos: WidgetInstance = {
  id: "remote-videos",
  kind: "videos",
  props: {
    query: "remote work",
  },
};

const remoteGroups: StarterPackGroup[] = [
  {
    slug: "toolkit",
    title: "협업 툴킷",
    description: "분산 팀을 위한 커뮤니케이션 툴 모음",
    widgets: [remoteLinks],
  },
  {
    slug: "remote-life",
    title: "원격 근무 루틴",
    description: "쾌적한 원격 근무 환경을 위한 위젯",
    widgets: [remoteWeather, remoteVideos],
  },
];

const campingChecklist: WidgetInstance = {
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
};

const campingMap: WidgetInstance = {
  id: "camping-map",
  kind: "map",
  props: {
    query: "캠핑장",
  },
};

const campingVideos: WidgetInstance = {
  id: "camping-videos",
  kind: "videos",
  props: {
    query: "캠핑",
  },
};

const campingGroups: StarterPackGroup[] = [
  {
    slug: "preparation",
    title: "캠핑 준비물",
    description: "떠나기 전 챙겨야 할 준비물을 정리해보세요.",
    widgets: [campingChecklist],
  },
  {
    slug: "exploration",
    title: "주변 탐색",
    description: "캠핑 장소와 관련 정보를 찾아보세요.",
    widgets: [campingMap, campingVideos],
  },
];

const photoLinks: WidgetInstance = {
  id: "photo-links",
  kind: "links",
  props: {
    links: [
      { title: "500px", url: "https://500px.com", description: "사진 영감" },
      {
        title: "Lightroom Presets",
        url: "https://www.adobe.com/kr/products/photoshop-lightroom.html",
        description: "프리셋 관리",
      },
    ],
  },
};

const photoCalendar: WidgetInstance = {
  id: "photo-calendar",
  kind: "calendar",
  props: {},
};

const photoGroups: StarterPackGroup[] = [
  {
    slug: "shoot-plan",
    title: "촬영 계획",
    description: "촬영 일정을 잡고 준비하세요.",
    widgets: [photoCalendar],
  },
  {
    slug: "inspiration",
    title: "영감 수집",
    description: "사진 촬영에 영감을 주는 자료 모음",
    widgets: [photoLinks],
  },
];

const investLinks: WidgetInstance = {
  id: "invest-links",
  kind: "links",
  props: {
    links: [
      { title: "Investopedia", url: "https://www.investopedia.com" },
      { title: "네이버 증권", url: "https://finance.naver.com" },
    ],
  },
};

const investChecklist: WidgetInstance = {
  id: "invest-checklist",
  kind: "checklist",
  props: {
    items: [
      { id: "news", label: "오늘의 시장 뉴스 체크" },
      { id: "note", label: "학습 노트 작성" },
    ],
  },
};

const investVideos: WidgetInstance = {
  id: "invest-videos",
  kind: "videos",
  props: {
    query: "투자",
  },
};

const investGroups: StarterPackGroup[] = [
  {
    slug: "study",
    title: "학습 자료",
    description: "투자 공부를 위한 추천 자료",
    widgets: [investLinks, investVideos],
  },
  {
    slug: "routine",
    title: "학습 루틴",
    description: "꾸준한 공부를 도와주는 루틴",
    widgets: [investChecklist],
  },
];

const archLinks: WidgetInstance = {
  id: "arch-links",
  kind: "links",
  props: {
    links: [
      { title: "대한건축사협회", url: "https://www.kira.or.kr" },
      { title: "국가평생교육진흥원", url: "https://www.cb.or.kr" },
    ],
  },
};

const archCalendar: WidgetInstance = {
  id: "arch-calendar",
  kind: "calendar",
  props: {
    highlightDates: ["2024-09-21"],
  },
};

const archGroups: StarterPackGroup[] = [
  {
    slug: "reference",
    title: "자료 모음",
    description: "시험 준비에 필요한 자료 링크",
    widgets: [archLinks],
  },
  {
    slug: "schedule",
    title: "시험 일정",
    description: "중요 일정을 놓치지 마세요.",
    widgets: [archCalendar],
  },
];

const readingChecklist: WidgetInstance = {
  id: "reading-checklist",
  kind: "checklist",
  props: {
    items: [
      { id: "select", label: "읽을 책 선정" },
      { id: "note", label: "독서 노트 작성" },
      { id: "share", label: "동료와 인사이트 공유" },
    ],
  },
};

const readingMusic: WidgetInstance = {
  id: "reading-music",
  kind: "music",
  props: {
    query: "reading",
  },
};

const readingGroups: StarterPackGroup[] = [
  {
    slug: "habit",
    title: "독서 습관",
    description: "꾸준한 독서를 위한 체크리스트",
    widgets: [readingChecklist],
  },
  {
    slug: "focus",
    title: "몰입 환경",
    description: "집중을 돕는 배경 음악",
    widgets: [readingMusic],
  },
];

const mindfulnessLinks: WidgetInstance = {
  id: "mindfulness-links",
  kind: "links",
  props: {
    links: [
      { title: "Insight Timer", url: "https://insighttimer.com" },
      { title: "Headspace", url: "https://www.headspace.com" },
    ],
  },
};

const mindfulnessCalendar: WidgetInstance = {
  id: "mindfulness-calendar",
  kind: "calendar",
  props: {},
};

const mindfulnessGroups: StarterPackGroup[] = [
  {
    slug: "practice",
    title: "명상 연습",
    description: "명상과 마음챙김에 도움이 되는 리소스",
    widgets: [mindfulnessLinks],
  },
  {
    slug: "tracking",
    title: "기록과 일정",
    description: "명상 루틴을 꾸준히 기록하세요.",
    widgets: [mindfulnessCalendar],
  },
];

const familyCalendar: WidgetInstance = {
  id: "family-calendar",
  kind: "calendar",
  props: {},
};

const familyChecklist: WidgetInstance = {
  id: "family-checklist",
  kind: "checklist",
  props: {
    items: [
      { id: "lunch", label: "도시락 준비" },
      { id: "homework", label: "아이 숙제 확인" },
    ],
  },
};

const familyWeather: WidgetInstance = {
  id: "family-weather",
  kind: "weather",
  props: {
    city: "인천",
  },
};

const familyGroups: StarterPackGroup[] = [
  {
    slug: "family-routine",
    title: "가족 일정",
    description: "가족과 공유할 일정을 한눈에 관리",
    widgets: [familyCalendar, familyChecklist],
  },
  {
    slug: "daily-weather",
    title: "날씨 체크",
    description: "외출 전에 꼭 확인하세요.",
    widgets: [familyWeather],
  },
];

const personalLinks: WidgetInstance = {
  id: "personal-links",
  kind: "links",
  props: {
    links: [
      { title: "네이버 메일", url: "https://mail.naver.com" },
      { title: "구글 캘린더", url: "https://calendar.google.com" },
    ],
  },
};

const personalMusic: WidgetInstance = {
  id: "personal-music",
  kind: "music",
  props: {
    query: "chill",
  },
};

const personalMap: WidgetInstance = {
  id: "personal-map",
  kind: "map",
  props: {
    query: "카페",
  },
};

const personalGroups: StarterPackGroup[] = [
  {
    slug: "daily-essentials",
    title: "일상 바로가기",
    description: "자주 사용하는 서비스 모음",
    widgets: [personalLinks],
  },
  {
    slug: "inspiration",
    title: "휴식과 탐색",
    description: "휴식과 영감을 주는 위젯",
    widgets: [personalMusic, personalMap],
  },
];

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
        widgets: [pmLinks, pmChecklist, pmCalendar, pmMusic],
        groups: pmGroups,
      },
      {
        slug: "remote-work",
        title: "원격 근무",
        description: "분산팀을 위한 협업 툴 모음",
        widgets: [remoteLinks, remoteWeather, remoteVideos],
        groups: remoteGroups,
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
        widgets: [campingChecklist, campingMap, campingVideos],
        groups: campingGroups,
      },
      {
        slug: "photography",
        title: "사진 촬영",
        description: "촬영 계획과 영감을 한 번에",
        widgets: [photoLinks, photoCalendar],
        groups: photoGroups,
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
        widgets: [investLinks, investChecklist, investVideos],
        groups: investGroups,
      },
      {
        slug: "architecture",
        title: "건축사 자격증",
        description: "건축사 시험 준비를 위한 계획",
        widgets: [archLinks, archCalendar],
        groups: archGroups,
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
        widgets: [readingChecklist, readingMusic],
        groups: readingGroups,
      },
      {
        slug: "mindfulness",
        title: "마인드풀니스",
        description: "명상과 감정 기록을 위한 루틴",
        widgets: [mindfulnessLinks, mindfulnessCalendar],
        groups: mindfulnessGroups,
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
        widgets: [familyCalendar, familyChecklist, familyWeather],
        groups: familyGroups,
      },
      {
        slug: "personal",
        title: "나의 하루",
        description: "개인 루틴과 영감을 한 곳에서",
        widgets: [personalLinks, personalMusic, personalMap],
        groups: personalGroups,
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

export function findGroup(sectionSlug: string, topicSlug: string, groupSlug?: string) {
  const topic = findTopic(sectionSlug, topicSlug);
  if (!topic?.groups || topic.groups.length === 0) {
    return undefined;
  }

  if (!groupSlug) {
    return topic.groups[0];
  }

  return topic.groups.find((group) => group.slug === groupSlug) ?? topic.groups[0];
}
