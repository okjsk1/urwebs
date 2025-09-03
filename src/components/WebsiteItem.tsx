import React, { useState } from "react"; // React와 상태 관리를 위한 useState 훅을 불러옵니다.
import { Website } from "../types"; // Website 타입 정의를 불러옵니다.

// WebsiteItem 컴포넌트가 받을 props의 타입을 정의합니다.
interface WebsiteItemProps {
  website: Website; // 표시할 웹사이트 데이터
  isFavorited: boolean; // 즐겨찾기 상태인지 여부
  showDescription: boolean; // 상세 설명을 보여줄지 여부
  onToggleFavorite: (id: string) => void; // 즐겨찾기 상태를 토글하는 함수
  isDraggable?: boolean; // 드래그가 가능한지 여부 (선택 사항)
  onDragStart: (e: React.DragEvent, website: Website) => void; // 드래그 시작 시 호출될 함수
}

// WebsiteItem 컴포넌트의 본체
export function WebsiteItem({
  website,
  isFavorited,
  showDescription,
  onToggleFavorite,
  isDraggable = false,
  onDragStart,
}: WebsiteItemProps) {
  // 마우스 오버 상태를 관리하는 state
  const [isHovered, setIsHovered] = useState(false);

  // 즐겨찾기 버튼 클릭 시 호출될 함수
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // 기본 이벤트 동작(링크 이동 등)을 막습니다.
    e.stopPropagation(); // 상위 요소로의 이벤트 전파를 막습니다.
    onToggleFavorite(website.id); // prop으로 받은 즐겨찾기 토글 함수를 호출합니다.
  };

  // 드래그 시작 시 호출될 함수
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("websiteId", website.id); // 드래그 데이터에 사이트 ID를 저장합니다.
    onDragStart(e, website); // prop으로 받은 드래그 시작 함수를 호출합니다.
  };

  return (
    // 전체 아이템을 감싸는 div (드래그 가능 여부, 마우스 오버 스타일, 높이 등을 설정)
    <div
      className={`sfu-website-item flex items-start gap-2 p-1 min-h-3 min-w-0 flex-1 overflow-hidden ${isHovered ? "shadow-hover" : ""} ${showDescription ? "min-h-6" : ""}`}
      onMouseEnter={() => setIsHovered(true)} // 마우스 진입 시 isHovered를 true로 설정
      onMouseLeave={() => setIsHovered(false)} // 마우스 이탈 시 isHovered를 false로 설정
      style={{ height: showDescription ? "auto" : "18px" }}
      draggable={isDraggable} // isDraggable prop에 따라 드래그 가능하게 설정
      onDragStart={handleDragStart} // 드래그 시작 이벤트 핸들러
    >
      <div className="flex items-center gap-2 w-full">
        {/* 파비콘(Favicon) 이미지 */}
        <img
          src={`https://www.google.com/s2/favicons?domain=${website.url}&sz=84`} // 구글 API를 통해 파비콘을 가져옴
          alt=""
          className="w-4 h-4 rounded border flex-shrink-0"
          style={{
            backgroundColor: "#f7f7f7",
            borderColor: "#ededed",
          }}
          onError={(e) => {
            // 파비콘 로드 실패 시 대체 이미지로 변경
            (e.target as HTMLImageElement).src =
              'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" fill="%23e5e7eb"/><text x="8" y="12" text-anchor="middle" fill="%236b7280" font-size="8">🌐</text></svg>';
          }}
        />

        <div className="flex-1 min-w-0">
          {/* 웹사이트 제목과 링크 */}
          <a
            href={website.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-decoration-none hover:underline"
            style={{
              fontSize: "0.8rem",
              color: "var(--main-dark)", // CSS 변수로 변경하여 다크모드 대응
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              whiteSpace: "normal",
              wordBreak: "keep-all",
              maxWidth: "100%",
            }}
            title={
              !showDescription ? website.description : undefined
            } // 설명이 숨겨져 있을 때만 툴팁으로 표시
            onMouseEnter={(e) =>
              (e.currentTarget.style.color =
                "var(--main-point)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--main-dark)")
            }
          >
            {website.title}
          </a>

          {/* 상세 설명 (showDescription이 true일 때만 표시) */}
          {showDescription && (
            <div className="mt-2 space-y-1">
              {website.summary && (
                <div
                  className="pl-1 font-medium"
                  style={{
                    fontSize: "10px",
                    color: "var(--sub-text)", // CSS 변수로 변경하여 다크모드 대응
                    lineHeight: 1.4,
                    wordBreak: "break-word",
                  }}
                >
                  📝 {website.summary}
                </div>
              )}
              <div
                className="pl-1"
                style={{
                  fontSize: "9px",
                  color: "var(--sub-text)", // CSS 변수로 변경하여 다크모드 대응
                  lineHeight: 1.45,
                  wordBreak: "break-word",
                }}
              >
                {website.description}
              </div>
            </div>
          )}
        </div>

        {/* 즐겨찾기 버튼 */}
        <button
          onClick={handleFavoriteClick} // 클릭 시 즐겨찾기 토글 함수 호출
          className="ml-auto bg-transparent border-0 p-1 flex items-center cursor-pointer rounded transition-colors"
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#fbeaf2")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor =
              "transparent")
          }
          aria-label="즐겨찾기"
        >
          {/* 즐겨찾기 별 아이콘 SVG */}
          <svg
            className={`w-3 h-3 sfu-star-icon ${isFavorited ? "favorited" : ""}`} // 즐겨찾기 상태에 따라 'favorited' 클래스 추가
            viewBox="0 0 24 24"
            strokeWidth="1" // ✨ 별의 테두리 두께를 설정하는 부분입니다.
          >
            {/* 별 모양을 그리는 SVG path */}
            <polygon points="12,2 15,8 22,9 17,14 18,21 12,18 6,21 7,14 2,9 9,8"></polygon>
          </svg>
        </button>
      </div>
    </div>
  );
}