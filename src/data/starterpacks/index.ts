import { StarterPackGroup, StarterPackSection, StarterPackTopic, WidgetInstance } from "@/types/widgets";

interface LinkSeed {
  title: string;
  url: string;
  description: string;
}

interface TopicSeed {
  slug: string;
  title: string;
  description: string;
  links: LinkSeed[];
}

function createLinksWidget(
  sectionSlug: string,
  topicSlug: string,
  title: string,
  links: LinkSeed[],
): WidgetInstance {
  return {
    id: `${sectionSlug}-${topicSlug}-links`,
    kind: "links",
    title,
    props: {
      links: links.map((link) => ({
        title: link.title,
        url: link.url,
        description: link.description,
      })),
    },
  };
}

function createTopic(seed: TopicSeed, sectionSlug: string): StarterPackTopic {
  return {
    slug: seed.slug,
    title: seed.title,
    description: seed.description,
    widgets: [createLinksWidget(sectionSlug, seed.slug, `${seed.title} 필수 링크`, seed.links)],
  };
}

function createGroup(
  sectionSlug: string,
  groupSlug: string,
  title: string,
  topics: TopicSeed[],
  description?: string,
): StarterPackGroup {
  return {
    slug: `${sectionSlug}-${groupSlug}`,
    title,
    description,
    topics: topics.map((topic) => createTopic(topic, sectionSlug)),
  };
}

function flattenTopics(groups: StarterPackGroup[]): StarterPackTopic[] {
  return groups.flatMap((group) => group.topics);
}

