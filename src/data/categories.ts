// src/data/categories.ts
import type { FieldCategory } from "../types";

export const categories: FieldCategory[] = [
  {
    slug: 'webdev',
    title: '웹개발',
    icon: '💻',
    description: '프론트엔드, 백엔드, 풀스택 자료',
    href: '/category/webdev',
  },
  {
    slug: 'data-ai',
    title: '데이터/AI',
    icon: '🤖',
    description: '데이터 분석과 인공지능',
    href: '/category/data-ai',
  },
  {
    slug: 'cloud',
    title: '클라우드/데브옵스/플랫폼',
    icon: '☁️',
    description: '클라우드와 DevOps 자료',
    href: '/category/cloud',
  },
  {
    slug: 'test-qa',
    title: '테스트/QA',
    icon: '🧪',
    description: '품질 보증과 테스트',
    href: '/category/test-qa',
  },
  {
    slug: 'security',
    title: '보안/시큐리티',
    icon: '🔐',
    description: '보안과 정보 보호',
    href: '/category/security',
  },
  {
    slug: 'product',
    title: '제품/기획',
    icon: '📝',
    description: '제품 기획 및 관리',
    href: '/category/product',
  },
  {
    slug: 'design',
    title: '디자인/UX·UI',
    icon: '🎨',
    description: '디자인과 UX·UI',
    href: '/category/design',
  },
  {
    slug: 'marketing',
    title: '콘텐츠/마케팅',
    icon: '📣',
    description: '콘텐츠 제작과 마케팅',
    href: '/category/marketing',
    order: 8,
  },
  {
    slug: 'accounting',
    title: '회계/세무',
    icon: '📊',
    description: '회계와 세무 자료',
    href: '/category/accounting',
    order: 9,
  },
  {
    slug: 'video',
    title: '영상/크리에이티브',
    icon: '🎥',
    description: '영상 및 크리에이티브',
    href: '/category/video',
  },
  {
    slug: 'architecture',
    title: '건축/BIM/CAD/GIS',
    icon: '🏛️',
    description: '공간·건축 관련 정보를 모았습니다',
    href: '/category/architecture',
  },
  {
    slug: 'wedding',
    title: '결혼',
    icon: '💒',
    description: '결혼 준비와 허니문',
    href: '/category/wedding',
  },
  {
    slug: 'realestate',
    title: '부동산',
    icon: '🏠',
    description: '부동산 관련 자료를 빠르게',
    href: '/category/realestate',
  },
  {
    slug: 'stocks',
    title: '증권',
    icon: '📈',
    description: '투자와 주식 정보를 확인',
    href: '/category/stocks',
  },
  {
    slug: 'insurance',
    title: '보험',
    icon: '🛡️',
    description: '보험(설계/GA) 관련 사이트',
    href: '/category/insurance',
  },
];

export default categories;
