import type { Website, CategoryConfigMap } from './websites';

export const websites: Website[] = [
  {
    category: '법규/코드',
    title: '국가법령정보센터',
    url: 'https://www.law.go.kr',
    description: '건축법/시행령·규칙/행정해석 통합 열람',
    id: 'AR-WK-CODE-001',
  },
  {
    category: '법규/코드',
    title: '국토부 건설기준 통합(KDS/KCS) 공고',
    url: 'https://www.molit.go.kr',
    description: '설계코드·시방코드 체계 안내',
    id: 'AR-WK-CODE-002',
  },
  {
    category: '법규/코드',
    title: '국가건설기준센터(KCSC)',
    url: 'https://www.kcsc.re.kr',
    description: 'KDS·KCS 최신본/검색',
    id: 'AR-WK-CODE-003',
  },

  {
    category: '인허가/대지·규제',
    title: '세움터(건축행정시스템)',
    url: 'https://www.eais.go.kr',
    description: '건축 인허가/민원/대장 열람',
    id: 'AR-WK-PERMIT-001',
  },
  {
    category: '인허가/대지·규제',
    title: '토지이음(LURIS)',
    url: 'https://www.eum.go.kr',
    description: '용도지역·행위제한, 질의회신 사례',
    id: 'AR-WK-PERMIT-002',
  },
  {
    category: '인허가/대지·규제',
    title: '국토정보플랫폼(NGII)',
    url: 'https://www.ngii.go.kr',
    description: '지적/항공사진/정사영상 지도',
    id: 'AR-WK-PERMIT-003',
  },

  {
    category: '지적·지도/공간정보',
    title: '바로e맵(국토지리정보원)',
    url: 'https://www.ngii.go.kr',
    description: '1:5,000 등 각종 지도의 PDF 제공',
    id: 'AR-WK-GIS-001',
  },
  {
    category: '지적·지도/공간정보',
    title: '국가공간정보포털',
    url: 'https://data.go.kr',
    description: '수치지도/공간데이터 다운로드',
    id: 'AR-WK-GIS-002',
  },
  {
    category: '지적·지도/공간정보',
    title: '국토정보플랫폼 이용가이드',
    url: 'https://blog.naver.com',
    description: '수치지형도 다운 절차 요약',
    id: 'AR-WK-GIS-003',
  },

  {
    category: '설계 레퍼런스/매거진',
    title: '월간 SPACE',
    url: 'https://vmspace.com',
    description: '한국 대표 건축저널(1966~)',
    id: 'AR-WK-REF-001',
  },
  {
    category: '설계 레퍼런스/매거진',
    title: 'C3KOREA',
    url: 'https://en.c3zine.com',
    description: '한국 건축 큐레이션',
    id: 'AR-WK-REF-002',
  },
  {
    category: '설계 레퍼런스/매거진',
    title: 'C3GLOBE',
    url: 'https://c3globe.com',
    description: '글로벌 건축 큐레이션',
    id: 'AR-WK-REF-003',
  },
  {
    category: '설계 레퍼런스/매거진',
    title: '월간 건축세계(Archiworld)',
    url: 'https://www.archiworld1995.com',
    description: '국내외 사례/인터뷰',
    id: 'AR-WK-REF-004',
  },

  {
    category: '자재·사양/인증',
    title: 'NBS Source',
    url: 'https://source.thenbs.com',
    description: '제품 스펙·성능 데이터',
    id: 'AR-WK-MAT-001',
  },
  {
    category: '자재·사양/인증',
    title: 'BIMobject',
    url: 'https://www.bimobject.com',
    description: '제조사 BIM 객체/사양',
    id: 'AR-WK-MAT-002',
  },
  {
    category: '자재·사양/인증',
    title: '국가기술표준원(KATS)',
    url: 'https://www.kats.go.kr',
    description: 'KS·제품인증 안내',
    id: 'AR-WK-MAT-003',
  },

  {
    category: 'BIM/협업',
    title: 'Revit Help',
    url: 'https://help.autodesk.com/view/RVT',
    description: '공식 매뉴얼/패밀리 가이드',
    id: 'AR-WK-BIM-001',
  },
  {
    category: 'BIM/협업',
    title: 'Archicad Resources',
    url: 'https://graphisoft.com/resources',
    description: '튜토리얼/핸드북',
    id: 'AR-WK-BIM-002',
  },
  {
    category: 'BIM/협업',
    title: 'Navisworks Docs',
    url: 'https://help.autodesk.com/view/NAV',
    description: '충돌검토/코디네이션',
    id: 'AR-WK-BIM-003',
  },

  {
    category: '시공·감리/안전·품질',
    title: 'KCS 표준시방(국가건설기준센터)',
    url: 'https://www.kcsc.re.kr',
    description: '건축공사 표준시방·해설',
    id: 'AR-WK-CONST-001',
  },
  {
    category: '시공·감리/안전·품질',
    title: '국토안전관리원',
    url: 'https://www.kalis.or.kr',
    description: '시설물 안전점검·지침',
    id: 'AR-WK-CONST-002',
  },
  {
    category: '시공·감리/안전·품질',
    title: '안전보건공단(KOSHA)',
    url: 'https://www.kosha.or.kr',
    description: '건설안전 가이드/사례',
    id: 'AR-WK-CONST-003',
  },

  {
    category: '비용·견적/물량산출',
    title: '국토부 표준품셈 공고',
    url: 'https://www.molit.go.kr',
    description: '연도별 품셈 고시',
    id: 'AR-WK-COST-001',
  },
  {
    category: '비용·견적/물량산출',
    title: '대한건설협회 공사비지수',
    url: 'https://www.cak.or.kr',
    description: '공사비 동향·지수',
    id: 'AR-WK-COST-002',
  },
  {
    category: '비용·견적/물량산출',
    title: '한국물가정보',
    url: 'https://www.iloveprice.co.kr',
    description: '자재·노무 단가(참고/유료)',
    id: 'AR-WK-COST-003',
  },

  {
    category: '부동산/실거래·건축물대장',
    title: '실거래가 공개시스템(국토부)',
    url: 'https://rt.molit.go.kr',
    description: '토지·주거·업무 실거래가',
    id: 'AR-WK-RE-001',
  },
  {
    category: '부동산/실거래·건축물대장',
    title: '정부24 건축물대장 발급/열람',
    url: 'https://www.gov.kr',
    description: '공식 민원 서비스',
    id: 'AR-WK-RE-002',
  },
  {
    category: '부동산/실거래·건축물대장',
    title: '서울부동산정보광장',
    url: 'https://land.seoul.go.kr',
    description: '서울 실거래 조회',
    id: 'AR-WK-RE-003',
  },

  {
    category: '정책·연구/공모·학회',
    title: '건축공간연구원(AURI)',
    url: 'https://www.auri.re.kr',
    description: '정책 연구/동향·아카이브',
    id: 'AR-WK-POL-001',
  },
  {
    category: '정책·연구/공모·학회',
    title: 'AURUM',
    url: 'https://www.aurum.re.kr',
    description: 'AURI 아카이브',
    id: 'AR-WK-POL-002',
  },
  {
    category: '정책·연구/공모·학회',
    title: '대한건축학회(AIK)',
    url: 'https://www.aik.or.kr',
    description: '학술/행사/논문',
    id: 'AR-WK-POL-003',
  },
  {
    category: '정책·연구/공모·학회',
    title: '대한건축사협회(KIRA)',
    url: 'https://www.kira.or.kr',
    description: '회원지원/입찰·업무대가/교육',
    id: 'AR-WK-POL-004',
  },
];

export const categoryConfig: CategoryConfigMap = {
  code: { title: '법규/코드', icon: '⚖️', iconClass: 'icon-green' },
  permit: { title: '인허가/대지·규제', icon: '📝', iconClass: 'icon-yellow' },
  gis: { title: '지적·지도/공간정보', icon: '🗺️', iconClass: 'icon-teal' },
  reference: { title: '설계 레퍼런스/매거진', icon: '📚', iconClass: 'icon-purple' },
  materials: { title: '자재·사양/인증', icon: '🧱', iconClass: 'icon-red' },
  bim: { title: 'BIM/협업', icon: '🏗️', iconClass: 'icon-blue' },
  construction: { title: '시공·감리/안전·품질', icon: '🚧', iconClass: 'icon-orange' },
  cost: { title: '비용·견적/물량산출', icon: '💰', iconClass: 'icon-indigo' },
  realestate: { title: '부동산/실거래·건축물대장', icon: '🏠', iconClass: 'icon-green' },
  policy: { title: '정책·연구/공모·학회', icon: '📑', iconClass: 'icon-gray' },
};

export const categoryOrder = [
  'code',
  'permit',
  'gis',
  'reference',
  'materials',
  'bim',
  'construction',
  'cost',
  'realestate',
  'policy',
];

