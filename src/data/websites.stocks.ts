import type { Website, CategoryConfigMap } from './websites';

export const websites: Website[] = [
  {
    category: '증권포털',
    title: '네이버 증권',
    url: 'https://finance.naver.com',
    description: '국내 주식 시세 정보',
    id: 'ST-001',
  },
  {
    category: '증권포털',
    title: '다트 전자공시',
    url: 'https://dart.fss.or.kr',
    description: '기업 공시 확인',
    id: 'ST-002',
  },
  {
    category: '커뮤니티',
    title: '인베스팅닷컴',
    url: 'https://www.investing.com',
    description: '글로벌 금융 정보',
    id: 'ST-003',
  },
];

export const categoryConfig: CategoryConfigMap = {
  '증권포털': { title: '증권포털', icon: '📈', iconClass: 'icon-red' },
  '커뮤니티': { title: '커뮤니티', icon: '👥', iconClass: 'icon-indigo' },
};

export const categoryOrder = ['증권포털', '커뮤니티'];
