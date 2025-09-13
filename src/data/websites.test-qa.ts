import type { Website, CategoryConfigMap } from './websites';

export const websites: Website[] = [
  // ─────── 테스트 프레임워크 ───────
  { category: '테스트 프레임워크', title: 'Selenium', url: 'https://www.selenium.dev', description: '웹 자동화 테스트', id: 'QA-FRM-001' },
  { category: '테스트 프레임워크', title: 'Cypress', url: 'https://docs.cypress.io', description: '프론트엔드 테스트 도구', id: 'QA-FRM-002' },
  { category: '테스트 프레임워크', title: 'Playwright', url: 'https://playwright.dev', description: 'MS 오픈소스 E2E', id: 'QA-FRM-003' },

  // ─────── 버그 트래킹 ───────
  { category: '버그 트래킹', title: 'Jira', url: 'https://www.atlassian.com/software/jira', description: '이슈 및 버그 관리', id: 'QA-BUG-001' },
  { category: '버그 트래킹', title: 'Redmine', url: 'https://www.redmine.org', description: '오픈소스 이슈 추적', id: 'QA-BUG-002' },
  { category: '버그 트래킹', title: 'GitHub Issues', url: 'https://github.com', description: '코드와 함께 버그 관리', id: 'QA-BUG-003' },

  // ─────── QA 커뮤니티 ───────
  { category: 'QA 커뮤니티', title: 'QA 프로페셔널', url: 'https://cafe.naver.com/qaengineer', description: '국내 QA 커뮤니티', id: 'QA-COM-001' },
  { category: 'QA 커뮤니티', title: 'Software Testing Club', url: 'https://club.ministryoftesting.com', description: '국제 QA 포럼', id: 'QA-COM-002' },
  { category: 'QA 커뮤니티', title: 'Stack Overflow', url: 'https://stackoverflow.com/questions/tagged/testing', description: '테스트 관련 Q&A', id: 'QA-COM-003' },
];

export const categoryConfig: CategoryConfigMap = {
  '테스트 프레임워크': { title: '테스트 프레임워크', icon: '🧪', iconClass: 'icon-blue' },
  '버그 트래킹': { title: '버그 트래킹', icon: '🐞', iconClass: 'icon-red' },
  'QA 커뮤니티': { title: 'QA 커뮤니티', icon: '👥', iconClass: 'icon-green' },
};

export const categoryOrder = [
  '테스트 프레임워크',
  '버그 트래킹',
  'QA 커뮤니티',
];

