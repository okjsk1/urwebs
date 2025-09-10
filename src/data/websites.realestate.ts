import type { Website, CategoryConfigMap } from './websites';

export const websites: Website[] = [
  {
    category: '부동산포털',
    title: '직방',
    url: 'https://www.zigbang.com',
    description: '부동산 매물 검색 서비스',
    id: 'RE-001',
  },
  {
    category: '부동산포털',
    title: '다방',
    url: 'https://www.dabangapp.com',
    description: '원룸·오피스텔 찾기',
    id: 'RE-002',
  },
  {
    category: '정보',
    title: '국토교통부 실거래가',
    url: 'https://rt.molit.go.kr',
    description: '실거래가 조회 서비스',
    id: 'RE-003',
  },
];

export const categoryConfig: CategoryConfigMap = {
  '부동산포털': { title: '부동산포털', icon: '🏠', iconClass: 'icon-green' },
  '정보': { title: '정보', icon: 'ℹ️', iconClass: 'icon-blue' },
};

export const categoryOrder = ['부동산포털', '정보'];
