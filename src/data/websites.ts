// types에서 정의된 Website와 CategoryConfigMap 인터페이스를 가져옵니다.
export interface Website {
  category: string;
  title: string;
  url: string;
  description: string;
  id: string;
}

export interface CategoryConfigMap {
  [key: string]: {
    title: string;
    description?: string;
    icon: string;
    iconClass: string;
  };
}

export const websites: Website[] = [
  { category: "디자인", title: "핀터레스트", url: "https://www.pinterest.com", description: "디자인 아이디어 필수 사이트", id: "60" },
  { category: "디자인", title: "아키데일리", url: "https://www.archdaily.com", description: "세계 최대 건축 아카이브", id: "1" },
  { category: "디자인", title: "디즌", url: "https://www.dezeen.com", description: "건축·디자인 트렌드 매거진", id: "2" },
  { category: "디자인", title: "월페이퍼", url: "https://www.wallpaper.com", description: "럭셔리 라이프스타일·디자인", id: "3" },
  { category: "디자인", title: "도머스", url: "https://www.domusweb.it", description: "이탈리아 건축 명문지", id: "5" },
  { category: "디자인", title: "베한스", url: "https://www.behance.net", description: "크리에이티브 포트폴리오 공유", id: "65" },
  { category: "디자인", title: "Archinect", url: "https://archinect.com", description: "건축 커뮤니티·채용", id: "71" },
  { category: "디자인", title: "SPACE(공간)", url: "https://vmspace.com", description: "국내 대표 건축 매거진", id: "KR-D-001" },
  { category: "디자인", title: "C3 Korea", url: "https://www.c3korea.net", description: "국내외 건축 프로젝트", id: "KR-D-002" },
  { category: "디자인", title: "MARU(마루)", url: "https://marumagazine.com", description: "동시대 건축 이슈", id: "KR-D-003" },
  { category: "디자인", title: "A&C(건축과 환경)", url: "https://ancbook.com", description: "건축·도시·인테리어 출판", id: "KR-D-004" },
  { category: "디자인", title: "서울도시건축전시관", url: "https://www.seoulhour.kr", description: "도시·건축 전시·아카이브", id: "KR-D-006" },
  { category: "디자인", title: "한국건축문화대상", url: "https://www.aiak.or.kr/award", description: "권위 있는 건축상 아카이브", id: "KR-D-007" },
  { category: "디자인", title: "라펜트(조경)", url: "https://www.lafent.com", description: "조경·경관 뉴스·프로젝트", id: "KR-D-009" },
  { category: "디자인", title: "서울건축문화제", url: "https://www.saf.kr", description: "서울 건축 축제·전시", id: "KR-D-010" },

  { category: "공모전", title: "요즘것들", url: "https://www.allforyoung.com/", description: "청년 공모전 큐레이션", id: "62" },
  { category: "공모전", title: "슥삭", url: "https://www.ssgsag.kr/", description: "건축·디자인 공모 모음", id: "63" },
  { category: "공모전", title: "대한민국 건축대전", url: "https://www.kia.or.kr/sub03/sub03_01.jsp", description: "대표 건축 공모전", id: "145" },
  { category: "공모전", title: "씽굿", url: "https://www.thinkcontest.com", description: "국내 최대 공모전 플랫폼", id: "KR-C-001" },
  { category: "공모전", title: "캠퍼스픽", url: "https://www.campuspick.com", description: "대학생 공모·대외활동", id: "61" },
  { category: "공모전", title: "공모전코리아", url: "https://www.gongmo.kr", description: "카테고리별 공모 검색", id: "KR-C-002" },
  { category: "공모전", title: "올콘", url: "https://www.all-con.co.kr", description: "공모전·대외활동 정보", id: "KR-C-003" },
  { category: "공모전", title: "대한건축학회 학생공모", url: "https://www.aik.or.kr", description: "학회 학생 공모 안내", id: "KR-C-005" },
  { category: "공모전", title: "한국건축가협회 공모", url: "https://www.kira.or.kr", description: "현상설계·공모 공지", id: "KR-C-006" },
  { category: "공모전", title: "서울특별시 공모", url: "https://news.seoul.go.kr/urban", description: "도시·건축 공모 공지", id: "KR-C-007" },
  { category: "공모전", title: "조달청 나라장터(현상설계)", url: "https://www.g2b.go.kr", description: "공공 현상설계 입찰", id: "KR-C-008" },
  { category: "공모전", title: "LH 현상설계", url: "https://www.lh.or.kr", description: "LH 설계공모", id: "KR-C-009" },
  { category: "공모전", title: "SH 현상설계", url: "https://www.i-sh.co.kr", description: "SH 설계공모", id: "KR-C-010" },

  { category: "채용정보", title: "대한건축사협회", url: "https://www.kira.or.kr/jsp/main/03/02_01.jsp", description: "건축사무소 채용", id: "12" },
  { category: "채용정보", title: "월간스페이스", url: "https://vmspace.com/job/job.html", description: "건축 채용 공지", id: "13" },
  { category: "채용정보", title: "건설워커", url: "https://www.worker.co.kr/", description: "건설·건축 채용 플랫폼", id: "14" },
  { category: "채용정보", title: "사람인", url: "https://www.saramin.co.kr/zf_user/jobs/list/domestic", description: "국내 채용 포털", id: "15" },
  { category: "채용정보", title: "잡코리아", url: "https://www.jobkorea.co.kr", description: "대표 구인구직", id: "66" },
  { category: "채용정보", title: "원티드", url: "https://www.wanted.co.kr", description: "디자인·3D·BIM 채용", id: "KR-J-003" },
  { category: "채용정보", title: "인크루트 건축", url: "https://www.incruit.com", description: "건설·건축 공고", id: "KR-J-004" },
  { category: "채용정보", title: "워크넷", url: "https://www.work.go.kr", description: "공공 취업 포털", id: "KR-J-005" },

  { category: "유튜브", title: "셜록현준", url: "https://www.youtube.com/@Sherlock_HJ", description: "건축·도시 쉽게 설명", id: "KR-YT-001" },
  { category: "유튜브", title: "홍윤택TV", url: "https://www.youtube.com/@hongyuntaek", description: "건축사 시험·실무", id: "KR-YT-002" },
  { category: "유튜브", title: "CA Korea", url: "https://www.youtube.com/@cakorea", description: "그래픽·공간 디자인", id: "KR-YT-003" },
  { category: "유튜브", title: "Dami Lee", url: "https://www.youtube.com/@DamiLeeArch", description: "건축·도시 리뷰", id: "KR-YT-004" },
  { category: "유튜브", title: "30X40 Design Workshop", url: "https://www.youtube.com/@30X40DesignWorkshop", description: "실무 건축 워크플로우", id: "KR-YT-005" },
  { category: "유튜브", title: "The B1M", url: "https://www.youtube.com/@TheB1M", description: "세계 건설·건축 채널", id: "KR-YT-006" },
  { category: "유튜브", title: "Architectural Digest", url: "https://www.youtube.com/@Archdigest", description: "건축·인테리어 소개", id: "KR-YT-007" },
  { category: "유튜브", title: "Never Too Small", url: "https://www.youtube.com/@NeverTooSmall", description: "소형 주거 디자인", id: "KR-YT-008" },
  { category: "유튜브", title: "Stewart Hicks", url: "https://www.youtube.com/@stewarthicks", description: "건축 이론·역사", id: "KR-YT-009" },
  { category: "유튜브", title: "건축학개론", url: "https://www.youtube.com/@archi-basic", description: "학생용 건축 기초", id: "KR-YT-010" },

  { category: "커뮤니티", title: "연봉을알려주마", url: "https://cafe.daum.net/", description: "건축 업계 연봉 정보", id: "72" },
  { category: "커뮤니티", title: "건축Q&A", url: "https://arch-qa.com", description: "건축 질문·답변", id: "73" },
  { category: "커뮤니티", title: "한국건축가협회(KIRA)", url: "https://www.kira.or.kr", description: "건축가 단체·공지", id: "KR-U-001" },
  { category: "커뮤니티", title: "대한건축학회(AIK)", url: "https://www.aik.or.kr", description: "학술대회·논문 정보", id: "KR-U-002" },
  { category: "커뮤니티", title: "AURI 건축도시공간연구소", url: "https://www.auri.re.kr", description: "건축·도시 정책 연구", id: "KR-U-003" },

  { category: "지도", title: "카카오맵", url: "https://map.kakao.com", description: "로드뷰·위성·길찾기 국민지도", id: "KR-MAP-001" },
  { category: "지도", title: "네이버 지도", url: "https://map.naver.com", description: "대중교통·자전거 길찾기", id: "KR-MAP-002" },
  { category: "지도", title: "국토정보플랫폼 LX", url: "https://map.ngii.go.kr", description: "공공 지도·공간정보", id: "KR-MAP-003" },
  { category: "지도", title: "서울 열린데이터광장 지도", url: "https://data.seoul.go.kr", description: "서울 도시 데이터 지도", id: "KR-MAP-004" },
  { category: "지도", title: "VWorld", url: "https://map.vworld.kr", description: "3D·항공사진 지도", id: "KR-MAP-005" },
  { category: "지도", title: "국토교통부 토지이용규제정보서비스", url: "https://luris.molit.go.kr", description: "토지 용도지역 조회", id: "KR-MAP-006" },
  { category: "지도", title: "Google Earth", url: "https://earth.google.com", description: "위성 3D 지구 탐색", id: "KR-MAP-007" },
  { category: "지도", title: "OpenStreetMap", url: "https://www.openstreetmap.org", description: "오픈소스 지도", id: "KR-MAP-008" },
  { category: "지도", title: "ArcGIS Online", url: "https://www.arcgis.com", description: "전문 GIS 클라우드", id: "KR-MAP-009" },
  { category: "지도", title: "QGIS Korea", url: "https://qgis.org/ko/site", description: "QGIS 한국어 자료", id: "KR-MAP-010" },

  { category: "포털사이트", title: "구글", url: "https://www.google.com", description: "대표 검색 엔진", id: "301" },
  { category: "포털사이트", title: "네이버", url: "https://www.naver.com", description: "국내 대표 포털", id: "302" },
  { category: "포털사이트", title: "다음", url: "https://www.daum.net", description: "카카오 포털", id: "303" },
  { category: "포털사이트", title: "Microsoft 시작페이지", url: "https://www.msn.com/ko-kr", description: "MS 뉴스·포털", id: "304" },
  { category: "포털사이트", title: "야후", url: "https://www.yahoo.com", description: "미국 포털", id: "305" },
  { category: "포털사이트", title: "빙", url: "https://www.bing.com", description: "MS 검색 엔진", id: "306" },

  { category: "기타", title: "플렛아이콘", url: "https://www.flaticon.com/kr/", description: "벡터 아이콘 플랫폼", id: "43" },
  { category: "기타", title: "플랫아이콘", url: "https://www.flaticon.com/kr/", description: "무료 아이콘 리소스", id: "KR-ETC-001" },
  { category: "기타", title: "Freepik", url: "https://kr.freepik.com", description: "무료 벡터·이미지", id: "KR-ETC-002" },
  { category: "기타", title: "Pinterest - Architecture", url: "https://www.pinterest.com/search/pins/?q=architecture", description: "건축 레퍼런스 이미지", id: "KR-ETC-003" },
  { category: "기타", title: "Issuu", url: "https://issuu.com", description: "포트폴리오·매거진 뷰어", id: "KR-ETC-004" },
  { category: "기타", title: "ResearchGate", url: "https://www.researchgate.net", description: "학술 자료 공유", id: "KR-ETC-005" },
  { category: "기타", title: "한국과학기술정보연구원(KISTI) NDSL", url: "https://www.ndsl.kr", description: "국내 학술 DB", id: "KR-ETC-006" },
  { category: "기타", title: "서울시 건축지도(서울도시건축센터)", url: "https://map.seoul.go.kr", description: "서울 건축 자원 지도", id: "KR-ETC-007" },
  { category: "기타", title: "대한건축학회 논문집", url: "https://journal.aik.or.kr", description: "건축학회 논문집", id: "KR-ETC-008" },
  { category: "기타", title: "구글 스칼라", url: "https://scholar.google.com", description: "학술 검색엔진", id: "KR-ETC-009" },
  { category: "기타", title: "Architizer", url: "https://architizer.com", description: "건축 프로젝트·사무소 DB", id: "KR-ETC-010" },

  { category: "건축가", title: "David Chipperfield", url: "https://davidchipperfield.com/projects", description: "미니멀·정제된 건축", id: "101" },
  { category: "건축가", title: "Norman Foster", url: "https://www.fosterandpartners.com/projects/", description: "하이테크·친환경 선구자", id: "102" },
  { category: "건축가", title: "Richard Meier", url: "https://meierpartners.com/projects", description: "백색·기하학 건축", id: "103" },
  { category: "건축가", title: "Richard Rogers", url: "https://rshp.com/projects/", description: "하이테크 거장", id: "104" },
  { category: "건축가", title: "Santiago Calatrava", url: "https://calatrava.com/projects.html?all=yes", description: "조형적·공학적 형태", id: "105" },
  { category: "건축가", title: "Renzo Piano", url: "http://www.rpbw.com/", description: "투명·정밀 디테일", id: "106" },
  { category: "건축가", title: "OMA / Rem Koolhaas", url: "https://www.oma.com/projects", description: "혁신적·개념 중심", id: "107" },
  { category: "건축가", title: "Zaha Hadid", url: "https://www.zaha-hadid.com/archive", description: "곡선·유동적 형태", id: "108" },
  { category: "건축가", title: "Bjarke Ingels (BIG)", url: "https://big.dk/#projects", description: "유머러스·실용 디자인", id: "109" },
  { category: "건축가", title: "Kengo Kuma", url: "https://kkaa.co.jp/project/", description: "자연 소재·전통 재해석", id: "110" },
  { category: "건축가", title: "Herzog & de Meuron", url: "https://www.herzogdemeuron.com/index/projects/complete-works.html", description: "재료 실험·독창성", id: "111" },
  { category: "건축가", title: "Jean Nouvel", url: "http://www.jeannouvel.com/projets/", description: "빛·그림자 디자인", id: "115" },
  { category: "건축가", title: "I.M. Pei", url: "https://pei-architects.com/category/all-projects/", description: "현대적 기하·아이코닉", id: "118" },
  { category: "건축가", title: "Alvar Aalto", url: "https://alvaraalto.fi/en/architecture/", description: "인간 중심·목재", id: "204" },
  { category: "건축가", title: "Louis Kahn", url: "https://www.archdaily.com/tag/louis-kahn", description: "빛과 공간의 극적 사용", id: "205" },
  { category: "건축가", title: "Le Corbusier", url: "https://www.fondationlecorbusier.fr/", description: "근대·국제주의 거장", id: "206" },

  { category: "자료", title: "국가법령정보센터", url: "https://www.law.go.kr", description: "건축법·시행령·해설", id: "KR-R-001" },
  { category: "자료", title: "국토법령정보센터", url: "https://www.luris.go.kr", description: "국토계획·용도지역 안내", id: "KR-R-002" },
  { category: "자료", title: "세움터(건축행정)", url: "https://www.eais.go.kr", description: "인허가·대장·행정", id: "KR-R-003" },
  { category: "자료", title: "서울열린데이터광장", url: "https://data.seoul.go.kr", description: "서울 도시 데이터셋", id: "KR-R-006" },
];