const workGroups: StarterPackGroup[] = [
  createGroup("work", "it-dev", "IT / 개발", [
    {
      slug: "frontend",
      title: "프론트엔드",
      description: "React, Vue, Svelte, CSS",
      links: [
        {
          title: "React 공식 문서",
          url: "https://react.dev",
          description: "최신 React 가이드와 학습 자료",
        },
        {
          title: "Vue.js 공식 문서",
          url: "https://vuejs.org/guide/introduction.html",
          description: "Vue 3 가이드 및 베스트 프랙티스",
        },
        {
          title: "CSS-Tricks",
          url: "https://css-tricks.com",
          description: "실전 CSS 패턴과 UI 팁",
        },
      ],
    },
    {
      slug: "backend",
      title: "백엔드",
      description: "Node.js, Spring, Django, FastAPI",
      links: [
        {
          title: "Node.js 공식 문서",
          url: "https://nodejs.org/en/docs",
          description: "Node.js API 및 가이드",
        },
        {
          title: "Spring Guides",
          url: "https://spring.io/guides",
          description: "Spring 입문 및 확장 튜토리얼",
        },
        {
          title: "FastAPI 공식 문서",
          url: "https://fastapi.tiangolo.com",
          description: "현대적인 Python 백엔드 프레임워크",
        },
      ],
    },
    {
      slug: "data-ai",
      title: "데이터/AI",
      description: "Python, R, TensorFlow, 시각화",
      links: [
        {
          title: "TensorFlow Tutorials",
          url: "https://www.tensorflow.org/tutorials",
          description: "머신러닝 모델 구축 실습",
        },
        {
          title: "Kaggle",
          url: "https://www.kaggle.com",
          description: "데이터셋과 경쟁으로 실력 향상",
        },
        {
          title: "R for Data Science",
          url: "https://r4ds.hadley.nz",
          description: "R 기반 데이터 분석 가이드",
        },
      ],
    },
    {
      slug: "devops",
      title: "DevOps",
      description: "Docker, K8s, CI/CD, 클라우드",
      links: [
        {
          title: "Docker 공식 문서",
          url: "https://docs.docker.com",
          description: "컨테이너 빌드와 배포 가이드",
        },
        {
          title: "Kubernetes 문서",
          url: "https://kubernetes.io/docs/home",
          description: "K8s 운영 및 예제",
        },
        {
          title: "CI/CD with GitHub Actions",
          url: "https://docs.github.com/actions",
          description: "자동화 파이프라인 구축",
        },
      ],
    },
    {
      slug: "security",
      title: "보안",
      description: "취약점, 해킹뉴스, 인증",
      links: [
        {
          title: "OWASP Top 10",
          url: "https://owasp.org/www-project-top-ten",
          description: "웹 애플리케이션 보안 핵심",
        },
        {
          title: "Hacker News",
          url: "https://news.ycombinator.com",
          description: "최신 기술 및 보안 이슈",
        },
        {
          title: "KISA 보안공지",
          url: "https://www.krcert.or.kr/data/secNoticeList.do",
          description: "국내 보안 위협 동향",
        },
      ],
    },
  ]),
  createGroup("work", "design-architecture", "디자인 / 건축", [
    {
      slug: "graphic-design",
      title: "그래픽 디자인",
      description: "Figma, Photoshop, Illustrator",
      links: [
        {
          title: "Figma Community",
          url: "https://www.figma.com/community",
          description: "디자인 템플릿과 UI 킷",
        },
        {
          title: "Adobe Creative Cloud",
          url: "https://creativecloud.adobe.com",
          description: "Photoshop 및 Illustrator 학습",
        },
        {
          title: "Dribbble",
          url: "https://dribbble.com",
          description: "디자인 트렌드 영감",
        },
      ],
    },
    {
      slug: "ui-ux",
      title: "UI/UX",
      description: "프로토타입, 디자인 시스템",
      links: [
        {
          title: "Design Systems Repo",
          url: "https://designsystemsrepo.com",
          description: "디자인 시스템 사례 모음",
        },
        {
          title: "UX Collective",
          url: "https://uxdesign.cc",
          description: "UX 아티클과 실무 팁",
        },
        {
          title: "Maze",
          url: "https://maze.co",
          description: "프로토타입 테스트 플랫폼",
        },
      ],
    },
    {
      slug: "architecture",
      title: "건축 설계",
      description: "AutoCAD, Revit, BIM",
      links: [
        {
          title: "Autodesk Education",
          url: "https://www.autodesk.com/education",
          description: "AutoCAD 및 Revit 학습",
        },
        {
          title: "BIM Forum",
          url: "https://bimforum.org",
          description: "BIM 표준과 사례",
        },
        {
          title: "ArchDaily",
          url: "https://www.archdaily.com",
          description: "건축 디자인 인사이트",
        },
      ],
    },
    {
      slug: "interior",
      title: "인테리어",
      description: "3D, 마감재, 재료 DB",
      links: [
        {
          title: "Houzz",
          url: "https://www.houzz.com",
          description: "인테리어 영감과 자료",
        },
        {
          title: "Archilovers",
          url: "https://www.archilovers.com",
          description: "전세계 인테리어 사례",
        },
        {
          title: "SketchUp Learn",
          url: "https://learn.sketchup.com",
          description: "3D 모델링 튜토리얼",
        },
      ],
    },
  ]),
  createGroup("work", "biz-management", "기획 / 경영", [
    {
      slug: "product-planning",
      title: "제품 기획",
      description: "Notion, Jira, Trello",
      links: [
        {
          title: "Notion Templates",
          url: "https://www.notion.so/templates",
          description: "제품 기획 템플릿",
        },
        {
          title: "Jira Product Discovery",
          url: "https://www.atlassian.com/software/jira/product-discovery",
          description: "제품 아이디어 정리",
        },
        {
          title: "Trello Inspiration",
          url: "https://trello.com/inspiration",
          description: "워크플로우 보드 예시",
        },
      ],
    },
    {
      slug: "project-management",
      title: "프로젝트 관리",
      description: "Asana, Monday.com",
      links: [
        {
          title: "Asana Guide",
          url: "https://asana.com/guide",
          description: "프로젝트 관리 베스트",
        },
        {
          title: "Monday.com Blog",
          url: "https://monday.com/blog",
          description: "협업과 생산성 인사이트",
        },
        {
          title: "ClickUp University",
          url: "https://university.clickup.com",
          description: "프로젝트 운영 교육",
        },
      ],
    },
    {
      slug: "business-ops",
      title: "경영/관리",
      description: "ERP, CRM",
      links: [
        {
          title: "SAP Learning",
          url: "https://learning.sap.com",
          description: "ERP 시스템 학습",
        },
        {
          title: "Salesforce Trailhead",
          url: "https://trailhead.salesforce.com",
          description: "CRM 실습 코스",
        },
        {
          title: "Harvard Business Review",
          url: "https://hbr.org",
          description: "경영 전략 아티클",
        },
      ],
    },
  ]),
  createGroup("work", "marketing", "마케팅 / 미디어", [
    {
      slug: "digital-marketing",
      title: "디지털 마케팅",
      description: "Google Ads, Meta Ads, 네이버 광고",
      links: [
        {
          title: "Google Skillshop",
          url: "https://skillshop.exceedlms.com",
          description: "Google Ads 공인 교육",
        },
        {
          title: "Meta Blueprint",
          url: "https://www.facebook.com/business/learn",
          description: "Meta Ads 캠페인 학습",
        },
        {
          title: "네이버 광고 아카데미",
          url: "https://edu.searchad.naver.com",
          description: "네이버 검색광고 가이드",
        },
      ],
    },
    {
      slug: "sns-management",
      title: "SNS 운영",
      description: "인스타, 유튜브 스튜디오, 틱톡",
      links: [
        {
          title: "Instagram Creators",
          url: "https://www.instagram.com/creators",
          description: "인스타그램 운영 팁",
        },
        {
          title: "YouTube Creator Academy",
          url: "https://creatoracademy.youtube.com",
          description: "채널 성장 전략",
        },
        {
          title: "TikTok Business Center",
          url: "https://www.tiktok.com/business/ko",
          description: "틱톡 광고 및 운영 자료",
        },
      ],
    },
    {
      slug: "marketing-analytics",
      title: "데이터 분석",
      description: "GA4, Search Console",
      links: [
        {
          title: "Google Analytics Academy",
          url: "https://analytics.google.com/analytics/academy",
          description: "GA4 사용법 학습",
        },
        {
          title: "Search Console 도움말",
          url: "https://support.google.com/webmasters",
          description: "SEO 및 성과 분석",
        },
        {
          title: "Looker Studio Gallery",
          url: "https://lookerstudio.google.com/gallery",
          description: "데이터 시각화 템플릿",
        },
      ],
    },
  ]),
  createGroup("work", "office-legal", "회계 / 법무 / 사무", [
    {
      slug: "tax-accounting",
      title: "세무/회계",
      description: "더존, 국세청",
      links: [
        {
          title: "더존 SmartA",
          url: "https://www.duzon.com/product/smarta",
          description: "회계 프로그램 소개",
        },
        {
          title: "국세청 홈택스",
          url: "https://www.hometax.go.kr",
          description: "전자 세금신고",
        },
        {
          title: "삼일인포마인",
          url: "https://www.samil.com",
          description: "세무 회계 이슈",
        },
      ],
    },
    {
      slug: "legal",
      title: "법무",
      description: "판례검색, 법제처",
      links: [
        {
          title: "법령정보센터",
          url: "https://www.law.go.kr",
          description: "최신 법령 및 판례",
        },
        {
          title: "대법원 종합법률정보",
          url: "https://glaw.scourt.go.kr",
          description: "판례 검색",
        },
        {
          title: "로앤비",
          url: "https://www.lawnb.com",
          description: "법률 뉴스와 해설",
        },
      ],
    },
    {
      slug: "office",
      title: "문서/오피스",
      description: "한글, MS Office, 구글 Docs",
      links: [
        {
          title: "한컴오피스",
          url: "https://www.hancom.com",
          description: "한글 오피스 자료",
        },
        {
          title: "Microsoft 365 학습",
          url: "https://support.microsoft.com/training",
          description: "오피스 제품 튜토리얼",
        },
        {
          title: "Google Workspace Learning",
          url: "https://support.google.com/a/users",
          description: "구글 문서 활용",
        },
      ],
    },
    {
      slug: "public-services",
      title: "공공업무",
      description: "정부24, 나라장터",
      links: [
        {
          title: "정부24",
          url: "https://www.gov.kr",
          description: "민원 서비스",
        },
        {
          title: "나라장터",
          url: "https://www.g2b.go.kr",
          description: "조달청 입찰 정보",
        },
        {
          title: "국민신문고",
          url: "https://www.epeople.go.kr",
          description: "민원 제기 및 상담",
        },
      ],
    },
  ]),
  createGroup("work", "education-research", "교육 / 연구", [
    {
      slug: "papers",
      title: "논문/자료",
      description: "Google Scholar, RISS",
      links: [
        {
          title: "Google Scholar",
          url: "https://scholar.google.com",
          description: "학술 논문 검색",
        },
        {
          title: "RISS",
          url: "https://www.riss.kr",
          description: "국내외 학술자료",
        },
        {
          title: "arXiv",
          url: "https://arxiv.org",
          description: "최신 연구 논문",
        },
      ],
    },
    {
      slug: "collaboration-tools",
      title: "협업 툴",
      description: "Slack, Teams, Zoom",
      links: [
        {
          title: "Slack",
          url: "https://slack.com/intl/ko-kr",
          description: "실시간 팀 커뮤니케이션",
        },
        {
          title: "Microsoft Teams",
          url: "https://www.microsoft.com/ko-kr/microsoft-teams",
          description: "하이브리드 회의 및 협업",
        },
        {
          title: "Zoom",
          url: "https://zoom.us",
          description: "화상 회의 플랫폼",
        },
      ],
    },
  ]),
];

