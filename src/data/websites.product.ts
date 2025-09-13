import type { Website, CategoryConfigMap } from './websites';

export const websites: Website[] = [
  // ────── 제품 전략/로드맵 ──────
  { category: '제품 전략/로드맵', title: 'SVPG', url: 'https://www.svpg.com', description: '제품 리더십 블로그', id: 'PRD-STR-001' },
  { category: '제품 전략/로드맵', title: 'Mind the Product', url: 'https://www.mindtheproduct.com', description: 'PM 커뮤니티/이벤트', id: 'PRD-STR-002' },
  { category: '제품 전략/로드맵', title: 'ProductPlan', url: 'https://www.productplan.com', description: '로드맵 관리 도구', id: 'PRD-STR-003' },

  // ────── 사용자 조사 ──────
  { category: '사용자 조사', title: 'Typeform', url: 'https://www.typeform.com', description: '대화형 설문', id: 'PRD-RES-001' },
  { category: '사용자 조사', title: 'UserTesting', url: 'https://www.usertesting.com', description: '사용성 테스트 패널', id: 'PRD-RES-002' },
  { category: '사용자 조사', title: '네이버 폼', url: 'https://form.office.naver.com', description: '국내 설문 플랫폼', id: 'PRD-RES-003' },

  // ────── 협업/문서 ──────
  { category: '협업/문서', title: 'Notion', url: 'https://www.notion.so', description: '문서/제품 사양 관리', id: 'PRD-COL-001' },
  { category: '협업/문서', title: 'Confluence', url: 'https://www.atlassian.com/software/confluence', description: '팀 위키 협업', id: 'PRD-COL-002' },
  { category: '협업/문서', title: 'Productboard', url: 'https://www.productboard.com', description: '피드백 수집/우선순위', id: 'PRD-COL-003' },
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

