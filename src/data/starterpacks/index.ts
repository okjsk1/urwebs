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

const itLinks: WidgetInstance = {
  id: "work-it-links",
  kind: "links",
  props: {
    links: [
      { title: "GitHub", url: "https://github.com", description: "코드 저장소 관리" },
      { title: "Jira", url: "https://www.atlassian.com/software/jira", description: "이슈 트래킹" },
      { title: "Swagger", url: "https://swagger.io", description: "API 명세 확인" },
    ],
  },
};

const itChecklist: WidgetInstance = {
  id: "work-it-checklist",
  kind: "checklist",
  props: {
    storageKey: "work-it-daily",
    items: [
      { id: "standup", label: "데일리 스탠드업 준비" },
      { id: "review", label: "코드 리뷰 처리" },
      { id: "deploy", label: "배포 일정 확인" },
    ],
  },
};

const itCalendar: WidgetInstance = {
  id: "work-it-calendar",
  kind: "calendar",
  props: {},
};

const itGroups: StarterPackGroup[] = [
  {
    slug: "dev-collab",
    title: "개발 협업",
    description: "팀과 소통하고 작업 현황을 빠르게 확인하세요.",
    widgets: [itLinks, itChecklist],
  },
  {
    slug: "dev-schedule",
    title: "개발 일정 관리",
    description: "스프린트 계획과 중요한 마일스톤을 놓치지 마세요.",
    widgets: [itCalendar],
  },
];

const designLinks: WidgetInstance = {
  id: "work-design-links",
  kind: "links",
  props: {
    links: [
      { title: "Figma", url: "https://www.figma.com", description: "디자인 협업" },
      { title: "Behance", url: "https://www.behance.net", description: "레퍼런스 탐색" },
      { title: "ArchDaily", url: "https://www.archdaily.com", description: "건축 인사이트" },
    ],
  },
};

const designCalendar: WidgetInstance = {
  id: "work-design-calendar",
  kind: "calendar",
  props: {},
};

const designVideos: WidgetInstance = {
  id: "work-design-videos",
  kind: "videos",
  props: {
    query: "design inspiration",
  },
};

const designGroups: StarterPackGroup[] = [
  {
    slug: "design-reference",
    title: "디자인 레퍼런스",
    description: "프로젝트 아이디어를 확장할 자료를 모았습니다.",
    widgets: [designLinks, designVideos],
  },
  {
    slug: "design-schedule",
    title: "프로젝트 일정",
    description: "디자인과 설계 마일스톤을 정리하세요.",
    widgets: [designCalendar],
  },
];

const businessLinks: WidgetInstance = {
  id: "work-business-links",
  kind: "links",
  props: {
    links: [
      { title: "Notion", url: "https://www.notion.so", description: "기획 문서 협업" },
      { title: "Google Analytics", url: "https://analytics.google.com", description: "지표 확인" },
      { title: "Miro", url: "https://miro.com", description: "아이디어 보드" },
    ],
  },
};

const businessChecklist: WidgetInstance = {
  id: "work-business-checklist",
  kind: "checklist",
  props: {
    storageKey: "work-business-weekly",
    items: [
      { id: "okr", label: "주간 OKR 리뷰" },
      { id: "report", label: "성과 리포트 업데이트" },
      { id: "meeting", label: "주요 미팅 준비" },
    ],
  },
};

const businessGroups: StarterPackGroup[] = [
  {
    slug: "business-planning",
    title: "전략 기획",
    description: "비즈니스 전략 수립에 필요한 자료를 모았습니다.",
    widgets: [businessLinks],
  },
  {
    slug: "business-ops",
    title: "운영 체크리스트",
    description: "경영 실무를 위한 주요 업무를 관리하세요.",
    widgets: [businessChecklist],
  },
];

const marketingLinks: WidgetInstance = {
  id: "work-marketing-links",
  kind: "links",
  props: {
    links: [
      { title: "Meta Ads", url: "https://www.facebook.com/business/ads", description: "캠페인 관리" },
      { title: "Google Trends", url: "https://trends.google.com", description: "트렌드 분석" },
      { title: "Canva", url: "https://www.canva.com", description: "콘텐츠 제작" },
    ],
  },
};

const marketingChecklist: WidgetInstance = {
  id: "work-marketing-checklist",
  kind: "checklist",
  props: {
    storageKey: "work-marketing-campaign",
    items: [
      { id: "campaign", label: "캠페인 성과 확인" },
      { id: "content", label: "콘텐츠 일정 검토" },
      { id: "report", label: "주요 지표 공유" },
    ],
  },
};

const marketingVideos: WidgetInstance = {
  id: "work-marketing-videos",
  kind: "videos",
  props: {
    query: "marketing strategy",
  },
};

