import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Globe, Cloud, Rss, Search, Settings } from 'lucide-react';

// 뉴스 피드 위젯
export const NewsWidget = ({ widget, isEditMode, updateWidget }: any) => {
  const [selectedCategory, setSelectedCategory] = useState(widget?.content?.category || '전체');
  const [showSettings, setShowSettings] = useState(false);
  
  const allNews = [
    { id: 1, title: 'AI 기술 발전으로 인한 업계 변화', source: 'TechNews', time: '2시간 전', category: '기술' },
    { id: 2, title: '새로운 스마트폰 출시 소식', source: 'MobileWorld', time: '4시간 전', category: '기술' },
    { id: 3, title: '환경 친화적 에너지 솔루션', source: 'GreenTech', time: '6시간 전', category: '환경' },
    { id: 4, title: '정부 경제 정책 발표', source: 'EconomyDaily', time: '1시간 전', category: '경제' },
    { id: 5, title: '축구 국가대표 경기 결과', source: 'SportsToday', time: '3시간 전', category: '스포츠' },
    { id: 6, title: '신작 영화 개봉 소식', source: 'MovieNews', time: '5시간 전', category: '연예' },
    { id: 7, title: '건강 관리 팁', source: 'HealthGuide', time: '7시간 전', category: '건강' },
    { id: 8, title: '부동산 시장 동향', source: 'RealEstate', time: '8시간 전', category: '경제' }
  ];
  
  const news = selectedCategory === '전체' 
    ? allNews 
    : allNews.filter(n => n.category === selectedCategory);

  const [keywords, setKeywords] = useState(['AI', '기술', '스마트폰']);
  const [newKeyword, setNewKeyword] = useState('');
  
  const categories = ['전체', '기술', '경제', '환경', '스포츠', '연예', '건강'];

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  return (
    <div className="p-2 h-full flex flex-col">
      {/* 보기 모드에서는 내부 카드/헤더를 렌더하지 않음 (중첩 카드 제거) */}
      {isEditMode && (
        <div className="mb-2 shrink-0">
          <div className="text-sm font-semibold text-gray-700 mb-1">카테고리</div>
          <div className="flex flex-wrap gap-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-1 text-xs rounded ${
                  selectedCategory === cat 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 뉴스 목록 (플랫 리스트) */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-200">
        {news.slice(0, 5).map(item => (
          <div key={item.id} className="py-2">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
              {item.title}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 mt-0.5">
              <span>{item.source}</span>
              <span>{item.time}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 편집 모드: 키워드 관리 */}
      {isEditMode && (
        <div className="mt-2 pt-2 border-t border-gray-200 shrink-0">
          <div className="space-y-2">
            <div className="flex gap-1">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="키워드 추가..."
                className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded"
                onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
              />
              <Button size="sm" className="h-6 text-xs" onClick={addKeyword}>
                추가
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {keywords.map(keyword => (
                <span
                  key={keyword}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                >
                  {keyword}
                  <button
                    onClick={() => removeKeyword(keyword)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// RSS 피드 위젯
// RSSWidget 제거됨

// 영감명언 위젯 - 카테고리별 자동 재생
export const QuoteWidget = ({ widget, isEditMode, updateWidget }: any) => {
  // 카테고리별 명언 데이터
  const QUOTE_CATEGORIES: Record<string, string[]> = {
    motivation: [
      '성공은 작은 노력이 반복된 결과다. — 로버트 콜리어',
      '지금 하지 않으면, 1년 뒤에도 같은 곳에 있을 것이다. — 카렌 램',
      '완벽보다 완료. — 셰릴 샌드버그',
      '꿈을 이루고 싶다면 먼저 깨어나라. — 마크 트웨인',
      '성공의 비밀은 시작하는 것이다. — 마크 트웨인',
      '가능성을 믿어라. 그럼 가능해진다. — 마하트마 간디',
      '오늘 할 수 있는 일을 내일로 미루지 마라. — 벤저민 프랭클린',
      '인생은 자전거를 타는 것과 같다. 균형을 잡으려면 움직여야 한다. — 알베르트 아인슈타인'
    ],
    wisdom: [
      '천 리 길도 한 걸음부터. — 노자',
      '실패는 성공의 어머니다. — 토마스 에디슨',
      '지식은 힘이다. — 프랜시스 베이컨',
      '시간은 금이다. — 벤저민 프랭클린',
      '인내는 쓰지만 그 열매는 달다. — 아리스토텔레스',
      '배움에는 끝이 없다. — 공자',
      '진실은 자유를 가져다준다. — 예수',
      '지혜는 경험에서 나온다. — 아리스토텔레스'
    ],
    life: [
      '인생은 아름다운 모험이다. — 헬렌 켈러',
      '삶은 선택의 연속이다. — 장 폴 사르트르',
      '행복은 여행이지 목적지가 아니다. — 벤 스위트랜드',
      '인생은 10%는 당신에게 일어나는 일이고, 90%는 당신이 그것에 어떻게 반응하는가이다. — 찰스 스윈돌',
      '오늘은 어제 죽은 사람이 그토록 바라던 내일이다. — 찰스 디킨스',
      '인생은 짧다. 시간을 낭비하지 마라. — 스티브 잡스',
      '삶의 의미는 다른 사람을 돕는 것이다. — 달라이 라마',
      '인생은 공정하지 않다. 그것에 익숙해져라. — 빌 게이츠'
    ],
    success: [
      '성공은 준비된 자에게 찾아온다. — 루이 파스퇴르',
      '성공은 1%의 영감과 99%의 땀이다. — 토마스 에디슨',
      '성공의 열쇠는 실패를 두려워하지 않는 것이다. — 빌 코스비',
      '성공은 최고점에 도달하는 것이 아니라 최고점을 향해 올라가는 것이다. — 존 우든',
      '성공은 마지막에 웃는 자의 것이다. — 나폴레옹',
      '성공은 준비와 기회가 만나는 지점이다. — 세네카',
      '성공은 실패에서 실패로 가면서도 열정을 잃지 않는 것이다. — 윈스턴 처칠',
      '성공은 매일의 작은 노력들이 쌓인 결과다. — 로버트 콜리어'
    ],
    love: [
      '사랑은 모든 것을 용서한다. — 성경',
      '사랑은 눈으로 보는 것이 아니라 마음으로 보는 것이다. — 헬렌 켈러',
      '진정한 사랑은 조건이 없다. — 무명',
      '사랑은 주는 것이다. — 성경',
      '사랑은 시간과 함께 자란다. — 윌리엄 셰익스피어',
      '사랑은 두 사람이 함께 같은 방향을 바라보는 것이다. — 앙투안 드 생텍쥐페리',
      '사랑은 이해하는 것이다. — 무명',
      '사랑은 행동이다. — 무명'
    ],
    friendship: [
      '진정한 친구는 하나면 충분하다. — 아리스토텔레스',
      '친구는 필요할 때 나타나는 사람이다. — 무명',
      '친구는 가족 중에서 우리가 선택한 사람이다. — 무명',
      '진정한 우정은 시간과 거리를 초월한다. — 무명',
      '친구는 당신의 모든 이야기를 알고도 당신을 사랑하는 사람이다. — 무명',
      '우정은 영혼이 두 개의 몸에 거주하는 것이다. — 아리스토텔레스',
      '친구는 당신이 될 수 있는 최고의 사람이 되도록 도와주는 사람이다. — 헨리 포드',
      '진정한 친구는 당신의 성공을 진심으로 축하하는 사람이다. — 무명'
    ],
    work: [
      '일은 인생의 절반이다. — 토마스 에디슨',
      '열정 없이는 위대한 일을 할 수 없다. — 랄프 월도 에머슨',
      '성공하는 사람은 실패를 두려워하지 않는다. — 무명',
      '일은 사랑의 표현이다. — 칼릴 지브란',
      '최고의 일은 즐거움에서 나온다. — 아리스토텔레스',
      '일은 인생을 의미 있게 만든다. — 빅터 프랭클',
      '성공은 준비된 자에게 찾아온다. — 루이 파스퇴르',
      '일은 당신의 정체성을 보여준다. — 무명'
    ]
  };

  const CATEGORY_OPTIONS = [
    { value: 'motivation', label: '동기부여', emoji: '💪' },
    { value: 'wisdom', label: '지혜', emoji: '🧠' },
    { value: 'life', label: '인생', emoji: '🌱' },
    { value: 'success', label: '성공', emoji: '🏆' },
    { value: 'love', label: '사랑', emoji: '❤️' },
    { value: 'friendship', label: '우정', emoji: '🤝' },
    { value: 'work', label: '일', emoji: '💼' },
  ];

  const [selectedCategory, setSelectedCategory] = useState(widget?.content?.category || 'motivation');
  const [showSettings, setShowSettings] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [autoPlayInterval, setAutoPlayInterval] = useState(widget?.content?.autoPlayInterval || 10);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentQuotes = QUOTE_CATEGORIES[selectedCategory] || QUOTE_CATEGORIES.motivation;

  // 자동 재생
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % currentQuotes.length);
    }, autoPlayInterval * 1000);

    return () => clearInterval(interval);
  }, [currentQuotes.length, autoPlayInterval]);

  const changeCategory = (category: string) => {
    setSelectedCategory(category);
    setCurrentIndex(0);
    updateWidget?.(widget.id, { 
      ...widget, 
      content: { 
        ...widget.content, 
        category,
        autoPlayInterval 
      } 
    });
  };

  const changeInterval = (interval: number) => {
    setAutoPlayInterval(interval);
    updateWidget?.(widget.id, { 
      ...widget, 
      content: { 
        ...widget.content, 
        category: selectedCategory,
        autoPlayInterval: interval 
      } 
    });
  };

  return (
    <div className="p-3 h-full flex flex-col">
      {/* 헤더 */}
      {isEditMode && (
        <div className="flex items-center justify-end mb-3 shrink-0">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => setShowSettingsModal(true)}
            title="설정"
          >
            <Settings className="w-3 h-3" />
          </Button>
        </div>
      )}

      {/* 설정 모달 */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-[90vw] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">영감 명언 설정</h3>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => setShowSettingsModal(false)}
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">카테고리 선택</label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORY_OPTIONS.map(category => (
                    <Button
                      key={category.value}
                      size="sm"
                      variant={selectedCategory === category.value ? 'default' : 'outline'}
                      className="h-8 text-sm justify-start"
                      onClick={() => changeCategory(category.value)}
                    >
                      <span className="mr-2">{category.emoji}</span>
                      {category.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">자동 재생 간격</label>
                <div className="flex gap-2">
                  {[10, 20, 30].map(interval => (
                    <Button
                      key={interval}
                      size="sm"
                      variant={autoPlayInterval === interval ? 'default' : 'outline'}
                      className="h-8 text-sm flex-1"
                      onClick={() => changeInterval(interval)}
                    >
                      {interval}초
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button
                onClick={() => setShowSettingsModal(false)}
                className="px-4"
              >
                완료
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 명언 표시 */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-lg w-full">
          <div className="text-sm text-gray-800 dark:text-gray-100 leading-relaxed">
            {currentQuotes[currentIndex]}
          </div>
        </div>
      </div>
    </div>
  );
};

// 구글 검색 위젯
export const GoogleSearchWidget = ({ widget, isEditMode, updateWidget }: any) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
    }
  };

  return (
    <div className="p-1 h-full flex flex-col">
      <div className="flex items-center justify-center mb-1 shrink-0">
        <div className="text-sm font-normal">
          <span className="text-[#4285F4]">G</span>
          <span className="text-[#EA4335]">o</span>
          <span className="text-[#FBBC05]">o</span>
          <span className="text-[#4285F4]">g</span>
          <span className="text-[#34A853]">l</span>
          <span className="text-[#EA4335]">e</span>
        </div>
      </div>
      
      <form onSubmit={handleSearch} className="flex-1 flex flex-col justify-center">
        <div className="relative max-w-[85%] mx-auto w-full">
          {/* 통합 검색바 */}
          <div className="flex items-center bg-white border border-blue-500 rounded-lg shadow-sm hover:shadow-md transition-shadow h-[70%]">
            {/* 왼쪽 아이콘 */}
            <div className="flex items-center pl-2 pr-1">
              <div className="w-3 h-3 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-2 h-2">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <div className="w-px h-2 bg-gray-300 mx-1"></div>
            </div>
            
            {/* 검색 입력 필드 */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Google 검색"
              className="flex-1 px-1 py-0.5 text-xs border-none outline-none bg-transparent placeholder-gray-500"
            />
            
            {/* 오른쪽 아이콘들 */}
            <div className="flex items-center pr-1">
              <button
                type="button"
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                title="음성 검색"
              >
                <svg className="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </button>
              <button
                type="button"
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                title="이미지 검색"
              >
                <svg className="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

// 네이버 검색 위젯
export const NaverSearchWidget = ({ widget, isEditMode, updateWidget }: any) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.open(`https://search.naver.com/search.naver?query=${encodeURIComponent(searchQuery)}`, '_blank');
    }
  };

  return (
    <div className="p-1 h-full flex flex-col">
      <form onSubmit={handleSearch} className="flex-1 flex flex-col justify-center">
        <div className="relative max-w-[85%] mx-auto w-full">
          {/* 통합 검색바 */}
          <div className="flex items-center bg-white border border-green-500 rounded-lg shadow-sm hover:shadow-md transition-shadow h-[70%]">
            {/* 왼쪽 아이콘 */}
            <div className="flex items-center pl-2 pr-1">
              <div className="w-3 h-3 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-2 h-2">
                  <path fill="#03C75A" d="M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845Z"/>
                </svg>
              </div>
              <div className="w-px h-2 bg-gray-300 mx-1"></div>
            </div>
            
            {/* 검색 입력 필드 */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="네이버 검색"
              className="flex-1 px-1 py-0.5 text-xs border-none outline-none bg-transparent placeholder-gray-500"
            />
            
            {/* 오른쪽 아이콘들 */}
            <div className="flex items-center pr-2">
              <button
                type="button"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="키보드"
              >
                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z"/>
                </svg>
              </button>
              <div className="w-px h-4 bg-gray-300 mx-1"></div>
              <button
                type="submit"
                className="p-2 bg-green-500 hover:bg-green-600 rounded-full transition-colors"
                title="검색"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

// 법령 검색 위젯
export const LawSearchWidget = ({ widget, isEditMode, updateWidget }: any) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.open(`https://www.law.go.kr/LSW/lsInfoP.do?efYd=20231201&lsiSeq=234567&chrClsCd=010202&urlMode=lsInfoP&viewCls=lsInfoP&ancYnChk=0#0000`, '_blank');
    }
  };

  return (
    <div className="p-1 h-full flex flex-col">
      <div className="flex items-center gap-1 mb-1 shrink-0">
        <div className="w-4 h-4 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-3 h-3">
            <path fill="#4A90E2" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <h4 className="font-semibold text-xs text-gray-800">법제처 검색</h4>
      </div>
      
      <form onSubmit={handleSearch} className="flex-1 flex flex-col justify-center">
        <div className="relative z-10 max-w-[85%] mx-auto w-full">
          {/* 통합 검색바 */}
          <div className="flex items-center bg-white border border-blue-500 shadow-sm hover:shadow-md transition-shadow h-[70%]">
            {/* 왼쪽 드롭다운 */}
            <div className="flex items-center px-2 py-1 border-r border-gray-200">
              <span className="text-xs font-medium text-gray-700 mr-1">현행법령</span>
              <svg className="w-2 h-2 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </div>
            
            {/* 검색 입력 필드 */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="검색어를 입력하세요"
              className="flex-1 px-2 py-0.5 text-xs border-none outline-none bg-transparent placeholder-gray-500"
            />
            
            {/* 오른쪽 검색 버튼 */}
            <button
              type="submit"
              className="px-2 py-0.5 bg-blue-500 hover:bg-blue-600 text-white transition-colors"
              title="검색"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};