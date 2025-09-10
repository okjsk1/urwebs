import type { FieldCategory } from "../types";

export const categories: FieldCategory[] = [
  {
    slug: 'architecture',
    title: '건축학과',
    emoji: '🏛️',
    description: '건축 정보를 모았습니다',
  },
  {
    slug: 'realestate',
    title: '부동산',
    emoji: '🏠',
    description: '부동산 관련 자료를 빠르게',
  },
  {
    slug: 'stocks',
    title: '증권',
    emoji: '📈',
    description: '투자와 주식 정보를 확인',
  },
];

export default categories;
