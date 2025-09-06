import { useEffect, useState } from "react";
import useUserRole from "../hooks/useUserRole";
import { listPosts, Post } from "../libs/posts.repo";
import BoardLayout from "../components/BoardLayout";
import PostItem from "../components/PostItem";
import PostCard from "../components/PostCard";

interface Props {
  board: "notice" | "free";
}

export default function BoardList({ board }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState("");
  const { user, role } = useUserRole();
  const [lastDoc, setLastDoc] = useState<any>();
  const [loading, setLoading] = useState(false);

  const canWrite = !!user && (board === "free" || role === "admin");

  const load = async (reset = false) => {
    if (loading) return;
    setLoading(true);
    const res = await listPosts(board, reset ? undefined : lastDoc);
    let newPosts = res.posts;
    if (search) {
      newPosts = newPosts.filter((p) => p.title.includes(search));
    }
    setPosts(reset ? newPosts : [...posts, ...newPosts]);
    setLastDoc(res.lastDoc);
    setLoading(false);
  };

  useEffect(() => {
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board, search]);

  return (
    <BoardLayout board={board} canWrite={canWrite}>
      <div className="mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="검색"
          className="border px-2 py-1 w-full sm:w-64"
        />
      </div>
      <div className="hidden sm:block">
        <table className="w-full table-fixed border-t border-b">
          <thead className="bg-gray-50">
            <tr className="text-center">
              <th className="w-12 py-2">번호</th>
              <th className="text-left">제목</th>
              <th className="w-24">작성자</th>
              <th className="w-32">날짜</th>
              <th className="w-16">조회</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p, i) => (
              <PostItem key={p.id} post={p} index={posts.length - i} />
            ))}
          </tbody>
        </table>
      </div>
      <div className="sm:hidden space-y-2">
        {posts.map((p, i) => (
          <PostCard key={p.id} post={p} index={posts.length - i} />
        ))}
      </div>
      {lastDoc && (
        <div className="text-center my-4">
          <button className="px-3 py-1 border" onClick={() => load(false)}>
            더보기
          </button>
        </div>
      )}
    </BoardLayout>
  );
}

