import React from "react";
import { useNavigate } from "react-router-dom";

interface BoardLayoutProps {
  board: "notice" | "free";
  canWrite?: boolean;
  /**
   * 검색 입력 등 헤더 중앙에 배치될 요소.
   * 공지사항 목록에서 사용된다.
   */
  search?: React.ReactNode;
  children: React.ReactNode;
}

export default function BoardLayout({ board, canWrite, search, children }: BoardLayoutProps) {
  const navigate = useNavigate();
  const title = board === "notice" ? "공지사항" : "자유게시판";
  return (
    <div className="max-w-4xl mx-auto">
      <header className="sticky top-0 z-10 flex items-center gap-4 p-4 border-b bg-white">
        <h1 className="text-2xl font-bold whitespace-nowrap">{title}</h1>
        <div className="flex-1 flex justify-center">{search}</div>
        {canWrite && (
          <button
            onClick={() => navigate(`/write?board=${board}`)}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            글쓰기
          </button>
        )}
      </header>
      <div className="p-4">{children}</div>
    </div>
  );
}

