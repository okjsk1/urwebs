import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut, User } from "firebase/auth";
import { toast } from "sonner";
import { logger } from "../lib/logger";

interface HeaderProps {
  onContactClick: () => void;
  onHomepageClick: () => void;
  onHomeClick: () => void;
  onStartPageClick: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  categoryTitle?: string;
  onLoginClick: () => void;
  onSignupClick: () => void;
  user?: any; // Firebase User 객체
}

export function Header({
  onContactClick,
  onHomepageClick,
  onHomeClick,
  onStartPageClick,
  isDarkMode,
  onToggleDarkMode,
  categoryTitle,
  onLoginClick,
  onSignupClick,
  user: propsUser,
}: HeaderProps) {
  // Props로 받은 user를 사용하되, 없으면 내부 상태를 사용
  const [localUser, setLocalUser] = useState<User | null>(null);
  const user = propsUser || localUser;

  useEffect(() => {
    if (!propsUser) {
      const auth = getAuth();
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setLocalUser(currentUser);
      });

      return () => unsubscribe();
    }
  }, [propsUser]);

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      logger.info("로그아웃 성공!");
    } catch (error: any) {
      console.error("로그아웃 실패:", error.message);
    }
  };

  const handleNoticeClick = () => {
    toast.info('공지사항 기능은 개발 중입니다.');
  };
    
  const handleBoardClick = () => {
    toast.info('자유게시판 기능은 개발 중입니다.');
  };

  return (
    <header className="sfu-header sticky top-0 z-50">
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
        <div className="flex items-center gap-3">
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
            <h1
              style={{
                fontSize: "1.5rem",
                color: "var(--main-point)",
                letterSpacing: "0.01em",
              }}
            >
              UrWebs
            </h1>
            <p
              style={{
                fontSize: "1rem",
                color: "var(--sub-text)",
                marginTop: "2px",
              }}
            >
              {categoryTitle || "Your Webs"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-between w-full lg:w-auto">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              className="sfu-btn-ghost flex items-center gap-2 text-sm dark:text-gray-200"
              onClick={handleNoticeClick}
            >
              📢 공지사항
            </button>
            <button
              className="sfu-btn-ghost flex items-center gap-2 text-sm dark:text-gray-200"
              onClick={handleBoardClick}
            >
              💬 자유게시판
            </button>
            <button
              className="sfu-btn-ghost flex items-center gap-2 text-sm dark:text-gray-200"
              onClick={onContactClick}
            >
              📞 문의하기
            </button>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {user ? (
              <>
                <span className="text-sm dark:text-gray-200">환영합니다, {user?.displayName || user?.email || '사용자'}!</span>
                <button
                  className="sfu-btn-ghost text-sm dark:text-gray-200"
                  onClick={handleLogout}
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <button className="sfu-btn-ghost text-sm dark:text-gray-200" onClick={onLoginClick}>
                  로그인
                </button>
                <button className="sfu-btn-ghost text-sm dark:text-gray-200" style={{ marginLeft: '10px' }} onClick={onSignupClick}>
                  회원가입
                </button>
              </>
            )}

            <button
              className="sfu-btn-ghost flex items-center gap-2 text-sm dark:text-gray-200"
              onClick={onToggleDarkMode}
            >
              {isDarkMode ? '🌞 Light' : '🌙 Dark'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}