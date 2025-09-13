// src/data/personas.ts
export interface PersonaItem {
  slug: string;
  title: string;
}

export interface PersonaCategory {
  slug: string;
  title: string;
  items: PersonaItem[];
}

export const personaCategories: PersonaCategory[] = [
  {
    slug: 'webdev',
    title: '웹개발',
    items: [
      { slug: 'student', title: '학생/입문' },
      { slug: 'junior-fe', title: '주니어 FE' },
      { slug: 'junior-be', title: '주니어 BE' },
      { slug: 'fullstack', title: '풀스택' },
      { slug: 'lead-architect', title: '리드/아키텍트' },
      { slug: 'job-seeker', title: '취업준비' },
    ],
  },
  {
    slug: 'mobile',
    title: '모바일/크로스플랫폼',
    items: [
      { slug: 'ios', title: 'iOS 네이티브' },
      { slug: 'android', title: 'Android 네이티브' },
      { slug: 'flutter', title: 'Flutter' },
      { slug: 'react-native', title: 'React Native' },
      { slug: 'game-unity', title: '게임(유니티)' },
      { slug: 'mobile-backend', title: '모바일 백엔드(BaaS)' },
      { slug: 'qa', title: 'QA' },
    ],
  },
  {
    slug: 'data-ai',
    title: '데이터/AI',
    items: [
      { slug: 'analyst', title: '데이터 분석가' },
      { slug: 'engineer', title: '데이터 엔지니어' },
      { slug: 'ml-engineer', title: 'ML 엔지니어' },
      { slug: 'researcher', title: '리서처/LLM' },
      { slug: 'data-pm', title: '데이터 PM' },
    ],
  },
  {
    slug: 'cloud',
    title: '클라우드/데브옵스/플랫폼',
    items: [
      { slug: 'sre', title: 'SRE' },
      { slug: 'platform-engineer', title: '플랫폼 엔지니어' },
      { slug: 'infra-network', title: '인프라/네트워크' },
      { slug: 'cloud-security', title: '클라우드 보안' },
      { slug: 'dba', title: 'DBA' },
      { slug: 'finops', title: 'FinOps' },
    ],
  },
  {
    slug: 'test-qa',
    title: '테스트/QA',
    items: [
      { slug: 'qa-engineer', title: 'QA 엔지니어' },
      { slug: 'test-automation', title: '테스트 자동화 엔지니어' },
      { slug: 'frontend-qa', title: '프론트엔드' },
      { slug: 'backend-qa', title: '백엔드' },
      { slug: 'mobile-qa', title: '모바일 QA' },
      { slug: 'performance-security', title: '성능/보안 테스터' },
    ],
  },
  {
    slug: 'security',
    title: '보안/시큐리티',
    items: [
      { slug: 'developer', title: '개발자' },
      { slug: 'sre-platform', title: 'SRE/플랫폼' },
      { slug: 'blue-team', title: '보안담당자(Blue)' },
      { slug: 'red-team', title: '레드팀/침투' },
      { slug: 'compliance', title: '컴플라이언스' },
    ],
  },
  {
    slug: 'product',
    title: '제품/기획',
    items: [
      { slug: 'pm-po', title: 'PM/PO' },
      { slug: 'data-pm-growth', title: '데이터 PM/그로스' },
      { slug: 'designer-collab', title: '프로덕트 디자이너 협업' },
      { slug: 'founder', title: '창업자' },
    ],
  },
  {
    slug: 'design',
    title: '디자인/UX·UI',
    items: [
      { slug: 'ux-designer', title: 'UX 디자이너' },
      { slug: 'ui-designer', title: 'UI/프로덕트 디자이너' },
      { slug: 'visual-branding', title: '비주얼/브랜딩' },
      { slug: 'motion-prototype', title: '모션/프로토타입' },
      { slug: 'handoff', title: '핸드오프(디자이너→개발자)' },
    ],
  },
  {
    slug: 'marketing',
    title: '콘텐츠/마케팅',
    items: [
      { slug: 'content-marketer', title: '콘텐츠 마케터' },
      { slug: 'performance-marketer', title: '퍼포먼스 마케터' },
      { slug: 'seo', title: 'SEO' },
      { slug: 'sns-community', title: 'SNS/커뮤니티' },
      { slug: 'crm-retention', title: 'CRM/리텐션' },
    ],
  },
  {
    slug: 'video',
    title: '영상/크리에이티브',
    items: [
      { slug: 'planning', title: '기획' },
      { slug: 'shooting', title: '촬영' },
      { slug: 'editing', title: '편집' },
      { slug: 'motion-cg', title: '모션/CG' },
      { slug: 'sound', title: '사운드' },
      { slug: 'youtube-distribution', title: '유튜브/배포' },
    ],
  },
  {
    slug: 'architecture',
    title: '건축/BIM/CAD/GIS',
    items: [
      { slug: 'student', title: '학생' },
      { slug: 'staff', title: '설계직원' },
    ],
  },
  {
    slug: 'embedded',
    title: '임베디드/IoT & 게임',
    items: [
      { slug: 'firmware-engineer', title: '펌웨어 엔지니어' },
      { slug: 'hardware-electronics', title: '하드웨어/전자' },
      { slug: 'rtos-communication', title: 'RTOS/통신' },
      { slug: 'iot-cloud', title: 'IoT 클라우드' },
      { slug: 'game-client', title: '게임 클라이언트' },
      { slug: 'game-server', title: '게임 서버/라이브Ops' },
    ],
  },
  {
    slug: 'realestate',
    title: '부동산',
    items: [
      { slug: 'student', title: '학생' },
      { slug: 'agent', title: '공인중개사' },
      { slug: 'tenant', title: '임차인' },
      { slug: 'landlord', title: '임대인' },
      { slug: 'investor', title: '투자자' },
    ],
  },
  {
    slug: 'stocks',
    title: '증권',
    items: [
      { slug: 'beginner', title: '입문 투자자' },
      { slug: 'long-value', title: '장기/가치' },
      { slug: 'growth-quant', title: '성장/퀀트' },
      { slug: 'trader', title: '단기/트레이더' },
      { slug: 'overseas', title: '해외' },
      { slug: 'derivatives', title: '파생/옵션' },
    ],
  },
  {
    slug: 'insurance',
    title: '보험',
    items: [
      { slug: 'consumer', title: '소비자' },
      { slug: 'planner-ga', title: '설계사/GA' },
      { slug: 'loss-assessor', title: '손해사정' },
      { slug: 'manager', title: '관리자' },
    ],
  },
];

export default personaCategories;
