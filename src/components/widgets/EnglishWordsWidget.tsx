// 영어 단어 학습 위젯 - 단순 자동전환판 (10초 고정, 테마 선택만)
// 기능: 10초마다 자동으로 다음 단어로 이동, 테마 변경 가능(편집 모드에서만), 불필요 기능/통계 제거

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight, Settings, X } from 'lucide-react';
import { WidgetProps, persistOrLocal, readLocal } from './utils/widget-helpers';

type Level = 'beginner' | 'intermediate' | 'advanced';

interface Word {
  id: string;
  english: string;
  korean: string;
  level: Level;
  createdAt: number;
}

type ThemeKey =
  | 'elementary' | 'middle' | 'high'
  | 'travel' | 'toeic' | 'toefl'
  | 'daily' | 'business' | 'science';

const now = Date.now();
const W = (id: string, english: string, korean: string, level: Level = 'beginner'): Word =>
  ({ id, english, korean, level, createdAt: now });

const createWords = (prefix: string, entries: Array<[string, string, Level?]>) =>
  entries.map(([english, korean, level], index) =>
    W(`${prefix}${index + 1}`, english, korean, level ?? 'beginner'));

// --- 단어 데이터 (확장 버전) ---
const THEME_WORDS: Record<ThemeKey, Word[]> = {
  elementary: createWords('el', [
    ['apple', '사과'],
    ['book', '책'],
    ['cat', '고양이'],
    ['dog', '개'],
    ['house', '집'],
    ['water', '물'],
    ['friend', '친구'],
    ['happy', '행복한'],
    ['school', '학교'],
    ['teacher', '선생님'],
    ['student', '학생'],
    ['family', '가족'],
    ['mother', '어머니'],
    ['father', '아버지'],
    ['sister', '자매'],
    ['brother', '형제'],
    ['car', '자동차'],
    ['bike', '자전거'],
    ['food', '음식'],
    ['milk', '우유'],
    ['bread', '빵'],
    ['rice', '밥'],
    ['fish', '생선'],
    ['chicken', '닭고기'],
    ['window', '창문'],
    ['door', '문'],
    ['table', '식탁'],
    ['chair', '의자'],
    ['flower', '꽃'],
    ['tree', '나무'],
    ['sun', '태양'],
    ['moon', '달'],
    ['star', '별'],
    ['phone', '전화기'],
    ['computer', '컴퓨터'],
    ['paper', '종이'],
    ['pen', '펜'],
    ['pencil', '연필'],
    ['notebook', '공책'],
    ['bag', '가방'],
    ['shoes', '신발'],
    ['clothes', '옷'],
    ['hat', '모자'],
    ['glasses', '안경'],
    ['bed', '침대'],
    ['bathroom', '욕실'],
    ['kitchen', '부엌'],
    ['living room', '거실'],
    ['street', '거리'],
    ['park', '공원'],
    ['store', '가게'],
    ['market', '시장'],
    ['money', '돈'],
    ['price', '가격'],
    ['cheap', '저렴한'],
    ['expensive', '비싼'],
    ['small', '작은'],
    ['big', '큰'],
    ['long', '긴'],
    ['short', '짧은'],
    ['fast', '빠른'],
    ['slow', '느린'],
    ['hot', '뜨거운'],
    ['cold', '차가운'],
    ['warm', '따뜻한'],
    ['cool', '시원한'],
    ['clean', '깨끗한'],
    ['dirty', '더러운'],
    ['new', '새로운'],
    ['old', '오래된'],
    ['young', '젊은'],
    ['early', '이른'],
    ['late', '늦은'],
    ['today', '오늘'],
    ['yesterday', '어제'],
    ['tomorrow', '내일'],
    ['morning', '아침'],
    ['afternoon', '오후'],
    ['evening', '저녁'],
    ['night', '밤'],
    ['always', '항상'],
    ['usually', '보통'],
    ['often', '자주'],
    ['sometimes', '가끔'],
    ['rarely', '드물게'],
    ['never', '절대 ~하지 않다'],
    ['rain', '비'],
    ['snow', '눈'],
    ['cloud', '구름'],
    ['toy', '장난감'],
    ['game', '게임'],
  ]),
  middle: createWords('mid', [
    ['beautiful', '아름다운', 'intermediate'],
    ['important', '중요한', 'intermediate'],
    ['difficult', '어려운', 'intermediate'],
    ['interesting', '흥미로운', 'intermediate'],
    ['comfortable', '편안한', 'intermediate'],
    ['necessary', '필요한', 'intermediate'],
    ['possible', '가능한', 'intermediate'],
    ['different', '다른', 'intermediate'],
    ['wonderful', '훌륭한', 'intermediate'],
    ['fantastic', '환상적인', 'intermediate'],
    ['efficient', '효율적인', 'intermediate'],
    ['curious', '호기심 많은', 'intermediate'],
    ['creative', '창의적인', 'intermediate'],
    ['polite', '공손한', 'intermediate'],
    ['helpful', '도움이 되는', 'intermediate'],
    ['energetic', '활기찬', 'intermediate'],
    ['responsible', '책임감 있는', 'intermediate'],
    ['confident', '자신 있는', 'intermediate'],
    ['generous', '관대한', 'intermediate'],
  ]),
  high: createWords('hi', [
    ['serendipity', '우연한 발견', 'advanced'],
    ['ephemeral', '일시적인', 'advanced'],
    ['ubiquitous', '어디에나 있는', 'advanced'],
    ['mellifluous', '감미로운', 'advanced'],
    ['perspicacious', '통찰력 있는', 'advanced'],
    ['luminous', '빛나는', 'advanced'],
    ['resilient', '회복력 있는', 'advanced'],
    ['eloquent', '유창한', 'advanced'],
    ['meticulous', '꼼꼼한', 'advanced'],
    ['alacrity', '민첩함', 'advanced'],
    ['equanimity', '평정심', 'advanced'],
    ['tenacious', '끈질긴', 'advanced'],
  ]),
  travel: createWords('trav', [
    ['passport', '여권', 'intermediate'],
    ['visa', '비자', 'intermediate'],
    ['airport', '공항', 'intermediate'],
    ['terminal', '터미널', 'intermediate'],
    ['gate', '탑승구', 'intermediate'],
    ['boarding pass', '탑승권', 'intermediate'],
    ['baggage', '수하물', 'intermediate'],
    ['luggage', '짐', 'intermediate'],
    ['carry-on', '기내 반입 가방', 'intermediate'],
    ['check-in', '체크인', 'intermediate'],
    ['customs', '세관', 'intermediate'],
    ['immigration', '출입국 심사', 'intermediate'],
    ['security', '보안 검색', 'intermediate'],
    ['departure', '출발', 'intermediate'],
    ['arrival', '도착', 'intermediate'],
    ['delay', '지연', 'intermediate'],
    ['cancellation', '취소', 'intermediate'],
    ['itinerary', '여행 일정', 'intermediate'],
    ['reservation', '예약', 'intermediate'],
    ['booking', '예약하기', 'intermediate'],
    ['ticket', '표', 'intermediate'],
    ['seat', '좌석', 'intermediate'],
    ['aisle', '통로', 'intermediate'],
    ['window seat', '창가 좌석', 'intermediate'],
    ['train', '기차', 'intermediate'],
    ['subway', '지하철', 'intermediate'],
    ['bus', '버스', 'intermediate'],
    ['taxi', '택시', 'intermediate'],
    ['rideshare', '차량 공유', 'intermediate'],
    ['rental car', '렌터카', 'intermediate'],
    ['hotel', '호텔', 'intermediate'],
    ['hostel', '호스텔', 'intermediate'],
    ['guesthouse', '게스트하우스', 'intermediate'],
    ['reception', '접수처', 'intermediate'],
    ['lobby', '로비', 'intermediate'],
    ['elevator', '엘리베이터', 'intermediate'],
    ['stairs', '계단', 'intermediate'],
    ['room key', '객실 열쇠', 'intermediate'],
    ['single room', '싱글룸', 'intermediate'],
    ['double room', '더블룸', 'intermediate'],
    ['suite', '스위트룸', 'intermediate'],
    ['breakfast', '아침 식사', 'intermediate'],
    ['checkout', '체크아웃', 'intermediate'],
    ['tour', '투어', 'intermediate'],
    ['guide', '가이드', 'intermediate'],
    ['map', '지도', 'intermediate'],
    ['directions', '길 안내', 'intermediate'],
    ['landmark', '랜드마크', 'intermediate'],
    ['museum', '박물관', 'intermediate'],
    ['gallery', '미술관', 'intermediate'],
    ['monument', '기념비', 'intermediate'],
    ['temple', '사원', 'intermediate'],
    ['cathedral', '대성당', 'intermediate'],
    ['beach', '해변', 'intermediate'],
    ['mountain', '산', 'intermediate'],
    ['island', '섬', 'intermediate'],
    ['river', '강', 'intermediate'],
    ['lake', '호수', 'intermediate'],
    ['forest', '숲', 'intermediate'],
    ['marketplace', '시장', 'intermediate'],
    ['souvenir', '기념품', 'intermediate'],
    ['currency', '통화', 'intermediate'],
    ['exchange rate', '환율', 'intermediate'],
    ['credit card', '신용카드', 'intermediate'],
    ['cash', '현금', 'intermediate'],
    ['tip', '팁', 'intermediate'],
    ['receipt', '영수증', 'intermediate'],
    ['insurance', '보험', 'intermediate'],
    ['emergency', '비상사태', 'intermediate'],
    ['pharmacy', '약국', 'intermediate'],
    ['doctor', '의사', 'intermediate'],
    ['allergy', '알레르기', 'intermediate'],
    ['vegetarian', '채식주의자', 'intermediate'],
    ['reservation number', '예약 번호', 'intermediate'],
    ['confirmation', '확인서', 'intermediate'],
    ['overbooking', '좌석 초과 예약', 'advanced'],
    ['lost and found', '분실물 센터', 'intermediate'],
    ['travel adapter', '여행용 어댑터', 'intermediate'],
    ['sim card', '심카드', 'intermediate'],
    ['layover', '경유', 'intermediate'],
    ['jet lag', '시차 적응', 'intermediate'],
    ['tourist information', '관광 안내소', 'intermediate'],
  ]),
  toeic: createWords('toeic', [
    ['company', '회사', 'intermediate'],
    ['department', '부서', 'intermediate'],
    ['division', '사업부', 'intermediate'],
    ['branch', '지점', 'intermediate'],
    ['headquarters', '본사', 'intermediate'],
    ['subsidiary', '자회사', 'intermediate'],
    ['startup', '스타트업', 'intermediate'],
    ['corporation', '법인', 'intermediate'],
    ['stakeholder', '이해관계자', 'intermediate'],
    ['shareholder', '주주', 'intermediate'],
    ['board', '이사회', 'intermediate'],
    ['executive', '임원', 'intermediate'],
    ['manager', '관리자', 'intermediate'],
    ['supervisor', '감독자', 'intermediate'],
    ['coworker', '동료', 'intermediate'],
    ['assistant', '조수', 'intermediate'],
    ['intern', '인턴', 'intermediate'],
    ['contractor', '외주업체', 'intermediate'],
    ['client', '고객', 'intermediate'],
    ['customer', '구매자', 'intermediate'],
    ['vendor', '공급업체', 'intermediate'],
    ['supplier', '납품업체', 'intermediate'],
    ['partner', '협력사', 'intermediate'],
    ['agreement', '합의', 'intermediate'],
    ['contract', '계약', 'intermediate'],
    ['proposal', '제안서', 'intermediate'],
    ['quotation', '견적', 'intermediate'],
    ['invoice', '송장', 'intermediate'],
    ['purchase order', '구매 주문서', 'intermediate'],
    ['delivery note', '납품서', 'intermediate'],
    ['inventory', '재고', 'intermediate'],
    ['warehouse', '창고', 'intermediate'],
    ['logistics', '물류', 'intermediate'],
    ['shipment', '배송', 'intermediate'],
    ['tracking', '추적', 'intermediate'],
    ['deadline', '마감일', 'intermediate'],
    ['milestone', '중간 목표', 'intermediate'],
    ['roadmap', '로드맵', 'intermediate'],
    ['strategy', '전략', 'intermediate'],
    ['objective', '목표', 'intermediate'],
    ['key result', '핵심 성과', 'intermediate'],
    ['KPI', '핵심 지표', 'advanced'],
    ['performance', '성과', 'intermediate'],
    ['evaluation', '평가', 'intermediate'],
    ['feedback', '피드백', 'intermediate'],
    ['promotion', '승진', 'intermediate'],
    ['salary', '급여', 'intermediate'],
    ['bonus', '보너스', 'intermediate'],
    ['benefit', '복리후생', 'intermediate'],
    ['allowance', '수당', 'intermediate'],
    ['overtime', '초과 근무', 'intermediate'],
    ['schedule', '일정', 'intermediate'],
    ['shift', '근무조', 'intermediate'],
    ['meeting', '회의', 'intermediate'],
    ['presentation', '발표', 'intermediate'],
    ['conference', '회의', 'intermediate'],
    ['webinar', '웹 세미나', 'intermediate'],
    ['workshop', '워크숍', 'intermediate'],
    ['minutes', '회의록', 'intermediate'],
    ['agenda', '안건', 'intermediate'],
    ['memo', '메모', 'intermediate'],
    ['report', '보고서', 'intermediate'],
    ['analysis', '분석', 'intermediate'],
    ['insight', '통찰', 'advanced'],
    ['summary', '요약', 'intermediate'],
    ['budget', '예산', 'intermediate'],
    ['revenue', '매출', 'intermediate'],
    ['profit', '이익', 'intermediate'],
    ['loss', '손실', 'intermediate'],
    ['expense', '비용', 'intermediate'],
    ['cost', '원가', 'intermediate'],
    ['margin', '마진', 'intermediate'],
    ['cash flow', '현금 흐름', 'advanced'],
    ['forecast', '전망', 'intermediate'],
    ['estimate', '추정', 'intermediate'],
    ['audit', '감사', 'advanced'],
    ['compliance', '준수', 'advanced'],
    ['regulation', '규정', 'intermediate'],
    ['policy', '정책', 'intermediate'],
    ['procedure', '절차', 'intermediate'],
    ['guideline', '지침', 'intermediate'],
    ['risk', '위험', 'intermediate'],
    ['mitigation', '완화', 'advanced'],
    ['issue', '문제', 'intermediate'],
    ['ticket', '문의 티켓', 'intermediate'],
    ['support', '지원', 'intermediate'],
    ['escalation', '상위 전달', 'advanced'],
    ['negotiation', '협상', 'advanced'],
    ['deal', '거래', 'intermediate'],
    ['closing', '마무리', 'intermediate'],
    ['signature', '서명', 'intermediate'],
    ['approval', '승인', 'intermediate'],
    ['pending', '보류 중', 'intermediate'],
    ['rejected', '거절된', 'intermediate'],
    ['granted', '승인된', 'intermediate'],
    ['synergy', '시너지', 'advanced'],
    ['liability', '부채', 'advanced'],
    ['dividend', '배당금', 'advanced'],
    ['merger', '합병', 'advanced'],
    ['benchmark', '벤치마크', 'intermediate'],
  ]),
  toefl: createWords('toefl', [
    ['abstract', '개요', 'advanced'],
    ['analysis', '분석', 'advanced'],
    ['argument', '논증', 'advanced'],
    ['assumption', '가정', 'advanced'],
    ['assessment', '평가', 'advanced'],
    ['citation', '인용', 'advanced'],
    ['coherence', '일관성', 'advanced'],
    ['cohesion', '응집성', 'advanced'],
    ['comparison', '비교', 'advanced'],
    ['contrast', '대조', 'advanced'],
    ['conclusion', '결론', 'advanced'],
    ['conjecture', '추측', 'advanced'],
    ['consensus', '합의', 'advanced'],
    ['context', '맥락', 'advanced'],
    ['correlation', '상관관계', 'advanced'],
    ['criteria', '평가기준', 'advanced'],
    ['debate', '토론', 'advanced'],
    ['definition', '정의', 'advanced'],
    ['demonstration', '입증', 'advanced'],
    ['derivation', '도출', 'advanced'],
    ['discussion', '논의', 'advanced'],
    ['evidence', '증거', 'advanced'],
    ['example', '예시', 'advanced'],
    ['excerpt', '발췌', 'advanced'],
    ['explanation', '설명', 'advanced'],
    ['framework', '틀', 'advanced'],
    ['hypothesis', '가설', 'advanced'],
    ['implication', '시사점', 'advanced'],
    ['interpretation', '해석', 'advanced'],
    ['literature', '문헌', 'advanced'],
    ['methodology', '방법론', 'advanced'],
    ['notion', '개념', 'advanced'],
    ['observation', '관찰', 'advanced'],
    ['paradigm', '패러다임', 'advanced'],
    ['phenomenon', '현상', 'advanced'],
    ['preliminary', '예비적인', 'advanced'],
    ['principle', '원리', 'advanced'],
    ['proposal', '제안', 'advanced'],
    ['rationale', '근거', 'advanced'],
    ['reference', '참고문헌', 'advanced'],
    ['reliability', '신뢰도', 'advanced'],
    ['replication', '재현', 'advanced'],
    ['research', '연구', 'advanced'],
    ['response', '응답', 'advanced'],
    ['sample', '표본', 'advanced'],
    ['significance', '의의', 'advanced'],
    ['statistics', '통계', 'advanced'],
    ['synthesis', '종합', 'advanced'],
    ['theory', '이론', 'advanced'],
    ['thesis', '논문', 'advanced'],
    ['validity', '타당도', 'advanced'],
    ['variable', '변수', 'advanced'],
    ['advocate', '옹호하다', 'advanced'],
    ['allocate', '할당하다', 'advanced'],
    ['anticipate', '예상하다', 'advanced'],
    ['approximate', '대략의', 'advanced'],
    ['articulate', '명확히 표현하다', 'advanced'],
    ['assert', '단언하다', 'advanced'],
    ['assimilate', '동화하다', 'advanced'],
    ['attribute', '원인으로 돌리다', 'advanced'],
    ['chronology', '연대순', 'advanced'],
    ['clarify', '명확히 하다', 'advanced'],
    ['coincide', '일치하다', 'advanced'],
    ['compile', '편집하다', 'advanced'],
    ['conceive', '구상하다', 'advanced'],
    ['condense', '응축하다', 'advanced'],
    ['confer', '협의하다', 'advanced'],
    ['conform', '따르다', 'advanced'],
    ['constrain', '제한하다', 'advanced'],
    ['contrastive', '대조적인', 'advanced'],
    ['converge', '모이다', 'advanced'],
    ['derive', '끌어내다', 'advanced'],
    ['differentiate', '구별하다', 'advanced'],
    ['elaborate', '정교하게 설명하다', 'advanced'],
    ['emphasize', '강조하다', 'advanced'],
    ['enumerate', '열거하다', 'advanced'],
    ['evaluate', '평가하다', 'advanced'],
    ['formulate', '공식화하다', 'advanced'],
    ['generalize', '일반화하다', 'advanced'],
    ['infer', '추론하다', 'advanced'],
    ['integrate', '통합하다', 'advanced'],
    ['justify', '정당화하다', 'advanced'],
    ['mediate', '중재하다', 'advanced'],
    ['moderate', '조절하다', 'advanced'],
    ['postulate', '가정하다', 'advanced'],
    ['reiterate', '반복하다', 'advanced'],
    ['scrutinize', '면밀히 조사하다', 'advanced'],
    ['substantiate', '입증하다', 'advanced'],
    ['underscore', '강조하다', 'advanced'],
    ['epistemology', '인식론', 'advanced'],
    ['semantics', '의미론', 'advanced'],
  ]),
  daily: createWords('daily', [
    ['breakfast', '아침 식사'],
    ['lunch', '점심 식사'],
    ['dinner', '저녁 식사'],
    ['snack', '간식'],
    ['drink', '음료'],
    ['coffee', '커피'],
    ['tea', '차'],
    ['juice', '주스'],
    ['water bottle', '물병'],
    ['exercise', '운동', 'intermediate'],
    ['workout', '운동하다', 'intermediate'],
    ['stretch', '스트레칭하다', 'intermediate'],
    ['jog', '조깅하다', 'intermediate'],
    ['walk', '걷다'],
    ['run', '달리다'],
    ['cycle', '자전거 타다', 'intermediate'],
    ['lift', '들어 올리다', 'intermediate'],
    ['yoga', '요가', 'intermediate'],
    ['meditation', '명상', 'intermediate'],
    ['sleep', '잠자다'],
    ['nap', '낮잠'],
    ['alarm', '알람'],
    ['schedule', '일정', 'intermediate'],
    ['calendar', '달력', 'intermediate'],
    ['appointment', '약속', 'intermediate'],
    ['meeting', '회의', 'intermediate'],
    ['deadline', '마감', 'intermediate'],
    ['plan', '계획', 'intermediate'],
    ['goal', '목표', 'intermediate'],
    ['habit', '습관', 'intermediate'],
    ['task', '할 일', 'intermediate'],
    ['project', '프로젝트', 'intermediate'],
    ['note', '메모'],
    ['reminder', '알림', 'intermediate'],
    ['message', '메시지', 'intermediate'],
    ['email', '이메일', 'intermediate'],
    ['call', '전화', 'intermediate'],
    ['charge', '충전하다', 'intermediate'],
    ['battery', '배터리', 'intermediate'],
    ['update', '업데이트하다', 'intermediate'],
    ['download', '다운로드하다', 'intermediate'],
    ['upload', '업로드하다', 'intermediate'],
    ['backup', '백업하다', 'intermediate'],
    ['password', '비밀번호', 'intermediate'],
    ['username', '사용자 이름', 'intermediate'],
    ['wifi', '와이파이', 'intermediate'],
    ['router', '공유기', 'intermediate'],
    ['stream', '스트리밍하다', 'intermediate'],
    ['subscribe', '구독하다', 'intermediate'],
    ['unsubscribe', '구독을 취소하다', 'intermediate'],
    ['repair', '수리하다', 'intermediate'],
    ['service', '서비스', 'intermediate'],
    ['delivery', '배송', 'intermediate'],
    ['order', '주문하다', 'intermediate'],
    ['refund', '환불', 'intermediate'],
    ['exchange', '교환하다', 'intermediate'],
    ['warranty', '보증', 'intermediate'],
    ['receipt', '영수증', 'intermediate'],
    ['invoice', '청구서', 'intermediate'],
    ['budget', '예산', 'intermediate'],
    ['saving', '저축', 'intermediate'],
    ['expense', '지출', 'intermediate'],
    ['balance', '잔액', 'intermediate'],
    ['transfer', '송금하다', 'intermediate'],
    ['account', '계정', 'intermediate'],
    ['subscription', '구독', 'intermediate'],
    ['profile', '프로필', 'intermediate'],
    ['settings', '설정', 'intermediate'],
    ['privacy', '개인 정보', 'intermediate'],
    ['notification', '알림', 'intermediate'],
    ['mute', '음소거하다', 'intermediate'],
    ['block', '차단하다', 'intermediate'],
    ['unblock', '차단 해제하다', 'intermediate'],
    ['laundry', '세탁', 'intermediate'],
    ['grocery', '식료품', 'intermediate'],
    ['cleaning', '청소', 'intermediate'],
    ['commute', '통근하다', 'intermediate'],
    ['dishwasher', '식기세척기', 'intermediate'],
    ['trash', '쓰레기', 'intermediate'],
  ]),
  business: createWords('biz', [
    ['entrepreneur', '기업가', 'advanced'],
    ['innovation', '혁신', 'intermediate'],
    ['strategy', '전략', 'intermediate'],
    ['revenue', '수익', 'intermediate'],
    ['efficiency', '효율성', 'intermediate'],
    ['collaboration', '협업', 'intermediate'],
    ['leadership', '리더십', 'intermediate'],
    ['productivity', '생산성', 'intermediate'],
    ['scalability', '확장성', 'advanced'],
    ['synergy', '시너지', 'advanced'],
    ['diversification', '다각화', 'advanced'],
    ['portfolio', '포트폴리오', 'intermediate'],
    ['partnership', '파트너십', 'intermediate'],
    ['investment', '투자', 'intermediate'],
    ['liquidity', '유동성', 'advanced'],
    ['dividend', '배당금', 'advanced'],
    ['merger', '합병', 'advanced'],
    ['acquisition', '인수', 'advanced'],
    ['liability', '부채', 'advanced'],
    ['asset', '자산', 'intermediate'],
    ['leverage', '레버리지', 'advanced'],
    ['compliance', '준수', 'advanced'],
    ['benchmark', '벤치마크', 'intermediate'],
    ['pipeline', '파이프라인', 'intermediate'],
    ['roadshow', '홍보 순회', 'advanced'],
    ['franchise', '가맹점', 'intermediate'],
    ['outsourcing', '외주', 'intermediate'],
    ['procurement', '조달', 'advanced'],
    ['governance', '지배 구조', 'advanced'],
  ]),
  science: createWords('sci', [
    ['atom', '원자', 'intermediate'],
    ['molecule', '분자', 'intermediate'],
    ['compound', '화합물', 'intermediate'],
    ['element', '원소', 'intermediate'],
    ['ion', '이온', 'intermediate'],
    ['electron', '전자', 'intermediate'],
    ['proton', '양성자', 'intermediate'],
    ['neutron', '중성자', 'intermediate'],
    ['nucleus', '원자핵', 'intermediate'],
    ['bond', '결합', 'intermediate'],
    ['reaction', '반응', 'intermediate'],
    ['catalyst', '촉매', 'intermediate'],
    ['enzyme', '효소', 'intermediate'],
    ['protein', '단백질', 'intermediate'],
    ['carbohydrate', '탄수화물', 'intermediate'],
    ['lipid', '지질', 'intermediate'],
    ['nucleotide', '뉴클레오타이드', 'advanced'],
    ['cell', '세포', 'intermediate'],
    ['tissue', '조직', 'intermediate'],
    ['organ', '기관', 'intermediate'],
    ['organism', '생물체', 'intermediate'],
    ['ecosystem', '생태계', 'intermediate'],
    ['habitat', '서식지', 'intermediate'],
    ['biodiversity', '생물 다양성', 'advanced'],
    ['evolution', '진화', 'intermediate'],
    ['adaptation', '적응', 'intermediate'],
    ['mutation', '돌연변이', 'advanced'],
    ['selection', '선택', 'advanced'],
    ['genome', '유전체', 'advanced'],
    ['gene', '유전자', 'intermediate'],
    ['chromosome', '염색체', 'advanced'],
    ['photosynthesis', '광합성', 'advanced'],
    ['respiration', '호흡', 'intermediate'],
    ['metabolism', '대사', 'advanced'],
    ['diffusion', '확산', 'intermediate'],
    ['osmosis', '삼투', 'advanced'],
    ['gravity', '중력', 'intermediate'],
    ['inertia', '관성', 'intermediate'],
    ['force', '힘', 'intermediate'],
    ['energy', '에너지', 'intermediate'],
    ['power', '동력', 'intermediate'],
    ['work', '일', 'intermediate'],
    ['friction', '마찰', 'intermediate'],
    ['velocity', '속도', 'intermediate'],
    ['acceleration', '가속도', 'advanced'],
    ['momentum', '운동량', 'advanced'],
    ['pressure', '압력', 'intermediate'],
    ['temperature', '온도', 'intermediate'],
    ['entropy', '엔트로피', 'advanced'],
    ['equilibrium', '평형', 'advanced'],
    ['wavelength', '파장', 'intermediate'],
    ['frequency', '주파수', 'intermediate'],
    ['amplitude', '진폭', 'advanced'],
    ['spectrum', '스펙트럼', 'advanced'],
    ['radiation', '복사', 'advanced'],
    ['reflection', '반사', 'intermediate'],
    ['refraction', '굴절', 'advanced'],
    ['diffraction', '회절', 'advanced'],
    ['conductor', '도체', 'intermediate'],
    ['insulator', '부도체', 'intermediate'],
    ['semiconductor', '반도체', 'advanced'],
    ['circuit', '회로', 'intermediate'],
    ['voltage', '전압', 'intermediate'],
    ['current', '전류', 'intermediate'],
    ['resistance', '저항', 'intermediate'],
    ['capacity', '용량', 'intermediate'],
    ['inductance', '인덕턴스', 'advanced'],
    ['experiment', '실험', 'intermediate'],
    ['hypothesis', '가설', 'advanced'],
    ['microscope', '현미경', 'intermediate'],
    ['dataset', '데이터셋', 'intermediate'],
    ['data', '데이터', 'intermediate'],
    ['variable', '변수', 'intermediate'],
    ['function', '함수', 'intermediate'],
    ['parameter', '매개변수', 'intermediate'],
    ['model', '모델', 'intermediate'],
    ['algorithm', '알고리즘', 'intermediate'],
    ['simulation', '시뮬레이션', 'intermediate'],
    ['optimization', '최적화', 'advanced'],
    ['neuron', '뉴런', 'advanced'],
    ['network', '네트워크', 'intermediate'],
    ['interface', '인터페이스', 'intermediate'],
    ['protocol', '프로토콜', 'intermediate'],
    ['bandwidth', '대역폭', 'intermediate'],
    ['latency', '지연 시간', 'intermediate'],
    ['throughput', '처리량', 'advanced'],
    ['encryption', '암호화', 'intermediate'],
    ['decryption', '복호화', 'intermediate'],
    ['hash', '해시', 'intermediate'],
    ['compiler', '컴파일러', 'advanced'],
    ['interpreter', '인터프리터', 'advanced'],
    ['runtime', '실행 환경', 'intermediate'],
    ['container', '컨테이너', 'intermediate'],
    ['virtualization', '가상화', 'advanced'],
    ['quantum', '양자', 'advanced'],
    ['machine learning', '기계 학습', 'advanced'],
  ]),
};

