import { Link } from "react-router-dom";
import { Post } from "../libs/posts.repo";

interface Props {
  post: Post;
  index: number;
}

export default function PostCard({ post, index }: Props) {
  const date = post.createdAt?.toDate
    ? post.createdAt.toDate()
    : new Date(post.createdAt);
  const isNotice = post.board === "notice" || post.pinned;
  return (
    <div className="border-b py-3">
      <Link to={`/post/${post.id}`} className="font-medium block truncate">
        {isNotice && <span className="text-red-500 mr-1">[공지]</span>}
        {post.title}
      </Link>
      <div className="text-xs text-gray-500 mt-1 flex gap-2">
        <span>#{index}</span>
        <span>{post.authorName}</span>
        <span>{date.toLocaleDateString()}</span>
        <span>조회 {post.views ?? 0}</span>
      </div>
    </div>
  );
}

