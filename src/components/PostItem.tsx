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
    <tr className="border-b text-center">
      <td className="py-2">{isNotice ? "공지" : index}</td>
      <td className="text-left">
        {isNotice && <span className="text-red-500 mr-1">[공지]</span>}
        <Link to={`/post/${post.id}`} className="hover:underline block truncate">
          {post.title}
        </Link>
      </td>
      <td>{post.authorName}</td>
      <td>{date.toLocaleDateString()}</td>
      <td>{post.views ?? 0}</td>
    </tr>
  );
}

