import { Link } from "react-router-dom";
import { Post } from "../libs/posts.repo";

export default function PostItem({ post }: { post: Post }) {
  return (
    <div className="border-b p-2">
      <Link to={`/post/${post.id}`} className="flex justify-between">
        <div>
          {post.pinned && <span className="text-red-500 mr-1">[공지]</span>}
          <span>{post.title}</span>
        </div>
        <div className="text-sm text-gray-500">
          {post.authorName}
        </div>
      </Link>
    </div>
  );
}
