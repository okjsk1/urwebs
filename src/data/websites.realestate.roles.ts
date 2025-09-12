import type { Website, CategoryConfigMap } from './websites';

const commonConfig: CategoryConfigMap = {
  추천: { title: '추천 사이트', icon: '🔗', iconClass: 'icon-blue' },
};

const commonOrder = ['추천'];

export const roleData = {
  student: {
    websites: [
      { category: '추천', title: '직방', url: 'https://www.zigbang.com/', description: '원룸·오피스텔·아파트', id: 'KR-RE-STU-001' },
      { category: '추천', title: '다방', url: 'https://www.dabangapp.com/', description: '원룸·투룸·오피스텔', id: 'KR-RE-STU-002' },
      { category: '추천', title: '피터팬의 좋은방 구하기', url: 'https://www.peterpanz.com/', description: '중개수수료 없는 방구하기', id: 'KR-RE-STU-003' },
    ],
    categoryConfig: commonConfig,
    categoryOrder: commonOrder,
  },
  agent: {
    websites: [
      { category: '추천', title: '국토교통부 실거래가', url: 'https://rt.molit.go.kr/', description: '아파트·토지 실거래가', id: 'KR-RE-AGT-001' },
      { category: '추천', title: '부동산공시가격 알리미', url: 'https://www.realtyprice.kr/', description: '공시지가/주택공시가', id: 'KR-RE-AGT-002' },
      { category: '추천', title: '정부24 부동산종합증명', url: 'https://www.gov.kr/portal', description: '부동산 종합증명·민원', id: 'KR-RE-AGT-003' },
    ],
    categoryConfig: commonConfig,
    categoryOrder: commonOrder,
  },
  tenant: {
    websites: [
      { category: '추천', title: '부동산 전월세지원센터', url: 'https://www.jeonse.or.kr/', description: '보증금 보호·상담', id: 'KR-RE-TEN-001' },
      { category: '추천', title: 'HUG 전세보증', url: 'https://www.khug.or.kr/portal/guar/sub_view.do?menuNo=200028', description: '전세보증 상품 안내', id: 'KR-RE-TEN-002' },
      { category: '추천', title: '주택도시기금', url: 'https://nhuf.molit.go.kr/', description: '전세·주택자금대출', id: 'KR-RE-TEN-003' },
    ],
    categoryConfig: commonConfig,
    categoryOrder: commonOrder,
  },
  landlord: {
    websites: [
      { category: '추천', title: '홈택스(양도소득세)', url: 'https://www.hometax.go.kr/', description: '세금 신고·계산', id: 'KR-RE-LDL-001' },
      { category: '추천', title: '위택스(지방세)', url: 'https://www.wetax.go.kr/', description: '취득세·재산세 납부', id: 'KR-RE-LDL-002' },
      { category: '추천', title: '임대사업자 등록', url: 'https://www.gov.kr/mw/AA020InfoCappView.do?CappBizCD=15000000036', description: '임대사업자 등록 안내', id: 'KR-RE-LDL-003' },
    ],
    categoryConfig: commonConfig,
    categoryOrder: commonOrder,
  },
  investor: {
    websites: [
      { category: '추천', title: 'KB부동산 리브온', url: 'https://onland.kbstar.com/', description: 'KB 시세·리포트', id: 'KR-RE-INV-001' },
      { category: '추천', title: '아실(아파트실거래가)', url: 'https://asil.kr/', description: '실거래가·분양·분석', id: 'KR-RE-INV-002' },
      { category: '추천', title: '국토교통부 실거래가', url: 'https://rt.molit.go.kr/', description: '아파트·토지 실거래가', id: 'KR-RE-INV-003' },
    ],
    categoryConfig: commonConfig,
    categoryOrder: commonOrder,
  },
} as const;

export type RealEstateRole = keyof typeof roleData;

