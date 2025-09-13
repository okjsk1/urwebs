import type { Website, CategoryConfigMap } from './websites';

export const websites: Website[] = [
  { category: '보안 자료', title: 'OWASP', url: 'https://owasp.org', description: '오픈 웹 보안 프로젝트', id: 'SEC-REF-001' },
];

export const categoryConfig: CategoryConfigMap = {
  '보안 자료': { title: '보안 자료', icon: '🔐', iconClass: 'icon-red' },
};

export const categoryOrder = [
  '보안 자료',
];
