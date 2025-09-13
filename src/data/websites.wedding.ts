import type { Website, CategoryConfigMap } from './websites';

export const websites: Website[] = [
  { category: '결혼준비 앱/플랫폼', title: '웨딩북', url: 'https://www.weddingbook.com/', description: '웨딩홀·스드메 비교/후기/예약까지 한 번에.', id: 'WED-001' },
  { category: '결혼준비 앱/플랫폼', title: '웨딧', url: 'https://www.wedit.kr/', description: '스몰웨딩·셀프웨딩 기획/업체 연결.', id: 'WED-002' },
  { category: '결혼준비 앱/플랫폼', title: '웨딩의 여신', url: 'https://www.facebook.com/weddinggoddess/', description: '결혼준비 커뮤니티·앱.', id: 'WED-003' },

  { category: '앱 스토어/공식 채널', title: '웨딩북 iOS', url: 'https://apps.apple.com/app/id994071144', description: '앱 기능·후기·잔여타임 안내.', id: 'WED-004' },
  { category: '앱 스토어/공식 채널', title: '웨딧 공식 채널(X)', url: 'https://x.com/wedit_kr', description: '스몰웨딩 사례/소식.', id: 'WED-005' },
  { category: '앱 스토어/공식 채널', title: '웨딩의 여신 앱 정보', url: 'https://com-jjlee-wedqueen.en.aptoide.com/app', description: '최신 버전·개발사 정보.', id: 'WED-006' },

  { category: '이벤트/박람회', title: '웨딩북 페스티벌', url: 'https://www.wdgbook.com/festival', description: '오프라인 혜택/설명회.', id: 'WED-007' },
  { category: '이벤트/박람회', title: '인스타그램 웨딧', url: 'https://www.instagram.com/wedit_your_wedding/', description: '실사례 포트폴리오.', id: 'WED-008' },
  { category: '이벤트/박람회', title: '웨딩의 여신 페이스북', url: 'https://www.facebook.com/weddinggoddess/', description: '앱 소식.', id: 'WED-009' },

  { category: '법적 절차/서류', title: '정부24 혼인신고', url: 'https://www.gov.kr/mw/AA020InfoCappView.do?CappBizCD=12700000050', description: '온라인 안내·서류·접수기관.', id: 'WED-010' },
  { category: '법적 절차/서류', title: '찾기 쉬운 생활법령', url: 'https://www.easylaw.go.kr/CSP/CnpClsMainBtr.laf?ccfNo=4&cciNo=1&cnpClsNo=1', description: '혼인신고 요건/증인/기재사항.', id: 'WED-011' },
  { category: '법적 절차/서류', title: '재외공관 혼인신고 안내', url: 'https://overseas.mofa.go.kr/us-atlanta-ko/brd/m_20611/view.do?seq=1108109', description: '재외국민 혼인신고 절차.', id: 'WED-012' },

  { category: '주택도시기금(전세/구입 지원)', title: '기금e든든', url: 'https://enhuf.molit.go.kr/', description: '신혼부부 전세자금 등 온라인 신청.', id: 'WED-013' },
  { category: '주택도시기금(전세/구입 지원)', title: '한국주택금융공사 보금자리론(개요)', url: 'https://www.hf.go.kr/ko/sub01/sub01_01_01.do', description: '고정금리 주담대.', id: 'WED-014' },
  { category: '주택도시기금(전세/구입 지원)', title: '보금자리론(특성별 안내)', url: 'https://www.hf.go.kr/ko/sub01/sub01_01_02.do', description: '용도/요건 상세.', id: 'WED-015' },

  { category: '인쇄 청첩장', title: '바른손카드', url: 'https://www.barunsoncard.com/', description: '샘플/프로모션·모바일 세트 제공.', id: 'WED-016' },
  { category: '인쇄 청첩장', title: '잇츠카드', url: 'https://www.itscard.co.kr/', description: '다양한 디자인·소량 인쇄.', id: 'WED-017' },
  { category: '인쇄 청첩장', title: '카드마켓', url: 'https://www.cardmarket.kr/', description: '인쇄+모바일 쿠폰 프로모션.', id: 'WED-018' },

  { category: '모바일 청첩장', title: '보자기카드', url: 'https://www.bojagicard.com/', description: '모바일 초대장·후기/예식장 정보.', id: 'WED-019' },
  { category: '모바일 청첩장', title: '달팽', url: 'https://dalpeng.com/', description: '반응형 모바일 초대장·지도/RSVP.', id: 'WED-020' },
  { category: '모바일 청첩장', title: '페이지시스터즈', url: 'https://www.pagesisters.cc/', description: '블록 기반 편집·평생 보관.', id: 'WED-021' },

  { category: '올인원/신규 서비스 참고', title: '데어무드', url: 'https://theirmood.com/', description: '모바일 청첩장·축의금·대시보드.', id: 'WED-022' },
  { category: '올인원/신규 서비스 참고', title: '더카드(모바일 세트 기사)', url: 'https://www.dailysecu.com/news/articleView.html?idxno=44980', description: '인쇄+모바일 동일 디자인 세트.', id: 'WED-023' },
  { category: '올인원/신규 서비스 참고', title: '바른손 인스타', url: 'https://www.instagram.com/barunsoncard/', description: '최신 디자인/프로모션.', id: 'WED-024' },

  { category: '허니문 전문 여행사', title: '팜투어', url: 'https://www.palmtour.co.kr/', description: '허니문 특화 여행사/박람회.', id: 'WED-025' },
  { category: '허니문 전문 여행사', title: '허니문리조트', url: 'https://www.honeymoonresort.co.kr/', description: '맞춤 자유여행 상담/콘텐츠.', id: 'WED-026' },
  { category: '허니문 전문 여행사', title: '천생연분닷컴', url: 'https://www.1000syb.com/', description: '허니문 전문/박람회 진행.', id: 'WED-027' },

  { category: '대형 여행사 허니문 라인업', title: '하나투어 허니문', url: 'https://www.hanatour.com/package/honeymoon', description: '발리/하와이/몰디브 기획전.', id: 'WED-028' },
  { category: '대형 여행사 허니문 라인업', title: '노랑풍선 허니문', url: 'https://www.ybtour.co.kr/', description: '지역별 패키지/맞춤 견적.', id: 'WED-029' },
  { category: '대형 여행사 허니문 라인업', title: '노랑풍선 허니문 모바일', url: 'https://prdt.ybtour.co.kr/product/localList.m?dspSid=AGDA000&menu=HYM', description: '하와이 등 맞춤 특전.', id: 'WED-030' },

  { category: '프로모션/박람회 소식', title: '하나투어 F/W 허니문 프로모션', url: 'https://www.kmib.co.kr/article/view.asp?arcid=0027848124', description: '시즌 혜택.', id: 'WED-031' },
  { category: '프로모션/박람회 소식', title: '노랑풍선 허니문 온라인 박람회', url: 'https://mpkg.ybtour.co.kr/promotion/promotionDetail.yb?mstNo=20000030591', description: '기간 한정 혜택.', id: 'WED-032' },
  { category: '프로모션/박람회 소식', title: '팜투어 매거진/리조트 소식', url: 'https://palmtour.co.kr/hmcontents/article_list.asp', description: '리조트 소식.', id: 'WED-033' },

  { category: '예식장 예약/비교', title: '웨딩북', url: 'https://www.weddingbook.com/', description: '잔여타임·실시간 상담/후기.', id: 'WED-034' },
  { category: '예식장 예약/비교', title: '웨딩북 앱 안내', url: 'https://apps.apple.com/app/id994071144', description: '예식장 즉시예약 설명.', id: 'WED-035' },
  { category: '예식장 예약/비교', title: '웨딧', url: 'https://www.wedit.kr/', description: '스몰웨딩 베뉴/컨셉 탐색.', id: 'WED-036' },

  { category: '스튜디오·드레스·메이크업(스드메)', title: '웨딩북', url: 'https://www.weddingbook.com/', description: '스드메 후기·견적 비교.', id: 'WED-037' },
  { category: '스튜디오·드레스·메이크업(스드메)', title: '웨딧', url: 'https://www.wedit.kr/', description: '셀프/컨셉웨딩 연결.', id: 'WED-038' },
  { category: '스튜디오·드레스·메이크업(스드메)', title: '웨딩의 여신', url: 'https://www.facebook.com/weddinggoddess/', description: '업체 후기·정보.', id: 'WED-039' },
];

