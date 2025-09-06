import { Link } from "react-router-dom";
import { Post } from "../libs/posts.repo";

interface Props {
  post: Post;
  index: number;
}

export default function PostItem({ post, index }: Props) {
  const date = post.createdAt?.toDate
    ? post.createdAt.toDate()
    : new Date(post.createdAt);
  const isNotice = post.pinned;
  return (
    <tr className="border-b text-center hover:bg-gray-50">
      <td className="py-3">{isNotice ? "공지" : index}</td>
      <td className="text-left px-2">
        {post.tags?.map((tag) => (
          <span
            key={tag}
            className={`mr-1 ${tag === "공지" ? "text-red-500" : "text-blue-500"}`}
          >
            [{tag}]
          </span>
        ))}
        <Link to={`/post/${post.id}`} className="block truncate hover:underline">
          {post.title}
        </Link>
      </td>
      <td>{post.authorName}</td>
      <td>{date.toLocaleDateString()}</td>
      <td>{post.views ?? 0}</td>
    </tr>
  );
}

