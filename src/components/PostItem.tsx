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
  return (
    <tr className="border-b text-center">
      <td className="py-2">{post.pinned ? "공지" : index}</td>
      <td className="text-left">
        {post.pinned && <span className="text-red-500 mr-1">[공지]</span>}
        <Link to={`/post/${post.id}`} className="hover:underline">
          {post.title}
        </Link>
      </td>
      <td>{post.authorName}</td>
      <td>{date.toLocaleDateString()}</td>
      <td>{post.views ?? 0}</td>
    </tr>
  );
}