const hobbyGroups: StarterPackGroup[] = [
  createGroup("hobby", "outdoor", "아웃도어", [
    {
      slug: "camping",
      title: "캠핑",
      description: "예약, 장비몰, 체크리스트, 날씨",
      links: [
        {
          title: "캠핑톡",
          url: "https://www.campingtalk.co.kr",
          description: "캠핑장 예약 정보",
        },
        {
          title: "알리익스프레스 캠핑",
          url: "https://ko.aliexpress.com/category/200002490/camping-hiking.html",
          description: "캠핑 장비 쇼핑",
        },
        {
          title: "기상청 날씨누리",
          url: "https://www.weather.go.kr/w/weather/forecast/mid-term.do",
          description: "주간 날씨 확인",
        },
      ],
    },
    {
      slug: "hiking",
      title: "등산",
      description: "등산로 지도, 커뮤니티",
      links: [
        {
          title: "국립공원공단",
          url: "https://www.knps.or.kr",
          description: "등산로 정보",
        },
        {
          title: "트랭글",
          url: "https://www.tranggle.com",
          description: "등산 기록 커뮤니티",
        },
        {
          title: "AllTrails",
          url: "https://www.alltrails.com",
          description: "글로벌 트레일 지도",
        },
      ],
    },
    {
      slug: "fishing",
      title: "낚시",
      description: "조황 정보, 장비몰",
      links: [
        {
          title: "바다타임",
          url: "https://www.badatime.com",
          description: "조황 및 물때 정보",
        },
        {
          title: "낚시바다",
          url: "https://www.fishings.co.kr",
          description: "낚시 커뮤니티",
        },
        {
          title: "디카몰",
          url: "https://www.dicamall.co.kr",
          description: "낚시 장비 쇼핑",
        },
      ],
    },
    {
      slug: "cycling-running",
      title: "자전거/러닝",
      description: "경로앱, 커뮤니티",
      links: [
        {
          title: "Strava",
          url: "https://www.strava.com",
          description: "러닝/라이딩 기록",
        },
        {
          title: "Komoot",
          url: "https://www.komoot.com",
          description: "경로 탐색",
        },
        {
          title: "동호회 찾기",
          url: "https://cafe.naver.com",
          description: "네이버 스포츠 카페",
        },
      ],
    },
  ]),
  createGroup("hobby", "gaming", "게임", [
    {
      slug: "pc-gaming",
      title: "PC게임",
      description: "Steam, 공략, 커뮤니티",
      links: [
        {
          title: "Steam",
          url: "https://store.steampowered.com",
          description: "PC 게임 스토어",
        },
        {
          title: "INVEN",
          url: "https://www.inven.co.kr",
          description: "게임 뉴스와 공략",
        },
        {
          title: "Nexus Mods",
          url: "https://www.nexusmods.com",
          description: "게임 모드 다운로드",
        },
      ],
    },
    {
      slug: "console-gaming",
      title: "콘솔게임",
      description: "PlayStation, Xbox, Switch",
      links: [
        {
          title: "PlayStation Store",
          url: "https://store.playstation.com",
          description: "PS 전용 게임",
        },
        {
          title: "Nintendo Switch",
          url: "https://www.nintendo.co.kr",
          description: "닌텐도 공식 정보",
        },
        {
          title: "Xbox",
          url: "https://www.xbox.com",
          description: "Xbox 게임 패스",
        },
      ],
    },
    {
      slug: "mobile-gaming",
      title: "모바일게임",
      description: "쿠키런, 원신 등 인기게임",
      links: [
        {
          title: "앱스토어 인기게임",
          url: "https://apps.apple.com/kr/charts/iphone",
          description: "iOS 인기 순위",
        },
        {
          title: "구글플레이 인기게임",
          url: "https://play.google.com/store/apps/collection/cluster?clp=ggEJCh0KF21vcmVfZ2FtZXNfcG9wdWxhcg%3D%3D:S:ANO1ljLM4D0&gsr=CQt6AQkKHQoXbW9yZV9nYW1lc19wb3B1bGFyEgkJodjtZFptwAE%3D:S:ANO1ljLHKXY",
          description: "Android 인기 게임",
        },
        {
          title: "게임 공략 위키",
          url: "https://namu.wiki",
          description: "주요 모바일 게임 공략",
        },
      ],
    },
  ]),
  createGroup("hobby", "cooking", "요리 / 음식", [
    {
      slug: "recipes",
      title: "레시피",
      description: "백종원, 만개의 레시피",
      links: [
        {
          title: "만개의 레시피",
          url: "https://www.10000recipe.com",
          description: "국내 최대 레시피",
        },
        {
          title: "백종원 요리비책",
          url: "https://www.youtube.com/@paikscuisine",
          description: "유튜브 레시피 채널",
        },
        {
          title: "쿠킹덤",
          url: "https://www.cookingdom.co.kr",
          description: "요리 커뮤니티",
        },
      ],
    },
    {
      slug: "baking",
      title: "베이킹",
      description: "빵/케이크, 오븐 레시피",
      links: [
        {
          title: "Bread Garden",
          url: "https://breadgarden.co.kr",
          description: "베이킹 레시피",
        },
        {
          title: "우드노트",
          url: "https://www.woodynote.com",
          description: "홈베이킹 팁",
        },
        {
          title: "YouTube 베이킹",
          url: "https://www.youtube.com/results?search_query=%EB%B2%A0%EC%9D%B4%ED%82%B9",
          description: "베이킹 영상 모음",
        },
      ],
    },
    {
      slug: "camp-cooking",
      title: "캠핑요리",
      description: "간편식, 캠핑 전용 레시피",
      links: [
        {
          title: "캠핑요리 레시피",
          url: "https://www.youtube.com/results?search_query=%EC%BA%A0%ED%95%91%EC%9A%94%EB%A6%AC",
          description: "캠핑 요리 영상",
        },
        {
          title: "캠핑푸드",
          url: "https://www.campingfood.co.kr",
          description: "캠핑 음식 쇼핑",
        },
        {
          title: "아웃도어 체크리스트",
          url: "https://blog.naver.com/PostView.naver?blogId=outdoor",
          description: "캠핑 준비물 가이드",
        },
      ],
    },
  ]),
  createGroup("hobby", "photo-video", "사진 / 영상", [
    {
      slug: "photo-editing",
      title: "사진 편집",
      description: "Lightroom, Snapseed",
      links: [
        {
          title: "Adobe Lightroom",
          url: "https://www.adobe.com/products/photoshop-lightroom.html",
          description: "사진 편집 솔루션",
        },
        {
          title: "Snapseed",
          url: "https://snapseed.online",
          description: "모바일 편집 앱",
        },
        {
          title: "500px",
          url: "https://500px.com",
          description: "사진 공유 커뮤니티",
        },
      ],
    },
    {
      slug: "video-editing",
      title: "영상 편집",
      description: "Premiere, DaVinci Resolve, CapCut",
      links: [
        {
          title: "Premiere Pro 튜토리얼",
          url: "https://helpx.adobe.com/kr/premiere-pro/tutorials.html",
          description: "Adobe 공식 강좌",
        },
        {
          title: "DaVinci Resolve Training",
          url: "https://www.blackmagicdesign.com/kr/products/davinciresolve/training",
          description: "무료 전문 과정",
        },
        {
          title: "CapCut Creator Hub",
          url: "https://www.capcut.com/creators",
          description: "모바일 영상 편집",
        },
      ],
    },
    {
      slug: "sharing",
      title: "공유",
      description: "Instagram, Pinterest, YouTube",
      links: [
        {
          title: "Instagram",
          url: "https://www.instagram.com",
          description: "사진 공유 플랫폼",
        },
        {
          title: "Pinterest",
          url: "https://www.pinterest.com",
          description: "아이디어 보드",
        },
        {
          title: "YouTube",
          url: "https://www.youtube.com",
          description: "영상 업로드 플랫폼",
        },
      ],
    },
  ]),
  createGroup("hobby", "music", "음악", [
    {
      slug: "instrument",
      title: "악기",
      description: "기타 코드, 피아노 악보, 드럼",
      links: [
        {
          title: "Ultimate Guitar",
          url: "https://www.ultimate-guitar.com",
          description: "기타 코드 라이브러리",
        },
        {
          title: "Musescore",
          url: "https://musescore.com",
          description: "피아노 악보 공유",
        },
        {
          title: "Drumeo",
          url: "https://www.drumeo.com",
          description: "드럼 레슨",
        },
      ],
    },
    {
      slug: "listening",
      title: "음악 감상",
      description: "Spotify, YouTube Music, SoundCloud",
      links: [
        {
          title: "Spotify",
          url: "https://www.spotify.com",
          description: "스트리밍 서비스",
        },
        {
          title: "YouTube Music",
          url: "https://music.youtube.com",
          description: "유튜브 음악 서비스",
        },
        {
          title: "SoundCloud",
          url: "https://soundcloud.com",
          description: "인디 음악 공유",
        },
      ],
    },
    {
      slug: "music-production",
      title: "음악 제작",
      description: "FL Studio, Ableton, GarageBand",
      links: [
        {
          title: "FL Studio Tutorials",
          url: "https://www.image-line.com/fl-studio-learning",
          description: "FL Studio 학습",
        },
        {
          title: "Ableton Learn",
          url: "https://www.ableton.com/en/learn",
          description: "라이브 세션 교육",
        },
        {
          title: "GarageBand Guides",
          url: "https://support.apple.com/garageband",
          description: "GarageBand 사용법",
        },
      ],
    },
  ]),
  createGroup("hobby", "sports", "스포츠", [
    {
      slug: "fitness",
      title: "헬스/피트니스",
      description: "루틴, 트래커",
      links: [
        {
          title: "Nike Training Club",
          url: "https://www.nike.com/ntc-app",
          description: "홈트레이닝 프로그램",
        },
        {
          title: "StrongLifts",
          url: "https://stronglifts.com",
          description: "웨이트 루틴",
        },
        {
          title: "MyFitnessPal",
          url: "https://www.myfitnesspal.com",
          description: "영양 및 운동 기록",
        },
      ],
    },
    {
      slug: "ball-sports",
      title: "축구/농구/야구",
      description: "뉴스, 경기 일정",
      links: [
        {
          title: "ESPN",
          url: "https://www.espn.com",
          description: "글로벌 스포츠 뉴스",
        },
        {
          title: "KBO",
          url: "https://www.koreabaseball.com",
          description: "야구 경기 일정",
        },
        {
          title: "K League",
          url: "https://www.kleague.com",
          description: "축구 경기 정보",
        },
      ],
    },
    {
      slug: "esports",
      title: "e스포츠",
      description: "LoL, 스타크래프트, 오버워치",
      links: [
        {
          title: "LoL Esports",
          url: "https://lolesports.com",
          description: "리그 오브 레전드 일정",
        },
        {
          title: "Inven e스포츠",
          url: "https://esports.inven.co.kr",
          description: "국내 e스포츠 뉴스",
        },
        {
          title: "Liquipedia",
          url: "https://liquipedia.net",
          description: "스타크래프트 & 오버워치 정보",
        },
      ],
    },
  ]),
];

