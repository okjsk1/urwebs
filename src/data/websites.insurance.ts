import type { Website, CategoryConfigMap } from './websites';

export const websites: Website[] = [
  // TODO: 보험 관련 웹사이트를 추가할 예정입니다.
];

export const categoryConfig: CategoryConfigMap = {
  '설계사': { title: '설계사', icon: '👔', iconClass: 'icon-blue' },
  '자동차보험': { title: '자동차보험', icon: '🚗', iconClass: 'icon-red' },
};

export const categoryOrder = [
  '설계사',
  '자동차보험',
];
