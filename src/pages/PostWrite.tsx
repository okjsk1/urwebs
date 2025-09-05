import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { User, onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, provider, db } from "../firebase";
import { createPost, updatePost, getPost } from "../libs/posts.repo";
import { toast } from "sonner";

export default function PostWrite() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const board = params.get("board") as "notice" | "free" | null;
  const editId = params.get("id");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pinned, setPinned] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);

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

  useEffect(() => {
    if (editId) {
      getPost(editId).then((p) => {
        if (p) {
          setTitle(p.title);
          setContent(p.content);
          setPinned(p.pinned);
        }
      });
    }
  }, [editId]);

  const isAdmin = role === "admin";
  const canWrite = !!user && (board === "free" || isAdmin);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!board || !user || !canWrite) return;
    const data = {
      board,
      title,
      content,
      authorUid: user.uid,
      authorName: user.displayName || user.email || "",
      pinned: board === "notice" ? pinned : false,
    };
    try {
      if (editId) {
        await updatePost(editId, {
          title,
          content,
          pinned: data.pinned,
          board: data.board,
        });
        toast.success("게시글이 수정되었습니다.");
        navigate(`/post/${editId}`);
      } else {
        const id = await createPost(data);
        toast.success("게시글이 작성되었습니다.");
        navigate(`/post/${id}`);
      }
    } catch (e) {
      toast.error("게시글 저장에 실패했습니다.");
    }
  };

  if (!board) return <div className="p-4">잘못된 접근입니다.</div>;
  if (!user)
    return (
      <div className="p-4 text-center">
        <button className="px-3 py-1 border" onClick={() => signInWithPopup(auth, provider)}>
          로그인 후 작성
        </button>
      </div>
    );
  if (!canWrite) return <div className="p-4">권한이 없습니다.</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
          className="border px-2 py-1"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용"
          className="border px-2 py-1 h-60"
        />
        {board === "notice" && isAdmin && (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
            />
            상단 고정
          </label>
        )}
        <button type="submit" className="px-3 py-1 bg-blue-500 text-white rounded">
          {editId ? "수정" : "작성"}
        </button>
      </form>
    </div>
  );
}
