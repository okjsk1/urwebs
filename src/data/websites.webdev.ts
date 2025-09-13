import type { Website, CategoryConfigMap } from './websites';

export const websites: Website[] = [
  /* ───────── 웹개발: 문서/표준 ───────── */
  { category: "문서/표준", title: "MDN Web Docs", url: "https://developer.mozilla.org/", description: "HTML·CSS·JS 표준 문서", id: "WEB-DOC-001" },
  { category: "문서/표준", title: "DevDocs", url: "https://devdocs.io/", description: "다중 문서 통합 검색", id: "WEB-DOC-002" },
  { category: "문서/표준", title: "WHATWG HTML", url: "https://html.spec.whatwg.org/", description: "HTML Living Standard", id: "WEB-DOC-003" },
  { category: "문서/표준", title: "ECMAScript(ECMA-262)", url: "https://tc39.es/ecma262/", description: "JS 언어 명세", id: "WEB-DOC-004" },
  { category: "문서/표준", title: "Can I use", url: "https://caniuse.com/", description: "브라우저 호환성 표", id: "WEB-DOC-005" },
  { category: "문서/표준", title: "W3C Standards", url: "https://www.w3.org/standards/", description: "웹 표준 스펙", id: "WEB-DOC-006" },

  /* ───────── 웹개발: 프론트엔드 프레임워크 ───────── */
  { category: "프론트엔드", title: "React", url: "https://react.dev/", description: "컴포넌트 기반 UI", id: "WEB-FE-001" },
  { category: "프론트엔드", title: "Next.js", url: "https://nextjs.org/", description: "React 앱 프레임워크", id: "WEB-FE-002" },
  { category: "프론트엔드", title: "Vue.js", url: "https://vuejs.org/", description: "프로그레시브 프레임워크", id: "WEB-FE-003" },
  { category: "프론트엔드", title: "Nuxt", url: "https://nuxt.com/", description: "Vue 기반 풀스택", id: "WEB-FE-004" },
  { category: "프론트엔드", title: "Svelte", url: "https://svelte.dev/", description: "컴파일러 기반 UI", id: "WEB-FE-005" },
  { category: "프론트엔드", title: "SolidJS", url: "https://www.solidjs.com/", description: "고성능 반응성", id: "WEB-FE-006" },

  /* ───────── 웹개발: 백엔드/런타임 ───────── */
  { category: "백엔드/런타임", title: "Node.js", url: "https://nodejs.org/", description: "서버 사이드 JS 런타임", id: "WEB-BE-001" },
  { category: "백엔드/런타임", title: "Deno", url: "https://deno.com/", description: "보안 기본 JS/TS 런타임", id: "WEB-BE-002" },
  { category: "백엔드/런타임", title: "Bun", url: "https://bun.sh/", description: "초고속 JS 런타임", id: "WEB-BE-003" },
  { category: "백엔드/런타임", title: "Express", url: "https://expressjs.com/", description: "미들웨어 웹 프레임워크", id: "WEB-BE-004" },
  { category: "백엔드/런타임", title: "NestJS", url: "https://nestjs.com/", description: "타입스크립트 백엔드", id: "WEB-BE-005" },
  { category: "백엔드/런타임", title: "Koa", url: "https://koajs.com/", description: "경량 Node 웹 프레임워크", id: "WEB-BE-006" },

  /* ───────── 웹개발: 빌드/번들러 ───────── */
  { category: "빌드/번들러", title: "Vite", url: "https://vitejs.dev/", description: "차세대 프론트 빌드", id: "WEB-BLD-001" },
  { category: "빌드/번들러", title: "Webpack", url: "https://webpack.js.org/", description: "JS 번들러 표준", id: "WEB-BLD-002" },
  { category: "빌드/번들러", title: "Rollup", url: "https://rollupjs.org/", description: "라이브러리 번들링", id: "WEB-BLD-003" },
  { category: "빌드/번들러", title: "esbuild", url: "https://esbuild.github.io/", description: "초고속 번들러", id: "WEB-BLD-004" },
  { category: "빌드/번들러", title: "SWC", url: "https://swc.rs/", description: "Rust 기반 트랜스파일러", id: "WEB-BLD-005" },

  /* ───────── 웹개발: 패키지/레지스트리 ───────── */
  { category: "패키지/레지스트리", title: "npm", url: "https://www.npmjs.com/", description: "JS 패키지 레지스트리", id: "WEB-PKG-001" },
  { category: "패키지/레지스트리", title: "pnpm", url: "https://pnpm.io/", description: "고속 패키지 매니저", id: "WEB-PKG-002" },
  { category: "패키지/레지스트리", title: "Yarn", url: "https://yarnpkg.com/", description: "대안 패키지 매니저", id: "WEB-PKG-003" },
  { category: "패키지/레지스트리", title: "jsDelivr", url: "https://www.jsdelivr.com/", description: "CDN 패키지 배포", id: "WEB-PKG-004" },
  { category: "패키지/레지스트리", title: "unpkg", url: "https://unpkg.com/", description: "npm CDN 뷰어", id: "WEB-PKG-005" },

  /* ───────── 웹개발: 테스트 ───────── */
  { category: "테스트", title: "Jest", url: "https://jestjs.io/", description: "JS 단위 테스트", id: "WEB-TST-001" },
  { category: "테스트", title: "Vitest", url: "https://vitest.dev/", description: "Vite 네이티브 테스트", id: "WEB-TST-002" },
  { category: "테스트", title: "Playwright", url: "https://playwright.dev/", description: "멀티브라우저 E2E", id: "WEB-TST-003" },
  { category: "테스트", title: "Cypress", url: "https://www.cypress.io/", description: "웹 E2E 테스트", id: "WEB-TST-004" },
  { category: "테스트", title: "Testing Library", url: "https://testing-library.com/", description: "접근성 중심 테스트", id: "WEB-TST-005" },

  /* ───────── 웹개발: 품질/코드 ───────── */
  { category: "품질/코드", title: "ESLint", url: "https://eslint.org/", description: "JS/TS 린팅", id: "WEB-QLT-001" },
  { category: "품질/코드", title: "Prettier", url: "https://prettier.io/", description: "코드 포매터", id: "WEB-QLT-002" },
  { category: "품질/코드", title: "TypeScript", url: "https://www.typescriptlang.org/", description: "타입 시스템", id: "WEB-QLT-003" },
  { category: "품질/코드", title: "Lighthouse", url: "https://developer.chrome.com/docs/lighthouse/", description: "성능/품질 측정", id: "WEB-QLT-004" },
  { category: "품질/코드", title: "Web.dev", url: "https://web.dev/", description: "웹 성능·PWA 가이드", id: "WEB-QLT-005" },

  /* ───────── 웹개발: 배포/호스팅 ───────── */
  { category: "배포/호스팅", title: "Vercel", url: "https://vercel.com/", description: "프론트엔드 호스팅", id: "WEB-DEP-001" },
  { category: "배포/호스팅", title: "Netlify", url: "https://www.netlify.com/", description: "정적/풀스택 배포", id: "WEB-DEP-002" },
  { category: "배포/호스팅", title: "Cloudflare Pages", url: "https://pages.cloudflare.com/", description: "글로벌 엣지 배포", id: "WEB-DEP-003" },
  { category: "배포/호스팅", title: "GitHub Pages", url: "https://pages.github.com/", description: "정적 사이트 호스팅", id: "WEB-DEP-004" },
  { category: "배포/호스팅", title: "Render", url: "https://render.com/", description: "웹서비스/DB 호스팅", id: "WEB-DEP-005" },

  /* ───────── 웹개발: 디자인/CSS ───────── */
  { category: "디자인/CSS", title: "Tailwind CSS", url: "https://tailwindcss.com/docs", description: "유틸리티 퍼스트 CSS", id: "WEB-CSS-001" },
  { category: "디자인/CSS", title: "CSS-Tricks(아카이브)", url: "https://css-tricks.com/", description: "CSS 팁/패턴", id: "WEB-CSS-002" },
  { category: "디자인/CSS", title: "Material Design", url: "https://m3.material.io/", description: "구글 디자인 시스템", id: "WEB-CSS-003" },
  { category: "디자인/CSS", title: "Bootstrap", url: "https://getbootstrap.com/", description: "UI 컴포넌트 프레임워크", id: "WEB-CSS-004" },
  { category: "디자인/CSS", title: "Radix UI", url: "https://www.radix-ui.com/", description: "접근성 우선 컴포넌트", id: "WEB-CSS-005" },

  /* ───────── 웹개발: 아이콘/에셋 ───────── */
  { category: "아이콘/에셋", title: "Heroicons", url: "https://heroicons.com", description: "Tailwind 팀의 아이콘", id: "WEB-ICO-001" },
  { category: "아이콘/에셋", title: "Lucide", url: "https://lucide.dev", description: "오픈소스 아이콘 세트", id: "WEB-ICO-002" },
  { category: "아이콘/에셋", title: "Iconify", url: "https://icon-sets.iconify.design", description: "수천 종 아이콘 통합", id: "WEB-ICO-003" },
  { category: "아이콘/에셋", title: "Phosphor Icons", url: "https://phosphoricons.com", description: "가변 굵기 아이콘", id: "WEB-ICO-004" },
  { category: "아이콘/에셋", title: "SVG Repo", url: "https://www.svgrepo.com", description: "무료 SVG 모음", id: "WEB-ICO-005" },

  /* ───────── 웹개발: 네트워킹/상태/폼 ───────── */
  { category: "네트워킹/상태/폼", title: "Axios", url: "https://axios-http.com", description: "HTTP 클라이언트", id: "WEB-NET-001" },
  { category: "네트워킹/상태/폼", title: "TanStack Query", url: "https://tanstack.com/query", description: "서버 상태 관리", id: "WEB-NET-002" },
  { category: "네트워킹/상태/폼", title: "Redux Toolkit", url: "https://redux-toolkit.js.org", description: "Redux 상태 관리", id: "WEB-NET-003" },
  { category: "네트워킹/상태/폼", title: "React Hook Form", url: "https://react-hook-form.com", description: "React 폼 라이브러리", id: "WEB-NET-004" },
  { category: "네트워킹/상태/폼", title: "Zod", url: "https://zod.dev", description: "타입 안전 스키마", id: "WEB-NET-005" },

  /* ───────── 웹개발: 데이터 시각화 ───────── */
  { category: "데이터 시각화", title: "D3.js", url: "https://d3js.org", description: "강력한 데이터 시각화", id: "WEB-DV-001" },
  { category: "데이터 시각화", title: "Recharts", url: "https://recharts.org", description: "React 차트 라이브러리", id: "WEB-DV-002" },
  { category: "데이터 시각화", title: "Chart.js", url: "https://www.chartjs.org", description: "간단한 차트", id: "WEB-DV-003" },
  { category: "데이터 시각화", title: "ECharts", url: "https://echarts.apache.org", description: "대용량 인터랙티브 차트", id: "WEB-DV-004" },
  { category: "데이터 시각화", title: "Visx", url: "https://airbnb.io/visx", description: "D3와 React 유틸", id: "WEB-DV-005" },

  /* ───────── 웹개발: 샌드박스/플레이그라운드 ───────── */
  { category: "샌드박스/플레이그라운드", title: "CodeSandbox", url: "https://codesandbox.io", description: "온라인 코드 샌드박스", id: "WEB-SBX-001" },
  { category: "샌드박스/플레이그라운드", title: "StackBlitz", url: "https://stackblitz.com", description: "브라우저 기반 IDE", id: "WEB-SBX-002" },
  { category: "샌드박스/플레이그라운드", title: "CodePen", url: "https://codepen.io", description: "프론트엔드 실험", id: "WEB-SBX-003" },

  /* ───────── 웹개발: 디버깅/개발자도구 ───────── */
  { category: "디버깅/개발자도구", title: "Chrome DevTools", url: "https://developer.chrome.com/docs/devtools", description: "크롬 개발자 도구", id: "WEB-DBG-001" },
  { category: "디버깅/개발자도구", title: "React DevTools", url: "https://react.dev/learn/react-developer-tools", description: "React 컴포넌트 디버깅", id: "WEB-DBG-002" },

  /* ───────── 웹개발: 학습/커뮤니티 ───────── */
  { category: "학습/커뮤니티", title: "freeCodeCamp", url: "https://www.freecodecamp.org/", description: "무료 코딩 코스", id: "WEB-LRN-001" },
  { category: "학습/커뮤니티", title: "Stack Overflow", url: "https://stackoverflow.com/", description: "개발 Q&A 커뮤니티", id: "WEB-LRN-002" },
  { category: "학습/커뮤니티", title: "dev.to", url: "https://dev.to/", description: "개발 아티클 커뮤니티", id: "WEB-LRN-003" },
  { category: "학습/커뮤니티", title: "Frontend Mentor", url: "https://www.frontendmentor.io/", description: "실전 UI 과제", id: "WEB-LRN-004" },
  { category: "학습/커뮤니티", title: "Roadmap.sh", url: "https://roadmap.sh/", description: "직무별 로드맵", id: "WEB-LRN-005" },

  /* ───────── 웹개발: 국내/레퍼런스 ───────── */
  { category: "국내/레퍼런스", title: "NAVER D2", url: "https://d2.naver.com/home", description: "국내 대표 개발 블로그", id: "WEB-KR-001" },
  { category: "국내/레퍼런스", title: "Kakao Tech", url: "https://tech.kakao.com/", description: "카카오 기술 블로그", id: "WEB-KR-002" },
  { category: "국내/레퍼런스", title: "NHN Toast UI", url: "https://ui.toast.com/", description: "오픈소스 UI 컴포넌트", id: "WEB-KR-003" },
  { category: "국내/레퍼런스", title: "LINE Engineering", url: "https://engineering.linecorp.com/ko", description: "라인 엔지니어링", id: "WEB-KR-004" },
  { category: "국내/레퍼런스", title: "Inflearn", url: "https://www.inflearn.com/", description: "국내 개발 강의 플랫폼", id: "WEB-KR-005" }
];

