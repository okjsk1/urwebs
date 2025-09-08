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
  { category: "디자인", title: "핀터레스트", url: "https://www.pinterest.com", description: "건축과 디자인 아이디어를 발견하고 저장할 수 있는 비주얼 검색 플랫폼입니다", id: "60" },
  { category: "디자인", title: "아키데일리", url: "https://www.archdaily.com", description: "전 세계 건축 프로젝트와 뉴스를 매일 업데이트하는 세계 최대 건축 정보 사이트입니다", id: "1" },
  { category: "디자인", title: "디즌", url: "https://www.dezeen.com", description: "건축과 디자인 트렌드를 선도하는 영국의 권위 있는 온라인 디자인 매거진입니다", id: "2" },
  { category: "디자인", title: "월페이퍼", url: "https://www.wallpaper.com", description: "럭셔리 라이프스타일과 현대 건축·디자인을 소개하는 프리미엄 매거진입니다", id: "3" },
  { category: "디자인", title: "도머스", url: "https://www.domusweb.it", description: "1928년부터 발행되어 온 이탈리아의 권위 있는 건축 및 디자인 매거진입니다", id: "5" },
  { category: "디자인", title: "베한스", url: "https://www.behance.net", description: "Adobe에서 운영하는 크리에이티브 포트폴리오 공유 플랫폼입니다", id: "65" },
  { category: "디자인", title: "Archinect", url: "https://archinect.com", description: "건축 커뮤니티와 채용정보를 제공하는 글로벌 건축 플랫폼입니다", id: "71" },
  { category: "디자인", title: "SPACE(공간)", url: "https://vmspace.com", description: "국내 대표 건축 매거진, 프로젝트·비평·인터뷰", id: "KR-D-001" },
  { category: "디자인", title: "C3 Korea", url: "https://www.c3korea.net", description: "국내외 건축 프로젝트와 이론을 다루는 전문지", id: "KR-D-002" },
  { category: "디자인", title: "MARU(마루)", url: "https://marumagazine.com", description: "동시대 건축과 디자인 이슈를 다루는 매거진", id: "KR-D-003" },
  { category: "디자인", title: "A&C(건축과 환경)", url: "https://ancbook.com", description: "건축·도시·인테리어 관련 출판/매거진", id: "KR-D-004" },
  { category: "디자인", title: "서울도시건축전시관", url: "https://www.seoulhour.kr", description: "도시·건축 전시/행사·아카이브", id: "KR-D-006" },
  { category: "디자인", title: "한국건축문화대상", url: "https://www.aiak.or.kr/award", description: "국내 권위 있는 건축상 수상작 아카이브", id: "KR-D-007" },
  { category: "디자인", title: "라펜트(조경)", url: "https://www.lafent.com", description: "조경/도시·경관 프로젝트·뉴스", id: "KR-D-009" },
  { category: "디자인", title: "서울건축문화제", url: "https://www.saf.kr", description: "서울건축문화제 행사·전시 자료", id: "KR-D-010" },


  { category: "공모전", title: "요즘것들", url: "https://www.allforyoung.com/", description: "젊은 크리에이터들을 위한 공모전과 프로젝트 정보를 큐레이션하는 사이트입니다", id: "62" },
  { category: "공모전", title: "슥삭", url: "https://www.ssgsag.kr/", description: "건축 및 디자인 분야의 다양한 공모전 정보를 한눈에 볼 수 있는 플랫폼입니다", id: "63" },
  { category: "공모전", title: "대한민국 건축대전", url: "https://www.kia.or.kr/sub03/sub03_01.jsp", description: "한국건축가협회에서 주최하는 대표적인 건축 공모전입니다", id: "145" },
  { category: "공모전", title: "씽굿", url: "https://www.thinkcontest.com", description: "국내 최대 공모전 플랫폼(건축/디자인 필터)", id: "KR-C-001" },
  { category: "공모전", title: "캠퍼스픽", url: "https://www.campuspick.com", description: "대학생을 위한 다양한 공모전과 대외활동 정보를 제공하는 플랫폼입니다", id: "61" },
  { category: "공모전", title: "공모전코리아", url: "https://www.gongmo.kr", description: "카테고리별 공모전 검색", id: "KR-C-002" },
  { category: "공모전", title: "올콘", url: "https://www.all-con.co.kr", description: "국내 공모전/대외활동 정보", id: "KR-C-003" },
  { category: "공모전", title: "대한건축학회 학생공모", url: "https://www.aik.or.kr", description: "학생 작품전/공모 안내(학회 공지)", id: "KR-C-005" },
  { category: "공모전", title: "한국건축가협회 공모", url: "https://www.kira.or.kr", description: "현상설계/공모 공지", id: "KR-C-006" },
  { category: "공모전", title: "서울특별시 공모", url: "https://news.seoul.go.kr/urban", description: "도시/건축 관련 공모·현상설계 공지", id: "KR-C-007" },
  { category: "공모전", title: "조달청 나라장터(현상설계)", url: "https://www.g2b.go.kr", description: "공공 설계공모·현상설계 입찰 공고", id: "KR-C-008" },
  { category: "공모전", title: "LH 현상설계", url: "https://www.lh.or.kr", description: "LH 현상설계·공모 공지", id: "KR-C-009" },
  { category: "공모전", title: "SH 현상설계", url: "https://www.i-sh.co.kr", description: "서울주택도시공사 설계공모", id: "KR-C-010" },

  { category: "채용정보", title: "대한건축사협회", url: "https://www.kira.or.kr/jsp/main/03/02_01.jsp", description: "대한건축사협회에서 제공하는 건축사무소 및 관련 업계 채용 공고", id: "12" },
  { category: "채용정보", title: "월간스페이스", url: "https://vmspace.com/job/job.html", description: "건축사무소와 건축 관련 기업의 채용 정보를 제공하는 전문 사이트입니다", id: "13" },
  { category: "채용정보", title: "건설워커", url: "https://www.worker.co.kr/", description: "건축 및 건설 분야 채용 정보를 제공하는 국내 대표 구인구직 플랫폼입니다", id: "14" },
  { category: "채용정보", title: "사람인", url: "https://www.saramin.co.kr/zf_user/jobs/list/domestic", description: "국내 대표적인 채용 플랫폼으로 건축·건설 분야 채용 공고도 제공합니다", id: "15" },
  { category: "채용정보", title: "잡코리아", url: "https://www.jobkorea.co.kr", description: "국내 대표 채용 정보 사이트로 건축 분야 채용 정보도 풍부합니다", id: "66" },
  { category: "채용정보", title: "원티드", url: "https://www.wanted.co.kr", description: "디자인·3D·BIM 관련 채용 다수", id: "KR-J-003" },
  { category: "채용정보", title: "인크루트 건축", url: "https://www.incruit.com", description: "건설·건축 직군 공고", id: "KR-J-004" },
  { category: "채용정보", title: "워크넷", url: "https://www.work.go.kr", description: "고용노동부 공공 취업 포털", id: "KR-J-005" },

  { category: "유튜브", title: "셜록현준", url: "https://www.youtube.com/@Sherlock_HJ", description: "건축가 유현준 교수가 건축과 도시 이야기를 쉽게 풀어주는 채널", id: "KR-YT-001" },
  { category: "유튜브", title: "홍윤택TV", url: "https://www.youtube.com/@hongyuntaek", description: "국내 건축사 시험, 건축 실무, 학습 관련 콘텐츠", id: "KR-YT-002" },
  { category: "유튜브", title: "CA Korea", url: "https://www.youtube.com/@cakorea", description: "월간 CA Korea가 운영하는 그래픽·공간 디자인 채널", id: "KR-YT-003" },
  { category: "유튜브", title: "Dami Lee", url: "https://www.youtube.com/@DamiLeeArch", description: "한국계 미국 건축가, 건축·디자인·도시 리뷰", id: "KR-YT-004" },
  { category: "유튜브", title: "30X40 Design Workshop", url: "https://www.youtube.com/@30X40DesignWorkshop", description: "미국 건축가 Eric Reinholdt의 실무 건축 워크플로우", id: "KR-YT-005" },
  { category: "유튜브", title: "The B1M", url: "https://www.youtube.com/@TheB1M", description: "세계에서 가장 큰 건축/건설 전문 유튜브 채널", id: "KR-YT-006" },
  { category: "유튜브", title: "Architectural Digest", url: "https://www.youtube.com/@Archdigest", description: "전 세계 건축·인테리어 프로젝트 소개", id: "KR-YT-007" },
  { category: "유튜브", title: "Never Too Small", url: "https://www.youtube.com/@NeverTooSmall", description: "소형 주거 공간 디자인 사례 전문 채널", id: "KR-YT-008" },
  { category: "유튜브", title: "Stewart Hicks", url: "https://www.youtube.com/@stewarthicks", description: "시카고 기반 교수의 건축 이론과 역사 강의", id: "KR-YT-009" },
  { category: "유튜브", title: "건축학개론", url: "https://www.youtube.com/@archi-basic", description: "국내 학생·초보자를 위한 건축 기초 학습 채널", id: "KR-YT-010" },

  { category: "커뮤니티", title: "연봉을알려주마", url: "https://cafe.daum.net/", description: "타 업종에 비하여 저평가 받고있는 건축인들 및 건축계 내에서도 천차만별인 설계사무소의 연봉수준을 서로 알고자 하기 위하여 만들어졌습니다", id: "72" },
  { category: "커뮤니티", title: "건축Q&A", url: "https://arch-qa.com", description: "건축에 관한 질문과 답변을 나누는 커뮤니티 플랫폼입니다", id: "73" },
  { category: "커뮤니티", title: "한국건축가협회(KIRA)", url: "https://www.kira.or.kr", description: "국내 건축가 단체, 공지/세미나/교육", id: "KR-U-001" },
  { category: "커뮤니티", title: "대한건축학회(AIK)", url: "https://www.aik.or.kr", description: "학술대회/논문/학생행사 정보", id: "KR-U-002" },
  { category: "커뮤니티", title: "AURI 건축도시공간연구소", url: "https://www.auri.re.kr", description: "정책 리포트·연구자료", id: "KR-U-003" },

 { category: "지도", title: "카카오맵", url: "https://map.kakao.com", description: "국내 대표 지도 서비스, 길찾기 및 장소 검색 지원", id: "KR-MAP-001" },
  { category: "지도", title: "네이버 지도", url: "https://map.naver.com", description: "대중교통/자전거/도보 길찾기에 강점이 있는 지도 서비스", id: "KR-MAP-002" },
  { category: "지도", title: "국토정보플랫폼 LX", url: "https://map.ngii.go.kr", description: "국토지리정보원에서 제공하는 공공 지도 및 공간정보", id: "KR-MAP-003" },
  { category: "지도", title: "서울 열린데이터광장 지도", url: "https://data.seoul.go.kr", description: "서울시의 다양한 도시/교통/건축 데이터 지도 서비스", id: "KR-MAP-004" },
  { category: "지도", title: "VWorld", url: "https://map.vworld.kr", description: "국토부 운영, 3D/항공사진 지도 제공", id: "KR-MAP-005" },
  { category: "지도", title: "국토교통부 토지이용규제정보서비스", url: "https://luris.molit.go.kr", description: "토지 용도지역·지구 지정 여부 확인 가능", id: "KR-MAP-006" },
  { category: "지도", title: "Google Earth", url: "https://earth.google.com", description: "전 세계 위성사진 기반 3D 지구 탐색 플랫폼", id: "KR-MAP-007" },
  { category: "지도", title: "OpenStreetMap", url: "https://www.openstreetmap.org", description: "전 세계 사용자가 참여하는 오픈소스 지도 프로젝트", id: "KR-MAP-008" },
  { category: "지도", title: "ArcGIS Online", url: "https://www.arcgis.com", description: "Esri에서 제공하는 전문 GIS 클라우드 플랫폼", id: "KR-MAP-009" },
  { category: "지도", title: "QGIS Korea", url: "https://qgis.org/ko/site", description: "오픈소스 GIS 소프트웨어 QGIS의 한국어 자료", id: "KR-MAP-010" },

  { category: "포털사이트", title: "구글", url: "https://www.google.com", description: "전 세계에서 가장 많이 사용되는 검색 엔진이자 포털사이트입니다", id: "301" },
  { category: "포털사이트", title: "네이버", url: "https://www.naver.com", description: "한국의 대표적인 포털사이트로 검색, 뉴스, 쇼핑 등 다양한 서비스를 제공합니다", id: "302" },
  { category: "포털사이트", title: "다음", url: "https://www.daum.net", description: "카카오에서 운영하는 국내 주요 포털사이트입니다", id: "303" },
  { category: "포털사이트", title: "Microsoft 시작페이지", url: "https://www.msn.com/ko-kr", description: "Microsoft에서 제공하는 뉴스와 정보 포털 사이트입니다", id: "304" },
  { category: "포털사이트", title: "야후", url: "https://www.yahoo.com", description: "미국의 대표적인 인터넷 포털 서비스입니다", id: "305" },
  { category: "포털사이트", title: "빙", url: "https://www.bing.com", description: "Microsoft에서 개발한 검색 엔진입니다", id: "306" },

  { category: "기타", title: "플렛아이콘", url: "https://www.flaticon.com/kr/", description: "다양한 아이콘을 제공하는 벡터 이미지 플랫폼입니다", id: "43" },
  { category: "기타", title: "플랫아이콘", url: "https://www.flaticon.com/kr/", description: "건축 도면·발표자료에 활용할 수 있는 무료 아이콘 플랫폼", id: "KR-ETC-001" },
  { category: "기타", title: "Freepik", url: "https://kr.freepik.com", description: "도면, 패널 작업용 무료 벡터/이미지 리소스 제공", id: "KR-ETC-002" },
  { category: "기타", title: "Pinterest - Architecture", url: "https://www.pinterest.com/search/pins/?q=architecture", description: "전 세계 건축 아이디어와 레퍼런스 이미지 검색", id: "KR-ETC-003" },
  { category: "기타", title: "Issuu", url: "https://issuu.com", description: "건축 포트폴리오/매거진 업로드 및 열람 가능한 플랫폼", id: "KR-ETC-004" },
  { category: "기타", title: "ResearchGate", url: "https://www.researchgate.net", description: "건축·도시 연구자들의 논문 및 학술자료 공유 사이트", id: "KR-ETC-005" },
  { category: "기타", title: "한국과학기술정보연구원(KISTI) NDSL", url: "https://www.ndsl.kr", description: "건축·토목·도시 관련 국내 학술자료 데이터베이스", id: "KR-ETC-006" },
  { category: "기타", title: "서울시 건축지도(서울도시건축센터)", url: "https://map.seoul.go.kr", description: "서울시 주요 건축물과 역사적 건축 자원 지도 서비스", id: "KR-ETC-007" },
  { category: "기타", title: "대한건축학회 논문집", url: "https://journal.aik.or.kr", description: "국내 대표 건축학회에서 발행하는 학술논문집", id: "KR-ETC-008" },
  { category: "기타", title: "구글 스칼라", url: "https://scholar.google.com", description: "건축·디자인 분야 논문 검색에 활용 가능한 학술 검색엔진", id: "KR-ETC-009" },
  { category: "기타", title: "Architizer", url: "https://architizer.com", description: "세계 건축 프로젝트와 사무소 DB를 모아둔 플랫폼", id: "KR-ETC-010" },


  { category: "건축가", title: "David Chipperfield", url: "https://davidchipperfield.com/projects", description: "영국 출신의 세계적인 건축가로, 미니멀하고 정제된 디자인으로 유명합니다", id: "101" },
  { category: "건축가", title: "Norman Foster", url: "https://www.fosterandpartners.com/projects/", description: "하이테크 건축의 선구자이며, 지속가능한 디자인을 추구하는 영국 건축가입니다", id: "102" },
  { category: "건축가", title: "Richard Meier", url: "https://meierpartners.com/projects", description: "흰색 건축물과 기하학적 형태로 잘 알려진 미국의 건축가입니다", id: "103" },
  { category: "건축가", title: "Richard Rogers", url: "https://rshp.com/projects/", description: "하이테크 건축의 거장으로 퐁피두 센터를 설계한 영국 건축가입니다", id: "104" },
  { category: "건축가", title: "Santiago Calatrava", url: "https://calatrava.com/projects.html?all=yes", description: "스페인 출신의 건축가이자 엔지니어로, 생체 공학적 형태의 건축물로 유명합니다", id: "105" },
  { category: "건축가", title: "Renzo Piano", url: "http://www.rpbw.com/", description: "이탈리아 출신 건축가로, 테크노-건축 양식과 투명한 디자인을 선보입니다", id: "106" },
  { category: "건축가", title: "OMA / Rem Koolhaas", url: "https://www.oma.com/projects", description: "네덜란드 건축가 렘 콜하스가 설립한 건축사무소로 혁신적이고 파격적인 건축을 선보입니다", id: "107" },
  { category: "건축가", title: "Zaha Hadid", url: "https://www.zaha-hadid.com/archive", description: "곡선과 유동적인 형태로 건축의 새로운 경지를 개척한 건축가입니다", id: "108" },
  { category: "건축가", title: "Bjarke Ingels (BIG)", url: "https://big.dk/#projects", description: "덴마크 건축가로, 유머러스하고 실용적인 디자인으로 유명합니다", id: "109" },
  { category: "건축가", title: "Kengo Kuma", url: "https://kkaa.co.jp/project/", description: "일본 건축가로, 자연 소재와 전통적인 건축을 현대적으로 재해석합니다", id: "110" },
  { category: "건축가", title: "Herzog & de Meuron", url: "https://www.herzogdemeuron.com/index/projects/complete-works.html", description: "스위스 출신의 건축 듀오로, 재료의 실험적 사용과 독창적 디자인으로 유명합니다", id: "111" },
  { category: "건축가", title: "Jean Nouvel", url: "http://www.jeannouvel.com/projets/", description: "프랑스 출신 건축가로, 빛과 그림자를 활용한 감각적 디자인을 선보입니다", id: "115" },
  { category: "건축가", title: "I.M. Pei", url: "https://pei-architects.com/category/all-projects/", description: "중국계 미국 건축가로, 루브르 박물관 유리 피라미드 설계로 유명합니다", id: "118" },
  { category: "건축가", title: "Alvar Aalto", url: "https://alvaraalto.fi/en/architecture/", description: "핀란드 근대 건축의 거장으로, 인간 중심적 디자인과 목재 활용으로 유명합니다", id: "204" },
  { category: "건축가", title: "Louis Kahn", url: "https://www.archdaily.com/tag/louis-kahn", description: "미국의 건축가로, 빛과 공간의 극적인 사용으로 유명합니다", id: "205" },
  { category: "건축가", title: "Le Corbusier", url: "https://www.fondationlecorbusier.fr/", description: "근대 건축의 거장이자 국제주의 양식을 대표하는 건축가입니다", id: "206" }
,
  { category: "자료", title: "국가법령정보센터", url: "https://www.law.go.kr", description: "건축법·시행령·시행규칙·해설 조회", id: "KR-R-001" },
  { category: "자료", title: "국토법령정보센터", url: "https://www.luris.go.kr", description: "국토계획/용도지역·지구/행정절차 안내", id: "KR-R-002" },
  { category: "자료", title: "세움터(건축행정)", url: "https://www.eais.go.kr", description: "인허가·대장·건축행정 정보", id: "KR-R-003" },
  { category: "자료", title: "서울열린데이터광장", url: "https://data.seoul.go.kr", description: "서울 도시·교통·건축 데이터셋", id: "KR-R-006" },

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
  "자료": { title: "자료", icon: "📚", iconClass: "icon-gray" },
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
  "자료",
];
