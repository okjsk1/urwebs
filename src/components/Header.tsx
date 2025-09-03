import React from "react";
import { AiOutlinePlus } from "react-icons/ai";

interface HeaderProps {
  onContactClick: () => void;
  onHomepageClick: () => void;
  onHomeClick: () => void;
  onStartPageClick: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  categoryTitle?: string;
}

export function Header({
  onContactClick,
  onHomepageClick,
  onHomeClick,
  onStartPageClick,
  isDarkMode,
  onToggleDarkMode,
  categoryTitle,
}: HeaderProps) {
  // 공지사항 클릭 핸들러 - 실제 프로젝트에서는 공지사항 페이지로 이동하도록 구현
  const handleNoticeClick = () => {
    alert('공지사항 기능은 개발 중입니다.');
  };
  
  // 자유게시판 클릭 핸들러 - 실제 프로젝트에서는 게시판 페이지로 이동하도록 구현  
  const handleBoardClick = () => {
    alert('자유게시판 기능은 개발 중입니다.');
  };
  return (
    <header className="sfu-header sticky top-0 z-50">
      {/* 시작페이지 버튼을 최상단에 배치 */}
      <div className="max-w-screen-2xl mx-auto flex justify-end px-4 lg:px-8 pt-2">
        <button
          className="sfu-btn-ghost text-xs opacity-75 dark:text-gray-300"
          onClick={onHomepageClick}
          style={{ fontSize: '0.75rem' }}
        >
          시작페이지로 설정하기
        </button>
      </div>
      
      <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between px-4 lg:px-8 pb-4 gap-4 lg:gap-8">
        {/* 헤더의 내부 컨테이너입니다. 반응형 디자인을 위해 flexbox와 gap을 사용합니다. */}
        <div className="flex items-center gap-3">
          {/* 로고와 제목을 담는 컨테이너입니다. */}
          <div
            className="drop-shadow-sm"
            style={{ fontSize: "2.1rem" }}
          >
            🐻
          </div>
          <div
            className="brand cursor-pointer"
            onClick={onHomeClick}
          >
            {/* 브랜드 영역입니다. 마우스를 올리면 손가락 모양 커서로 바뀝니다. */}
            <h1
              style={{
                fontSize: "1.5rem",
                color: "var(--main-point)",
                letterSpacing: "0.01em",
              }}
            >
              SFU
            </h1>
            {/* SFU 제목입니다. */}
            <p
              style={{
                fontSize: "1rem",
                color: "var(--sub-text)",
                marginTop: "2px",
              }}
            >
              {categoryTitle || "Sites For You"}
            </p>
            {/* categoryTitle props가 있으면 그 값을, 없으면 "Sites For You"를 표시합니다. */}
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-between w-full lg:w-auto">
          {/* 좌측 메뉴들 */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              className="sfu-btn-ghost flex items-center gap-2 text-sm dark:text-gray-200"
              onClick={handleNoticeClick}
            >
              📢 공지사항
            </button>
            {/* 공지사항 버튼입니다. */}
            <button
              className="sfu-btn-ghost flex items-center gap-2 text-sm dark:text-gray-200"
              onClick={handleBoardClick}
            >
              💬 자유게시판
            </button>
            {/* 자유게시판 버튼입니다. */}
            <button
              className="sfu-btn-ghost flex items-center gap-2 text-sm dark:text-gray-200"
              onClick={onContactClick}
            >
              📞 문의하기
            </button>
            {/* 문의하기 버튼입니다. */}
          </div>
          
          {/* 우측 메뉴들 */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              className="sfu-btn-ghost flex items-center gap-2 text-sm dark:text-gray-200"
              onClick={onToggleDarkMode}
            >
              {/* isDarkMode 상태에 따라 버튼 텍스트가 바뀝니다. */}
              {isDarkMode ? '🌞 Light' : '🌙 Dark'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}