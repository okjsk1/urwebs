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
    <div className="max-w-4xl mx-auto">
      <header className="flex items-center justify-between p-6 border-b">
        <h1 className="text-3xl font-bold">{title}</h1>
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