const marketingGroups: StarterPackGroup[] = [
  {
    slug: "marketing-insight",
    title: "마케팅 인사이트",
    description: "시장과 트렌드를 빠르게 파악하세요.",
    widgets: [marketingLinks, marketingVideos],
  },
  {
    slug: "marketing-ops",
    title: "캠페인 운영",
    description: "캠페인 일정을 점검하고 공유하세요.",
    widgets: [marketingChecklist],
  },
];

const operationsLinks: WidgetInstance = {
  id: "work-operations-links",
  kind: "links",
  props: {
    links: [
      { title: "국세청 홈택스", url: "https://www.hometax.go.kr", description: "세무 신고" },
      { title: "법제처 국가법령정보센터", url: "https://www.law.go.kr", description: "법령 검색" },
      { title: "워크플로이", url: "https://workflowy.com", description: "업무 정리" },
    ],
  },
};

const operationsChecklist: WidgetInstance = {
  id: "work-operations-checklist",
  kind: "checklist",
  props: {
    storageKey: "work-operations-monthly",
    items: [
      { id: "tax", label: "세무 신고 일정 확인" },
      { id: "contract", label: "계약서 검토" },
      { id: "admin", label: "사무 물품 정비" },
    ],
  },
};

const operationsCalendar: WidgetInstance = {
  id: "work-operations-calendar",
  kind: "calendar",
  props: {},
};

const operationsGroups: StarterPackGroup[] = [
  {
    slug: "operations-reference",
    title: "법무 · 행정 자료",
    description: "업무에 필요한 행정 문서를 빠르게 찾으세요.",
    widgets: [operationsLinks],
  },
  {
    slug: "operations-schedule",
    title: "정기 업무 관리",
    description: "회계와 사무 일정을 체계적으로 관리하세요.",
    widgets: [operationsChecklist, operationsCalendar],
  },
];

const researchLinks: WidgetInstance = {
  id: "work-research-links",
  kind: "links",
  props: {
    links: [
      { title: "Google Scholar", url: "https://scholar.google.com", description: "학술 자료 검색" },
      { title: "DBpia", url: "https://www.dbpia.co.kr", description: "국내 논문 검색" },
      { title: "Zotero", url: "https://www.zotero.org", description: "자료 관리" },
    ],
  },
};

const researchChecklist: WidgetInstance = {
  id: "work-research-checklist",
  kind: "checklist",
  props: {
    storageKey: "work-research-weekly",
    items: [
      { id: "reading", label: "논문 리딩" },
      { id: "experiment", label: "실험/수업 준비" },
      { id: "note", label: "결과 정리" },
    ],
  },
};

const researchVideos: WidgetInstance = {
  id: "work-research-videos",
  kind: "videos",
  props: {
    query: "research methods",
  },
};

