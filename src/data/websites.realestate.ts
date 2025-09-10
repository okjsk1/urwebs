import type { Website, CategoryConfigMap } from '../types';

export const websites: Website[] = [
  { category: '포털/시세', title: '네이버 부동산', url: 'https://land.naver.com', description: '국내 최대 부동산 포털', id: 'KR-RE-001' },
  { category: '포털/시세', title: '직방', url: 'https://www.zigbang.com', description: '아파트·원룸 매물 검색', id: 'KR-RE-002' },
  { category: '포털/시세', title: '다방', url: 'https://www.dabangapp.com', description: '원룸·오피스텔 정보', id: 'KR-RE-003' },
  { category: '포털/시세', title: 'KB부동산', url: 'https://kbland.kr', description: '시세 조회·시장 분석', id: 'KR-RE-004' },
  { category: '포털/시세', title: '호갱노노', url: 'https://hogangnono.com', description: '아파트 실거래·시세 비교', id: 'KR-RE-005' },

  { category: '정부/공공', title: '실거래가 공개시스템', url: 'https://rt.molit.go.kr', description: '국토부 실거래가 조회', id: 'KR-RE-006' },
  { category: '정부/공공', title: '온나라 부동산정보', url: 'https://www.onnara.go.kr', description: '종합 부동산 공공포털', id: 'KR-RE-007' },
  { category: '정부/공공', title: '부동산공시가격 알리미', url: 'https://www.realtyprice.kr', description: '공시가격 조회', id: 'KR-RE-008' },
  { category: '정부/공공', title: '한국부동산원', url: 'https://www.reb.or.kr', description: '시장 동향·통계 제공', id: 'KR-RE-009' },
  { category: '정부/공공', title: 'LH 한국토지주택공사', url: 'https://www.lh.or.kr', description: '공공주택 분양·임대', id: 'KR-RE-010' },

  { category: '뉴스', title: '한국경제 부동산', url: 'https://land.hankyung.com', description: '한국경제 부동산 뉴스', id: 'KR-RE-011' },
  { category: '뉴스', title: '매일경제 부동산', url: 'https://land.mk.co.kr', description: '매일경제 부동산 소식', id: 'KR-RE-012' },
  { category: '뉴스', title: '서울경제 부동산', url: 'https://www.sedaily.com/NewsList/IndustryRealestate', description: '서울경제 부동산 기사', id: 'KR-RE-013' },
  { category: '뉴스', title: '머니투데이 부동산', url: 'https://realestate.mt.co.kr', description: '머니투데이 부동산 정보', id: 'KR-RE-014' },

  { category: '커뮤니티', title: '부동산스터디', url: 'https://cafe.naver.com/realestate114', description: '네이버 부동산 카페', id: 'KR-RE-015' },
  { category: '커뮤니티', title: '뽐뿌 부동산포럼', url: 'https://www.ppomppu.co.kr/zboard/zboard.php?id=house', description: '뽐뿌 부동산 커뮤니티', id: 'KR-RE-016' },
  { category: '커뮤니티', title: '디시 부동산 갤러리', url: 'https://gall.dcinside.com/board/lists?id=house', description: '디시인사이드 부동산 갤러리', id: 'KR-RE-017' },

  { category: '금융/정책', title: '주택도시기금', url: 'https://nhuf.molit.go.kr', description: '모기지·전세자금 지원', id: 'KR-RE-018' },
  { category: '금융/정책', title: '주택도시보증공사', url: 'https://www.khug.or.kr', description: '보증·공공임대 정보', id: 'KR-RE-019' },
  { category: '금융/정책', title: '청약홈', url: 'https://www.applyhome.co.kr', description: '아파트 청약 신청', id: 'KR-RE-020' },
  { category: '금융/정책', title: '토지이용규제정보서비스', url: 'https://luris.molit.go.kr', description: '토지 이용·규제 조회', id: 'KR-RE-021' },
];

export const categoryConfig: CategoryConfigMap = {
  '포털/시세': { title: '포털/시세', icon: '🏠', iconClass: 'icon-orange' },
  '정부/공공': { title: '정부/공공', icon: '🏢', iconClass: 'icon-blue' },
  '뉴스': { title: '뉴스', icon: '📰', iconClass: 'icon-yellow' },
  '커뮤니티': { title: '커뮤니티', icon: '👥', iconClass: 'icon-indigo' },
  '금융/정책': { title: '금융/정책', icon: '💰', iconClass: 'icon-green' },
};

export const categoryOrder = [
  '포털/시세',
  '정부/공공',
  '뉴스',
  '커뮤니티',
  '금융/정책',
];

export default websites;