const studyGroups: StarterPackGroup[] = [
  createGroup("study", "language", "언어", [
    {
      slug: "english",
      title: "영어",
      description: "듀오링고, BBC, TED",
      links: [
        {
          title: "Duolingo",
          url: "https://www.duolingo.com",
          description: "게임화된 언어 학습",
        },
        {
          title: "BBC Learning English",
          url: "https://www.bbc.co.uk/learningenglish",
          description: "영어 뉴스 학습",
        },
        {
          title: "TED",
          url: "https://www.ted.com/talks",
          description: "영어 청취 자료",
        },
      ],
    },
    {
      slug: "japanese",
      title: "일본어",
      description: "JLPT, 애니 자막 학습",
      links: [
        {
          title: "JLPT Sensei",
          url: "https://jlptsensei.com",
          description: "JLPT 대비 자료",
        },
        {
          title: "WaniKani",
          url: "https://www.wanikani.com",
          description: "한자 학습 시스템",
        },
        {
          title: "Animelon",
          url: "https://animelon.com",
          description: "애니 자막 학습",
        },
      ],
    },
    {
      slug: "chinese",
      title: "중국어",
      description: "HSK, 회화 앱",
      links: [
        {
          title: "HSK Online",
          url: "https://www.hskonline.com",
          description: "HSK 모의고사",
        },
        {
          title: "HelloChinese",
          url: "https://www.hellochinese.cc",
          description: "중국어 회화 학습",
        },
        {
          title: "Du Chinese",
          url: "https://www.duchinese.net",
          description: "중국어 리딩",
        },
      ],
    },
    {
      slug: "other-languages",
      title: "기타 언어",
      description: "스페인어, 독일어 등",
      links: [
        {
          title: "Busuu",
          url: "https://www.busuu.com",
          description: "다국어 학습 플랫폼",
        },
        {
          title: "Memrise",
          url: "https://www.memrise.com",
          description: "실전 회화 학습",
        },
        {
          title: "Clozemaster",
          url: "https://www.clozemaster.com",
          description: "문장 기반 학습",
        },
      ],
    },
  ]),
  createGroup("study", "certifications", "자격증", [
    {
      slug: "civil-service",
      title: "공무원/고시",
      description: "시험 일정과 강의",
      links: [
        {
          title: "고시기획",
          url: "https://www.gosiplan.co.kr",
          description: "공무원 시험 정보",
        },
        {
          title: "EBS 공무원",
          url: "https://gov.eduwill.net",
          description: "온라인 강의",
        },
        {
          title: "커넥츠 공단기",
          url: "https://gong.conects.com",
          description: "공시 자료실",
        },
      ],
    },
    {
      slug: "engineering",
      title: "기사/기술사",
      description: "자격시험 대비",
      links: [
        {
          title: "큐넷",
          url: "https://www.q-net.or.kr",
          description: "국가기술자격 공고",
        },
        {
          title: "자단기",
          url: "https://eng.conects.com",
          description: "기사 자격 학습",
        },
        {
          title: "기술인협회",
          url: "https://www.kpea.or.kr",
          description: "기술사 자료",
        },
      ],
    },
    {
      slug: "computer-cert",
      title: "컴퓨터 관련 자격증",
      description: "정보처리기사, MOS",
      links: [
        {
          title: "정보처리기사 커리큘럼",
          url: "https://www.inflearn.com/course/%EC%A0%95%EB%B3%B4%EC%B2%98%EB%A6%AC%EA%B8%B0%EC%82%AC",
          description: "온라인 강의",
        },
        {
          title: "MOS 시험 안내",
          url: "https://certiport.pearsonvue.com/Certifications/Microsoft/MOS/Overview",
          description: "MS 오피스 자격 안내",
        },
        {
          title: "코딩테스트 대비",
          url: "https://programmers.co.kr/learn/challenges",
          description: "실전 문제 풀이",
        },
      ],
    },
    {
      slug: "language-tests",
      title: "어학 시험",
      description: "TOEIC, TOEFL, IELTS",
      links: [
        {
          title: "ETS TOEIC",
          url: "https://www.ets.org/toeic",
          description: "공식 시험 정보",
        },
        {
          title: "ETS TOEFL",
          url: "https://www.ets.org/toefl",
          description: "TOEFL 준비 자료",
        },
        {
          title: "IELTS.org",
          url: "https://www.ielts.org",
          description: "IELTS 시험 안내",
        },
      ],
    },
  ]),
  createGroup("study", "programming", "프로그래밍", [
    {
      slug: "algorithms",
      title: "알고리즘/코딩테스트",
      description: "LeetCode, 백준, 프로그래머스",
      links: [
        {
          title: "LeetCode",
          url: "https://leetcode.com",
          description: "알고리즘 문제 풀이",
        },
        {
          title: "백준",
          url: "https://www.acmicpc.net",
          description: "한국 코딩테스트 플랫폼",
        },
        {
          title: "프로그래머스",
          url: "https://programmers.co.kr",
          description: "코딩 테스트 연습",
        },
      ],
    },
    {
      slug: "online-courses",
      title: "온라인 강의",
      description: "Inflearn, Udemy, Coursera",
      links: [
        {
          title: "인프런",
          url: "https://www.inflearn.com",
          description: "한국어 IT 강의",
        },
        {
          title: "Udemy",
          url: "https://www.udemy.com",
          description: "글로벌 온라인 강의",
        },
        {
          title: "Coursera",
          url: "https://www.coursera.org",
          description: "대학/기업 과정",
        },
      ],
    },
    {
      slug: "open-source",
      title: "오픈소스/깃허브 학습",
      description: "커밋과 PR 실습",
      links: [
        {
          title: "GitHub Learning Lab",
          url: "https://lab.github.com",
          description: "GitHub 실습",
        },
        {
          title: "First Timers Only",
          url: "https://www.firsttimersonly.com",
          description: "오픈소스 입문",
        },
        {
          title: "OSSU",
          url: "https://github.com/ossu/computer-science",
          description: "오픈소스 CS 커리큘럼",
        },
      ],
    },
  ]),
  createGroup("study", "knowledge", "일반 지식", [
    {
      slug: "history-society",
      title: "역사/사회",
      description: "한국사, 세계사 자료",
      links: [
        {
          title: "국사편찬위원회",
          url: "https://www.history.go.kr",
          description: "한국사 데이터베이스",
        },
        {
          title: "BBC History",
          url: "https://www.bbc.co.uk/history",
          description: "세계사 칼럼",
        },
        {
          title: "EBS 지식채널 e",
          url: "https://home.ebs.co.kr/jke/main",
          description: "사회 이슈 영상",
        },
      ],
    },
    {
      slug: "math-physics",
      title: "수학/물리",
      description: "강의와 시뮬레이션",
      links: [
        {
          title: "Khan Academy",
          url: "https://www.khanacademy.org",
          description: "수학 강의",
        },
        {
          title: "Brilliant",
          url: "https://brilliant.org",
          description: "문제 기반 학습",
        },
        {
          title: "PhET 시뮬레이션",
          url: "https://phet.colorado.edu",
          description: "물리 실험 체험",
        },
      ],
    },
    {
      slug: "science",
      title: "과학 탐구",
      description: "과학 잡지와 실험",
      links: [
        {
          title: "NASA",
          url: "https://www.nasa.gov",
          description: "우주 과학 뉴스",
        },
        {
          title: "National Geographic Science",
          url: "https://www.nationalgeographic.com/science",
          description: "과학 탐구 기사",
        },
        {
          title: "SciShow",
          url: "https://www.youtube.com/user/scishow",
          description: "과학 유튜브 채널",
        },
      ],
    },
  ]),
  createGroup("study", "reading", "독서 / 콘텐츠", [
    {
      slug: "ebooks",
      title: "전자책",
      description: "리디북스, 교보",
      links: [
        {
          title: "리디북스",
          url: "https://ridibooks.com",
          description: "전자책 서점",
        },
        {
          title: "교보 eBook",
          url: "https://digital.kyobobook.co.kr",
          description: "전자책/오디오북",
        },
        {
          title: "밀리의서재",
          url: "https://www.millie.co.kr",
          description: "월정액 도서 구독",
        },
      ],
    },
    {
      slug: "book-club",
      title: "북클럽",
      description: "독후감, 추천도서",
      links: [
        {
          title: "Goodreads",
          url: "https://www.goodreads.com",
          description: "독서 커뮤니티",
        },
        {
          title: "리딩투데이",
          url: "https://www.readingtoday.co.kr",
          description: "북클럽 프로그램",
        },
        {
          title: "독서모임 찾기",
          url: "https://www.meetup.com/ko-KR/topics/book-clubs",
          description: "지역 북클럽",
        },
      ],
    },
    {
      slug: "audiobook",
      title: "오디오북/팟캐스트",
      description: "듣기 전용 콘텐츠",
      links: [
        {
          title: "Audible",
          url: "https://www.audible.com",
          description: "오디오북 플랫폼",
        },
        {
          title: "팟빵",
          url: "https://www.podbbang.com",
          description: "국내 팟캐스트",
        },
        {
          title: "Spotify Podcast",
          url: "https://www.spotify.com/podcasts",
          description: "글로벌 팟캐스트",
        },
      ],
    },
  ]),
];

