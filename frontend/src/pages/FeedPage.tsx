import { useEffect, useState } from "react";
import { FeedResponse, Post, feedApi } from "../services/content_api";
import PostCard from "../components/PostCard";
import { Link } from "react-router-dom";

export default function FeedPage() {
  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const data = await feedApi.get({ page: 1, pageSize: 20 });
      setFeed(data);
    } catch (err) {
      setError("Не удалось загрузить ленту");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-violet-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Загрузка ленты...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-violet-50 flex items-center justify-center">
        <div className="text-center p-8 rounded-2xl bg-white shadow-lg">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Ошибка</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={loadFeed}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-violet-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Лента</h1>
          <Link
            to="/create"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
          >
            Создать пост
          </Link>
        </div>

        {/* Posts */}
        {feed && feed.posts.length > 0 ? (
          <div className="space-y-6">
            {feed.posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center p-12 rounded-2xl bg-white shadow-lg">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Пока нет постов
            </h2>
            <p className="text-slate-600 mb-6">
              Будьте первым, кто напишет пост в White Network!
            </p>
            <Link
              to="/create"
              className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold hover:shadow-lg transition-all"
            >
              Создать первый пост
            </Link>
          </div>
        )}

        {/* Pagination */}
        {feed && feed.hasNextPage && (
          <div className="text-center mt-8">
            <button className="px-6 py-3 rounded-xl bg-white border-2 border-slate-200 text-slate-700 font-medium hover:border-blue-300 hover:bg-blue-50 transition-all">
              Загрузить ещё
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
