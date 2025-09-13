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
    slug: 'mobile',
    title: '모바일/크로스플랫폼',
    icon: '📱',
    description: '앱 개발과 크로스플랫폼',
  },
  {
    slug: 'data-ai',
    title: '데이터/AI',
    icon: '🤖',
    description: '데이터 분석과 인공지능',
  },
  {
    slug: 'cloud',
    title: '클라우드/데브옵스/플랫폼',
    icon: '☁️',
    description: '클라우드와 DevOps 자료',
  },
  {
    slug: 'test-qa',
    title: '테스트/QA',
    icon: '🧪',
    description: '품질 보증과 테스트',
  },
  {
    slug: 'security',
    title: '보안/시큐리티',
    icon: '🔐',
    description: '보안과 정보 보호',
  },
  {
    slug: 'product',
    title: '제품/기획',
    icon: '📝',
    description: '제품 기획 및 관리',
  },
  {
    slug: 'design',
    title: '디자인/UX·UI',
    icon: '🎨',
    description: '디자인과 UX·UI',
  },
  {
    slug: 'marketing',
    title: '콘텐츠/마케팅',
    icon: '📣',
    description: '콘텐츠 제작과 마케팅',
  },
  {
    slug: 'video',
    title: '영상/크리에이티브',
    icon: '🎥',
    description: '영상 및 크리에이티브',
  },
  {
    slug: 'architecture',
    title: '건축/BIM/CAD/GIS',
    icon: '🏛️',
    description: '공간·건축 관련 정보를 모았습니다',
    href: '/category/architecture',
  },
  {
    slug: 'embedded',
    title: '임베디드/IoT & 게임',
    icon: '🎮',
    description: '임베디드와 게임 개발',
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
