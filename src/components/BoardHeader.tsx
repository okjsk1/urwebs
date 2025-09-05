import { User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import React from "react";

interface BoardHeaderProps {
  board: "notice" | "free";
  search?: string;
  onSearch?: (v: string) => void;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  canWrite?: boolean;
}

export default function BoardHeader({
  board,
  search,
  onSearch,
  user,
  onLogin,
  onLogout,
  canWrite,
}: BoardHeaderProps) {
  const navigate = useNavigate();
  return (
    <header className="p-4 border-b mb-4">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-xl font-bold">
          {board === "notice" ? "공지사항" : "자유게시판"}
        </h1>
        {user ? (
          <button className="text-sm" onClick={onLogout}>
            로그아웃
          </button>
        ) : (
          <button className="text-sm" onClick={onLogin}>
            로그인
          </button>
        )}
      </div>
      {onSearch && (
        <div className="flex items-center">
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="검색"
            className="border px-2 py-1 flex-grow mr-2"
          />
          {canWrite && (
            <button
              onClick={() => navigate(`/write?board=${board}`)}
              className="px-3 py-1 bg-blue-500 text-white rounded"
            >
              글쓰기
            </button>
          )}
        </div>
      )}
    </header>
  );
}
