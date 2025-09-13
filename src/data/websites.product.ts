import type { Website, CategoryConfigMap } from './websites';

export const websites: Website[] = [
  { category: '제품 관리', title: 'ProductPlan', url: 'https://www.productplan.com', description: '로드맵 도구', id: 'PROD-REF-001' },
];

export const categoryConfig: CategoryConfigMap = {
  '제품 관리': { title: '제품 관리', icon: '📝', iconClass: 'icon-blue' },
};

export const categoryOrder = [
  '제품 관리',
];
