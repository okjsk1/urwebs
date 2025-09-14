import { Link } from "react-router-dom";
import { PinIcon } from "lucide-react";
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
    <div className={`border rounded p-4 mb-2 ${isNotice ? "bg-gray-100" : ""}`}>
      <Link
        to={`/post/${post.id}`}
        className="block truncate text-lg font-semibold"
        title={post.title}
      >
        {isNotice && <PinIcon className="inline mr-1 w-4 h-4 text-red-500" />}
        {post.title}
      </Link>
      <div className="mt-1 text-sm text-gray-500 flex flex-wrap gap-2">
        <span>{isNotice ? "怨듭?" : `#${index}`}</span>
        <span>{post.authorName}</span>
        <span>{date.toLocaleDateString()}</span>
        <span>議고쉶 {post.views ?? 0}</span>
      </div>
    </div>
  );
}


