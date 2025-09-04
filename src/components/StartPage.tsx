import React, { useState, useEffect } from 'react'; // React의 핵심 훅(Hook)들을 가져옵니다.
import { DndProvider } from 'react-dnd'; // 드래그 앤 드롭 기능을 제공하는 라이브러리
import { HTML5Backend } from 'react-dnd-html5-backend'; // HTML5 기반의 드래그 앤 드롭 백엔드
import { Widget, FavoritesData } from '../types'; // 위젯 및 즐겨찾기 데이터 타입을 정의한 파일에서 가져옵니다.
import { WeatherWidget } from './widgets/WeatherWidget'; // 날씨 위젯 컴포넌트
import { ClockWidget } from './widgets/ClockWidget'; // 시계 위젯 컴포넌트
import { MemoWidget } from './widgets/MemoWidget'; // 메모 위젯 컴포넌트
import { TodoWidget } from './widgets/TodoWidget'; // 할 일 위젯 컴포넌트
import { websites, categoryOrder, categoryConfig } from '../data/websites'; // 웹사이트 데이터, 카테고리 순서, 카테고리 설정을 가져옵니다.
import { CategoryCard } from './CategoryCard'; // 카테고리 카드 컴포넌트
import { TopSitesSidebar } from './TopSitesSidebar';

interface StartPageProps { // StartPage 컴포넌트가 받는 속성(Props)의 타입을 정의합니다.
  favoritesData: FavoritesData; // 즐겨찾기 데이터를 포함하는 객체
  onUpdateFavorites: (data: FavoritesData) => void; // 즐겨찾기 데이터 업데이트를 위한 함수
  onClose: () => void; // 시작 페이지를 닫는 함수
  showDescriptions: boolean; // 설명 표시 여부
}