export const categoryConfig: CategoryConfigMap = {
  '문서/표준': { title: '문서/표준', icon: '📘', iconClass: 'icon-blue' },
  '프론트엔드': { title: '프론트엔드', icon: '🖥️', iconClass: 'icon-green' },
  '백엔드/런타임': { title: '백엔드/런타임', icon: '🛠️', iconClass: 'icon-red' },
  '빌드/번들러': { title: '빌드/번들러', icon: '⚙️', iconClass: 'icon-orange' },
  '패키지/레지스트리': { title: '패키지/레지스트리', icon: '📦', iconClass: 'icon-yellow' },
  '테스트': { title: '테스트', icon: '🧪', iconClass: 'icon-purple' },
  '품질/코드': { title: '품질/코드', icon: '✅', iconClass: 'icon-teal' },
  '배포/호스팅': { title: '배포/호스팅', icon: '🚀', iconClass: 'icon-indigo' },
  '디자인/CSS': { title: '디자인/CSS', icon: '🎨', iconClass: 'icon-red' },
  '아이콘/에셋': { title: '아이콘/에셋', icon: '🖼️', iconClass: 'icon-orange' },
  '네트워킹/상태/폼': { title: '네트워킹/상태/폼', icon: '🔗', iconClass: 'icon-teal' },
  '데이터 시각화': { title: '데이터 시각화', icon: '📊', iconClass: 'icon-yellow' },
  '샌드박스/플레이그라운드': { title: '샌드박스/플레이그라운드', icon: '🧩', iconClass: 'icon-green' },
  '디버깅/개발자도구': { title: '디버깅/개발자도구', icon: '🐞', iconClass: 'icon-gray' },
  '학습/커뮤니티': { title: '학습/커뮤니티', icon: '👥', iconClass: 'icon-gray' },
  '국내/레퍼런스': { title: '국내/레퍼런스', icon: '🇰🇷', iconClass: 'icon-blue' },
};

export const categoryOrder = [
  '문서/표준',
  '프론트엔드',
  '백엔드/런타임',
  '빌드/번들러',
  '패키지/레지스트리',
  '테스트',
  '품질/코드',
  '배포/호스팅',
  '디자인/CSS',
  '아이콘/에셋',
  '네트워킹/상태/폼',
  '데이터 시각화',
  '샌드박스/플레이그라운드',
  '디버깅/개발자도구',
  '학습/커뮤니티',
  '국내/레퍼런스',
];
