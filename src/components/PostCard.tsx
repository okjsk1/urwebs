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
  const isNotice = post.pinned;
  return (
    <div className="border rounded p-4 mb-2">
      <Link to={`/post/${post.id}`} className="block truncate text-lg font-semibold">
        {post.tags?.map((tag) => (
          <span
            key={tag}
            className={`mr-1 ${tag === "공지" ? "text-red-500" : "text-blue-500"}`}
          >
            [{tag}]
          </span>
        ))}
        {post.title}
      </Link>
      <div className="mt-1 text-sm text-gray-500 flex flex-wrap gap-2">
        <span>{isNotice ? "공지" : `#${index}`}</span>
        <span>{post.authorName}</span>
        <span>{date.toLocaleDateString()}</span>
        <span>조회 {post.views ?? 0}</span>
      </div>
    </div>
  );
}

