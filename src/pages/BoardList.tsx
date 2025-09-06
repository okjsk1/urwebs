import { useEffect, useMemo, useState } from "react";
import useUserRole from "../hooks/useUserRole";
import { listPosts, Post } from "../libs/posts.repo";
import BoardLayout from "../components/BoardLayout";
import PostItem from "../components/PostItem";
import PostCard from "../components/PostCard";
import { noticeDummy } from "../data/noticeDummy";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";

interface Props {
  board: "notice" | "free";
}

export default function BoardList({ board }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState("");
  const { user, role } = useUserRole();
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<"number" | "createdAt" | "views">(
    "number"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const pageSize = 20;

  const canWrite = !!user && (board === "free" || role === "admin");

  const load = async () => {
    setLoading(true);
    if (board === "notice") {
      setPosts(noticeDummy);
    } else {
      const res = await listPosts(board);
      setPosts(res.posts);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.content.toLowerCase().includes(term) ||
        p.authorName.toLowerCase().includes(term)
    );
  }, [posts, search]);

  const sorted = useMemo(() => {
    const pinned = filtered.filter((p) => p.pinned);
    const normal = filtered.filter((p) => !p.pinned);
    normal.sort((a, b) => {
      let comp = 0;
      if (sortKey === "views") {
        comp = (a.views || 0) - (b.views || 0);
      } else {
        const ta = new Date(a.createdAt).getTime();
        const tb = new Date(b.createdAt).getTime();
        comp = ta - tb;
      }
      return sortOrder === "asc" ? comp : -comp;
    });
    return [...pinned, ...normal];
  }, [filtered, sortKey, sortOrder]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const pagePosts = sorted.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (key: "number" | "createdAt" | "views") => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  return (
    <BoardLayout
      board={board}
      canWrite={canWrite}
      search={
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="검색 (제목/본문/작성자)"
          className="border px-2 py-1 w-full sm:w-64"
        />
      }
    >
      <div className="hidden sm:block">
        <table className="w-full table-fixed border-t border-b">
          <thead className="bg-gray-50">
            <tr className="text-center">
              <th
                className="w-12 py-2 cursor-pointer"
                onClick={() => toggleSort("number")}
              >
                번호 {sortKey === "number" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th className="text-left">제목</th>
              <th className="w-24">작성자</th>
              <th
                className="w-32 cursor-pointer"
                onClick={() => toggleSort("createdAt")}
              >
                날짜 {sortKey === "createdAt" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="w-16 cursor-pointer"
                onClick={() => toggleSort("views")}
              >
                조회 {sortKey === "views" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            )}
            {!loading &&
              pagePosts.map((p, i) => (
                <PostItem
                  key={p.id}
                  post={p}
                  index={sorted.length - ((page - 1) * pageSize + i)}
                />
              ))}
            {!loading && pagePosts.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8">
                  <div className="border rounded p-6 text-center text-gray-500">
                    📄 등록된 공지가 없습니다. 우측 상단에서 작성하세요.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="sm:hidden space-y-2">
        {pagePosts.map((p, i) => (
          <PostCard
            key={p.id}
            post={p}
            index={sorted.length - ((page - 1) * pageSize + i)}
          />
        ))}
        {!loading && pagePosts.length === 0 && (
          <div className="border rounded p-6 text-center text-gray-500">
            📄 등록된 공지가 없습니다. 우측 상단에서 작성하세요.
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage(Math.max(1, page - 1));
                }}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  isActive={page === i + 1}
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(i + 1);
                  }}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage(Math.min(totalPages, page + 1));
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </BoardLayout>
  );
}