export function StartPage({ favoritesData, onUpdateFavorites, onClose, showDescriptions }: StartPageProps) {
  const [currentTime, setCurrentTime] = useState(new Date()); // 현재 시간을 상태(state)로 관리합니다.
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]); // 확장된 카테고리 목록을 상태로 관리합니다.

  useEffect(() => { // 컴포넌트가 마운트될 때 한 번 실행되는 효과(Effect) 훅입니다.
    const timer = setInterval(() => { // 1초마다 현재 시간을 업데이트하는 타이머를 설정합니다.
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer); // 컴포넌트가 언마운트될 때 타이머를 정리(cleanup)합니다.
  }, []); // 빈 배열([])은 이 효과가 컴포넌트 마운트 시에만 실행되도록 합니다.

  const formatTime = (date: Date) => { // 시간을 '시:분:초' 형식으로 포맷하는 함수입니다.
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit', // 시간(두 자리 숫자)
      minute: '2-digit', // 분(두 자리 숫자)
      second: '2-digit' // 초(두 자리 숫자)
    });
  };

  const formatDate = (date: Date) => { // 날짜를 '년월일 요일' 형식으로 포맷하는 함수입니다.
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric', // 년도
      month: 'long', // 월(긴 이름)
      day: 'numeric', // 일
      weekday: 'long' // 요일(긴 이름)
    });
  };

  const renderWidget = (widget: Widget) => { // 위젯 타입에 따라 다른 위젯 컴포넌트를 렌더링하는 함수입니다.
    switch (widget.type) {
      case 'weather':
        return <WeatherWidget key={widget.id} widget={widget} />;
      case 'clock':
        return <ClockWidget key={widget.id} widget={widget} />;
      case 'memo':
        return <MemoWidget key={widget.id} widget={widget} />;
      case 'todo':
        return <TodoWidget key={widget.id} widget={widget} />;
      default:
        return null; // 정의되지 않은 위젯 타입이면 아무것도 렌더링하지 않습니다.
    }
  };

  const getFavoriteWebsites = () => { // 즐겨찾기에 추가된 웹사이트 목록을 가져오는 함수입니다.
    return favoritesData.items
      .map(id => websites.find(site => site.id === id)) // ID를 기반으로 전체 웹사이트 목록에서 찾습니다.
      .filter(Boolean); // 찾지 못한 (undefined) 항목을 제거합니다.
  };

  const handleToggleFavorite = (websiteId: string) => { // 특정 웹사이트의 즐겨찾기 상태를 토글하는 함수입니다.
    const isFavorited = favoritesData.items.includes(websiteId); // 이미 즐겨찾기에 있는지 확인
    const updatedItems = isFavorited
      ? favoritesData.items.filter(id => id !== websiteId) // 이미 있다면 제거
      : [...favoritesData.items, websiteId]; // 없다면 추가
    onUpdateFavorites({ ...favoritesData, items: updatedItems }); // 업데이트된 즐겨찾기 목록으로 상태를 변경합니다.
  };

  const handleVisit = (websiteId: string) => {
    const visitCounts = {
      ...(favoritesData.visitCounts || {}),
      [websiteId]: (favoritesData.visitCounts?.[websiteId] || 0) + 1,
    };
    onUpdateFavorites({ ...favoritesData, visitCounts });
  };
  
  const handleToggleCategory = (category: string) => { // 카테고리 확장/축소 상태를 토글하는 함수입니다.
    setExpandedCategories(prev => // 이전 상태를 기반으로 새로운 상태를 업데이트합니다.
      prev.includes(category) // 이미 확장되어 있다면
        ? prev.filter(c => c !== category) // 목록에서 제거하여 축소
        : [...prev, category] // 목록에 추가하여 확장
    );
  };

  const categorizedWebsites = categoryOrder.reduce((acc, category) => { // 웹사이트 데이터를 카테고리별로 그룹화하는 함수입니다.
    acc[category] = websites.filter(site => site.category === category); // 각 카테고리에 해당하는 웹사이트들을 필터링하여 객체에 저장
    return acc;
  }, {} as { [key: string]: typeof websites[0][] });

  return ( // 컴포넌트의 UI를 렌더링하는 JSX 코드입니다.
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-purple-50 overflow-auto">
      <TopSitesSidebar favoritesData={favoritesData} onVisit={handleVisit} />
      {/* 고정된 전체화면 배경, 그라디언트 및 스크롤 가능 설정 */}
      <div className="min-h-screen p-6 lg:pr-64">
        {/* 최소 높이, 내부 여백 설정 */}
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">나의 시작페이지</h1>
            <p className="text-xl text-gray-600">{formatDate(currentTime)}</p>
            <p className="text-3xl font-mono text-blue-600 mt-2">{formatTime(currentTime)}</p>
          </div>
          <button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            ✖ 닫기
          </button>
        </div>

        <DndProvider backend={HTML5Backend}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 즐겨찾기 사이트들 */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">즐겨찾기 사이트</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {getFavoriteWebsites().map((site) => site && (
                  <a
                    key={site.id}
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleVisit(site.id)}
                    className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border"
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">🌐</div>
                      <h3 className="font-medium text-gray-800 truncate">{site.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{site.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* 위젯 영역 */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">위젯</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favoritesData.widgets.map(renderWidget)}
                
                {/* 기본 위젯들 */}
                <div className="bg-white p-4 rounded-lg shadow-md border">
                  <h3 className="font-medium text-gray-800 mb-2">🌤️ 날씨</h3>
                  <p className="text-2xl">23°C</p>
                  <p className="text-sm text-gray-500">서울, 맑음</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-md border">
                  <h3 className="font-medium text-gray-800 mb-2">📝 메모</h3>
                  <textarea
                    className="w-full h-20 resize-none border-none outline-none text-sm"
                    placeholder="메모를 입력하세요..."
                  />
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-md border">
                  <h3 className="font-medium text-gray-800 mb-2">✅ 할 일</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">프로젝트 완성하기</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">회의 준비하기</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-md border">
                  <h3 className="font-medium text-gray-800 mb-2">📅 오늘</h3>
                  <p className="text-sm text-gray-600">
                    {new Date().toLocaleDateString('ko-KR', { 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">일정이 없습니다</p>
                </div>
              </div>
            </div>
          </div>
        
          <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">전체 카테고리</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoryOrder.map(category => (
              <CategoryCard
                key={category}
                category={category}
                sites={categorizedWebsites[category] || []}
                config={categoryConfig[category]}
                isExpanded={expandedCategories.includes(category)}
                showDescriptions={showDescriptions}
                favorites={favoritesData.items}
                onToggleCategory={handleToggleCategory}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        </DndProvider>
      </div>
    </div>
  );
}