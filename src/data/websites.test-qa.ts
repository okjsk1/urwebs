import type { Website, CategoryConfigMap } from './websites';

export const websites: Website[] = [
  { category: '테스트 도구', title: 'Playwright', url: 'https://playwright.dev', description: '테스트 자동화 프레임워크', id: 'TQA-TOOL-001' },
];

export const categoryConfig: CategoryConfigMap = {
  '테스트 도구': { title: '테스트 도구', icon: '🧪', iconClass: 'icon-green' },
};

export const categoryOrder = [
  '테스트 도구',
];
