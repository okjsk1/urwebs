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
    icon: string;
    iconClass: string;
    title: string;
  };
}

export const websites: Website[] = [
  // 디자인
  {
    category: "디자인",
    title: "핀터레스트",
    url: "https://www.pinterest.com",
    description: "건축과 디자인 아이디어를 발견하고 저장할 수 있는 비주얼 검색 플랫폼입니다",
    id: "60",
  },
  {
    category: "디자인",
    title: "아키데일리",
    url: "https://www.archdaily.com",
    description: "전 세계 건축 프로젝트와 뉴스를 매일 업데이트하는 세계 최대 건축 정보 사이트입니다",
    id: "1",
  },
  {
    category: "디자인",
    title: "디즌",
    url: "https://www.dezeen.com",
    description: "건축과 디자인 트렌드를 선도하는 영국의 권위 있는 온라인 디자인 매거진입니다",
    id: "2",
  },
  {
    category: "디자인",
    title: "월페이퍼",
    url: "https://www.wallpaper.com",
    description: "럭셔리 라이프스타일과 현대 건축·디자인을 소개하는 프리미엄 매거진입니다",
    id: "3",
  },
  {
    category: "디자인",
    title: "도머스",
    url: "https://www.domusweb.it",
    description: "1928년부터 발행되어 온 이탈리아의 권위 있는 건축 및 디자인 매거진입니다",
    id: "5",
  },
  {
    category: "디자인",
    title: "베한스",
    url: "https://www.behance.net",
    description: "Adobe에서 운영하는 크리에이티브 포트폴리오 공유 플랫폼입니다",
    id: "65",
  },
  {
    category: "디자인",
    title: "Archinect",
    url: "https://archinect.com",
    description: "건축 커뮤니티와 채용정보를 제공하는 글로벌 건축 플랫폼입니다",
    id: "71",
  },

  // 공모전
  {
    category: "공모전",
    title: "씽굿",
    url: "https://www.thinkcontest.com",
    description: "창의적이고 혁신적인 아이디어를 발굴하는 국내 대표 공모전 플랫폼입니다",
    id: "7",
  },
  {
    category: "공모전",
    title: "캠퍼스픽",
    url: "https://www.campuspick.com",
    description: "대학생을 위한 다양한 공모전과 대외활동 정보를 제공하는 플랫폼입니다",
    id: "61",
  },
  {
    category: "공모전",
    title: "요즘것들",
    url: "https://www.allforyoung.com/",
    description: "젊은 크리에이터들을 위한 공모전과 프로젝트 정보를 큐레이션하는 사이트입니다",
    id: "62",
  },
  {
    category: "공모전",
    title: "슥삭",
    url: "https://www.ssgsag.kr/",
    description: "건축 및 디자인 분야의 다양한 공모전 정보를 한눈에 볼 수 있는 플랫폼입니다",
    id: "63",
  },
  {
    category: "공모전",
    title: "공모전코리아",
    url: "https://www.contestkorea.com",
    description: "국내 최대 규모의 공모전 정보 플랫폼입니다",
    id: "64",
  },
  {
    category: "공모전",
    title: "대한민국 건축대전",
    url: "https://www.kia.or.kr/sub03/sub03_01.jsp",
    description: "한국건축가협회에서 주최하는 대표적인 건축 공모전입니다",
    id: "145",
  },

  // 채용정보
  {
    category: "채용정보",
    title: "대한건축사협회",
    url: "https://www.kira.or.kr/jsp/main/03/02_01.jsp",
    description: "대한건축사협회에서 제공하는 건축사무소 및 관련 업계 채용 공고",
    id: "12",
  },
  {
    category: "채용정보",
    title: "월간스페이스",
    url: "https://vmspace.com/job/job.html",
    description: "건축사무소와 건축 관련 기업의 채용 정보를 제공하는 전문 사이트입니다",
    id: "13",
  },
  {
    category: "채용정보",
    title: "건설워커",
    url: "https://www.worker.co.kr/",
    description: "건축 및 건설 분야 채용 정보를 제공하는 국내 대표 구인구직 플랫폼입니다",
    id: "14",
  },
  {
    category: "채용정보",
    title: "사람인",
    url: "https://www.saramin.co.kr/zf_user/jobs/list/domestic",
    description: "국내 대표적인 채용 플랫폼으로 건축·건설 분야 채용 공고도 제공합니다",
    id: "15",
  },
  {
    category: "채용정보",
    title: "잡코리아",
    url: "https://www.jobkorea.co.kr",
    description: "국내 대표 채용 정보 사이트로 건축 분야 채용 정보도 풍부합니다",
    id: "66",
  },

  // 유튜브 (대표 건축 채널)
  {
    category: "유튜브",
    title: "셜록현준",
    url: "https://www.youtube.com/@Sherlock_HJ",
    description: "건축가 유현준이 운영하는 채널로, 건축과 도시, 문화를 쉽게 풀어냅니다",
    id: "150",
  },
  {
    category: "유튜브",
    title: "DamiLee",
    url: "https://www.youtube.com/@DamiLeeArch",
    description: "건축, 디자인, 공간에 대한 흥미로운 주제를 다루는 해외 건축 유튜버입니다",
    id: "151",
  },
  {
    category: "유튜브",
    title: "Architectural Digest",
    url: "https://www.youtube.com/@Archdigest",
    description: "전 세계에서 가장 아름다운 건축물과 인테리어를 소개하는 유명 채널입니다",
    id: "152",
  },
  {
    category: "유튜브",
    title: "The B1M",
    url: "https://www.youtube.com/@TheB1M",
    description: "건축 및 건설 분야의 주요 프로젝트를 다루는 세계 최대 건축 유튜브 채널입니다",
    id: "153",
  },
  {
    category: "유튜브",
    title: "30X40 Design Workshop",
    url: "https://www.youtube.com/@30X40DesignWorkshop",
    description: "건축가를 위한 실무 디자인 팁과 워크플로우를 제공하는 채널입니다",
    id: "69",
  },

  // 커뮤니티
  {
    category: "커뮤니티",
    title: "연봉을알려주마",
    url: "https://cafe.daum.net/",
    description: "타 업종에 비하여 저평가 받고있는 건축인들 및 건축계 내에서도 천차만별인 설계사무소의 연봉수준을 서로 알고자 하기 위하여 만들어졌습니다",
    id: "72",
  },
  {
    category: "커뮤니티",
    title: "건축Q&A",
    url: "https://arch-qa.com",
    description: "건축에 관한 질문과 답변을 나누는 커뮤니티 플랫폼입니다",
    id: "73",
  },

  // 지도
  {
    category: "지도",
    title: "Google Earth",
    url: "https://earth.google.com",
    description: "전 세계의 건축물과 도시를 위성 이미지로 탐색할 수 있는 플랫폼입니다",
    id: "39",
  },
  {
    category: "지도",
    title: "카카오맵",
    url: "https://map.kakao.com/",
    description: "국내외 유명 건축물의 위치와 정보를 지도로 확인할 수 있는 서비스입니다",
    id: "76",
  },

  // 포털사이트 카테고리 추가
  {
    category: "포털사이트",
    title: "구글",
    url: "https://www.google.com",
    description: "전 세계에서 가장 많이 사용되는 검색 엔진이자 포털사이트입니다",
    id: "301",
  },
  {
    category: "포털사이트",
    title: "네이버",
    url: "https://www.naver.com",
    description: "한국의 대표적인 포털사이트로 검색, 뉴스, 쇼핑 등 다양한 서비스를 제공합니다",
    id: "302",
  },
  {
    category: "포털사이트",
    title: "다음",
    url: "https://www.daum.net",
    description: "카카오에서 운영하는 국내 주요 포털사이트입니다",
    id: "303",
  },
  {
    category: "포털사이트",
    title: "Microsoft 시작페이지",
    url: "https://www.msn.com/ko-kr",
    description: "Microsoft에서 제공하는 뉴스와 정보 포털 사이트입니다",
    id: "304",
  },
  {
    category: "포털사이트",
    title: "야후",
    url: "https://www.yahoo.com",
    description: "미국의 대표적인 인터넷 포털 서비스입니다",
    id: "305",
  },
  {
    category: "포털사이트", 
    title: "빙",
    url: "https://www.bing.com",
    description: "Microsoft에서 개발한 검색 엔진입니다",
    id: "306",
  },

  // 기타
  {
    category: "기타",
    title: "플렛아이콘",
    url: "https://www.flaticon.com/kr/",
    description: "다양한 아이콘을 제공하는 벡터 이미지 플랫폼입니다",
    id: "43",
  },

  // 건축가
  {
    category: "건축가",
    title: "David Chipperfield",
    url: "https://davidchipperfield.com/projects",
    description: "영국 출신의 세계적인 건축가로, 미니멀하고 정제된 디자인으로 유명합니다",
    id: "101",
  },
  {
    category: "건축가",
    title: "Norman Foster",
    url: "https://www.fosterandpartners.com/projects/",
    description: "하이테크 건축의 선구자이며, 지속가능한 디자인을 추구하는 영국 건축가입니다",
    id: "102",
  },
  {
    category: "건축가",
    title: "Richard Meier",
    url: "https://meierpartners.com/projects",
    description: "흰색 건축물과 기하학적 형태로 잘 알려진 미국의 건축가입니다",
    id: "103",
  },
  {
    category: "건축가",
    title: "Richard Rogers",
    url: "https://rshp.com/projects/",
    description: "하이테크 건축의 거장으로 퐁피두 센터를 설계한 영국 건축가입니다",
    id: "104",
  },
  {
    category: "건축가",
    title: "Santiago Calatrava",
    url: "https://calatrava.com/projects.html?all=yes",
    description: "스페인 출신의 건축가이자 엔지니어로, 생체 공학적 형태의 건축물로 유명합니다",
    id: "105",
  },
  {
    category: "건축가",
    title: "Renzo Piano",
    url: "http://www.rpbw.com/",
    description: "이탈리아 출신 건축가로, 테크노-건축 양식과 투명한 디자인을 선보입니다",
    id: "106",
  },
  {
    category: "건축가",
    title: "OMA / Rem Koolhaas",
    url: "https://www.oma.com/projects",
    description: "네덜란드 건축가 렘 콜하스가 설립한 건축사무소로 혁신적이고 파격적인 건축을 선보입니다",
    id: "107",
  },
  {
    category: "건축가",
    title: "Zaha Hadid",
    url: "https://www.zaha-hadid.com/archive",
    description: "곡선과 유동적인 형태로 건축의 새로운 경지를 개척한 건축가입니다",
    id: "108",
  },
  {
    category: "건축가",
    title: "Bjarke Ingels (BIG)",
    url: "https://big.dk/#projects",
    description: "덴마크 건축가로, 유머러스하고 실용적인 디자인으로 유명합니다",
    id: "109",
  },
  {
    category: "건축가",
    title: "Kengo Kuma",
    url: "https://kkaa.co.jp/project/",
    description: "일본 건축가로, 자연 소재와 전통적인 건축을 현대적으로 재해석합니다",
    id: "110",
  },
  {
    category: "건축가",
    title: "Herzog & de Meuron",
    url: "https://www.herzogdemeuron.com/index/projects/complete-works.html",
    description: "스위스 출신의 건축 듀오로, 재료의 실험적 사용과 독창적 디자인으로 유명합니다",
    id: "111",
  },
  {
    category: "건축가",
    title: "Jean Nouvel",
    url: "http://www.jeannouvel.com/projets/",
    description: "프랑스 출신 건축가로, 빛과 그림자를 활용한 감각적 디자인을 선보입니다",
    id: "115",
  },
  {
    category: "건축가",
    title: "I.M. Pei",
    url: "https://pei-architects.com/category/all-projects/",
    description: "중국계 미국 건축가로, 루브르 박물관 유리 피라미드 설계로 유명합니다",
    id: "118",
  },
  {
    category: "건축가",
    title: "Alvar Aalto",
    url: "https://alvaraalto.fi/en/architecture/",
    description: "핀란드 근대 건축의 거장으로, 인간 중심적 디자인과 목재 활용으로 유명합니다",
    id: "204",
  },
  {
    category: "건축가",
    title: "Louis Kahn",
    url: "https://www.archdaily.com/tag/louis-kahn",
    description: "미국의 건축가로, 빛과 공간의 극적인 사용으로 유명합니다",
    id: "205",
  },
  {
    category: "건축가",
    title: "Le Corbusier",
    url: "https://www.fondationlecorbusier.fr/",
    description: "근대 건축의 거장이자 국제주의 양식을 대표하는 건축가입니다",
    id: "206",
  },
];

export const categoryConfig = {
  "디자인": { title: "디자인", icon: "🎨", iconClass: "icon-blue" },
  "공모전": { title: "공모전", icon: "🏆", iconClass: "icon-yellow" },
  "채용정보": { title: "채용정보", icon: "💼", iconClass: "icon-green" },
  "유튜브": { title: "유튜브", icon: "📺", iconClass: "icon-red" },
  "커뮤니티": { title: "커뮤니티", icon: "👥", iconClass: "icon-indigo" },
  "지도": { title: "지도", icon: "📍", iconClass: "icon-teal" },
  "건축가": { title: "건축가", icon: "👨‍💼", iconClass: "icon-purple" },
  "포털사이트": { title: "포털사이트", icon: "🌐", iconClass: "icon-orange" },
  "기타": { title: "기타", icon: "📚", iconClass: "icon-gray" },
};

export const categoryOrder = [
    "디자인",
  "공모전",
  "채용정보",
  "유튜브",
  "커뮤니티",
  "지도",
  "건축가",
  "포털사이트",
  "기타",
];
