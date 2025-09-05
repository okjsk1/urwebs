import { useEffect, useState } from "react";
import { User, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, provider, db } from "../firebase";
import { listPosts, Post } from "../libs/posts.repo";
import BoardHeader from "../components/BoardHeader";
import PostItem from "../components/PostItem";

interface Props {
  board: "notice" | "free";
}

export default function BoardList({ board }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<any>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const snap = await getDoc(doc(db, "users", u.uid));
        setRole(snap.data()?.role || "user");
      } else {
        setRole(null);
      }
    });
    return () => unsub();
  }, []);

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

  const handleLogin = async () => {
    await signInWithPopup(auth, provider);
  };
  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <BoardHeader
        board={board}
        search={search}
        onSearch={setSearch}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        canWrite={canWrite}
      />
      <table className="w-full table-fixed">
        <thead>
          <tr className="border-b text-center">
            <th className="w-12">번호</th>
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
      {lastDoc && (
        <div className="text-center my-4">
          <button
            className="px-3 py-1 border"
            onClick={() => load(false)}
          >
            더보기
          </button>
        </div>
      )}
    </div>
  );
}
