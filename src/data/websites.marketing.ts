import type { Website, CategoryConfigMap } from './websites';

export const websites: Website[] = [
  // ───────── 퍼포먼스/애드옵스 ─────────
  { category: '플랫폼 정책·가이드', title: 'Google Ads 도움말', url: 'https://support.google.com/google-ads', description: '정책/최적화 가이드', id: 'MKT-PLT-001' },
  { category: '플랫폼 정책·가이드', title: 'Meta Business 도움말', url: 'https://www.facebook.com/business/help', description: '광고 정책/운영', id: 'MKT-PLT-002' },
  { category: '플랫폼 정책·가이드', title: '네이버 광고 안내', url: 'https://searchad.naver.com/guide', description: '검색/콘텐츠 광고 가이드', id: 'MKT-PLT-003' },

  { category: '리포팅/분석', title: 'Google Analytics 도움말', url: 'https://support.google.com/analytics', description: '설정/분석 가이드', id: 'MKT-RPT-001' },
  { category: '리포팅/분석', title: 'Looker Studio', url: 'https://lookerstudio.google.com', description: '무료 대시보드', id: 'MKT-RPT-002' },
  { category: '리포팅/분석', title: 'Appsflyer 리소스', url: 'https://www.appsflyer.com/kr/resources/', description: '앱 트래킹/어트리뷰션', id: 'MKT-RPT-003' },

  { category: '광고 자료실·인사이트', title: 'Think with Google Korea', url: 'https://www.thinkwithgoogle.com/intl/ko-kr/', description: '소비자 인사이트', id: 'MKT-INS-001' },
  { category: '광고 자료실·인사이트', title: 'Meta 광고 라이브러리', url: 'https://www.facebook.com/ads/library/', description: '집행 광고 검색', id: 'MKT-INS-002' },
  { category: '광고 자료실·인사이트', title: 'IGAWorks 블로그', url: 'https://blog.igaworks.com', description: '모바일 마케팅 인사이트', id: 'MKT-INS-003' },

  // ───────── 콘텐츠/소셜 ─────────
  { category: '콘텐츠 전략/캘린더', title: 'HubSpot Blog', url: 'https://blog.hubspot.com/', description: '콘텐츠 전략/SEO', id: 'MKT-CNT-001' },
  { category: '콘텐츠 전략/캘린더', title: 'Buffer 블로그', url: 'https://buffer.com/resources', description: '소셜 운영 팁', id: 'MKT-CNT-002' },
  { category: '콘텐츠 전략/캘린더', title: 'Trello 템플릿', url: 'https://trello.com/templates', description: '콘텐츠 캘린더', id: 'MKT-CNT-003' },

  { category: '저작도구·에셋', title: 'Canva', url: 'https://www.canva.com/ko_kr/', description: '썸네일/템플릿', id: 'MKT-TL-001' },
  { category: '저작도구·에셋', title: 'Unsplash', url: 'https://unsplash.com', description: '무료 이미지', id: 'MKT-TL-002' },
  { category: '저작도구·에셋', title: 'ICONS8', url: 'https://icons8.com', description: '아이콘/일러스트', id: 'MKT-TL-003' },

  { category: 'SEO/키워드', title: 'Google Search Console', url: 'https://search.google.com/search-console', description: '인덱싱/성능', id: 'MKT-SEO-001' },
  { category: 'SEO/키워드', title: 'Ahrefs 블로그', url: 'https://ahrefs.com/blog/', description: '키워드/링크 전략', id: 'MKT-SEO-002' },
  { category: 'SEO/키워드', title: '네이버 서치어드바이저', url: 'https://searchadvisor.naver.com', description: '네이버 검색 관리', id: 'MKT-SEO-003' },

  // ───────── CRM·리텐션 ─────────
  { category: '이메일/메시징', title: 'Mailchimp 가이드', url: 'https://mailchimp.com/resources/', description: '이메일 캠페인', id: 'MKT-EML-001' },
  { category: '이메일/메시징', title: 'Braze Docs', url: 'https://www.braze.com/docs/', description: '세그먼트/저니', id: 'MKT-EML-002' },
  { category: '이메일/메시징', title: '카카오 비즈메시지', url: 'https://business.kakao.com/info/bizmessage/', description: '알림톡/친구톡 안내', id: 'MKT-EML-003' },

  { category: '데이터·세그먼트', title: 'Segment Docs', url: 'https://segment.com/docs/', description: '이벤트 수집/연동', id: 'MKT-DATA-001' },
  { category: '데이터·세그먼트', title: 'Mixpanel', url: 'https://mixpanel.com', description: '행동 분석/리텐션', id: 'MKT-DATA-002' },
  { category: '데이터·세그먼트', title: 'Amplitude', url: 'https://amplitude.com', description: '퍼널/코호트', id: 'MKT-DATA-003' },

  { category: '개인정보/정책', title: '개인정보보호 포털', url: 'https://www.eprivacy.go.kr', description: '가이드/교육', id: 'MKT-PRIV-001' },
  { category: '개인정보/정책', title: 'PIPC', url: 'https://www.pipc.go.kr', description: '가이드라인/질의응답', id: 'MKT-PRIV-002' },
  { category: '개인정보/정책', title: 'IAB TCF', url: 'https://iabeurope.eu/tcf-2-2/', description: '동의 프레임워크 개요', id: 'MKT-PRIV-003' },
];

export const categoryConfig: CategoryConfigMap = {
  '플랫폼 정책·가이드': { title: '플랫폼 정책·가이드', icon: '📘', iconClass: 'icon-blue' },
  '리포팅/분석': { title: '리포팅/분석', icon: '📊', iconClass: 'icon-green' },
  '광고 자료실·인사이트': { title: '광고 자료실·인사이트', icon: '🧠', iconClass: 'icon-red' },
  '콘텐츠 전략/캘린더': { title: '콘텐츠 전략/캘린더', icon: '🗓️', iconClass: 'icon-purple' },
  '저작도구·에셋': { title: '저작도구·에셋', icon: '🛠️', iconClass: 'icon-orange' },
  'SEO/키워드': { title: 'SEO/키워드', icon: '🔍', iconClass: 'icon-yellow' },
  '이메일/메시징': { title: '이메일/메시징', icon: '✉️', iconClass: 'icon-indigo' },
  '데이터·세그먼트': { title: '데이터·세그먼트', icon: '🧮', iconClass: 'icon-teal' },
  '개인정보/정책': { title: '개인정보/정책', icon: '⚖️', iconClass: 'icon-gray' },
};

export const categoryOrder = [
  '플랫폼 정책·가이드',
  '리포팅/분석',
  '광고 자료실·인사이트',
  '콘텐츠 전략/캘린더',
  '저작도구·에셋',
  'SEO/키워드',
  '이메일/메시징',
  '데이터·세그먼트',
  '개인정보/정책',
];