export const categoryConfig = {
  design: {
    title: "디자인",
    description: "디자인 영감/뉴스/자료",
    icon: "🎨",
    iconClass: "icon-blue",
  },
  contest: {
    title: "공모전",
    description: "공모전·경연 정보",
    icon: "🏆",
    iconClass: "icon-yellow",
  },
  jobs: {
    title: "채용정보",
    description: "채용 공고 및 취업 정보",
    icon: "💼",
    iconClass: "icon-green",
  },
  youtube: {
    title: "유튜브",
    description: "관련 유튜브 채널",
    icon: "📺",
    iconClass: "icon-red",
  },
  community: {
    title: "커뮤니티",
    description: "온라인 커뮤니티",
    icon: "👥",
    iconClass: "icon-indigo",
  },
  map: {
    title: "지도",
    description: "지도/로드뷰/길찾기",
    icon: "📍",
    iconClass: "icon-teal",
  },
  architect: {
    title: "건축가",
    description: "건축가 아카이브",
    icon: "👨‍💼",
    iconClass: "icon-purple",
  },
  portal: {
    title: "포털사이트",
    description: "검색 포털",
    icon: "🌐",
    iconClass: "icon-orange",
  },
  etc: {
    title: "기타",
    description: "기타 유용한 사이트",
    icon: "📚",
    iconClass: "icon-gray",
  },
  reference: {
    title: "자료",
    description: "자료/법규/데이터",
    icon: "📚",
    iconClass: "icon-gray",
  },
};

export const categoryOrder = [
  "design",
  "contest",
  "jobs",
  "youtube",
  "community",
  "map",
  "architect",
  "portal",
  "etc",
  "reference",
];
