import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { postsApi } from "../services/content_api";

export default function CreatePostPage() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("Пост не может быть пустым");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await postsApi.create({ content });
      navigate("/feed");
    } catch (err) {
      setError("Не удалось создать пост. Попробуйте снова.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-violet-50 py-8">
      <div className="max-w-3xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Создать пост
          </h1>
          <p className="text-slate-600">
            Поделитесь своими мыслями с сообществом
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border-2 border-slate-100 shadow-lg">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="О чём вы думаете? Напишите что-нибудь интересное..."
              className="w-full min-h-[200px] p-4 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 text-lg outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400 resize-y"
              maxLength={5000}
              disabled={loading}
            />
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-slate-500">
                {content.length} / 5000
              </span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/feed")}
                  className="px-6 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors"
                  disabled={loading}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={loading || !content.trim()}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Публикуем..." : "Опубликовать"}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
