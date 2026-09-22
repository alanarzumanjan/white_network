import { Link } from "react-router-dom";
import { Post } from "../services/content_api";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "только что";
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays < 7) return `${diffDays} д назад`;
    return date.toLocaleDateString("ru-RU");
  };

  return (
    <div className="p-6 rounded-2xl bg-white border-2 border-slate-100 hover:border-blue-200 transition-all hover:shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold">
          {post.authorUsername.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">
              {post.authorUsername}
            </span>
            <span className="text-xs text-emerald-600 font-medium">
              ⭐ {post.authorKarma}
            </span>
          </div>
          <div className="text-xs text-slate-500">
            {formatDate(post.createdAt)}
          </div>
        </div>
        {post.clubName && (
          <Link
            to={`/club/${post.clubId}`}
            className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors"
          >
            {post.clubName}
          </Link>
        )}
      </div>

      {/* Content */}
      <Link to={`/post/${post.id}`}>
        <p className="text-slate-700 leading-relaxed mb-4 hover:text-slate-900 transition-colors">
          {post.content.length > 300
            ? post.content.substring(0, 300) + "..."
            : post.content}
        </p>
      </Link>

      {/* Footer */}
      <div className="flex items-center gap-6 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <button className="hover:text-blue-600 transition-colors">▲</button>
          <span className="font-semibold">{post.upvotes - post.downvotes}</span>
          <button className="hover:text-red-600 transition-colors">▼</button>
        </div>
        <Link
          to={`/post/${post.id}`}
          className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
        >
          💬 {post.commentsCount}
        </Link>
      </div>
    </div>
  );
}
