import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useUserRole from "../hooks/useUserRole";
import { getPost, deletePost, Post, increaseView } from "../libs/posts.repo";
import BoardLayout from "../components/BoardLayout";
import { toast } from "sonner";

interface Comment {
  id: number;
  author: string;
  content: string;
  createdAt: Date;
}

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const { user, role } = useUserRole();
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      author: "익명",
      content: "첫 댓글입니다.",
      createdAt: new Date(),
    },
  ]);
  const [comment, setComment] = useState("");

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

  const isOwner = user && post && post.authorUid === user.uid;
  const isAdmin = role === "admin";
  const canWrite = !!user && post && (post.board === "free" || isAdmin);

  const handleDelete = async () => {
    if (!post) return;
    if (confirm("삭제하시겠습니까?")) {
      try {
        await deletePost(post.id);
        toast.success("게시글이 삭제되었습니다.");
        navigate(`/${post.board}`);
      } catch (e) {
        toast.error("게시글 삭제에 실패했습니다.");
      }
    }
  };

  const addComment = () => {
    if (!comment.trim()) return;
    setComments([
      ...comments,
      {
        id: Date.now(),
        author: user?.displayName || "익명",
        content: comment,
        createdAt: new Date(),
      },
    ]);
    setComment("");
    toast.success("댓글이 등록되었습니다.");
  };

  if (!post) return <div className="p-4">Loading...</div>;

  const createdAt = post.createdAt?.toDate
    ? post.createdAt.toDate()
    : new Date(post.createdAt);

  return (
    <BoardLayout board={post.board} canWrite={canWrite}>
      <h1 className="text-2xl font-bold mb-2">
        {post.tags?.map((tag) => (
          <span
            key={tag}
            className={`mr-1 ${tag === "공지" ? "text-red-500" : "text-blue-500"}`}
          >
            [{tag}]
          </span>
        ))}
        {post.title}
      </h1>
      <div className="text-sm text-gray-500 mb-4 flex flex-wrap gap-2 justify-between">
        <span>{post.authorName}</span>
        <span>
          {createdAt.toLocaleDateString()} | 조회 {post.views ?? 0}
        </span>
      </div>
      <div className="whitespace-pre-wrap p-6 border rounded mb-4">
        {post.content}
      </div>
      {(isOwner || isAdmin) && (
        <div className="flex gap-2 mb-8">
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
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-2">댓글</h2>
        {comments.map((c) => (
          <div key={c.id} className="border-t py-2">
            <div className="text-sm text-gray-500">
              {c.author} | {c.createdAt.toLocaleDateString()}
            </div>
            <div>{c.content}</div>
          </div>
        ))}
        <textarea
          className="w-full border p-2 mt-4"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="댓글을 입력하세요"
        />
        <button
          className="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
          onClick={addComment}
        >
          댓글 달기
        </button>
      </section>
      <div className="mt-8">
        <button
          className="px-4 py-2 border rounded"
          onClick={() => navigate(`/${post.board}`)}
        >
          목록으로
        </button>
      </div>
    </BoardLayout>
  );
}

