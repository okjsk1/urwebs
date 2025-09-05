import React from "react";
import { useNavigate } from "react-router-dom";

interface BoardLayoutProps {
  board: "notice" | "free";
  canWrite?: boolean;
  children: React.ReactNode;
}

export default function BoardLayout({ board, canWrite, children }: BoardLayoutProps) {
  const navigate = useNavigate();
  const title = board === "notice" ? "공지사항" : "자유게시판";
  return (
    <div className="max-w-2xl mx-auto">
      <header className="flex justify-between items-center p-4 border-b">
        <h1 className="text-2xl font-bold">{title}</h1>
        {canWrite && (
          <button
            onClick={() => navigate(`/write?board=${board}`)}
            className="px-3 py-1 bg-blue-500 text-white rounded"
          >
            글쓰기
          </button>
        )}
      </header>
      <div className="p-4">{children}</div>
    </div>
  );
}