const researchGroups: StarterPackGroup[] = [
  {
    slug: "research-reference",
    title: "연구 자료",
    description: "최신 연구 동향을 살펴보세요.",
    widgets: [researchLinks, researchVideos],
  },
  {
    slug: "research-routine",
    title: "학습 루틴",
    description: "연구와 수업 준비를 위한 일정과 할 일을 정리하세요.",
    widgets: [researchChecklist],
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

const bakingChecklist: WidgetInstance = {
  id: "baking-checklist",
  kind: "checklist",
  props: {
    storageKey: "home-baking",
    items: [
      { id: "preheat", label: "오븐 예열" },
      { id: "measure", label: "재료 계량" },
      { id: "cooling", label: "식힘망 준비" },
    ],
  },
};

const bakingLinks: WidgetInstance = {
  id: "baking-links",
  kind: "links",
  props: {
    links: [
      { title: "Breadtopia", url: "https://breadtopia.com", description: "천연 발효 빵 레시피" },
      {
        title: "만개의 레시피 베이킹",
        url: "https://www.10000recipe.com/recipe/list.html?q=%EB%B2%A0%EC%9D%B4%ED%82%B9",
        description: "한글 레시피 모음",
      },
    ],
  },
};

const bakingVideos: WidgetInstance = {
  id: "baking-videos",
  kind: "videos",
  props: {
    query: "홈 베이킹",
  },
};

const bakingGroups: StarterPackGroup[] = [
  {
    slug: "baking-prep",
    title: "굽기 준비",
    description: "재료와 도구를 미리 준비해보세요.",
    widgets: [bakingChecklist],
  },
  {
    slug: "baking-study",
    title: "레시피 탐색",
    description: "새로운 레시피와 튜토리얼을 찾아보세요.",
    widgets: [bakingLinks, bakingVideos],
  },
];

const gardeningChecklist: WidgetInstance = {
  id: "gardening-checklist",
  kind: "checklist",
  props: {
    storageKey: "urban-gardening",
    items: [
      { id: "watering", label: "물 주기 일정 확인" },
      { id: "repot", label: "분갈이 준비" },
      { id: "fertilizer", label: "비료 주기 기록" },
    ],
  },
};

const gardeningLinks: WidgetInstance = {
  id: "gardening-links",
  kind: "links",
  props: {
    links: [
      {
        title: "가드닝 인포",
        url: "https://www.sisul.or.kr/open_content/forest/gardening/",
        description: "도시 정원 가이드",
      },
      {
        title: "국립수목원 식물도감",
        url: "https://nature.go.kr/kbi/plant/plantSearchList.do",
        description: "식물 관리 정보",
      },
    ],
  },
};

const gardeningCalendar: WidgetInstance = {
  id: "gardening-calendar",
  kind: "calendar",
  props: {},
};

const gardeningGroups: StarterPackGroup[] = [
  {
    slug: "gardening-routine",
    title: "가드닝 루틴",
    description: "식물 관리 루틴을 기록해보세요.",
    widgets: [gardeningChecklist, gardeningCalendar],
  },
  {
    slug: "gardening-reference",
    title: "식물 정보",
    description: "키우는 식물 정보를 찾아보고 저장하세요.",
    widgets: [gardeningLinks],
  },
];

const musicPracticeChecklist: WidgetInstance = {
  id: "music-practice-checklist",
  kind: "checklist",
  props: {
    storageKey: "music-practice",
    items: [
      { id: "warmup", label: "워밍업 스케일" },
      { id: "technique", label: "테크닉 연습" },
      { id: "repertoire", label: "레퍼토리 곡 반복" },
    ],
  },
};

const musicPracticeCalendar: WidgetInstance = {
  id: "music-practice-calendar",
  kind: "calendar",
  props: {},
};

const musicPracticeVideos: WidgetInstance = {
  id: "music-practice-videos",
  kind: "videos",
  props: {
    query: "악기 연습 루틴",
  },
};

const musicPracticeGroups: StarterPackGroup[] = [
  {
    slug: "practice-plan",
    title: "연습 계획",
    description: "연습 루틴과 스케줄을 정리하세요.",
    widgets: [musicPracticeChecklist, musicPracticeCalendar],
  },
  {
    slug: "practice-inspiration",
    title: "연주 레퍼런스",
    description: "연주 팁과 튜토리얼을 확인하세요.",
    widgets: [musicPracticeVideos],
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

        slug: "it-development",
        title: "IT / 개발",
        description: "개발자 팀을 위한 생산성 도구",
        widgets: [itLinks, itChecklist, itCalendar],
        groups: itGroups,
      },
      {
        slug: "design-architecture",
        title: "디자인 / 건축",
        description: "디자인과 설계 프로젝트 관리를 위한 큐레이션",
        widgets: [designLinks, designCalendar, designVideos],
        groups: designGroups,
      },
      {
        slug: "business-management",
        title: "기획 / 경영",
        description: "경영 전략과 실무 운영을 동시에 챙겨보세요.",
        widgets: [businessLinks, businessChecklist],
        groups: businessGroups,
      },
      {
        slug: "marketing-media",
        title: "마케팅 / 미디어",
        description: "마케팅 캠페인과 콘텐츠 운영을 위한 필수 위젯",
        widgets: [marketingLinks, marketingChecklist, marketingVideos],
        groups: marketingGroups,
      },
      {
        slug: "operations-admin",
        title: "회계 / 법무 / 사무",
        description: "행정과 지원 업무를 체계적으로 관리하세요.",
        widgets: [operationsLinks, operationsChecklist, operationsCalendar],
        groups: operationsGroups,
      },
      {
        slug: "education-research",
        title: "교육 / 연구",
        description: "교육자와 연구자를 위한 루틴과 자료 정리",
        widgets: [researchLinks, researchChecklist, researchVideos],
        groups: researchGroups,
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
      {
        slug: "home-baking",
        title: "홈 베이킹",
        description: "집에서 만드는 베이커리 실습 루틴",
        widgets: [bakingChecklist, bakingLinks, bakingVideos],
        groups: bakingGroups,
      },
      {
        slug: "urban-gardening",
        title: "홈 가드닝",
        description: "반려식물을 위한 관리와 정보 수집",
        widgets: [gardeningChecklist, gardeningCalendar, gardeningLinks],
        groups: gardeningGroups,
      },
      {
        slug: "music-practice",
        title: "악기 연습",
        description: "꾸준한 연습 루틴과 레슨 자료",
        widgets: [musicPracticeChecklist, musicPracticeCalendar, musicPracticeVideos],
        groups: musicPracticeGroups,
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
