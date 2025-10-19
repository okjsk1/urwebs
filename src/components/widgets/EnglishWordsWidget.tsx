// 영어 단어 학습 위젯 - 단순 자동전환판 (10초 고정, 테마 선택만)
// 기능: 10초마다 자동으로 다음 단어로 이동, 테마 변경 가능(편집 모드에서만), 불필요 기능/통계 제거

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';
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

// --- 단어 데이터 (확장 버전) ---
const THEME_WORDS: Record<ThemeKey, Word[]> = {
  elementary: [
    W('e1','apple','사과'), W('e2','book','책'), W('e3','cat','고양이'), W('e4','dog','개'),
    W('e5','house','집'), W('e6','water','물'), W('e7','friend','친구'), W('e8','happy','행복한'),
    W('e9','school','학교'), W('e10','teacher','선생님'), W('e11','student','학생'), W('e12','family','가족'),
    W('e13','mother','어머니'), W('e14','father','아버지'), W('e15','sister','언니/누나'), W('e16','brother','형/오빠'),
    W('e17','car','자동차'), W('e18','bike','자전거'), W('e19','food','음식'), W('e20','milk','우유'),
    W('e21','bread','빵'), W('e22','rice','쌀'), W('e23','fish','물고기'), W('e24','chicken','닭'),
    W('e25','red','빨간색'), W('e26','blue','파란색'), W('e27','green','초록색'), W('e28','yellow','노란색'),
    // 추가
    W('e29','window','창문'), W('e30','door','문'), W('e31','table','탁자'), W('e32','chair','의자'),
    W('e33','flower','꽃'), W('e34','tree','나무'), W('e35','sun','태양'), W('e36','moon','달'), W('e37','star','별'),
  ],
  middle: [
    W('m1','beautiful','아름다운','intermediate'), W('m2','important','중요한','intermediate'),
    W('m3','difficult','어려운','intermediate'), W('m4','interesting','흥미로운','intermediate'),
    W('m5','comfortable','편안한','intermediate'), W('m6','necessary','필요한','intermediate'),
    W('m7','possible','가능한','intermediate'), W('m8','different','다른','intermediate'),
    W('m9','wonderful','훌륭한','intermediate'), W('m10','fantastic','환상적인','intermediate'),
    // 추가
    W('m11','efficient','효율적인','intermediate'),
    W('m12','curious','호기심 많은','intermediate'),
    W('m13','creative','창의적인','intermediate'),
    W('m14','polite','공손한','intermediate'),
    W('m15','helpful','도움이 되는','intermediate'),
  ],
  high: [
    W('h1','serendipity','우연한 발견','advanced'),
    W('h2','ephemeral','일시적인','advanced'),
    W('h3','ubiquitous','어디에나 있는','advanced'),
    W('h4','mellifluous','감미로운(소리)','advanced'),
    W('h5','perspicacious','통찰력 있는','advanced'),
    W('h6','luminous','빛나는','advanced'),
    W('h7','resilient','회복력 있는','advanced'),
    W('h8','eloquent','유창한','advanced'),
    // 추가
    W('h9','meticulous','꼼꼼한','advanced'),
    W('h10','alacrity','민첩, 열의','advanced'),
  ],
  travel: [
    W('t1','passport','여권','intermediate'), W('t2','airport','공항','intermediate'),
    W('t3','hotel','호텔'), W('t4','restaurant','레스토랑','intermediate'),
    W('t5','ticket','표'), W('t6','luggage','짐','intermediate'),
    W('t7','currency','통화','intermediate'), W('t8','souvenir','기념품','intermediate'),
    // 추가
    W('t9','boarding pass','탑승권','intermediate'),
    W('t10','reservation','예약','intermediate'),
    W('t11','customs','세관','intermediate'),
    W('t12','itinerary','여행 일정','intermediate'),
  ],
  toeic: [
    W('to1','meeting','회의','intermediate'), W('to2','deadline','마감일','intermediate'),
    W('to3','budget','예산','intermediate'), W('to4','contract','계약','intermediate'),
    W('to5','schedule','일정','intermediate'), W('to6','presentation','발표','intermediate'),
    W('to7','negotiation','협상','advanced'), W('to8','investment','투자','intermediate'),
    // 추가
    W('to9','proposal','제안서','intermediate'),
    W('to10','invoice','송장','intermediate'),
  ],
  toefl: [
    W('tf1','hypothesis','가설','advanced'), W('tf2','analysis','분석','advanced'),
    W('tf3','synthesis','종합','advanced'), W('tf4','evaluation','평가','advanced'),
    W('tf5','interpretation','해석','advanced'), W('tf6','comprehensive','포괄적인','advanced'),
    W('tf7','sophisticated','정교한','advanced'), W('tf8','substantial','상당한','advanced'),
    // 추가
    W('tf9','phenomenon','현상','advanced'),
    W('tf10','correlation','상관관계','advanced'),
  ],
  daily: [
    W('d1','breakfast','아침식사'), W('d2','exercise','운동','intermediate'),
    W('d3','shopping','쇼핑'), W('d4','weather','날씨'),
    W('d5','transportation','교통수단','intermediate'), W('d6','entertainment','오락','intermediate'),
    W('d7','communication','소통','intermediate'), W('d8','technology','기술','intermediate'),
    // 추가
    W('d9','laundry','세탁','intermediate'),
    W('d10','appointment','약속/예약','intermediate'),
  ],
  business: [
    W('b1','entrepreneur','기업가','advanced'), W('b2','innovation','혁신','intermediate'),
    W('b3','strategy','전략','intermediate'), W('b4','revenue','수익','intermediate'),
    W('b5','efficiency','효율성','intermediate'), W('b6','collaboration','협력','intermediate'),
    W('b7','leadership','리더십','intermediate'), W('b8','productivity','생산성','intermediate'),
    // 추가
    W('b9','stakeholder','이해관계자','intermediate'),
    W('b10','scalability','확장성','advanced'),
  ],
  science: [
    W('s1','experiment','실험','intermediate'), W('s2','hypothesis','가설','advanced'),
    W('s3','microscope','현미경','intermediate'), W('s4','molecule','분자','intermediate'),
    W('s5','ecosystem','생태계','intermediate'), W('s6','evolution','진화','intermediate'),
    W('s7','photosynthesis','광합성','advanced'), W('s8','metabolism','신진대사','advanced'),
    // 추가
    W('s9','gravity','중력','intermediate'),
    W('s10','atom','원자','intermediate'),
  ],
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
    <div className="p-3 h-full flex flex-col">
      {/* 설정 패널 (편집 모드에서만) */}
      {isEditMode && showSettings && (
        <div className="mb-3 p-2 bg-gray-50 rounded-lg space-y-2 shrink-0">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">테마 선택</label>
            <div className="grid grid-cols-2 gap-1">
              {THEME_OPTIONS.map(theme => (
                <Button
                  key={theme.value}
                  size="sm"
                  variant={selectedTheme === theme.value ? 'default' : 'outline'}
                  className="h-6 text-xs justify-start"
                  onClick={() => { 
                    setSelectedTheme(theme.value); 
                    setCurrentIndex(0); 
                    setShowSettings(false); 
                  }}
                >
                  <span className="mr-1">{theme.emoji}</span>
                  {theme.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 상단 표시줄 */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
        <div>{currentIndex + 1} / {words.length}</div>
        {isEditMode && (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => setShowSettings(s => !s)}
            title="설정"
          >
            <Settings className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* 단어 카드 */}
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
        <div className="text-2xl font-bold text-gray-800">{currentWord.english}</div>
        <div className="text-sm text-gray-500">
          {currentWord.level === 'beginner' && '🟢 초급'}
          {currentWord.level === 'intermediate' && '🟡 중급'}
          {currentWord.level === 'advanced' && '🔴 고급'}
        </div>
        <div className="text-lg text-blue-600 font-medium">{currentWord.korean}</div>
      </div>

      {/* 좌/우 네비게이션 */}
      <div className="flex items-center justify-between shrink-0">
        <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={prev}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="text-xs text-gray-500">10초마다 자동 전환</div>
        <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={next}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