// 테마 옵션
const THEME_OPTIONS: { value: ThemeKey; label: string; emoji: string }[] = [
  { value: 'elementary', label: '초등학생', emoji: '🎒' },
  { value: 'middle', label: '중학생', emoji: '📚' },
  { value: 'high', label: '고등학생', emoji: '🎓' },
  { value: 'travel', label: '해외여행', emoji: '✈️' },
  { value: 'toeic', label: '토익', emoji: '💼' },
  { value: 'toefl', label: '토플', emoji: '🎯' },
  { value: 'daily', label: '실생활', emoji: '🏠' },
  { value: 'business', label: '비즈니스', emoji: '💼' },
  { value: 'science', label: '과학', emoji: '🔬' },
];

export const EnglishWordsWidget = ({ widget, isEditMode, updateWidget }: WidgetProps) => {
  // 저장/복원 최소 상태만
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>('elementary');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  
  // 위젯 크기 확인 (gridSize 또는 size 속성에서 가져오기)
  const widgetSize = useMemo(() => {
    const gridSize = (widget as any)?.gridSize || (widget as any)?.size;
    if (typeof gridSize === 'object' && gridSize !== null) {
      return gridSize;
    }
    if (typeof gridSize === 'string') {
      const [w, h] = gridSize.split('x').map(Number);
      return { w, h };
    }
    return { w: 1, h: 2 }; // 기본값
  }, [(widget as any)?.gridSize, (widget as any)?.size]);
  
  const isCompact = widgetSize.w === 1 && widgetSize.h === 1;

  // 복원 (기존 'toiec' 저장값 호환)
  useEffect(() => {
    const saved = readLocal(widget.id, {
      selectedTheme: 'elementary',
      currentIndex: 0,
      showSettings: false,
    });
    const theme: ThemeKey = saved.selectedTheme === 'toiec' ? 'toeic' : saved.selectedTheme;
    setSelectedTheme(theme);
    setCurrentIndex(Number(saved.currentIndex) || 0);
    setShowSettings(!!saved.showSettings);
  }, [widget.id]);

  // 저장 (간단 디바운스)
  useEffect(() => {
    const t = setTimeout(() => {
      persistOrLocal(widget.id, { selectedTheme, currentIndex, showSettings }, updateWidget);
    }, 200);
    return () => clearTimeout(t);
  }, [widget.id, updateWidget, selectedTheme, currentIndex, showSettings]);

  const words = useMemo(() => THEME_WORDS[selectedTheme] ?? THEME_WORDS.elementary, [selectedTheme]);
  const currentWord = words[currentIndex];

  // 10초 고정 자동 전환
  useEffect(() => {
    if (!words.length) return;
    const id = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, 10_000);
    return () => window.clearInterval(id);
  }, [words.length]);

  const prev = useCallback(() => {
    if (!words.length) return;
    setCurrentIndex((i) => (i === 0 ? words.length - 1 : i - 1));
  }, [words.length]);

  const next = useCallback(() => {
    if (!words.length) return;
    setCurrentIndex((i) => (i + 1) % words.length);
  }, [words.length]);

  if (!currentWord) {
    return (
      <div className="p-3 h-full flex flex-col items-center justify-center text-center">
        <div className="text-2xl mb-2">📚</div>
        <div className="text-sm text-gray-500">단어를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className={`h-full flex ${isCompact ? 'p-1.5' : 'p-3'} overflow-hidden relative`}>
      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 단어 카드 - 컴팩트 모드에서 더 조밀하게 */}
        <div className={`flex-1 flex flex-col items-center justify-center text-center ${isCompact ? 'space-y-1' : 'space-y-2'} min-h-0`}>
        <div className={`${isCompact ? 'text-lg leading-tight' : 'text-3xl'} font-bold text-gray-800 break-words`}>
          {currentWord.english}
        </div>
        {!isCompact && (
          <div className={`text-base text-gray-500`}>
            {currentWord.level === 'beginner' && '🟢 초급'}
            {currentWord.level === 'intermediate' && '🟡 중급'}
            {currentWord.level === 'advanced' && '🔴 고급'}
          </div>
        )}
        {isCompact && (
          <div className={`text-[9px] text-gray-500 leading-tight`}>
            {currentWord.level === 'beginner' && '🟢'}
            {currentWord.level === 'intermediate' && '🟡'}
            {currentWord.level === 'advanced' && '🔴'}
          </div>
        )}
          <div className={`${isCompact ? 'text-xs leading-tight' : 'text-xl'} text-blue-600 font-medium break-words px-1`}>
            {currentWord.korean}
          </div>
        </div>

        {/* 좌/우 네비게이션 - 컴팩트 모드에서 최소화 */}
        <div className={`flex items-center justify-between shrink-0 ${isCompact ? 'mt-0.5' : 'mt-2'}`}>
          <Button 
            size="sm" 
            variant="outline" 
            className={`${isCompact ? 'h-5 w-5 p-0 border-gray-300' : 'h-8 w-8 p-0'}`} 
            onClick={prev}
            title="이전 단어"
          >
            <ChevronLeft className={isCompact ? 'w-2.5 h-2.5' : 'w-4 h-4'} />
          </Button>
          {!isCompact && (
            <div className="text-xs text-gray-500">10초마다 자동 전환</div>
          )}
          {isCompact && (
            <div className="text-[8px] text-gray-400">10초</div>
          )}
          <Button 
            size="sm" 
            variant="outline" 
            className={`${isCompact ? 'h-5 w-5 p-0 border-gray-300' : 'h-8 w-8 p-0'}`} 
            onClick={next}
            title="다음 단어"
          >
            <ChevronRight className={isCompact ? 'w-2.5 h-2.5' : 'w-4 h-4'} />
          </Button>
        </div>
      </div>

      {/* 설정 버튼 (편집 모드일 때만) - 오른쪽 상단 고정 */}
      {isEditMode && (
        <button
          onClick={() => setShowSettings(s => !s)}
          className={`absolute ${isCompact ? 'h-4 w-4 p-0' : 'h-6 w-6 p-0'} flex items-center justify-center rounded hover:bg-gray-100 transition-colors z-10`}
          title="설정"
          style={{
            top: isCompact ? '6px' : '12px',
            right: isCompact ? '6px' : '12px',
          }}
        >
          <Settings className={isCompact ? 'w-2.5 h-2.5 text-gray-600' : 'w-3 h-3 text-gray-600'} />
        </button>
      )}

      {/* 설정 패널 (편집 모드에서만) - 오른쪽 스크롤 영역 */}
      {isEditMode && showSettings && (
        <div className={`absolute top-0 right-0 bottom-0 ${isCompact ? 'w-24' : 'w-48'} bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-lg z-20 flex flex-col`}>
          <div className={`${isCompact ? 'p-1.5' : 'p-2'} border-b border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0`}>
            <span className={`${isCompact ? 'text-[10px]' : 'text-xs'} font-medium text-gray-700 dark:text-gray-300`}>설정</span>
            <button
              onClick={() => setShowSettings(false)}
              className={`${isCompact ? 'h-4 w-4 p-0' : 'h-5 w-5 p-0'} flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
              title="닫기"
            >
              <X className={isCompact ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className={`${isCompact ? 'p-1.5' : 'p-2'} space-y-2`}>
              <label className={`${isCompact ? 'text-[10px]' : 'text-xs'} font-medium text-gray-700 dark:text-gray-300 block`}>테마 선택</label>
              <div className={`grid ${isCompact ? 'grid-cols-1' : 'grid-cols-1'} gap-1`}>
                {THEME_OPTIONS.map(theme => (
                  <Button
                    key={theme.value}
                    size="sm"
                    variant={selectedTheme === theme.value ? 'default' : 'outline'}
                    className={`${isCompact ? 'h-5 text-[10px] px-1' : 'h-6 text-xs'} justify-start w-full`}
                    onClick={() => { 
                      setSelectedTheme(theme.value); 
                      setCurrentIndex(0); 
                      setShowSettings(false); 
                    }}
                  >
                    <span className="mr-1">{theme.emoji}</span>
                    <span className="truncate">{theme.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
