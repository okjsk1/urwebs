import type { Site } from "./taxonomy";

export const siteCatalog: Site[] = [
  // 공공/협회
  { id:"ins-fss",  title:"금융감독원 소비자포털", url:"https://fine.fss.or.kr", description:"민원·분쟁조정·소비자보호", sourceType:"public", tags:["민원","분쟁","규제"] },
  { id:"ins-fsc",  title:"금융위원회", url:"https://www.fsc.go.kr", description:"감독규정·정책·제도 변경", sourceType:"public", tags:["규제","정책"] },
  { id:"ins-klia", title:"생명보험협회 공시실", url:"https://www.klia.or.kr", description:"생보 상품 공시/비교/약관", sourceType:"association", tags:["공시","약관"] },
  { id:"ins-knia", title:"손해보험협회 공시실", url:"https://www.knia.or.kr", description:"손보 상품 공시/비교/약관", sourceType:"association", tags:["공시","약관"] },
  { id:"ins-kidi", title:"보험개발원 통계/요율", url:"https://www.kidi.or.kr", description:"요율/손해율/리스크", sourceType:"stats", tags:["통계","요율"] },
  { id:"ins-nhis", title:"국민건강보험공단", url:"https://www.nhis.or.kr", description:"자격득실/보험료/청구", sourceType:"public", tags:["의료","실손","청구"] },
  { id:"ins-hira", title:"건강보험심사평가원", url:"https://www.hira.or.kr", description:"진료내역·제증명·처방", sourceType:"public", tags:["의료","증빙","청구"] },
  { id:"ins-gov24",title:"정부24", url:"https://www.gov.kr", description:"각종 민원/증명/전자문서", sourceType:"public", tags:["민원","증빙"] },
  { id:"ins-taas", title:"도로교통공단 TAAS", url:"https://taas.koroad.or.kr", description:"교통사고 통계/분석", sourceType:"public", tags:["자동차","보상","통계"] },
  { id:"ins-privacy", title:"개인정보보호포털", url:"https://www.privacy.go.kr", description:"개인정보 분쟁/가이드", sourceType:"public", tags:["준법","민원"] },

  // 비교/가입/다이렉트(묶음)
  { id:"ins-compare", title:"공식 보험 비교(보험 비교 포털)", url:"https://www.finlife.fss.or.kr", description:"공식 비교/가격/보장", sourceType:"compare", tags:["비교","가입"] },
  { id:"ins-direct",  title:"보험사 다이렉트 모음", url:"https://www.e-insmarket.or.kr", description:"자동차/운전자/여행 등", sourceType:"insurer", tags:["가입","자동차","여행"] },

  // 설계사/전문가
  { id:"ins-ad",    title:"광고심의/준법 가이드", url:"https://adv.fss.or.kr", description:"광고 심의 기준/절차/예시", sourceType:"association", tags:["광고심의","준법"] },
  { id:"ins-uw",    title:"언더라이팅 가이드",   url:"https://uw.kidi.or.kr", description:"인수지침/리스크/사례", sourceType:"tool", tags:["언더라이팅"] },
  { id:"ins-claimlaw", title:"보험 판례/유권해석", url:"https://law.fss.or.kr", description:"분쟁/판례/해석", sourceType:"public", tags:["판례","보상"] },
  { id:"ins-ifrs",  title:"IFRS/계리 자료",  url:"https://ifrs.fss.or.kr", description:"IFRS17/리스크/계리", sourceType:"stats", tags:["IFRS","계리"] },
  { id:"ins-lead",  title:"리드 생성 채널/템플릿", url:"https://www.hubspot.com/lead-generation", description:"콘텐츠/검색/로컬 전략", sourceType:"tool", tags:["영업","리드"] },
  { id:"ins-crm",   title:"고객관리/CRM 툴",   url:"https://www.hubspot.com/products/crm", description:"상담·보장분석·후속관리", sourceType:"tool", tags:["CRM","설계"] },

  // 교육/시험
  { id:"ins-edu",   title:"보험 교육/연수원", url:"https://www.ifi.or.kr", description:"자격/보수교육/강의", sourceType:"edu", tags:["교육","자격"] },
  { id:"ins-exam",  title:"자격시험 안내(설계사/손사/계리)", url:"https://license.kidi.or.kr", description:"일정/과목/교재", sourceType:"public", tags:["시험","자격"] },

  // 해외
  { id:"ins-over",  title:"해외유학/체류 정보(정부)", url:"https://www.0404.go.kr", description:"비자/체류/보건 안내", sourceType:"public", tags:["해외","유학생"] },
  { id:"ins-travelclaim", title:"해외여행보험 청구 가이드", url:"https://www.chubbtravelinsurance.com/kr-ko/claims", description:"서류/절차/연락처", sourceType:"tool", tags:["여행","청구"] },
];

