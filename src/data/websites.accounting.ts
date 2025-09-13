import type { Website, CategoryConfigMap } from './websites';

export const websites: Website[] = [
  // ────── 세무 정보 ──────
  { category: '세무 정보', title: '국세청 홈택스', url: 'https://www.hometax.go.kr', description: '국세 조회 및 신고', id: 'ACC-TAX-001' },
  { category: '세무 정보', title: '대한세무사회', url: 'https://www.kacpta.or.kr', description: '세무사 정보/자료', id: 'ACC-TAX-002' },
  { category: '세무 정보', title: '삼쩜삼', url: 'https://www.3o3.co.kr', description: '종합소득세 환급 서비스', id: 'ACC-TAX-003' },
  { category: '세무 정보', title: '택스넷', url: 'https://www.taxnet.co.kr', description: '세무·회계 전문 포털', id: 'ACC-TAX-004' },
  { category: '세무 정보', title: '국세청 블로그', url: 'https://blog.naver.com/ntscafe', description: '세금 정책·해설', id: 'ACC-TAX-005' },

  // ────── 회계 소프트웨어 ──────
  { category: '회계 소프트웨어', title: '더존 Smart A', url: 'https://www.duzon.co.kr/product/erp/smarta', description: '국내 대표 회계 프로그램', id: 'ACC-SW-001' },
  { category: '회계 소프트웨어', title: '세모장부', url: 'https://semobook.com', description: '소상공인 클라우드 회계', id: 'ACC-SW-002' },
  { category: '회계 소프트웨어', title: 'QuickBooks', url: 'https://quickbooks.intuit.com', description: '글로벌 회계 SaaS', id: 'ACC-SW-003' },
  { category: '회계 소프트웨어', title: 'WEHAGO T', url: 'https://www.wehago.com', description: '더존 클라우드 회계 플랫폼', id: 'ACC-SW-004' },
  { category: '회계 소프트웨어', title: 'Wave Accounting', url: 'https://www.waveapps.com', description: '무료 회계·청구 SaaS', id: 'ACC-SW-005' },

  // ────── 정부 서비스 ──────
  { category: '정부 서비스', title: 'e세로', url: 'https://www.esero.go.kr', description: '지방세 신고 납부', id: 'ACC-GOV-001' },
  { category: '정부 서비스', title: '4대 사회보험 정보연계센터', url: 'https://www.4insure.or.kr', description: '사회보험 통합 신고', id: 'ACC-GOV-002' },
  { category: '정부 서비스', title: '정부24', url: 'https://www.gov.kr', description: '정부 민원/증명 발급', id: 'ACC-GOV-003' },
  { category: '정부 서비스', title: '위택스', url: 'https://www.wetax.go.kr', description: '지방세 납부·조회', id: 'ACC-GOV-004' },
  { category: '정부 서비스', title: '국민연금 e-서비스', url: 'https://www.nps.or.kr/jsppage/main.jsp', description: '연금 보험료 조회', id: 'ACC-GOV-005' },
];

export const categoryConfig: CategoryConfigMap = {
  '세무 정보': { title: '세무 정보', icon: '💡', iconClass: 'icon-yellow' },
  '회계 소프트웨어': { title: '회계 소프트웨어', icon: '🧾', iconClass: 'icon-blue' },
  '정부 서비스': { title: '정부 서비스', icon: '🏢', iconClass: 'icon-green' },
};

export const categoryOrder = [
  '세무 정보',
  '회계 소프트웨어',
  '정부 서비스',
];

