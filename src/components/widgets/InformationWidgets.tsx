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
    <div className="p-3 h-full flex flex-col">
      {/* 헤더 */}
      <div className="text-center mb-3 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xl">🌐</div>
          <h4 className="font-semibold text-sm text-gray-800 flex-1">뉴스 피드</h4>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Settings className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        
        {/* 관심분야 선택 */}
        {showSettings && (
          <div className="mb-2 p-2 bg-gray-50 rounded">
            <div className="text-xs text-gray-600 mb-2">관심분야</div>
            <div className="flex flex-wrap gap-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    updateWidget?.(widget.id, { ...widget, content: { ...widget.content, category: cat } });
                  }}
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
        
        <p className="text-xs text-gray-500">{selectedCategory} 뉴스</p>
      </div>
      
      {/* 키워드 관리 */}
      {isEditMode && (
        <div className="mb-3">
          <div className="flex gap-1 mb-2">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
              placeholder="키워드 추가"
              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
            />
            <Button size="sm" onClick={addKeyword} className="h-6 w-6 p-0">
              +
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {keywords.map(keyword => (
              <span
                key={keyword}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center gap-1"
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
      )}
      
      {/* 뉴스 목록 */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {news.length === 0 ? (
          <div className="text-center text-gray-500 text-xs py-4">
            해당 분야의 뉴스가 없습니다
          </div>
        ) : (
          news.map(article => (
            <div key={article.id} className="p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs text-blue-600 bg-blue-100 px-1 rounded">
                  {article.category}
                </span>
                <span className="text-xs text-gray-500">{article.time}</span>
              </div>
              <div className="text-sm font-medium text-gray-800 mb-1">
                {article.title}
              </div>
              <div className="text-xs text-gray-500">{article.source}</div>
            </div>
          ))
        )}
      </div>
      
      <Button 
        size="sm" 
        variant="outline" 
        className="w-full h-8 text-xs mt-3 shrink-0"
        onClick={() => window.open('https://news.google.com', '_blank')}
      >
        더 많은 뉴스 보기
      </Button>
    </div>
  );
};

// 날씨 정보 위젯
export const WeatherWidget = ({ widget, isEditMode, updateWidget }: any) => {
  const [weatherData, setWeatherData] = useState({
    temperature: 22,
    condition: '맑음',
    humidity: 60,
    windSpeed: 5,
    location: '서울',
    feelsLike: 24,
    uvIndex: 6,
    pressure: 1013,
    visibility: 10,
    sunrise: '06:30',
    sunset: '18:45',
    hourly: [
      { time: '14:00', temp: 22, icon: '☀️' },
      { time: '15:00', temp: 23, icon: '☀️' },
      { time: '16:00', temp: 24, icon: '⛅' },
      { time: '17:00', temp: 23, icon: '⛅' },
      { time: '18:00', temp: 21, icon: '🌤️' }
    ]
  });

  const [showDetails, setShowDetails] = useState(false);
  const [viewMode, setViewMode] = useState<'current' | 'hourly' | 'daily'>('current');
  const [customLocation, setCustomLocation] = useState(weatherData.location);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  
  // 날씨 데이터 확장 (시간대별, 일별)
  const extendedWeatherData = {
    ...weatherData,
    daily: [
      { day: '오늘', high: 28, low: 18, icon: '☀️', condition: '맑음' },
      { day: '내일', high: 26, low: 16, icon: '⛅', condition: '흐림' },
      { day: '모레', high: 24, low: 14, icon: '🌧️', condition: '비' },
      { day: '토요일', high: 27, low: 17, icon: '☀️', condition: '맑음' },
      { day: '일요일', high: 25, low: 15, icon: '⛅', condition: '흐림' }
    ],
    hourlyExtended: [
      { time: '06:00', temp: 18, icon: '🌅', condition: '맑음' },
      { time: '09:00', temp: 22, icon: '☀️', condition: '맑음' },
      { time: '12:00', temp: 26, icon: '☀️', condition: '맑음' },
      { time: '15:00', temp: 28, icon: '☀️', condition: '맑음' },
      { time: '18:00', temp: 25, icon: '🌤️', condition: '구름조금' },
      { time: '21:00', temp: 21, icon: '🌙', condition: '맑음' },
      { time: '00:00', temp: 19, icon: '🌙', condition: '맑음' },
      { time: '03:00', temp: 17, icon: '🌙', condition: '맑음' }
    ]
  };

  const handleLocationChange = () => {
    if (customLocation.trim()) {
      setWeatherData(prev => ({ ...prev, location: customLocation.trim() }));
      setIsEditingLocation(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* 위치 설정 */}
      <div className="p-2 border-b border-gray-200">
        {isEditMode && (
          <div className="flex items-center gap-1 mb-2">
            <input
              type="text"
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLocationChange()}
              onBlur={handleLocationChange}
              className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded"
              placeholder="위치 입력"
            />
            <Button
              size="sm"
              variant="outline"
              className="h-6 w-6 p-0"
              onClick={() => setIsEditingLocation(!isEditingLocation)}
            >
              <Settings className="w-3 h-3" />
            </Button>
          </div>
        )}
        <div className="text-xs text-gray-500 text-center">{extendedWeatherData.location}</div>
      </div>

      {/* 뷰 모드 선택 */}
      <div className="flex gap-1 p-2 border-b border-gray-200">
        <Button 
          size="sm" 
          variant={viewMode === 'current' ? 'default' : 'outline'}
          className="flex-1 h-6 text-xs"
          onClick={() => setViewMode('current')}
        >
          현재
        </Button>
        <Button 
          size="sm" 
          variant={viewMode === 'hourly' ? 'default' : 'outline'}
          className="flex-1 h-6 text-xs"
          onClick={() => setViewMode('hourly')}
        >
          시간별
        </Button>
        <Button 
          size="sm" 
          variant={viewMode === 'daily' ? 'default' : 'outline'}
          className="flex-1 h-6 text-xs"
          onClick={() => setViewMode('daily')}
        >
          일별
        </Button>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'current' && (
          <div className="p-3">
            {/* 메인 날씨 정보 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-col">
                <div className="text-4xl mb-1">{extendedWeatherData.condition === '맑음' ? '☀️' : extendedWeatherData.condition === '흐림' ? '☁️' : '🌧️'}</div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-gray-800">{extendedWeatherData.temperature}°</div>
                <div className="text-sm text-gray-500">체감 {extendedWeatherData.feelsLike}°</div>
              </div>
            </div>
            
            {/* 상세 정보 */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">습도</span>
                <span className="font-medium">{extendedWeatherData.humidity}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">바람</span>
                <span className="font-medium">{extendedWeatherData.windSpeed}m/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">자외선</span>
                <span className="font-medium">{extendedWeatherData.uvIndex}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">기압</span>
                <span className="font-medium">{extendedWeatherData.pressure}hPa</span>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'hourly' && (
          <div className="p-3">
            <div className="text-sm font-medium text-gray-800 mb-3">24시간 예보</div>
            <div className="space-y-2">
              {extendedWeatherData.hourlyExtended.map((hour, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-600">{hour.time}</div>
                  <div className="text-lg">{hour.icon}</div>
                  <div className="text-sm font-medium">{hour.temp}°</div>
                  <div className="text-xs text-gray-500 w-16 text-right">{hour.condition}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'daily' && (
          <div className="p-3">
            <div className="text-sm font-medium text-gray-800 mb-3">5일 예보</div>
            <div className="space-y-2">
              {extendedWeatherData.daily.map((day, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-600 w-12">{day.day}</div>
                  <div className="text-lg">{day.icon}</div>
                  <div className="text-xs text-gray-500 w-16">{day.condition}</div>
                  <div className="text-sm font-medium">{day.high}°/{day.low}°</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 소형 날씨 위젯
export const WeatherSmallWidget = ({ widget, isEditMode, updateWidget }: any) => {
  const [weatherData] = useState({
    temperature: 22,
    condition: '맑음',
    location: '서울'
  });

  return (
    <div className="h-full flex flex-col justify-center items-center text-center p-3">
      <div className="text-4xl mb-3">☀️</div>
      <div className="text-2xl font-bold text-gray-800 mb-1">{weatherData.temperature}°</div>
      <div className="text-xs text-gray-500 mb-1">{weatherData.condition}</div>
      <div className="text-xs text-gray-400">{weatherData.location}</div>
    </div>
  );
};

// 중형 날씨 위젯
export const WeatherMediumWidget = ({ widget, isEditMode, updateWidget }: any) => {
  const [weatherData] = useState({
    temperature: 22,
    condition: '맑음',
    location: '서울',
    feelsLike: 24,
    humidity: 60
  });

  return (
    <div className="h-full flex items-center justify-between p-3">
      <div className="flex flex-col">
        <div className="text-3xl mb-1">{weatherData.condition === '맑음' ? '☀️' : '☁️'}</div>
        <div className="text-xs text-gray-500">{weatherData.location}</div>
      </div>
      <div className="text-right">
        <div className="text-3xl font-bold text-gray-800">{weatherData.temperature}°</div>
        <div className="text-xs text-gray-500">체감 {weatherData.feelsLike}°</div>
        <div className="text-xs text-gray-500">습도 {weatherData.humidity}%</div>
      </div>
    </div>
  );
};

// RSS 피드 위젯
// RSSWidget 제거됨

// 명언 위젯
export const QuoteWidget = ({ widget, isEditMode, updateWidget }: any) => {
  const defaultQuotes = [
    '성공은 작은 노력이 반복된 결과다. — 로버트 콜리어',
    '지금 하지 않으면, 1년 뒤에도 같은 곳에 있을 것이다. — 카렌 램',
    '완벽보다 완료. — 셰릴 샌드버그',
    '천 리 길도 한 걸음부터. — 노자',
    '꿈을 이루고 싶다면 먼저 깨어나라. — 마크 트웨인',
    '실패는 성공의 어머니다. — 토마스 에디슨',
    '오늘 할 수 있는 일을 내일로 미루지 마라. — 벤저민 프랭클린',
    '인생은 자전거를 타는 것과 같다. 균형을 잡으려면 움직여야 한다. — 알베르트 아인슈타인',
    '가능성을 믿어라. 그럼 가능해진다. — 마하트마 간디',
    '성공의 비밀은 시작하는 것이다. — 마크 트웨인'
  ];
  
  // 위젯 콘텐츠가 없거나 quotes가 없으면 기본 명언 사용
  const savedQuotes = widget?.content?.quotes;
  const [quotes, setQuotes] = useState<string[]>(savedQuotes && savedQuotes.length > 0 ? savedQuotes : defaultQuotes);
  const [index, setIndex] = useState(0);
  const [editing, setEditing] = useState(false);
  const [newQuote, setNewQuote] = useState('');

  // 자동으로 다음 명언으로 넘어가는 기능
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % quotes.length);
    }, 10000); // 10초마다 자동 변경

    return () => clearInterval(interval);
  }, [quotes.length]);

  const next = () => setIndex((i) => (i + 1) % quotes.length);
  const prev = () => setIndex((i) => (i - 1 + quotes.length) % quotes.length);

  const addQuote = () => {
    const q = newQuote.trim();
    if (!q) return;
    const updated = [q, ...quotes];
    setQuotes(updated);
    setNewQuote('');
    updateWidget?.(widget.id, { ...widget, content: { ...widget.content, quotes: updated } });
  };

  const removeCurrent = () => {
    if (quotes.length <= 1) return;
    const updated = quotes.filter((_, i) => i !== index);
    setQuotes(updated);
    setIndex(0);
    updateWidget?.(widget.id, { ...widget, content: { ...widget.content, quotes: updated } });
  };

  return (
    <div className="p-2 h-full flex flex-col dark:bg-gray-800">
      {/* 컴팩트 헤더 */}
      <div className="text-center mb-2 flex-shrink-0">
        <div className="text-lg mb-1">💭</div>
        <h4 className="font-semibold text-xs text-gray-800 dark:text-gray-100">영감 명언</h4>
      </div>

      {/* 명언 표시 - 컴팩트 버전 */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-3 rounded-lg text-center">
          <div className="text-2xl mb-2 text-gray-400 dark:text-gray-500">❝</div>
          <div className="text-xs text-gray-800 dark:text-gray-100 leading-relaxed px-1">
            {quotes[index] || defaultQuotes[0]}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {index + 1} / {quotes.length}
          </div>
        </div>
        
        {/* 네비게이션 */}
        <div className="flex items-center justify-between mt-2">
          <button 
            className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" 
            onClick={prev}
          >
            이전
          </button>
          <button 
            className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" 
            onClick={next}
          >
            다음
          </button>
        </div>
      </div>
      
      {/* 편집 모드에서만 표시되는 컨트롤 */}
      {isEditMode && (
        <div className="mt-2 space-y-2 pt-2 border-t border-gray-200 dark:border-gray-600 flex-shrink-0">
          <div className="flex gap-1">
            <input
              value={newQuote}
              onChange={(e) => setNewQuote(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addQuote()}
              placeholder="명언 추가"
              className="flex-1 text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-gray-100"
            />
            <Button size="sm" className="h-6 text-xs" onClick={addQuote}>추가</Button>
          </div>
          <div className="flex justify-end">
            <Button 
              size="sm" 
              variant="outline" 
              className="h-6 text-xs text-red-600 dark:text-red-400 border-red-300 dark:border-red-600" 
              onClick={removeCurrent}
            >
              현재 문구 삭제
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// 구글 검색 위젯
export const GoogleSearchWidget = ({ widget, isEditMode, updateWidget }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const compact = widget?.variant === 'compact';

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
    }
  };

  const handleVoiceSearch = () => {
    // 음성 검색 기능 (실제로는 Web Speech API 사용)
    alert('음성 검색 기능은 준비 중입니다.');
  };

  const handleImageSearch = () => {
    // 이미지 검색 기능
    window.open('https://images.google.com', '_blank');
  };

  return (
    <div className="h-full bg-white flex flex-col justify-center">
      {/* 상단 고정 영역 (로고) */}
      <div className={`shrink-0 px-2 ${compact ? 'py-1' : 'py-3'}`}>
        <div className={`text-center ${compact ? 'mb-1' : 'mb-4'}`}>
          <img src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" alt="Google" className={`mx-auto ${compact ? 'h-7' : 'h-9'}`} />
        </div>
      </div>

      {/* 본문 영역 (검색창) */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 flex items-center">
        <div className={`relative mx-auto w-full ${compact ? 'max-w-[400px]' : 'max-w-2xl'}`}>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Google 검색 또는 URL 입력"
            className={`w-full px-10 ${compact ? 'py-3 pr-16' : 'py-4 pr-20'} text-sm border border-gray-200 rounded-full focus:outline-none shadow-[0_1px_6px_rgba(32,33,36,0.28)]`}
          />
          
          {/* 돋보기 아이콘 */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <Search className="w-5 h-5 text-gray-400" />
          </div>

          {/* 음성 검색 아이콘 */}
          <button
            onClick={handleVoiceSearch}
            className="absolute right-12 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            title="음성 검색"
          >
            <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          </button>

          {/* 이미지 검색 아이콘 */}
          <button
            onClick={handleImageSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            title="이미지 검색"
          >
            <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

// 유튜브 검색 위젯
export const YoutubeSearchWidget = ({ widget, isEditMode, updateWidget }: any) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`, '_blank');
    }
  };

  return (
    <div className="h-full bg-white flex flex-col justify-center">
      {/* 상단 고정 영역 (로고) */}
      <div className="shrink-0 px-2 py-3">
        <div className="text-center mb-4">
          <div className="text-xl font-bold flex items-center justify-center gap-1">
            <span className="text-red-600 bg-red-50 px-2 py-1 rounded">▶</span>
            <span className="text-gray-800">YouTube</span>
          </div>
        </div>
      </div>

      {/* 본문 영역 (검색창) */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 flex items-center">
        <div className="relative mx-auto w-full max-w-2xl">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="YouTube 검색"
              className="w-full px-10 py-2 text-xs border border-gray-300 rounded-full focus:outline-none focus:shadow-lg hover:shadow-md transition-shadow"
            />
            
            {/* 돋보기 아이콘 */}
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <Search className="w-4 h-4 text-gray-400" />
            </div>

            {/* 검색 버튼 */}
            <button
              onClick={handleSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              title="검색"
            >
              <svg className="w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 네이버 검색 위젯
export const NaverSearchWidget = ({ widget, isEditMode, updateWidget }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const compact = widget?.variant === 'compact';

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.open(`https://search.naver.com/search.naver?query=${encodeURIComponent(searchQuery)}`, '_blank');
    }
  };

  const handleVoiceSearch = () => {
    // 음성 검색 기능
    alert('음성 검색 기능은 준비 중입니다.');
  };

  const handleImageSearch = () => {
    // 이미지 검색 기능
    window.open('https://search.naver.com/search.naver?where=image', '_blank');
  };

  return (
    <div className="h-full bg-white flex flex-col justify-center">
      {/* 상단 고정 영역 (로고) */}
      <div className={`shrink-0 px-2 ${compact ? 'py-1' : 'py-3'}`}>
        <div className={`text-center ${compact ? 'mb-1' : 'mb-4'}`}>
          {!compact && (
            <img src="https://s.pstatic.net/static/www/mobile/edit/2016/0705/mobile_212852414260.png" alt="NAVER" className="mx-auto h-7" />
          )}
        </div>
      </div>

      {/* 본문 영역 (검색창) */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 flex items-start">
        <div className={`relative mx-auto w-full ${compact ? 'max-w-[400px]' : 'max-w-2xl'}`}>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="검색어를 입력해 주세요."
            className={`w-full ${compact ? 'pl-12 pr-16 py-3' : 'pl-12 pr-20 py-4'} text-sm border border-green-500 rounded-full focus:outline-none shadow-[0_1px_4px_rgba(3,199,90,0.3)]`}
          />
          {/* 좌측 N 로고 (수직 중앙 정렬) */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center bg-[#03C75A] text-white rounded-md" style={{ width: compact ? 18 : 20, height: compact ? 18 : 20 }}>
            <span className="font-extrabold" style={{ lineHeight: 1 }}>N</span>
          </div>

          {/* 음성 검색 아이콘 */}
          <button
            onClick={handleVoiceSearch}
            className="absolute right-12 top-1/2 transform -translate-y-1/2 p-1 hover:bg-green-50 rounded transition-colors"
            title="음성 검색"
          >
            <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          </button>

          {/* 이미지 검색 아이콘 */}
          <button
            onClick={handleImageSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-green-50 rounded transition-colors"
            title="이미지 검색"
          >
            <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

// 법제처 검색 위젯
export const LawSearchWidget = ({ widget, isEditMode, updateWidget }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('law'); // law, statute, case
  const compact = widget?.variant === 'compact';

  const handleSearch = () => {
    if (searchQuery.trim()) {
      let url = '';
      if (searchType === 'law') {
        url = `https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=&efYd=&chrClsCd=010202&ancYnChk=0#0000`;
      } else if (searchType === 'statute') {
        url = `https://www.law.go.kr/LSW/lawSearch.do?menuId=0&query=${encodeURIComponent(searchQuery)}`;
      } else {
        url = `https://www.law.go.kr/LSW/precInfoP.do?precSeq=`;
      }
      window.open(url, '_blank');
    }
  };

  return (
    <div className="h-full bg-white flex items-center p-2">
      {/* 검색 입력 그룹: 좌측 타입 선택, 중앙 입력, 우측 파란 버튼 */}
      <div className="w-full flex items-stretch">
        {/* 타입 선택 */}
        <div className="flex items-center">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className={`${compact ? 'text-xs h-8' : 'text-sm h-10'} px-3 border border-blue-600 border-r-0 rounded-l focus:outline-none bg-white`}
          >
            <option value="law">현행법령</option>
            <option value="statute">조문</option>
            <option value="case">판례</option>
          </select>
        </div>
        {/* 입력창 */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="검색어를 입력하세요"
            className={`w-full ${compact ? 'h-8 text-xs' : 'h-10 text-sm'} px-3 border-y border-blue-600 focus:outline-none`}
          />
        </div>
        {/* 검색 버튼 (파란 영역) */}
        <button
          onClick={handleSearch}
          className={`${compact ? 'h-8 w-10' : 'h-10 w-12'} flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 rounded-r`}
          title="검색"
        >
          <Search className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-white`} />
        </button>
      </div>
    </div>
  );
};
