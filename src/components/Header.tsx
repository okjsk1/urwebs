import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { useNavigate } from "react-router-dom";

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
  onLogout: () => void;
  user?: User | null;
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
  onLogout,
  user,
}: HeaderProps) {
  const navigate = useNavigate();
  const handleNoticeClick = () => {
    navigate("/notice");
  };

  const handleBoardClick = () => {
    navigate("/free");
  };

  return (
    <header className="urwebs-header sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto flex justify-end px-4 lg:px-8 pt-1.5">
        <button
          className="urwebs-btn-ghost text-xs opacity-75 dark:text-gray-300"
          onClick={onHomepageClick}
          style={{ fontSize: "0.75rem" }}
        >
          시작페이지로 설정하기
        </button>
      </div>

      <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between px-4 lg:px-8 pb-3 gap-3 lg:gap-6">
        <div className="flex items-center">
          <div className="brand cursor-pointer" onClick={onHomeClick}>
            <h1
              style={{
                fontSize: "calc(1.5rem - 2px)",
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
              className="urwebs-btn-ghost flex items-center gap-2 text-sm dark:text-gray-200"
              onClick={handleNoticeClick}
            >
              📢 공지사항
            </button>
            <button
              className="urwebs-btn-ghost flex items-center gap-2 text-sm dark:text-gray-200"
              onClick={handleBoardClick}
            >
              💬 자유게시판
            </button>
            <button
              className="urwebs-btn-ghost flex items-center gap-2 text-sm dark:text-gray-200"
              onClick={onContactClick}
            >
              📞 문의하기
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {user ? (
              <>
                <span className="text-sm dark:text-gray-200">
                  환영합니다, {user.displayName || user.email || "사용자"}!
                </span>
                <button
                  className="urwebs-btn-ghost text-sm dark:text-gray-200"
                  onClick={onLogout}
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <button
                  className="urwebs-btn-ghost text-sm dark:text-gray-200"
                  onClick={onLoginClick}
                >
                  로그인
                </button>
                <button
                  className="urwebs-btn-ghost text-sm dark:text-gray-200"
                  style={{ marginLeft: "10px" }}
                  onClick={onSignupClick}
                >
                  회원가입
                </button>
              </>
            )}

            <button
              className="urwebs-btn-ghost flex items-center gap-2 text-sm dark:text-gray-200"
              onClick={onToggleDarkMode}
            >
              {isDarkMode ? "🌞 Light" : "🌙 Dark"}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
