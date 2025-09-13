import type { Website, CategoryConfigMap } from './websites';

export const websites: Website[] = [
  // ────── 보안 뉴스/정보 ──────
  { category: '보안 뉴스/정보', title: '보안뉴스', url: 'https://www.boannews.com', description: '국내 대표 보안 매체', id: 'SEC-NEWS-001' },
  { category: '보안 뉴스/정보', title: 'KISA 보호나라', url: 'https://www.boho.or.kr', description: '국가 사이버 안전 포털', id: 'SEC-NEWS-002' },
  { category: '보안 뉴스/정보', title: 'The Hacker News', url: 'https://thehackernews.com', description: '글로벌 보안 뉴스', id: 'SEC-NEWS-003' },
  { category: '보안 뉴스/정보', title: '데일리시큐', url: 'https://www.dailysecu.com', description: '국내 보안 업계 소식', id: 'SEC-NEWS-004' },
  { category: '보안 뉴스/정보', title: 'SecurityWeek', url: 'https://www.securityweek.com', description: '국제 보안 뉴스', id: 'SEC-NEWS-005' },

  // ────── 취약점/침해대응 ──────
  { category: '취약점/침해대응', title: 'CVE', url: 'https://cve.mitre.org', description: '공식 취약점 식별자', id: 'SEC-VULN-001' },
  { category: '취약점/침해대응', title: 'NVD', url: 'https://nvd.nist.gov', description: '미국 국립 취약점 DB', id: 'SEC-VULN-002' },
  { category: '취약점/침해대응', title: 'KrCERT 경고', url: 'https://www.krcert.or.kr', description: '국가 침해사고 대응', id: 'SEC-VULN-003' },
  { category: '취약점/침해대응', title: 'Exploit Database', url: 'https://www.exploit-db.com', description: '공개 익스플로잇 자료', id: 'SEC-VULN-004' },
  { category: '취약점/침해대응', title: 'CERT/CC', url: 'https://www.kb.cert.org', description: '카네기멜론 CERT 경보', id: 'SEC-VULN-005' },

  // ────── 교육/인증 ──────
  { category: '교육/인증', title: 'KISA 사이버보안 교육', url: 'https://edu.kisa.or.kr', description: '공공 무료 보안 교육', id: 'SEC-EDU-001' },
  { category: '교육/인증', title: 'Offensive Security', url: 'https://www.offsec.com', description: 'OSCP 등 실무 인증', id: 'SEC-EDU-002' },
  { category: '교육/인증', title: '(ISC)² CISSP', url: 'https://www.isc2.org/Certifications/CISSP', description: '국제 보안 자격', id: 'SEC-EDU-003' },
  { category: '교육/인증', title: 'TryHackMe', url: 'https://tryhackme.com', description: '실습형 사이버보안 학습', id: 'SEC-EDU-004' },
  { category: '교육/인증', title: 'K-Shield Jr', url: 'https://www.kshieldjr.org', description: 'KISA 주관 보안인재 양성', id: 'SEC-EDU-005' },
];

export const categoryConfig: CategoryConfigMap = {
  '보안 뉴스/정보': { title: '보안 뉴스/정보', icon: '📰', iconClass: 'icon-blue' },
  '취약점/침해대응': { title: '취약점/침해대응', icon: '⚠️', iconClass: 'icon-red' },
  '교육/인증': { title: '교육/인증', icon: '🎓', iconClass: 'icon-green' },
};

export const categoryOrder = [
  '보안 뉴스/정보',
  '취약점/침해대응',
  '교육/인증',
];

