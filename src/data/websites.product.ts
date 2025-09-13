import type { Website, CategoryConfigMap } from './websites';

export const websites: Website[] = [
  // ────── 제품 전략/로드맵 ──────
  { category: '제품 전략/로드맵', title: 'SVPG', url: 'https://www.svpg.com', description: '제품 리더십 블로그', id: 'PRD-STR-001' },
  { category: '제품 전략/로드맵', title: 'Mind the Product', url: 'https://www.mindtheproduct.com', description: 'PM 커뮤니티/이벤트', id: 'PRD-STR-002' },
  { category: '제품 전략/로드맵', title: 'ProductPlan', url: 'https://www.productplan.com', description: '로드맵 관리 도구', id: 'PRD-STR-003' },
  { category: '제품 전략/로드맵', title: 'Product Coalition', url: 'https://productcoalition.com', description: 'PM 인사이트 컬렉션', id: 'PRD-STR-004' },
  { category: '제품 전략/로드맵', title: 'Aha! Roadmaps', url: 'https://www.aha.io', description: '제품 로드맵 SaaS', id: 'PRD-STR-005' },

  // ────── 사용자 조사 ──────
  { category: '사용자 조사', title: 'Typeform', url: 'https://www.typeform.com', description: '대화형 설문', id: 'PRD-RES-001' },
  { category: '사용자 조사', title: 'UserTesting', url: 'https://www.usertesting.com', description: '사용성 테스트 패널', id: 'PRD-RES-002' },
  { category: '사용자 조사', title: '네이버 폼', url: 'https://form.office.naver.com', description: '국내 설문 플랫폼', id: 'PRD-RES-003' },
  { category: '사용자 조사', title: 'SurveyMonkey', url: 'https://www.surveymonkey.com', description: '온라인 설문 서비스', id: 'PRD-RES-004' },
  { category: '사용자 조사', title: 'UsabilityHub', url: 'https://usabilityhub.com', description: '빠른 사용자 테스트', id: 'PRD-RES-005' },

  // ────── 협업/문서 ──────
  { category: '협업/문서', title: 'Notion', url: 'https://www.notion.so', description: '문서/제품 사양 관리', id: 'PRD-COL-001' },
  { category: '협업/문서', title: 'Confluence', url: 'https://www.atlassian.com/software/confluence', description: '팀 위키 협업', id: 'PRD-COL-002' },
  { category: '협업/문서', title: 'Productboard', url: 'https://www.productboard.com', description: '피드백 수집/우선순위', id: 'PRD-COL-003' },
  { category: '협업/문서', title: 'Miro', url: 'https://miro.com', description: '온라인 화이트보드 협업', id: 'PRD-COL-004' },
  { category: '협업/문서', title: 'Coda', url: 'https://coda.io', description: '문서·스프레드시트 통합', id: 'PRD-COL-005' },
];

export const categoryConfig: CategoryConfigMap = {
  '제품 전략/로드맵': { title: '제품 전략/로드맵', icon: '🧭', iconClass: 'icon-blue' },
  '사용자 조사': { title: '사용자 조사', icon: '🔍', iconClass: 'icon-yellow' },
  '협업/문서': { title: '협업/문서', icon: '📄', iconClass: 'icon-green' },
};

export const categoryOrder = [
  '제품 전략/로드맵',
  '사용자 조사',
  '협업/문서',
];

