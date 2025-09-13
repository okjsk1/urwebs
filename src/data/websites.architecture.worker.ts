import type { Website, CategoryConfigMap } from './websites';

export const websites: Website[] = [
  {
    category: '디자인',
    title: '아키데일리',
    url: 'https://www.archdaily.com',
    description: '세계 최대 건축 아카이브',
    id: 'AR-WK-DESIGN-001',
  },
  {
    category: '디자인',
    title: '디즌',
    url: 'https://www.dezeen.com',
    description: '건축·디자인 트렌드',
    id: 'AR-WK-DESIGN-002',
  },
  {
    category: '법규',
    title: '국가법령정보센터',
    url: 'https://www.law.go.kr',
    description: '건축법·시행령·해설',
    id: 'AR-WK-LAW-001',
  },
  {
    category: '법규',
    title: '국토법령정보센터',
    url: 'https://www.luris.go.kr',
    description: '국토계획·용도지역 안내',
    id: 'AR-WK-LAW-002',
  },
  {
    category: '행정',
    title: '세움터',
    url: 'https://www.eais.go.kr',
    description: '인허가·대장·행정',
    id: 'AR-WK-ADM-001',
  },
  {
    category: '행정',
    title: '정부24',
    url: 'https://www.gov.kr',
    description: '민원·행정 서비스',
    id: 'AR-WK-ADM-002',
  },
  {
    category: '프로그램',
    title: 'AutoCAD',
    url: 'https://www.autodesk.com/products/autocad',
    description: '대표 CAD 소프트웨어',
    id: 'AR-WK-PROG-001',
  },
  {
    category: '프로그램',
    title: 'Revit',
    url: 'https://www.autodesk.com/products/revit',
    description: 'BIM 설계 도구',
    id: 'AR-WK-PROG-002',
  },
];

export const categoryConfig: CategoryConfigMap = {
  design: { title: '디자인', icon: '🎨', iconClass: 'icon-blue' },
  law: { title: '법규', icon: '⚖️', iconClass: 'icon-green' },
  admin: { title: '행정', icon: '🗂️', iconClass: 'icon-yellow' },
  program: { title: '프로그램', icon: '💻', iconClass: 'icon-purple' },
};

export const categoryOrder = ['design', 'law', 'admin', 'program'];

