import type { Website, CategoryConfigMap } from './websites';

export const websites: Website[] = [
  // ───────── UX 리서처 ─────────
  { category: '방법론/원칙', title: 'Nielsen Norman Group', url: 'https://www.nngroup.com', description: 'UX 리서치/사용성', id: 'DES-MTH-001' },
  { category: '방법론/원칙', title: 'GOV.UK Service Manual', url: 'https://www.gov.uk/service-manual', description: '실무 지침', id: 'DES-MTH-002' },
  { category: '방법론/원칙', title: 'MeasuringU', url: 'https://measuringu.com', description: '통계/측정', id: 'DES-MTH-003' },

  { category: '접근성(A11y)', title: 'WAI-ARIA APG', url: 'https://www.w3.org/WAI/ARIA/apg/', description: '컴포넌트 패턴', id: 'DES-A11Y-001' },
  { category: '접근성(A11y)', title: 'WebAIM', url: 'https://webaim.org', description: '체크리스트/기사', id: 'DES-A11Y-002' },
  { category: '접근성(A11y)', title: 'a11yproject', url: 'https://www.a11yproject.com', description: '실무 팁 모음', id: 'DES-A11Y-003' },

  { category: '리서치 도구/패널', title: 'Google Forms', url: 'https://forms.google.com', description: '설문/스크리닝', id: 'DES-RSCH-001' },
  { category: '리서치 도구/패널', title: 'Maze', url: 'https://maze.co', description: '원격 테스트/설문', id: 'DES-RSCH-002' },
  { category: '리서치 도구/패널', title: 'Useberry', url: 'https://useberry.com', description: '프로토타입 테스트', id: 'DES-RSCH-003' },

  // ───────── UI 디자인/디자인 시스템 ─────────
  { category: '레퍼런스/가이드', title: 'Material Design', url: 'https://m3.material.io', description: '컴포넌트/토큰', id: 'DES-REF-001' },
  { category: '레퍼런스/가이드', title: 'Human Interface Guidelines', url: 'https://developer.apple.com/design/human-interface-guidelines/', description: '애플 가이드', id: 'DES-REF-002' },
  { category: '레퍼런스/가이드', title: 'Atlassian Design System', url: 'https://atlassian.design', description: '모범 사례', id: 'DES-REF-003' },

  { category: '아이콘/폰트·에셋', title: 'Google Fonts', url: 'https://fonts.google.com', description: '웹폰트', id: 'DES-ASSET-001' },
  { category: '아이콘/폰트·에셋', title: 'Heroicons', url: 'https://heroicons.com', description: '무료 아이콘', id: 'DES-ASSET-002' },
  { category: '아이콘/폰트·에셋', title: 'Phosphor Icons', url: 'https://phosphoricons.com', description: '다양한 스타일', id: 'DES-ASSET-003' },

  { category: '디자인 시스템 운영', title: 'Storybook', url: 'https://storybook.js.org', description: '컴포넌트 카탈로그', id: 'DES-DS-001' },
  { category: '디자인 시스템 운영', title: 'Zeroheight', url: 'https://zeroheight.com', description: '문서화 플랫폼', id: 'DES-DS-002' },
  { category: '디자인 시스템 운영', title: 'Figma Tokens 플러그인', url: 'https://www.figma.com/community', description: '토큰 관리', id: 'DES-DS-003' },

  // ───────── 프로토타이핑/핸드오프 ─────────
  { category: '프로토타입 도구', title: 'Figma', url: 'https://www.figma.com', description: '협업 디자인/프로토', id: 'DES-PROTO-001' },
  { category: '프로토타입 도구', title: 'Framer', url: 'https://www.framer.com', description: '인터랙션·웹 퍼블리시', id: 'DES-PROTO-002' },
  { category: '프로토타입 도구', title: 'ProtoPie', url: 'https://www.protopie.io', description: '고급 인터랙션', id: 'DES-PROTO-003' },

  { category: '핸드오프/협업', title: 'Zeplin', url: 'https://zeplin.io', description: '스펙/어셋 전달', id: 'DES-HO-001' },
  { category: '핸드오프/협업', title: 'Avocode', url: 'https://avocode.com', description: '디자인-개발 협업', id: 'DES-HO-002' },
  { category: '핸드오프/협업', title: 'Notion', url: 'https://www.notion.so', description: '문서/디자인 결정 기록', id: 'DES-HO-003' },

  { category: '영감/패턴 갤러리', title: 'Mobbin', url: 'https://mobbin.com', description: '앱 UI 패턴', id: 'DES-INSP-001' },
  { category: '영감/패턴 갤러리', title: 'Behance', url: 'https://www.behance.net', description: '포트폴리오/트렌드', id: 'DES-INSP-002' },
  { category: '영감/패턴 갤러리', title: 'Landbook', url: 'https://land-book.com', description: '랜딩페이지 사례', id: 'DES-INSP-003' },
];

export const categoryConfig: CategoryConfigMap = {
  '방법론/원칙': { title: '방법론/원칙', icon: '📚', iconClass: 'icon-blue' },
  '접근성(A11y)': { title: '접근성(A11y)', icon: '♿', iconClass: 'icon-green' },
  '리서치 도구/패널': { title: '리서치 도구/패널', icon: '🔬', iconClass: 'icon-yellow' },
  '레퍼런스/가이드': { title: '레퍼런스/가이드', icon: '🧭', iconClass: 'icon-indigo' },
  '아이콘/폰트·에셋': { title: '아이콘/폰트·에셋', icon: '🖼️', iconClass: 'icon-orange' },
  '디자인 시스템 운영': { title: '디자인 시스템 운영', icon: '🛠️', iconClass: 'icon-red' },
  '프로토타입 도구': { title: '프로토타입 도구', icon: '🎛️', iconClass: 'icon-teal' },
  '핸드오프/협업': { title: '핸드오프/협업', icon: '🤝', iconClass: 'icon-green' },
  '영감/패턴 갤러리': { title: '영감/패턴 갤러리', icon: '✨', iconClass: 'icon-purple' },
};

export const categoryOrder = [
  '방법론/원칙',
  '접근성(A11y)',
  '리서치 도구/패널',
  '레퍼런스/가이드',
  '아이콘/폰트·에셋',
  '디자인 시스템 운영',
  '프로토타입 도구',
  '핸드오프/협업',
  '영감/패턴 갤러리',
];