const selfGroups: StarterPackGroup[] = [
  createGroup("self", "productivity", "생산성", [
    {
      slug: "scheduling",
      title: "일정관리",
      description: "Google Calendar, 네이버 캘린더",
      links: [
        {
          title: "Google Calendar",
          url: "https://calendar.google.com",
          description: "클라우드 일정 관리",
        },
        {
          title: "네이버 캘린더",
          url: "https://calendar.naver.com",
          description: "국내 일정 관리",
        },
        {
          title: "Timeblocking Guides",
          url: "https://todoist.com/productivity-methods/time-blocking",
          description: "시간 관리 팁",
        },
      ],
    },
    {
      slug: "tasks",
      title: "할 일 관리",
      description: "Todoist, TickTick",
      links: [
        {
          title: "Todoist",
          url: "https://todoist.com",
          description: "멀티 플랫폼 할 일 앱",
        },
        {
          title: "TickTick",
          url: "https://ticktick.com",
          description: "캘린더 통합 할 일",
        },
        {
          title: "Notion Tasks",
          url: "https://www.notion.so/product/tasks",
          description: "Notion To-do",
        },
      ],
    },
    {
      slug: "habits",
      title: "습관 추적",
      description: "Habitica, 뽀모도로 타이머",
      links: [
        {
          title: "Habitica",
          url: "https://habitica.com",
          description: "RPG 스타일 습관관리",
        },
        {
          title: "Pomofocus",
          url: "https://pomofocus.io",
          description: "뽀모도로 타이머",
        },
        {
          title: "Loop Habit Tracker",
          url: "https://loophabits.org",
          description: "오픈소스 습관앱",
        },
      ],
    },
  ]),
  createGroup("self", "finance", "경제 / 투자", [
    {
      slug: "stocks",
      title: "주식",
      description: "TradingView, 증권사 HTS/MTS",
      links: [
        {
          title: "TradingView",
          url: "https://www.tradingview.com",
          description: "차트 및 지표",
        },
        {
          title: "키움증권 영웅문",
          url: "https://securities.kiwoom.com",
          description: "HTS 다운로드",
        },
        {
          title: "Investing.com",
          url: "https://www.investing.com",
          description: "시장 뉴스",
        },
      ],
    },
    {
      slug: "funds",
      title: "ETF/펀드",
      description: "글로벌 ETF, 펀드 비교",
      links: [
        {
          title: "ETF.com",
          url: "https://www.etf.com",
          description: "ETF 데이터",
        },
        {
          title: "모닝스타",
          url: "https://www.morningstar.com",
          description: "펀드 리서치",
        },
        {
          title: "Toss 증권",
          url: "https://tossinvest.com",
          description: "국내 ETF 정보",
        },
      ],
    },
    {
      slug: "crypto",
      title: "코인/블록체인",
      description: "시장 동향과 온체인 데이터",
      links: [
        {
          title: "CoinMarketCap",
          url: "https://coinmarketcap.com",
          description: "시가총액 순위",
        },
        {
          title: "Dune",
          url: "https://dune.com",
          description: "온체인 대시보드",
        },
        {
          title: "Upbit",
          url: "https://upbit.com",
          description: "국내 거래소",
        },
      ],
    },
    {
      slug: "real-estate",
      title: "부동산",
      description: "매물 및 시장 리포트",
      links: [
        {
          title: "직방",
          url: "https://www.zigbang.com",
          description: "아파트 매물 검색",
        },
        {
          title: "KB 부동산",
          url: "https://kbland.kr",
          description: "시세 및 리포트",
        },
        {
          title: "국토부 실거래가",
          url: "https://rt.molit.go.kr",
          description: "실거래가 조회",
        },
      ],
    },
  ]),
  createGroup("self", "mindset", "마인드 / 심리", [
    {
      slug: "meditation",
      title: "명상",
      description: "Calm, Headspace",
      links: [
        {
          title: "Calm",
          url: "https://www.calm.com",
          description: "명상 및 수면",
        },
        {
          title: "Headspace",
          url: "https://www.headspace.com",
          description: "가이드 명상",
        },
        {
          title: "Insight Timer",
          url: "https://insighttimer.com",
          description: "무료 명상 세션",
        },
      ],
    },
    {
      slug: "psychology",
      title: "심리테스트/성격 분석",
      description: "성격 검사와 리포트",
      links: [
        {
          title: "16Personalities",
          url: "https://www.16personalities.com/ko",
          description: "MBTI 기반 테스트",
        },
        {
          title: "Truity",
          url: "https://www.truity.com",
          description: "직무 성향 테스트",
        },
        {
          title: "Psychology Today",
          url: "https://www.psychologytoday.com/us/tests",
          description: "심리 자가진단",
        },
      ],
    },
    {
      slug: "motivation",
      title: "동기부여 영상",
      description: "TED, Motivation Hub",
      links: [
        {
          title: "TED Motivation",
          url: "https://www.ted.com/topics/motivation",
          description: "동기부여 강연",
        },
        {
          title: "MotivationHub",
          url: "https://www.youtube.com/@MotivationHub",
          description: "유튜브 모티베이션",
        },
        {
          title: "Goalcast",
          url: "https://www.goalcast.com",
          description: "영감 스토리",
        },
      ],
    },
  ]),
  createGroup("self", "career", "커리어 개발", [
    {
      slug: "portfolio",
      title: "이력서/포트폴리오",
      description: "Canva, Notion",
      links: [
        {
          title: "Canva Resume",
          url: "https://www.canva.com/resumes",
          description: "이력서 템플릿",
        },
        {
          title: "Notion Portfolio",
          url: "https://www.notion.so/templates/creative-portfolio",
          description: "포트폴리오 템플릿",
        },
        {
          title: "Enhancv Blog",
          url: "https://enhancv.com/blog",
          description: "이력서 작성 팁",
        },
      ],
    },
    {
      slug: "job-search",
      title: "구직",
      description: "LinkedIn, 사람인, 원티드",
      links: [
        {
          title: "LinkedIn Jobs",
          url: "https://www.linkedin.com/jobs",
          description: "글로벌 채용공고",
        },
        {
          title: "사람인",
          url: "https://www.saramin.co.kr",
          description: "국내 구인구직",
        },
        {
          title: "원티드",
          url: "https://www.wanted.co.kr",
          description: "스타트업 채용",
        },
      ],
    },
    {
      slug: "networking",
      title: "네트워킹",
      description: "커뮤니티, Slack 그룹",
      links: [
        {
          title: "Lunchclub",
          url: "https://lunchclub.com",
          description: "AI 네트워킹",
        },
        {
          title: "어썸 커뮤니티",
          url: "https://awesome-communities.com",
          description: "직군별 커뮤니티",
        },
        {
          title: "Slack Community Finder",
          url: "https://slofile.com",
          description: "Slack 오픈 커뮤니티",
        },
      ],
    },
  ]),
];

