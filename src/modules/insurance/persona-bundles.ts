import type { PersonaBundle } from "./taxonomy";

// TODO: 필요 시 퍼소나 세분화(tags 기반 필터 등)

export const personaBundles: PersonaBundle[] = [
  { persona:"consumer", defaultTags:["비교","청구","공시"], siteIds:[
    "ins-compare","ins-klia","ins-knia","ins-direct","ins-nhis",
    "ins-hira","ins-fss","ins-gov24","ins-taas","ins-privacy"
  ]},
  { persona:"agent", defaultTags:["리드","설계","준법"], siteIds:[
    "ins-ad","ins-klia","ins-knia","ins-kidi","ins-lead",
    "ins-crm","ins-compare","ins-direct","ins-fss","ins-gov24"
  ]},
  { persona:"expert", defaultTags:["언더라이팅","판례","통계"], siteIds:[
    "ins-uw","ins-claimlaw","ins-kidi","ins-klia","ins-knia",
    "ins-ifrs","ins-fsc","ins-fss","ins-gov24","ins-taas"
  ]},
  { persona:"corporate", defaultTags:["B2B","위험관리"], siteIds:[
    "ins-kidi","ins-knia","ins-klia","ins-fsc","ins-fss",
    "ins-compare","ins-direct","ins-gov24","ins-privacy","ins-ifrs"
  ]},
  { persona:"licensePrep", defaultTags:["교육","시험"], siteIds:[
    "ins-exam","ins-edu","ins-klia","ins-knia","ins-kidi",
    "ins-fss","ins-fsc","ins-gov24","ins-ifrs","ins-privacy"
  ]},
  { persona:"overseas", defaultTags:["해외","여행","청구"], siteIds:[
    "ins-over","ins-travelclaim","ins-compare","ins-direct","ins-fss",
    "ins-gov24","ins-nhis","ins-hira","ins-privacy","ins-klia"
  ]},
];
