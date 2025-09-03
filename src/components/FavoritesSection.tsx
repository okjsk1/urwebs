import React from 'react'; // React 라이브러리를 가져옵니다.
import { Website } from '../types'; // 웹사이트 데이터 타입을 가져옵니다.
import { websites } from '../data/websites'; // 전체 웹사이트 목록 데이터를 가져옵니다.

interface FavoritesSectionProps { // 컴포넌트가 받는 props의 타입을 정의합니다.
  favorites: string[]; // 즐겨찾기된 웹사이트 ID 배열입니다.
  onRemoveFavorite: (id: string) => void; // 즐겨찾기에서 항목을 제거하는 함수입니다.
  onReorderFavorites: (newFavorites: string[]) => void; // 즐겨찾기 순서를 변경하는 함수입니다.
}

export function FavoritesSection({ favorites, onRemoveFavorite, onReorderFavorites }: FavoritesSectionProps) {
  if (favorites.length === 0) { // 즐겨찾기 목록이 비어 있으면 아무것도 렌더링하지 않습니다.
    return null;
  }

  const handleDragStart = (e: React.DragEvent, index: number) => { // 드래그가 시작될 때 호출되는 함수입니다.
    e.dataTransfer.effectAllowed = "move"; // 드래그 효과를 '이동'으로 설정합니다.
    e.dataTransfer.setData('text/plain', index.toString()); // 드래그하는 항목의 인덱스를 데이터로 저장합니다.
  };

  const handleDragOver = (e: React.DragEvent) => { // 드래그 중인 항목이 대상 위로 지나갈 때 호출됩니다.
    e.preventDefault(); // 기본 동작(drop 금지)을 막아 드롭을 허용합니다.
    (e.currentTarget as HTMLElement).style.background = "#fffde4"; // 드래그 중인 항목의 배경색을 변경하여 시각적 피드백을 제공합니다.
  };

  const handleDragLeave = (e: React.DragEvent) => { // 드래그 중인 항목이 대상을 벗어날 때 호출됩니다.
    (e.currentTarget as HTMLElement).style.background = ""; // 배경색을 원래대로 되돌립니다.
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => { // 드래그 중인 항목이 대상에 드롭될 때 호출됩니다.
    e.preventDefault(); // 기본 동작을 막습니다.
    (e.currentTarget as HTMLElement).style.background = ""; // 배경색을 원래대로 되돌립니다.
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10); // 드래그 시작 시 저장했던 인덱스를 가져옵니다.
    
    if (fromIndex !== toIndex) { // 시작 위치와 끝 위치가 다를 경우에만 순서를 변경합니다.
      const newFavorites = [...favorites]; // 즐겨찾기 배열을 복사합니다.
      const moved = newFavorites.splice(fromIndex, 1)[0]; // 원래 위치의 항목을 제거하고 가져옵니다.
      newFavorites.splice(toIndex, 0, moved); // 새로운 위치에 제거했던 항목을 삽입합니다.
      onReorderFavorites(newFavorites); // 변경된 순서를 부모 컴포넌트에 전달합니다.
    }
  };

  return ( // 컴포넌트의 UI를 렌더링합니다.
    <div className="px-5 py-8 bg-gray-50 border-b-2" style={{ borderColor: 'var(--border-sfu)', backgroundColor: 'var(--soft-bg)' }}>
      {/* 스타일을 위한 클래스와 변수를 적용한 컨테이너입니다. */}
      <div className="flex items-center justify-between mb-4">
        <h2 
          className="flex items-center gap-3"
          style={{ fontSize: '1.13rem', color: 'var(--main-point)' }}
        >
          📁 내 즐겨찾기 {/* 즐겨찾기 섹션의 제목입니다. */}
        </h2>
      </div>
      
      <div className="grid gap-3 overflow-x-auto pb-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        {/* 즐겨찾기 항목들을 표시하는 그리드 컨테이너입니다. 스크롤이 가능합니다. */}
        {favorites.map((websiteId, index) => { // 즐겨찾기 배열을 순회하며 각 항목을 렌더링합니다.
          const website = websites.find(w => w.id === websiteId); // ID를 사용하여 전체 목록에서 웹사이트 정보를 찾습니다.
          if (!website) return null; // 웹사이트를 찾지 못하면 렌더링하지 않습니다.

          return (
            <div
              key={websiteId} // React 리스트 렌더링을 위한 고유 키입니다.
              className="sfu-favorite-item flex items-center gap-2 p-2 min-w-0 max-w-40 overflow-hidden"
              draggable // 이 div를 드래그 가능하게 만듭니다.
              onDragStart={(e) => handleDragStart(e, index)} // 드래그 시작 이벤트 핸들러
              onDragOver={handleDragOver} // 드래그 오버 이벤트 핸들러
              onDragLeave={handleDragLeave} // 드래그 리브 이벤트 핸들러
              onDrop={(e) => handleDrop(e, index)} // 드롭 이벤트 핸들러
            >
              <img // 웹사이트의 파비콘(favicon)을 표시합니다.
                src={`https://www.google.com/s2/favicons?domain=${website.url}&sz=16`}
                alt=""
                className="w-4 h-4 flex-shrink-0"
                onError={(e) => { // 파비콘 로드 실패 시 대체 이미지를 표시합니다.
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" fill="%23e5e7eb"/></svg>';
                }}
              />
              <a // 웹사이트 링크입니다.
                href={website.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-decoration-none"
                style={{ 
                  color: '#47340a', 
                  fontSize: '14px',
                  letterSpacing: '0.01em'
                }}
              >
                {website.title} {/* 웹사이트 제목을 표시합니다. */}
              </a>
              <button // 즐겨찾기 제거 버튼입니다.
                onClick={() => onRemoveFavorite(website.id)} // 클릭 시 onRemoveFavorite 함수를 호출합니다.
                className="ml-auto p-1 bg-transparent border-0 cursor-pointer transition-colors"
                style={{ 
                  fontSize: '14px', 
                  color: 'var(--main-point)' 
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#c94060')} // 마우스 진입 시 색상을 변경합니다.
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--main-point)')} // 마우스 이탈 시 원래 색상으로 되돌립니다.
                aria-label="즐겨찾기 제거" // 스크린 리더를 위한 접근성 레이블입니다.
              >
                ⭐ {/* 제거 아이콘으로 별 이모지를 사용합니다. */}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}