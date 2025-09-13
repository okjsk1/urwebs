import type { Website, CategoryConfigMap } from './websites';

export const websites: Website[] = [
  { category: '회계 자료', title: '국세청 홈택스', url: 'https://hometax.go.kr', description: '대한민국 국세청 서비스', id: 'ACC-REF-001' },
];

export const categoryConfig: CategoryConfigMap = {
  '회계 자료': { title: '회계 자료', icon: '📊', iconClass: 'icon-purple' },
};

export const categoryOrder = [
  '회계 자료',
];
