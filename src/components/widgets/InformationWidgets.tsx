import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Globe, Cloud, Rss, Search, Settings } from 'lucide-react';

// 뉴스 피드 위젯
export const NewsWidget = ({ widget, isEditMode, updateWidget }: any) => {
  const [news, setNews] = useState([
    { 
      id: 1, 
      title: 'AI 기술 발전으로 인한 업계 변화', 
      source: 'TechNews', 
      time: '2시간 전',
      category: '기술'
    },
    { 
      id: 2, 
      title: '새로운 스마트폰 출시 소식', 
      source: 'MobileWorld', 
      time: '4시간 전',
      category: '모바일'
    },
    { 
      id: 3, 
      title: '환경 친화적 에너지 솔루션', 
      source: 'GreenTech', 
      time: '6시간 전',
      category: '환경'
    }
  ]);

  const [keywords, setKeywords] = useState(['AI', '기술', '스마트폰']);
  const [newKeyword, setNewKeyword] = useState('');

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
    <div className="p-3">
      <div className="text-center mb-3">
        <div className="text-2xl mb-1">🌐</div>
        <h4 className="font-semibold text-sm text-gray-800">뉴스 피드</h4>
        <p className="text-xs text-gray-500">최신 뉴스 및 관심사</p>
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
      
      <div className="space-y-2">
        {news.map(article => (
          <div key={article.id} className="p-2 bg-gray-50 rounded">
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
        ))}
      </div>
      
      <Button 
        size="sm" 
        variant="outline" 
        className="w-full h-8 text-xs mt-3"
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
export const RSSWidget = ({ widget, isEditMode, updateWidget }: any) => {
  const [feeds, setFeeds] = useState([
    { 
      id: 1, 
      title: 'React 18 새로운 기능 소개', 
      source: 'React Blog', 
      time: '1일 전',
      url: 'https://react.dev/blog'
    },
    { 
      id: 2, 
      title: 'TypeScript 5.0 업데이트', 
      source: 'TypeScript News', 
      time: '2일 전',
      url: 'https://devblogs.microsoft.com/typescript'
    },
    { 
      id: 3, 
      title: 'Next.js 14 성능 개선사항', 
      source: 'Next.js Blog', 
      time: '3일 전',
      url: 'https://nextjs.org/blog'
    }
  ]);

  const [rssUrl, setRssUrl] = useState('');

  const addRSSFeed = () => {
    if (rssUrl.trim()) {
      // 실제로는 RSS 파싱 로직이 필요
      const newFeed = {
        id: Date.now(),
        title: '새 RSS 피드',
        source: 'RSS Feed',
        time: '방금 전',
        url: rssUrl.trim()
      };
      setFeeds([newFeed, ...feeds]);
      setRssUrl('');
    }
  };

  return (
    <div className="p-3">
      <div className="text-center mb-3">
        <div className="text-2xl mb-1">📡</div>
        <h4 className="font-semibold text-sm text-gray-800">RSS 피드</h4>
        <p className="text-xs text-gray-500">최신 기술 뉴스</p>
      </div>
      
      {/* RSS URL 추가 */}
      {isEditMode && (
        <div className="mb-3">
          <div className="flex gap-1">
            <input
              type="url"
              value={rssUrl}
              onChange={(e) => setRssUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addRSSFeed()}
              placeholder="RSS URL 입력"
              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
            />
            <Button size="sm" onClick={addRSSFeed} className="h-6 w-6 p-0">
              +
            </Button>
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        {feeds.map(feed => (
          <div key={feed.id} className="p-2 bg-gray-50 rounded">
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs text-blue-600 bg-blue-100 px-1 rounded">
                {feed.source}
              </span>
              <span className="text-xs text-gray-500">{feed.time}</span>
            </div>
            <div className="text-sm font-medium text-gray-800 mb-1">
              {feed.title}
            </div>
            <button
              onClick={() => window.open(feed.url, '_blank')}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              읽기 →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// 구글 검색 위젯
export const GoogleSearchWidget = ({ widget, isEditMode, updateWidget }: any) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
    }
  };

  return (
    <div className="p-3">
      <div className="text-center mb-3">
        <div className="text-2xl mb-1">🔍</div>
        <h4 className="font-semibold text-sm text-gray-800">구글 검색</h4>
      </div>
      
      <div className="space-y-2">
        <div className="flex gap-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="구글에서 검색"
            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
          />
        </div>
        
        <Button 
          size="sm" 
          className="w-full h-8 text-xs bg-blue-500 hover:bg-blue-600"
          onClick={handleSearch}
        >
          검색하기
        </Button>
        
        <Button 
          size="sm" 
          variant="outline"
          className="w-full h-8 text-xs"
          onClick={() => window.open('https://www.google.com', '_blank')}
        >
          Google 바로가기
        </Button>
      </div>
    </div>
  );
};

// 네이버 검색 위젯
export const NaverSearchWidget = ({ widget, isEditMode, updateWidget }: any) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.open(`https://search.naver.com/search.naver?query=${encodeURIComponent(searchQuery)}`, '_blank');
    }
  };

  return (
    <div className="p-3">
      <div className="text-center mb-3">
        <div className="text-2xl mb-1">🔍</div>
        <h4 className="font-semibold text-sm text-gray-800">네이버 검색</h4>
      </div>
      
      <div className="space-y-2">
        <div className="flex gap-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="네이버에서 검색"
            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
          />
        </div>
        
        <Button 
          size="sm" 
          className="w-full h-8 text-xs bg-green-500 hover:bg-green-600"
          onClick={handleSearch}
        >
          검색하기
        </Button>
        
        <Button 
          size="sm" 
          variant="outline"
          className="w-full h-8 text-xs"
          onClick={() => window.open('https://www.naver.com', '_blank')}
        >
          Naver 바로가기
        </Button>
      </div>
    </div>
  );
};

// 법제처 검색 위젯
export const LawSearchWidget = ({ widget, isEditMode, updateWidget }: any) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.open(`https://www.law.go.kr/LSW/lsInfoP.do?efYd=20240101&lsiSeq=000000&chrClsCd=010202&urlMode=lsInfoP&viewCls=lsInfoP&ancYnChk=0#0000`, '_blank');
    }
  };

  return (
    <div className="p-3">
      <div className="text-center mb-3">
        <div className="text-2xl mb-1">⚖️</div>
        <h4 className="font-semibold text-sm text-gray-800">법제처 검색</h4>
      </div>
      
      <div className="space-y-2">
        <div className="flex gap-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="법령명 검색"
            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
          />
        </div>
        
        <Button 
          size="sm" 
          className="w-full h-8 text-xs bg-purple-500 hover:bg-purple-600"
          onClick={handleSearch}
        >
          검색하기
        </Button>
        
        <Button 
          size="sm" 
          variant="outline"
          className="w-full h-8 text-xs"
          onClick={() => window.open('https://www.law.go.kr', '_blank')}
        >
          법제처 바로가기
        </Button>
      </div>
    </div>
  );
};
