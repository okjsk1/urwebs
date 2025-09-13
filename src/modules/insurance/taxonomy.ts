export type SourceType =
  | "public" | "association" | "insurer" | "compare" | "edu" | "stats" | "tool" | "community";

export type Persona =
  | "consumer"     // 개인고객
  | "agent"        // 설계사/GA/조직장
  | "expert"       // 언더라이터/보상/계리
  | "corporate"    // 기업·단체 고객
  | "licensePrep"  // 취업·수험(설계사/손사/계리)
  | "overseas";    // 해외거주·유학생

export interface Site {
  id: string;              // 전역 충돌 방지: 모두 "ins-" 프리픽스
  title: string;
  url: string;             // (우선 빈 문자열 허용)
  description: string;
  sourceType: SourceType;
  tags?: string[];         // intent/product 키워드 힌트
}

export interface PersonaBundle {
  persona: Persona;
  // 초기 필터 프리셋(사용 안 할 수도 있음)
  defaultTags?: string[];
  // 카드에 보여줄 사이트 10개(고정)
  siteIds: string[];
}
