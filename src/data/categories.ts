// src/data/categories.ts
import type { FieldCategory } from "../types";

export const categories: FieldCategory[] = [
  {
    slug: 'architecture',
    title: '건축학과',
    emoji: '🏛️',
    description: '건축 정보를 모았습니다',
    // href: '/category/architecture', // (선택) 커스텀 경로가 필요하면 주석 해제
  },
  {
    slug: 'realestate',
    title: '부동산',
    emoji: '🏠',
    description: '부동산 관련 자료를 빠르게',
  },
  {
    slug: 'securities',
    title: '증권',
    emoji: '📈',
    description: '투자와 주식 정보를 확인',
  },
];

export default categories;
