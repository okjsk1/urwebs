import type { Website, CategoryConfigMap } from './websites';

export const websites: Website[] = [
  /* ───────── 부동산: 매물/포털 ───────── */
  { category: "매물/포털", title: "네이버 부동산", url: "https://land.naver.com/", description: "국내 1위 부동산 포털", id: "KR-RE-P-001" },
  { category: "매물/포털", title: "직방", url: "https://www.zigbang.com/", description: "원룸·오피스텔·아파트", id: "KR-RE-P-002" },
  { category: "매물/포털", title: "다방", url: "https://www.dabangapp.com/", description: "원룸·투룸·오피스텔", id: "KR-RE-P-003" },
  { category: "매물/포털", title: "호갱노노", url: "https://hogangnono.com/", description: "아파트 시세·단지 정보", id: "KR-RE-P-004" },
  { category: "매물/포털", title: "부동산플래닛", url: "https://www.rplanet.co.kr/", description: "지도 기반 분석·시세", id: "KR-RE-P-005" },
  { category: "매물/포털", title: "피터팬의 좋은방 구하기", url: "https://www.peterpanz.com/", description: "중개수수료 없는 방 구하기", id: "KR-RE-P-006" },

  /* ───────── 부동산: 시세/분석 ───────── */
  { category: "시세/분석", title: "국토교통부 실거래가", url: "https://rt.molit.go.kr/", description: "아파트·토지 실거래가", id: "KR-RE-A-001" },
  { category: "시세/분석", title: "KB부동산 리브온", url: "https://onland.kbstar.com/", description: "KB 시세·리포트", id: "KR-RE-A-002" },
  { category: "시세/분석", title: "한국부동산원 통계", url: "https://www.reb.or.kr/", description: "가격동향·통계·지표", id: "KR-RE-A-003" },
  { category: "시세/분석", title: "아실(아파트실거래가)", url: "https://asil.kr/", description: "실거래가·분양·분석", id: "KR-RE-A-004" },
  { category: "시세/분석", title: "KOSIS 주택통계", url: "https://kosis.kr/", description: "국가통계 포털", id: "KR-RE-A-005" },

  /* ───────── 부동산: 청약/분양 ───────── */
  { category: "청약/분양", title: "청약홈", url: "https://www.applyhome.co.kr/", description: "아파트 청약 통합", id: "KR-RE-S-001" },
  { category: "청약/분양", title: "LH 청약센터", url: "https://apply.lh.or.kr/", description: "공공분양·임대 청약", id: "KR-RE-S-002" },
  { category: "청약/분양", title: "SH공사 분양", url: "https://www.i-sh.co.kr/", description: "서울주택도시공사 공고", id: "KR-RE-S-003" },
  { category: "청약/분양", title: "GH경기주택도시공사", url: "https://www.gh.or.kr/", description: "경기도 분양·임대", id: "KR-RE-S-004" },
  { category: "청약/분양", title: "HUG 분양보증 공고", url: "https://www.khug.or.kr/", description: "분양보증·분양정보", id: "KR-RE-S-005" },

  /* ───────── 부동산: 공공/정부 ───────── */
  { category: "공공/정부", title: "부동산공시가격 알리미", url: "https://www.realtyprice.kr/", description: "공시지가/주택공시가", id: "KR-RE-G-001" },
  { category: "공공/정부", title: "토지이용규제정보서비스", url: "https://luris.molit.go.kr/", description: "용도지역·지구 확인", id: "KR-RE-G-002" },
  { category: "공공/정부", title: "정부24(민원·열람)", url: "https://www.gov.kr/", description: "부동산종합증명·민원", id: "KR-RE-G-003" },
  { category: "공공/정부", title: "국가공간정보포털", url: "https://www.nsdi.go.kr/", description: "지적·공간정보 개방", id: "KR-RE-G-004" },
  { category: "공공/정부", title: "서울열린데이터광장", url: "https://data.seoul.go.kr/", description: "서울 부동산 데이터", id: "KR-RE-G-005" },

  /* ───────── 부동산: 경매/공매 ───────── */
  { category: "경매/공매", title: "온비드(캠코)", url: "https://www.onbid.co.kr/", description: "국유재산·공매", id: "KR-RE-AUC-001" },
  { category: "경매/공매", title: "대법원 경매정보", url: "https://www.courtauction.go.kr/", description: "법원 부동산 경매", id: "KR-RE-AUC-002" },
  { category: "경매/공매", title: "캠코자산매각", url: "https://www.kamco.or.kr/", description: "공매·자산매각 정보", id: "KR-RE-AUC-003" },
  { category: "경매/공매", title: "한국자산관리공사 온나라", url: "https://www.onnarang.co.kr/", description: "온나라 부동산정보", id: "KR-RE-AUC-004" },

  /* ───────── 부동산: 등기/법령/세금 ───────── */
  { category: "등기/법령/세금", title: "인터넷등기소", url: "https://www.iros.go.kr/", description: "부동산 등기 열람/발급", id: "KR-RE-L-001" },
  { category: "등기/법령/세금", title: "국가법령정보센터", url: "https://www.law.go.kr/", description: "부동산 관련 법령", id: "KR-RE-L-002" },
  { category: "등기/법령/세금", title: "홈택스(양도소득세)", url: "https://www.hometax.go.kr/", description: "세금 신고·계산", id: "KR-RE-L-003" },
  { category: "등기/법령/세금", title: "위택스(지방세)", url: "https://www.wetax.go.kr/", description: "취득세·재산세 납부", id: "KR-RE-L-004" },
  { category: "등기/법령/세금", title: "국세청 부동산세금 길라잡이", url: "https://www.nts.go.kr/", description: "부동산 세금 안내", id: "KR-RE-L-005" },

  /* ───────── 부동산: 지도/지적/공간정보 ───────── */
  { category: "지도/지적", title: "LX 국토정보플랫폼", url: "https://map.ngii.go.kr/", description: "지적도·연속지적도", id: "KR-RE-MAP-001" },
  { category: "지도/지적", title: "VWorld", url: "https://map.vworld.kr/", description: "항공사진·3D지도", id: "KR-RE-MAP-002" },
  { category: "지도/지적", title: "카카오맵", url: "https://map.kakao.com/", description: "로드뷰·길찾기", id: "KR-RE-MAP-003" },
  { category: "지도/지적", title: "네이버 지도", url: "https://map.naver.com/", description: "장소·대중교통", id: "KR-RE-MAP-004" },
  { category: "지도/지적", title: "국가공간정보 오픈마켓", url: "https://openapi.nsdi.go.kr/", description: "지적·주소 API", id: "KR-RE-MAP-005" },

  /* ───────── 부동산: 뉴스/커뮤니티 ───────── */
  { category: "뉴스/커뮤니티", title: "네이버 부동산 뉴스", url: "https://land.naver.com/news/", description: "언론사별 주요 뉴스", id: "KR-RE-N-001" },
  { category: "뉴스/커뮤니티", title: "매일경제 부동산", url: "https://www.mk.co.kr/realestate/", description: "부동산 경제 뉴스", id: "KR-RE-N-002" },
  { category: "뉴스/커뮤니티", title: "한국경제 부동산", url: "https://www.hankyung.com/realestate", description: "분양·시장 동향", id: "KR-RE-N-003" },
  { category: "뉴스/커뮤니티", title: "부동산스터디(네이버카페)", url: "https://cafe.naver.com/land", description: "투자·시장 정보 커뮤니티", id: "KR-RE-N-004" },
  { category: "뉴스/커뮤니티", title: "국토교통부 뉴스", url: "https://www.molit.go.kr/USR/NEWS/m_71/lst.jsp", description: "정책·보도자료", id: "KR-RE-N-005" },

  /* ───────── 부동산: 금융/대출 ───────── */
  { category: "금융/대출", title: "주택도시기금(기금e든든)", url: "https://nhuf.molit.go.kr/", description: "전세·주택자금대출", id: "KR-RE-F-001" },
  { category: "금융/대출", title: "한국주택금융공사(HF)", url: "https://www.hf.go.kr/", description: "보금자리론·디딤돌", id: "KR-RE-F-002" },
  { category: "금융/대출", title: "은행연합회 금리비교", url: "https://portal.kfb.or.kr/", description: "대출 금리 비교", id: "KR-RE-F-003" },
  { category: "금융/대출", title: "부동산 전월세지원센터", url: "https://www.jeonse.or.kr/", description: "보증금 보호·상담", id: "KR-RE-F-004" },
  { category: "금융/대출", title: "HUG 전세보증", url: "https://www.khug.or.kr/portal/guar/sub_view.do?menuNo=200028", description: "전세보증 상품 안내", id: "KR-RE-F-005" },
];

export const categoryConfig: CategoryConfigMap = {
  '매물/포털': { title: '매물/포털', icon: '🏠', iconClass: 'icon-green' },
  '시세/분석': { title: '시세/분석', icon: '📈', iconClass: 'icon-blue' },
  '청약/분양': { title: '청약/분양', icon: '📝', iconClass: 'icon-yellow' },
  '공공/정부': { title: '공공/정부', icon: '🏛️', iconClass: 'icon-purple' },
  '경매/공매': { title: '경매/공매', icon: '🔨', iconClass: 'icon-orange' },
  '등기/법령/세금': { title: '등기/법령/세금', icon: '📜', iconClass: 'icon-red' },
  '지도/지적': { title: '지도/지적', icon: '🗺️', iconClass: 'icon-teal' },
  '뉴스/커뮤니티': { title: '뉴스/커뮤니티', icon: '📰', iconClass: 'icon-indigo' },
  '금융/대출': { title: '금융/대출', icon: '💰', iconClass: 'icon-green' },
};

export const categoryOrder = [
  '매물/포털',
  '시세/분석',
  '청약/분양',
  '공공/정부',
  '경매/공매',
  '등기/법령/세금',
  '지도/지적',
  '뉴스/커뮤니티',
  '금융/대출',
];

