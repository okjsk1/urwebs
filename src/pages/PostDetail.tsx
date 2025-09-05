import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { User, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { getPost, deletePost, Post, increaseView } from "../libs/posts.repo";

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      getPost(id).then((p) => {
        if (p) {
          setPost({ ...p, views: (p.views || 0) + 1 });
          increaseView(p.id);
        }
      });
    }
  }, [id]);

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

  const isOwner = user && post && post.authorUid === user.uid;
  const isAdmin = role === "admin";

  const handleDelete = async () => {
    if (!post) return;
    if (confirm("삭제하시겠습니까?")) {
      await deletePost(post.id);
      navigate(`/${post.board}`);
    }
  };

  if (!post) return <div className="p-4">Loading...</div>;

  const createdAt = post.createdAt?.toDate
    ? post.createdAt.toDate()
    : new Date(post.createdAt);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
      <div className="text-sm text-gray-500 mb-4 flex justify-between">
        <span>{post.authorName}</span>
        <span>
          {createdAt.toLocaleDateString()} | 조회 {post.views ?? 0}
        </span>
      </div>
      <div className="whitespace-pre-wrap mb-4">{post.content}</div>
      {(isOwner || isAdmin) && (
        <div className="flex gap-2">
          <button
            className="px-3 py-1 border"
            onClick={() => navigate(`/write?board=${post.board}&id=${post.id}`)}
          >
            수정
          </button>
          <button className="px-3 py-1 border" onClick={handleDelete}>
            삭제
          </button>
        </div>
      )}
    </div>
  );
}
