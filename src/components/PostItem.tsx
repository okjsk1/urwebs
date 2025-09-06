import { Link, useNavigate } from "react-router-dom";
import { PinIcon } from "lucide-react@0.487.0";
import { Post } from "../libs/posts.repo";

interface Props {
  post: Post;
  index: number;
}

export default function PostItem({ post, index }: Props) {
  const navigate = useNavigate();
  const date = post.createdAt?.toDate
    ? post.createdAt.toDate()
    : new Date(post.createdAt);
  const isNotice = post.pinned;
  return (
    <tr
      onClick={() => navigate(`/post/${post.id}`)}
      className={`border-b text-center hover:bg-gray-100 cursor-pointer ${
        isNotice ? "bg-gray-100" : ""
      }`}
    >
      <td className="py-3">
        {isNotice ? (
          <span className="inline-flex items-center gap-1 text-red-500">
            <PinIcon className="w-4 h-4" /> 공지
          </span>
        ) : (
          index
        )}
      </td>
      <td className="text-left px-2">
        <Link
          to={`/post/${post.id}`}
          title={post.title}
          className="block truncate hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {post.title}
        </Link>
      </td>
      <td>{post.authorName}</td>
      <td>{date.toLocaleDateString()}</td>
      <td>{post.views ?? 0}</td>
    </tr>
  );
}

