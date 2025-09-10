import type { Website, CategoryConfigMap } from '../types';

export const websites: Website[] = [
  { category: '시장정보', title: '네이버 금융', url: 'https://finance.naver.com', description: '국내 대표 금융 포털', id: 'KR-ST-001' },
  { category: '시장정보', title: '다음 금융', url: 'https://finance.daum.net', description: '카카오 금융 정보', id: 'KR-ST-002' },
  { category: '시장정보', title: '한국거래소', url: 'https://www.krx.co.kr', description: '증시 지표·공시 제공', id: 'KR-ST-003' },
  { category: '시장정보', title: 'DART 전자공시', url: 'https://dart.fss.or.kr', description: '금융감독원 전자공시', id: 'KR-ST-004' },
  { category: '시장정보', title: 'FnGuide', url: 'https://www.fnguide.com', description: '기업 재무 정보', id: 'KR-ST-005' },

  { category: '증권사', title: '키움증권', url: 'https://www.kiwoom.com', description: '국내 1위 온라인 증권사', id: 'KR-ST-006' },
  { category: '증권사', title: '미래에셋증권', url: 'https://www.miraeassetdaewoo.com', description: '종합 금융투자사', id: 'KR-ST-007' },
  { category: '증권사', title: '삼성증권', url: 'https://www.samsungsecurities.co.kr', description: '삼성 금융 투자', id: 'KR-ST-008' },
  { category: '증권사', title: 'NH투자증권', url: 'https://www.nhqv.com', description: 'NH투자증권 홈트레이딩', id: 'KR-ST-009' },
  { category: '증권사', title: 'KB증권', url: 'https://www.kbsec.com', description: 'KB금융 투자 서비스', id: 'KR-ST-010' },
  { category: '증권사', title: '한국투자증권', url: 'https://www.truefriend.com', description: '한국투자증권 종합투자', id: 'KR-ST-011' },

  { category: '뉴스', title: '한국경제 증권', url: 'https://finance.hankyung.com', description: '한국경제 증권 뉴스', id: 'KR-ST-012' },
  { category: '뉴스', title: '매일경제 증권', url: 'https://stock.mk.co.kr', description: '매일경제 증권 속보', id: 'KR-ST-013' },
  { category: '뉴스', title: '이데일리 증권', url: 'https://www.edaily.co.kr/stock', description: '이데일리 주식 뉴스', id: 'KR-ST-014' },
  { category: '뉴스', title: '연합뉴스 증권', url: 'https://www.yna.co.kr/economy/stock', description: '연합뉴스 증권 기사', id: 'KR-ST-015' },

  { category: '커뮤니티', title: '팍스넷', url: 'https://paxnet.co.kr', description: '대표 주식 커뮤니티', id: 'KR-ST-016' },
  { category: '커뮤니티', title: '주식 갤러리', url: 'https://gall.dcinside.com/board/lists?id=stock', description: '디시인사이드 주식 갤러리', id: 'KR-ST-017' },
  { category: '커뮤니티', title: '뽐뿌 주식포럼', url: 'https://www.ppomppu.co.kr/zboard/zboard.php?id=stock', description: '뽐뿌 투자 커뮤니티', id: 'KR-ST-018' },
  { category: '커뮤니티', title: '클리앙 주식게시판', url: 'https://www.clien.net/service/board/cm_stock', description: '클리앙 주식 토론', id: 'KR-ST-019' },

  { category: '교육/자료', title: '금융투자협회', url: 'https://www.kofia.or.kr', description: '투자 교육·자료 제공', id: 'KR-ST-020' },
  { category: '교육/자료', title: '증권정보포털', url: 'https://seibro.or.kr', description: '한국예탁결제원 정보포털', id: 'KR-ST-021' },
  { category: '교육/자료', title: '금융감독원 교육', url: 'https://www.fss.or.kr/fss/edu', description: '금감원 금융 교육', id: 'KR-ST-022' },
];

export const categoryConfig: CategoryConfigMap = {
  '시장정보': { title: '시장정보', icon: '📊', iconClass: 'icon-green' },
  '증권사': { title: '증권사', icon: '🏦', iconClass: 'icon-blue' },
  '뉴스': { title: '뉴스', icon: '📰', iconClass: 'icon-yellow' },
  '커뮤니티': { title: '커뮤니티', icon: '👥', iconClass: 'icon-indigo' },
  '교육/자료': { title: '교육/자료', icon: '📚', iconClass: 'icon-gray' },
};

export const categoryOrder = [
  '시장정보',
  '증권사',
  '뉴스',
  '커뮤니티',
  '교육/자료',
];

export default websites;