const dailyGroups: StarterPackGroup[] = [
  createGroup("daily", "weather-transport", "날씨/교통", [
    {
      slug: "weather",
      title: "날씨",
      description: "기상청, AccuWeather",
      links: [
        {
          title: "기상청",
          url: "https://www.weather.go.kr",
          description: "대한민국 기상 정보",
        },
        {
          title: "AccuWeather",
          url: "https://www.accuweather.com",
          description: "글로벌 날씨 서비스",
        },
        {
          title: "Windy",
          url: "https://www.windy.com",
          description: "상세 기상지도",
        },
      ],
    },
    {
      slug: "air-quality",
      title: "미세먼지",
      description: "에어코리아",
      links: [
        {
          title: "에어코리아",
          url: "https://www.airkorea.or.kr",
          description: "실시간 대기정보",
        },
        {
          title: "IQAir",
          url: "https://www.iqair.com/world-air-quality",
          description: "글로벌 공기질",
        },
        {
          title: "케이웨더",
          url: "https://www.kweather.co.kr",
          description: "미세먼지 예보",
        },
      ],
    },
    {
      slug: "maps",
      title: "지도/길찾기",
      description: "네이버 지도, 구글 맵",
      links: [
        {
          title: "네이버 지도",
          url: "https://map.naver.com",
          description: "국내 길찾기",
        },
        {
          title: "Google Maps",
          url: "https://maps.google.com",
          description: "글로벌 지도",
        },
        {
          title: "카카오맵",
          url: "https://map.kakao.com",
          description: "대중교통 길찾기",
        },
      ],
    },
    {
      slug: "traffic",
      title: "교통",
      description: "버스, 지하철, 고속도로 상황",
      links: [
        {
          title: "서울교통공사",
          url: "https://www.seoulmetro.co.kr",
          description: "지하철 노선 정보",
        },
        {
          title: "TOPIS",
          url: "https://topis.seoul.go.kr",
          description: "실시간 버스 위치",
        },
        {
          title: "고속도로 교통정보",
          url: "https://www.roadplus.co.kr",
          description: "실시간 고속도로",
        },
      ],
    },
  ]),
  createGroup("daily", "news-media", "뉴스/미디어", [
    {
      slug: "portal-news",
      title: "포털 뉴스",
      description: "네이버, 다음",
      links: [
        {
          title: "네이버 뉴스",
          url: "https://news.naver.com",
          description: "국내 포털 뉴스",
        },
        {
          title: "다음 뉴스",
          url: "https://news.daum.net",
          description: "카카오 포털 뉴스",
        },
        {
          title: "연합뉴스",
          url: "https://www.yna.co.kr",
          description: "속보 및 주요 뉴스",
        },
      ],
    },
    {
      slug: "global-news",
      title: "글로벌 뉴스",
      description: "BBC, CNN, NYTimes",
      links: [
        {
          title: "BBC",
          url: "https://www.bbc.com/news",
          description: "국제 뉴스",
        },
        {
          title: "CNN",
          url: "https://www.cnn.com",
          description: "미국 뉴스",
        },
        {
          title: "New York Times",
          url: "https://www.nytimes.com",
          description: "글로벌 이슈",
        },
      ],
    },
    {
      slug: "youtube-news",
      title: "유튜브 뉴스 채널",
      description: "주요 뉴스 유튜브",
      links: [
        {
          title: "YTN",
          url: "https://www.youtube.com/@YTNnews",
          description: "한국 뉴스 채널",
        },
        {
          title: "BBC News",
          url: "https://www.youtube.com/@BBCNews",
          description: "국제 뉴스 채널",
        },
        {
          title: "연합뉴스TV",
          url: "https://www.youtube.com/@yonhap",
          description: "실시간 속보",
        },
      ],
    },
  ]),
  createGroup("daily", "shopping", "쇼핑/배달", [
    {
      slug: "ecommerce",
      title: "쇼핑몰",
      description: "쿠팡, 11번가, G마켓",
      links: [
        {
          title: "쿠팡",
          url: "https://www.coupang.com",
          description: "빠른 배송 쇼핑",
        },
        {
          title: "11번가",
          url: "https://www.11st.co.kr",
          description: "오픈마켓",
        },
        {
          title: "G마켓",
          url: "https://www.gmarket.co.kr",
          description: "종합 쇼핑몰",
        },
      ],
    },
    {
      slug: "delivery",
      title: "배달",
      description: "배민, 요기요, 쿠팡이츠",
      links: [
        {
          title: "배달의민족",
          url: "https://www.baemin.com",
          description: "국내 배달 앱",
        },
        {
          title: "요기요",
          url: "https://www.yogiyo.co.kr",
          description: "음식 배달",
        },
        {
          title: "쿠팡이츠",
          url: "https://www.coupangeats.com",
          description: "단건 배달",
        },
      ],
    },
    {
      slug: "secondhand",
      title: "중고거래",
      description: "당근, 번개장터",
      links: [
        {
          title: "당근마켓",
          url: "https://www.daangn.com",
          description: "동네 중고거래",
        },
        {
          title: "번개장터",
          url: "https://m.bunjang.co.kr",
          description: "중고 물품 거래",
        },
        {
          title: "중고나라",
          url: "https://cafe.naver.com/joonggonara",
          description: "중고거래 커뮤니티",
        },
      ],
    },
  ]),
  createGroup("daily", "finance", "금융/가계부", [
    {
      slug: "banking",
      title: "은행 앱, 카드사",
      description: "주요 은행 및 카드",
      links: [
        {
          title: "국민은행",
          url: "https://obank.kbstar.com",
          description: "대표 인터넷뱅킹",
        },
        {
          title: "신한은행",
          url: "https://bank.shinhan.com",
          description: "신한 SOL",
        },
        {
          title: "삼성카드",
          url: "https://www.samsungcard.com",
          description: "카드 혜택 조회",
        },
      ],
    },
    {
      slug: "household-ledger",
      title: "가계부 앱",
      description: "뱅크샐러드, 토스",
      links: [
        {
          title: "뱅크샐러드",
          url: "https://www.banksalad.com",
          description: "자산 관리 앱",
        },
        {
          title: "토스",
          url: "https://toss.im",
          description: "간편 송금 및 가계부",
        },
        {
          title: "가계부 비교",
          url: "https://www.appbrain.com/stats/android-market-share/app/us.wallet.expensetracker",
          description: "가계부 앱 순위",
        },
      ],
    },
    {
      slug: "currency",
      title: "환율/계산기",
      description: "환율 조회 및 계산",
      links: [
        {
          title: "네이버 환율",
          url: "https://finance.naver.com/marketindex",
          description: "실시간 환율",
        },
        {
          title: "XE Currency",
          url: "https://www.xe.com",
          description: "해외 환율 계산",
        },
        {
          title: "Korea Exim 환율",
          url: "https://www.koreaexim.go.kr/site/main/index003",
          description: "공식 환율 고시",
        },
      ],
    },
  ]),
  createGroup("daily", "health", "건강/의료", [
    {
      slug: "medical",
      title: "병원 예약, 약국 찾기",
      description: "병원, 약국 정보",
      links: [
        {
          title: "건강보험심사평가원",
          url: "https://www.hira.or.kr",
          description: "병원/약국 검색",
        },
        {
          title: "굿닥",
          url: "https://www.goodoc.co.kr",
          description: "병원 예약 서비스",
        },
        {
          title: "E약은요",
          url: "https://www.health.kr",
          description: "의약품 정보",
        },
      ],
    },
    {
      slug: "fitness-tracking",
      title: "운동 기록, 체중관리",
      description: "운동 및 건강관리",
      links: [
        {
          title: "Samsung Health",
          url: "https://health.apps.samsung.com",
          description: "건강 관리 앱",
        },
        {
          title: "Fitbit",
          url: "https://www.fitbit.com",
          description: "웨어러블 플랫폼",
        },
        {
          title: "MyFitnessPal",
          url: "https://www.myfitnesspal.com",
          description: "칼로리 기록",
        },
      ],
    },
    {
      slug: "insurance",
      title: "건강보험/의료보험 정보",
      description: "보험 및 지원",
      links: [
        {
          title: "국민건강보험",
          url: "https://www.nhis.or.kr",
          description: "건강보험 안내",
        },
        {
          title: "보건복지부",
          url: "https://www.mohw.go.kr",
          description: "복지 정책",
        },
        {
          title: "금융감독원 보험",
          url: "https://www.fss.or.kr/fss/kr/insurance/index.jsp",
          description: "보험 정보",
        },
      ],
    },
  ]),
  createGroup("daily", "living", "생활편의", [
    {
      slug: "parcel",
      title: "택배 조회",
      description: "CJ, 한진",
      links: [
        {
          title: "CJ대한통운",
          url: "https://www.cjlogistics.com/ko/main",
          description: "택배 조회",
        },
        {
          title: "한진택배",
          url: "https://www.hanjin.co.kr",
          description: "운송장 조회",
        },
        {
          title: "스마트택배",
          url: "https://www.smartparcel.kr",
          description: "택배 알림 앱",
        },
      ],
    },
    {
      slug: "utilities",
      title: "전기/가스 요금",
      description: "공과금 조회",
      links: [
        {
          title: "한전 사이버지점",
          url: "https://cyber.kepco.co.kr",
          description: "전기요금 조회",
        },
        {
          title: "도시가스 고객센터",
          url: "https://www.citygas.or.kr",
          description: "지역 도시가스",
        },
        {
          title: "인터넷지로",
          url: "https://www.giro.or.kr",
          description: "공과금 납부",
        },
      ],
    },
    {
      slug: "public-service",
      title: "공공서비스",
      description: "정부24, 민원24",
      links: [
        {
          title: "정부24",
          url: "https://www.gov.kr",
          description: "공공서비스 포털",
        },
        {
          title: "민원24",
          url: "https://www.minwon.go.kr",
          description: "민원 신청",
        },
        {
          title: "위택스",
          url: "https://www.wetax.go.kr",
          description: "지방세 납부",
        },
      ],
    },
  ]),
];