export const categoryConfig: CategoryConfigMap = {
  '결혼준비 앱/플랫폼': { title: '결혼준비 앱/플랫폼', icon: '💍', iconClass: 'icon-blue' },
  '앱 스토어/공식 채널': { title: '앱 스토어/공식 채널', icon: '📱', iconClass: 'icon-green' },
  '이벤트/박람회': { title: '이벤트/박람회', icon: '🎉', iconClass: 'icon-orange' },
  '법적 절차/서류': { title: '법적 절차/서류', icon: '📜', iconClass: 'icon-red' },
  '주택도시기금(전세/구입 지원)': { title: '주택도시기금(전세/구입 지원)', icon: '🏦', iconClass: 'icon-yellow' },
  '인쇄 청첩장': { title: '인쇄 청첩장', icon: '✉️', iconClass: 'icon-purple' },
  '모바일 청첩장': { title: '모바일 청첩장', icon: '📩', iconClass: 'icon-teal' },
  '올인원/신규 서비스 참고': { title: '올인원/신규 서비스 참고', icon: '🆕', iconClass: 'icon-indigo' },
  '허니문 전문 여행사': { title: '허니문 전문 여행사', icon: '🌴', iconClass: 'icon-green' },
  '대형 여행사 허니문 라인업': { title: '대형 여행사 허니문 라인업', icon: '🛫', iconClass: 'icon-blue' },
  '프로모션/박람회 소식': { title: '프로모션/박람회 소식', icon: '📣', iconClass: 'icon-orange' },
  '예식장 예약/비교': { title: '예식장 예약/비교', icon: '🏩', iconClass: 'icon-yellow' },
  '스튜디오·드레스·메이크업(스드메)': { title: '스튜디오·드레스·메이크업(스드메)', icon: '👗', iconClass: 'icon-purple' },
};

export const categoryOrder = [
  '결혼준비 앱/플랫폼',
  '앱 스토어/공식 채널',
  '이벤트/박람회',
  '법적 절차/서류',
  '주택도시기금(전세/구입 지원)',
  '인쇄 청첩장',
  '모바일 청첩장',
  '올인원/신규 서비스 참고',
  '허니문 전문 여행사',
  '대형 여행사 허니문 라인업',
  '프로모션/박람회 소식',
  '예식장 예약/비교',
  '스튜디오·드레스·메이크업(스드메)',
];

