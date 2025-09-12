import type { Website, CategoryConfigMap } from './websites';

export const websites: Website[] = [
  /* ───────── 보험(설계/GA): 상품/공시 ───────── */
  { category: "상품/공시", title: "보험다모아(온라인 보험슈퍼마켓)", url: "https://www.e-insmarket.or.kr/", description: "공식 보험료 비교·가입", id: "KR-IN-ADV-PUB-001" },
  { category: "상품/공시", title: "손해보험협회 공시실", url: "https://www.knia.or.kr/", description: "손보 상품공시·통계", id: "KR-IN-ADV-PUB-002" },
  { category: "상품/공시", title: "생명보험협회 공시실", url: "https://www.klia.or.kr/", description: "생보 상품공시·통계", id: "KR-IN-ADV-PUB-003" },
  { category: "상품/공시", title: "금융감독원 알림/자료실", url: "https://www.fss.or.kr/", description: "감독규정·보도·자료", id: "KR-IN-ADV-PUB-004" },
  { category: "상품/공시", title: "금융위원회 정책자료", url: "https://www.fsc.go.kr/", description: "보험 제도·정책 안내", id: "KR-IN-ADV-PUB-005" },

  /* ───────── 보험(설계/GA): 모집인/GA 관리 ───────── */
  { category: "모집인/GA 관리", title: "e-클린보험(설계사/GA 조회)", url: "https://eclean.knia.or.kr/eclean/recr010m", description: "모집인·GA 신뢰도 확인", id: "KR-IN-ADV-GA-001" },
  { category: "모집인/GA 관리", title: "손해보험협회 소비자포털", url: "https://consumer.knia.or.kr/", description: "민원·정보·계약유의", id: "KR-IN-ADV-GA-002" },
  { category: "모집인/GA 관리", title: "생명보험협회 소비자포털", url: "https://www.klia.or.kr/", description: "소비자 정보/공시", id: "KR-IN-ADV-GA-003" },
  { category: "모집인/GA 관리", title: "금감원 파인(FINE)", url: "https://fine.fss.or.kr/", description: "분쟁조정·소비자경보", id: "KR-IN-ADV-GA-004" },
  { category: "모집인/GA 관리", title: "개인정보보호위원회", url: "https://www.pipc.go.kr/", description: "개인정보 보호/가이드", id: "KR-IN-ADV-GA-005" },

  /* ───────── 보험(설계/GA): 컴플라이언스/표준 ───────── */
  { category: "컴플라이언스/표준", title: "금감원 금융광고 가이드", url: "https://fine.fss.or.kr/", description: "보험 광고·모집 준수", id: "KR-IN-ADV-CMP-001" },
  { category: "컴플라이언스/표준", title: "금융소비자보호 종합", url: "https://www.fss.or.kr/", description: "내부통제/판매원칙", id: "KR-IN-ADV-CMP-002" },
  { category: "컴플라이언스/표준", title: "전자금융·전자서명 안내", url: "https://www.kisa.or.kr/", description: "전자서명·전자금융 가이드", id: "KR-IN-ADV-CMP-003" },
  { category: "컴플라이언스/표준", title: "표준약관(협회/정부)", url: "https://www.knia.or.kr/", description: "약관 표준·해설", id: "KR-IN-ADV-CMP-004" },

  /* ───────── 보험(설계/GA): 교육/자격/연수 ───────── */
  { category: "교육/자격", title: "보험연수원", url: "https://www.in.or.kr/", description: "보험 전문교육·연수", id: "KR-IN-ADV-EDU-001" },
  { category: "교육/자격", title: "생보협회 자격시험센터", url: "https://exam.insure.or.kr/", description: "설계사/언더라이터 시험", id: "KR-IN-ADV-EDU-002" },
  { category: "교육/자격", title: "손해보험협회 교육자료", url: "https://www.knia.or.kr/", description: "손보 교육/세미나", id: "KR-IN-ADV-EDU-003" },
  { category: "교육/자격", title: "금융교육(파인)", url: "https://fine.fss.or.kr/", description: "소비자/실무 교육콘텐츠", id: "KR-IN-ADV-EDU-004" },

  /* ───────── 보험(설계/GA): 리서치/통계/요율 ───────── */
  { category: "리서치/통계", title: "보험개발원(KIDI)", url: "https://www.kidi.or.kr/", description: "요율·통계·연구", id: "KR-IN-ADV-DAT-001" },
  { category: "리서치/통계", title: "한국은행 ECOS", url: "https://ecos.bok.or.kr/", description: "거시지표(금리·물가)", id: "KR-IN-ADV-DAT-002" },
  { category: "리서치/통계", title: "KOSIS 국가통계", url: "https://kosis.kr/", description: "인구·소득·건강 통계", id: "KR-IN-ADV-DAT-003" },
  { category: "리서치/통계", title: "국민건강보험공단", url: "https://www.nhis.or.kr/", description: "건강·진료 통계/제도", id: "KR-IN-ADV-DAT-004" },

  /* ───────── 보험(설계/GA): 세무/연금/노무 ───────── */
  { category: "세무/연금", title: "국세청 홈택스", url: "https://www.hometax.go.kr/", description: "소득·세액공제 가이드", id: "KR-IN-ADV-TAX-001" },
  { category: "세무/연금", title: "국민연금공단(NPS)", url: "https://www.nps.or.kr/", description: "연금제도/노령연금", id: "KR-IN-ADV-TAX-002" },
  { category: "세무/연금", title: "근로복지공단", url: "https://www.kcomwel.or.kr/", description: "산재·고용·퇴직연금", id: "KR-IN-ADV-TAX-003" },
  { category: "세무/연금", title: "정부24", url: "https://www.gov.kr/", description: "각종 증명/민원", id: "KR-IN-ADV-TAX-004" },

  /* ───────── 보험(설계/GA): 자동차/위험 ───────── */
  { category: "자동차/위험", title: "카히스토리", url: "https://www.carhistory.or.kr/", description: "중고차 사고이력 조회", id: "KR-IN-ADV-AUTO-001" },
  { category: "자동차/위험", title: "보험다모아-자동차", url: "https://www.e-insmarket.or.kr/m/search.knia", description: "자동차보험 비교", id: "KR-IN-ADV-AUTO-002" },
  { category: "자동차/위험", title: "도로교통공단", url: "https://www.koroad.or.kr/", description: "교통법규/사고통계", id: "KR-IN-ADV-AUTO-003" },

  /* ───────── 보험(설계/GA): 소비자 대응/분쟁 ───────── */
  { category: "소비자 대응/분쟁", title: "금감원 파인(분쟁조정)", url: "https://fine.fss.or.kr/", description: "민원/분쟁조정 절차", id: "KR-IN-ADV-CS-001" },
  { category: "소비자 대응/분쟁", title: "손해보험협회 소비자포털", url: "https://consumer.knia.or.kr/", description: "보상절차·서식", id: "KR-IN-ADV-CS-002" },
  { category: "소비자 대응/분쟁", title: "생명보험협회 소비자포털", url: "https://www.klia.or.kr/", description: "보험금 청구 안내", id: "KR-IN-ADV-CS-003" },
];

export const categoryConfig: CategoryConfigMap = {
  '상품/공시': { title: '상품/공시', icon: '📄', iconClass: 'icon-blue' },
  '모집인/GA 관리': { title: '모집인/GA 관리', icon: '🧑\u200d💼', iconClass: 'icon-green' },
  '컴플라이언스/표준': { title: '컴플라이언스/표준', icon: '⚖️', iconClass: 'icon-purple' },
  '교육/자격': { title: '교육/자격', icon: '🎓', iconClass: 'icon-red' },
  '리서치/통계': { title: '리서치/통계', icon: '📊', iconClass: 'icon-indigo' },
  '세무/연금': { title: '세무/연금', icon: '💰', iconClass: 'icon-orange' },
  '자동차/위험': { title: '자동차/위험', icon: '🚗', iconClass: 'icon-teal' },
  '소비자 대응/분쟁': { title: '소비자 대응/분쟁', icon: '📞', iconClass: 'icon-gray' },
};

export const categoryOrder = [
  '상품/공시',
  '모집인/GA 관리',
  '컴플라이언스/표준',
  '교육/자격',
  '리서치/통계',
  '세무/연금',
  '자동차/위험',
  '소비자 대응/분쟁',
];