const sectionMeta: Record<string, { title: string; description: string; groups: StarterPackGroup[] }> = {
  work: {
    title: "업무",
    description: "업무 효율을 높이는 실전 도구 모음",
    groups: workGroups,
  },
  hobby: {
    title: "취미",
    description: "주말 취미 생활을 위한 큐레이션",
    groups: hobbyGroups,
  },
  study: {
    title: "학습",
    description: "언어부터 프로그래밍까지 학습을 돕는 스타터팩",
    groups: studyGroups,
  },
  self: {
    title: "자기계발",
    description: "생산성과 커리어를 성장시키는 리소스",
    groups: selfGroups,
  },
  daily: {
    title: "일상",
    description: "생활 전반을 편리하게 만들어 줄 필수 링크",
    groups: dailyGroups,
  },
};

const sectionOrder: (keyof typeof sectionMeta)[] = ["work", "hobby", "study", "self", "daily"];

export const starterPackSections: StarterPackSection[] = sectionOrder.map((slug) => {
  const value = sectionMeta[slug];
  return {
    slug,
    title: value.title,
    description: value.description,
    groups: value.groups,
    topics: flattenTopics(value.groups),
  };
});

export function findSection(sectionSlug: string) {
  return starterPackSections.find((section) => section.slug === sectionSlug);
}

export function findTopic(sectionSlug: string, topicSlug: string) {
  const section = findSection(sectionSlug);
  if (!section) return undefined;
  if (section.topics) {
    const topic = section.topics.find((candidate) => candidate.slug === topicSlug);
    if (topic) {
      return topic;
    }
  }
  if (!section.groups) return undefined;
  for (const group of section.groups) {
    const topic = group.topics.find((candidate) => candidate.slug === topicSlug);
    if (topic) return topic;
  }
  return undefined;
}

export function findGroup(sectionSlug: string, topicSlug: string) {
  const section = findSection(sectionSlug);
  if (!section?.groups) return undefined;
  return section.groups.find((group) => group.topics.some((topic) => topic.slug === topicSlug));
}
