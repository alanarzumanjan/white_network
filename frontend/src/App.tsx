import React, { useMemo, useState, useEffect } from "react";

const SUBSCRIBERS_URL = `${import.meta.env.VITE_API_URL || ""}/api/subscribers`;
const SUBSCRIBERS_COUNT_URL = `${import.meta.env.VITE_API_URL || ""}/api/subscribers/count`;

type SubmitState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

function normalizeErrorMessage(resStatus: number, message: string): string {
  const normalized = message.toLowerCase();

  if (
    resStatus === 409 ||
    normalized.includes("already") ||
    normalized.includes("exists") ||
    normalized.includes("registered") ||
    normalized.includes("email")
  ) {
    return "Этот email уже в списке";
  }

  if (message.trim().length > 0) {
    return message.trim();
  }

  return "Не удалось отправить";
}

export default function App() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState<number>(247);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0 });

  const source = useMemo(() => "landing" as const, []);

  // Fetch subscribers count
  useEffect(() => {
    fetch(SUBSCRIBERS_COUNT_URL)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.count === "number") {
          setSubscribersCount(data.count);
        }
      })
      .catch(() => {});
  }, []);

  // Countdown timer до Q3 2026 (1 сентября)
  useEffect(() => {
    const target = new Date("2026-09-01T00:00:00").getTime();
    const update = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
      });
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (submitState.status === "loading") return;

    const payload = {
      email,
      name: name.trim() ? name.trim() : undefined,
      reason: reason.trim() ? reason.trim() : undefined,
      source,
    };

    setSubmitState({ status: "loading" });

    try {
      const res = await fetch(SUBSCRIBERS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let message = "";

      if (text) {
        try {
          const data: unknown = JSON.parse(text);
          const d = data as Record<string, unknown>;
          const maybeString = typeof data === "string" ? data : "";

          message =
            (typeof d?.message === "string" ? d.message : undefined) ??
            (typeof d?.error === "string" ? d.error : undefined) ??
            (typeof d?.title === "string" ? d.title : undefined) ??
            maybeString ??
            "";
        } catch {
          message = text;
        }
      }

      if (!res.ok) {
        setSubmitState({
          status: "error",
          message: normalizeErrorMessage(res.status, message || ""),
        });
        return;
      }

      setSubscribersCount((c) => c + 1);
      setSubmitState({
        status: "success",
        message:
          "Спасибо! Вы в списке раннего доступа! Как начальная версия будет готова - вам придет сообщение на почту и вы получите бонус за вструпление одними из первых! Следите за уведомлениями!",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      setSubmitState({
        status: "error",
        message: message?.trim() || "Сеть недоступна",
      });
    }
  }

  const loading = submitState.status === "loading";
  const success = submitState.status === "success";
  const error = submitState.status === "error";

  const rules = [
    {
      num: "01",
      title: "Уважение и понимание",
      text: "Относиться друг к другу с уважением и пониманием. Каждый участник ценен.",
    },
    {
      num: "02",
      title: "Культурное общение",
      text: "Общение без матов и вульгарности. Мы за чистоту речи и мысли.",
    },
    {
      num: "03",
      title: "Без оскорблений",
      text: "Не оскорблять и не обижать участников. В сообществе все равноценны и значимы.",
    },
    {
      num: "04",
      title: "Чистый контент",
      text: "Никаких материалов 18+, вульгарности, казино-рекламы и того, что вызывает негатив.",
    },
    {
      num: "05",
      title: "Честность и искренность",
      text: "Быть честным и искренним в общении и собственных побуждениях.",
    },
    {
      num: "06",
      title: "Тактичность",
      text: "Думать о друг друге и стараться быть тактичным в высказываниях.",
    },
    {
      num: "07",
      title: "Взаимная поддержка",
      text: "Поддерживать и развиваться вместе с сообществом. Расти — значит расти вместе.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-violet-50">
      {/* STICKY NAV */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white font-extrabold text-sm transition-transform group-hover:scale-110">
              W
            </div>
            <span className="font-bold text-slate-900 hidden sm:inline">
              White Network
            </span>
          </a>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-4 text-sm">
            <a
              href="#early-access"
              className="px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors font-medium"
            >
              Ранний доступ
            </a>
            <a
              href="#rules"
              className="px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors font-medium"
            >
              Правила
            </a>
            <a
              href="https://t.me/whiter_network"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors font-medium"
            >
              Telegram
            </a>
            <a
              href="#early-access"
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold shadow-md hover:shadow-lg transition-all inline-flex items-center gap-1.5"
            >
              Вступить
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <path
                  d="M7 14L11 10L7 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Menu"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {mobileMenuOpen ? (
                <path d="M6 6L18 18M6 18L18 6" strokeLinecap="round" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-2">
              <a
                href="#early-access"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100 font-medium"
              >
                Ранний доступ
              </a>
              <a
                href="#rules"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100 font-medium"
              >
                Правила
              </a>
              <a
                href="https://t.me/whiter_network"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100 font-medium"
              >
                Telegram
              </a>
              <a
                href="#early-access"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold text-center"
              >
                Вступить
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section
        className="min-h-screen pt-12 pb-16 md:pt-20 md:pb-20 relative"
        aria-label="White Network hero"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Left */}
            <div>
              {/* Счётчик подписчиков */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex -space-x-2">
                  {[
                    "bg-blue-500",
                    "bg-violet-500",
                    "bg-emerald-500",
                    "bg-amber-500",
                  ].map((c, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full ${c} border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm`}
                    >
                      {["А", "М", "К", "Д"][i]}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-slate-600">
                  <strong className="text-slate-900">
                    {subscribersCount} человек
                  </strong>{" "}
                  уже в списке ожидания
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-sm font-medium mb-6">
                <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse" />
                <span>Социальная сеть нового поколения</span>
              </div>

              <h1 className="text-4xl md:text-7xl font-extrabold leading-[1.1] tracking-[-0.04em] mb-6">
                <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                  White
                </span>
                <br />
                <span className="text-slate-900">Network</span>
                <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                  {" "}
                  | Whiter
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-[540px] mb-8">
                Пространство, где ценятся культура речи, интеллектуальное
                общение и взаимное уважение
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 shadow-sm">
                  <span>✨</span>
                  <span>Без токсичности</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 shadow-sm">
                  <span>🎯</span>
                  <span>Умное сообщество</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 shadow-sm">
                  <span>🛡️</span>
                  <span>Качественный контент</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <a
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold transition-all hover:-translate-y-0.5 hover:shadow-xl shadow-lg shadow-blue-600/25"
                  href="#early-access"
                  aria-label="Получить ранний доступ"
                >
                  <span>Получить ранний доступ</span>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M7 14L11 10L7 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>

                <a
                  className="inline-flex items-center justify-center px-7 py-4 rounded-xl bg-white text-slate-700 border-2 border-slate-200 font-semibold transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50"
                  href="https://boosty.to/whiter.net"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Поддержать проект
                </a>
              </div>

              {/* Countdown timer */}
              <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-violet-50 border border-blue-200 max-w-md">
                <div className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3">
                  До закрытой beta осталось
                </div>
                <div className="flex gap-3">
                  {[
                    { label: "дней", value: countdown.days },
                    { label: "часов", value: countdown.hours },
                    { label: "минут", value: countdown.minutes },
                  ].map((t) => (
                    <div key={t.label} className="flex-1 text-center">
                      <div className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                        {t.value}
                      </div>
                      <div className="text-xs text-slate-500 uppercase tracking-wider">
                        {t.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right */}
            <div>
              <div
                id="early-access"
                className="p-8 md:p-10 rounded-3xl bg-white shadow-2xl border border-slate-200"
              >
                <div className="mb-7">
                  <h2 className="text-2xl md:text-3xl font-bold mb-3 text-slate-900">
                    Присоединяйтесь к раннему доступу
                  </h2>
                  <p className="text-base text-slate-600 m-0">
                    Оставьте email, чтобы получить приглашение первым
                  </p>
                </div>

                <form onSubmit={onSubmit} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Email *
                    </label>
                    <input
                      id="email"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 text-[0.95rem] outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400"
                      type="email"
                      value={email}
                      onChange={(ev) => setEmail(ev.target.value)}
                      required
                      placeholder="you@example.com"
                      autoComplete="email"
                      disabled={loading}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="name"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Имя
                    </label>
                    <input
                      id="name"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 text-[0.95rem] outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400 disabled:opacity-60"
                      type="text"
                      value={name}
                      onChange={(ev) => setName(ev.target.value)}
                      placeholder="Как к вам обращаться?"
                      disabled={loading}
                      autoComplete="name"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="reason"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Почему хотите вступить?
                    </label>
                    <textarea
                      id="reason"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 text-[0.95rem] outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400 resize-y min-h-[100px] disabled:opacity-60"
                      value={reason}
                      onChange={(ev) => setReason(ev.target.value)}
                      placeholder="Например: хочу общаться без токсичности"
                      disabled={loading}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-7 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold shadow-lg shadow-blue-600/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 inline-flex items-center justify-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Отправляем...</span>
                      </>
                    ) : (
                      <>
                        <span>Получить ранний доступ</span>
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <path
                            d="M7 14L11 10L7 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </>
                    )}
                  </button>

                  {(success || error) && (
                    <div
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                        success
                          ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                          : "bg-red-50 border border-red-200 text-red-700"
                      }`}
                      role={success ? "status" : "alert"}
                      aria-live="polite"
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
                          success
                            ? "bg-emerald-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {success ? "✓" : "!"}
                      </div>
                      <span>{submitState.message}</span>
                    </div>
                  )}

                  <p className="text-xs text-slate-500 text-center m-0">
                    Нажимая кнопку, вы соглашаетесь с{" "}
                    <a
                      href="/privacy"
                      className="underline hover:text-blue-600"
                    >
                      политикой конфиденциальности
                    </a>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 md:py-20 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center p-8 rounded-3xl bg-gradient-to-br from-blue-50 to-violet-50 border border-slate-200 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="text-5xl font-extrabold mb-2 bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                100%
              </div>
              <div className="text-sm text-slate-600 font-medium">
                Без мата и токсичности
              </div>
            </div>
            <div className="text-center p-8 rounded-3xl bg-gradient-to-br from-blue-50 to-violet-50 border border-slate-200 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="text-5xl font-extrabold mb-2 bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                AI
              </div>
              <div className="text-sm text-slate-600 font-medium">
                Умная модерация
              </div>
            </div>
            <div className="text-center p-8 rounded-3xl bg-gradient-to-br from-blue-50 to-violet-50 border border-slate-200 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="text-5xl font-extrabold mb-2 bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                ∞
              </div>
              <div className="text-sm text-slate-600 font-medium">
                Тематических клубов
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMS */}
      <section className="py-24 md:py-28" aria-label="Что нас беспокоит">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
              Проблема
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-[-0.03em] mb-4 text-slate-900">
              Что нас беспокоит
            </h2>
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
              Мы видим, как качество общения в интернете падает с каждым днём
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-3xl bg-white border-2 border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1 hover:border-blue-200">
              <div className="text-5xl mb-5">🗣️</div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">
                Отсутствие культуры
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed m-0">
                Маты, оскорбления, переход на личности стали нормой в
                большинстве социальных сетей
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-white border-2 border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1 hover:border-blue-200">
              <div className="text-5xl mb-5">🗑️</div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">
                Мусорный контент
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed m-0">
                Непристойные материалы и кликбейт заполняют ленты, забирая ваше
                время и внимание
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-white border-2 border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1 hover:border-blue-200">
              <div className="text-5xl mb-5">🔍</div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">
                Сложно найти единомышленников
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed m-0">
                Умных, культурных, приятных людей становится всё труднее
                встретить в интернете
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CHILDREN / FUTURE GENERATIONS */}
      <section
        className="py-24 md:py-28 bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 relative"
        aria-label="Защитим будущее"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block px-4 py-1.5 rounded-full bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider mb-4">
              Особенно важно
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-[-0.03em] mb-4 text-slate-900">
              Под угрозой — наши дети
            </h2>
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
              Каждый день подрастающее поколение впитывает то, что видит в
              интернете. И то, что они видят сегодня, формирует их завтра
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="p-8 rounded-3xl bg-white border-2 border-rose-100 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="text-5xl mb-5">🧒</div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">
                Деградация речи с ранних лет
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed m-0">
                Дети и подростки учатся говорить так, как говорят вокруг. Если в
                ленте — мат, оскорбления и пошлость, именно это станет их
                нормой. Мы теряем целое поколение, которое не знает красоты
                русского языка
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-white border-2 border-rose-100 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="text-5xl mb-5">💔</div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">
                Травля и агрессия как норма
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed m-0">
                Когда оскорбления становятся повседневной практикой, дети
                перестают видеть в этом что-то плохое. Они начинают травить друг
                друга, потому что «так делают все». Мы обязаны разорвать этот
                круг
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-white border-2 border-rose-100 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="text-5xl mb-5">🧠</div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">
                Потеря способности думать
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed m-0">
                Короткие, злые, примитивные сообщения убивают навык вести
                диалог. Подростки разучиваются аргументировать, слушать и
                слышать. Вместо дискуссий — обмен оскорблениями
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-white border-2 border-rose-100 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="text-5xl mb-5">🌱</div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">
                Искажённые ценности
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed m-0">
                Реклама казино, вульгарный контент, токсичные «авторитеты» — всё
                это формирует картину мира у молодого поколения. Им нужна
                альтернатива — среда, где ценятся ум, доброта и культура
              </p>
            </div>
          </div>

          <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-rose-600 to-pink-600 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15),transparent_70%)]" />
            <div className="relative">
              <div className="text-5xl mb-4">🕊️</div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                White Network — это не просто соцсеть
              </h3>
              <p className="text-base md:text-lg text-rose-50 leading-relaxed max-w-2xl mx-auto m-0">
                Это попытка создать пространство, в котором не стыдно будет
                расти нашим детям, младшим братьям и сёстрам. Пространство, где
                культура — это не слабость, а сила
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section
        className="py-24 md:py-28 bg-gradient-to-br from-slate-900 via-blue-900 to-violet-900 relative"
        aria-label="Наше решение"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-wider mb-4">
              Решение
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-[-0.03em] mb-4 text-white">
              Наше решение
            </h2>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
              Технологии помогают, но ценности — главные
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all hover:bg-white/10 hover:-translate-y-1 hover:shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-violet-400 scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" />
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-blue-500/20 border border-blue-400/30 mb-5">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">AI-редактор</h3>
              <p className="text-sm text-slate-300 leading-relaxed m-0">
                Предлагает литературные синонимы вместо мата. Не банит, а
                помогает выражать мысли красиво
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all hover:bg-white/10 hover:-translate-y-1 hover:shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-violet-400 scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" />
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-yellow-500/20 border border-yellow-400/30 mb-5">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">
                Литературная карма
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed m-0">
                Очки за красивые слова, аргументированные мысли, благородные
                поступки и помощь другим
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all hover:bg-white/10 hover:-translate-y-1 hover:shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-violet-400 scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" />
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-emerald-500/20 border border-emerald-400/30 mb-5">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">
                Жёсткая модерация
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed m-0">
                Никаких 18+, вульгарности, казино-рекламы. Только качественный и
                полезный контент
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all hover:bg-white/10 hover:-translate-y-1 hover:shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-violet-400 scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" />
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-violet-500/20 border border-violet-400/30 mb-5">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">
                Тематические клубы
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed m-0">
                Программирование, книги, наука, шахматы. Найди своих людей и
                общайся с единомышленниками
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all hover:bg-white/10 hover:-translate-y-1 hover:shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-violet-400 scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" />
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-cyan-500/20 border border-cyan-400/30 mb-5">
                <span className="text-2xl">📡</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">
                Важные новости
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed m-0">
                Подборка значимых новостей из проверенных источников по вашим
                интересам. Без кликбейта и шума
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        className="py-24 md:py-28 bg-white"
        aria-label="Как это работает"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
              Путь пользователя
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-[-0.03em] mb-4 text-slate-900">
              Как это работает
            </h2>
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
              Четыре простых шага до культурного общения
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {[
              {
                num: "1",
                icon: "📝",
                title: "Регистрация",
                text: "Оставь email и получи инвайт. Мы проверяем каждого, чтобы сохранить атмосферу.",
              },
              {
                num: "2",
                icon: "✍️",
                title: "Пиши посты",
                text: "Только текст — никаких картинок 18+ и вульгарности. AI помогает формулировать мысли красиво.",
              },
              {
                num: "3",
                icon: "⭐",
                title: "Получай карму",
                text: "За литературные слова, аргументы и помощь другим — очки. Карма растёт — открываются новые возможности.",
              },
              {
                num: "4",
                icon: "🌱",
                title: "Расти вместе",
                text: "Вступай в клубы, участвуй в дебатах, находи единомышленников. Развивайся в хорошей среде.",
              },
            ].map((step, i) => (
              <div key={step.num} className="relative">
                <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-slate-100 h-full transition-all hover:shadow-xl hover:-translate-y-1 hover:border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-white font-extrabold flex items-center justify-center shadow-lg">
                      {step.num}
                    </div>
                    <div className="text-3xl">{step.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-slate-900">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed m-0">
                    {step.text}
                  </p>
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 text-slate-300 text-2xl z-10">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEMO POST */}
      <section
        className="py-24 md:py-28 bg-gradient-to-br from-slate-50 to-blue-50"
        aria-label="Пример поста"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
              Как это выглядит
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-[-0.03em] mb-4 text-slate-900">
              Пример поста
            </h2>
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
              Так будут выглядеть обсуждения в White Network
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="p-8 rounded-3xl bg-white border-2 border-slate-100 shadow-xl">
              {/* Header поста */}
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-slate-100">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold">
                  М
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900">Мария К.</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                      Мыслитель · ⭐ 342
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Книжный клуб · 2 часа назад
                  </div>
                </div>
              </div>

              {/* Текст поста */}
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Почему «Медитации» Марка Аврелия актуальны спустя 2000 лет?
              </h3>
              <p className="text-slate-700 leading-relaxed mb-5">
                Перечитываю «Медитации» в третий раз и каждый раз нахожу что-то
                новое. Особенно меня поразила мысль о том, что мы страдаем не от
                событий, а от нашего отношения к ним. Как это перекликается с
                когнитивной психотерапией! Кто ещё замечал эту связь?
              </p>

              {/* AI-анализ */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-violet-50 border border-blue-200 mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">🤖</span>
                  <span className="text-xs font-bold text-blue-700">
                    AI-анализ поста
                  </span>
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  ✨ Аргументированная мысль:{" "}
                  <strong className="text-emerald-600">+15 кармы</strong> · 📚
                  Ссылка на тему:{" "}
                  <strong className="text-blue-600">+5 кармы</strong> · 💬
                  Приглашение к диалогу:{" "}
                  <strong className="text-violet-600">+3 кармы</strong>
                </div>
              </div>

              {/* Footer поста */}
              <div className="flex items-center gap-6 text-sm text-slate-500">
                <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                  <span>▲</span>
                  <span className="font-semibold">47</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                  <span>💬</span>
                  <span>12 ответов</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                  <span>🔖</span>
                  <span>Сохранить</span>
                </button>
              </div>
            </div>

            <p className="text-center text-sm text-slate-500 mt-6">
              ↑ Это демо. В реальной версии AI будет помогать писать ещё
              красивее
            </p>
          </div>
        </div>
      </section>

      {/* RULES */}
      <section
        id="rules"
        className="py-24 md:py-28"
        aria-label="Правила сообщества"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
              Сообщество
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-[-0.03em] mb-4 text-slate-900">
              Наши правила
            </h2>
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-6">
              Простые принципы, которые делают White Network местом, куда
              хочется возвращаться
            </p>
            <div className="inline-block p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-violet-50 border border-slate-200 max-w-2xl">
              <p className="text-base md:text-lg text-slate-700 italic leading-relaxed m-0">
                «Помните: общаясь, вы представляете свои собственные ценности и
                культуру, а также ценности и культуру своей семьи»
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rules.map((rule) => (
              <div
                key={rule.num}
                className="p-7 rounded-3xl bg-white border-2 border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1 hover:border-blue-200 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 text-[7rem] font-extrabold leading-none bg-gradient-to-br from-blue-600/10 to-violet-600/10 bg-clip-text text-transparent select-none pointer-events-none pr-4 pt-2">
                  {rule.num}
                </div>
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white font-extrabold text-lg mb-4 shadow-lg shadow-blue-600/20">
                    {rule.num}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-slate-900">
                    {rule.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed m-0">
                    {rule.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT ME */}
      <section
        className="py-24 md:py-28 bg-gradient-to-br from-indigo-50 via-blue-50 to-slate-50"
        aria-label="Обо мне"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 items-center">
            <div className="md:col-span-2 flex justify-center">
              <div className="relative">
                <div className="w-64 h-64 md:w-80 md:h-80 rounded-3xl bg-gradient-to-br from-blue-600 to-violet-600 shadow-2xl flex items-center justify-center overflow-hidden">
                  <img
                    src="/my_avatar.jpg"
                    alt="Alan - Founder"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 px-5 py-2 rounded-2xl bg-white shadow-lg border border-slate-200">
                  <div className="text-xs text-slate-500">Основатель</div>
                  <div className="text-sm font-bold text-slate-900">
                    Алан · 19 лет
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-3">
              <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-4">
                Об авторе
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-[-0.03em] mb-6 text-slate-900">
                Привет, я Алан
              </h2>

              <div className="space-y-4 text-base md:text-lg text-slate-700 leading-relaxed">
                <p className="m-0">
                  Мне 19 лет, я из Латвии. Увлекаюсь программированием,
                  шахматами, точными науками и английским языком. Читаю книги,
                  занимаюсь спортом, инвестициями.
                </p>
                <p className="m-0">
                  White Network — это не «очередной стартап ради хайпа». Это
                  проект, который я делаю, потому что{" "}
                  <strong className="text-slate-900">
                    сам устал от токсичности
                  </strong>{" "}
                  в интернете. Я хочу место, где можно спокойно поговорить о
                  книгах, коде, идеях — без ненормативной лексики с
                  интелектуальными людьми, без пусто потраченного времени.
                </p>
                <p className="m-0">
                  Я делаю его <strong className="text-slate-900">один</strong>:
                  сам пишу код на ASP.NET Core и React, сам проектирую
                  AI-фильтр, сам модерирую. Это непросто, но я верю, что такие
                  пространства нужны — особенно для молодых людей, которые ещё
                  формируются как личности.
                </p>
                <p className="m-0 italic text-slate-600">
                  Если вам близка эта идея — давайте построим её вместе.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <div className="text-sm text-slate-500 mb-3">
                  Технологии проекта:
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    "ASP.NET Core",
                    "React",
                    "PostgreSQL",
                    "Redis",
                    "AI/LLM",
                    "Modular Monolith",
                  ].map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* JOIN THE TEAM */}
      <section
        className="py-24 md:py-28 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative"
        aria-label="Стань частью команды"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4">
              Вместе мы сила
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-[-0.03em] mb-4 text-slate-900">
              Стань частью команды
            </h2>
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
              White Network — это не просто проект одного человека. Это
              сообщество, которое мы строим вместе. И у нас есть много идей,
              которые ждут своих авторов
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="p-8 rounded-3xl bg-white border-2 border-emerald-100 transition-all hover:shadow-xl hover:-translate-y-1 hover:border-emerald-300">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/20">
                <span className="text-2xl">💡</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">
                Делись идеями
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed m-0">
                У нас уже много задумок — от AI-анализатора фото до «медленных
                дебатов». Но лучшие идеи рождаются в диалоге. Каждый участник
                может предложить свою фичу, и если она найдёт отклик — мы её
                реализуем
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border-2 border-emerald-100 transition-all hover:shadow-xl hover:-translate-y-1 hover:border-emerald-300">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/20">
                <span className="text-2xl">📣</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">
                Продвигай вместе
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed m-0">
                Я буду невероятно рад тем, кто захочет помочь распространить
                идею White Network. Расскажи другу, поделись постом, напиши
                статью — любое действие приближает нас к цели. Вместе мы сможем
                изменить интернет
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 transition-all hover:shadow-xl hover:-translate-y-1 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold whitespace-nowrap">
                Особые бонусы
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center mb-5 shadow-lg shadow-emerald-600/30">
                <span className="text-2xl">🎁</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">
                Бонусы первым и активным
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed m-0">
                Те, кто присоединится первыми и будет помогать продвигать
                сообщество, получат особые бонусы: эксклюзивные бейджи,
                расширенные возможности, приоритетный доступ к новым фичам и
                многое другое
              </p>
            </div>
          </div>

          <div className="p-8 md:p-10 rounded-3xl bg-white border-2 border-emerald-200 text-center shadow-lg">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-slate-900">
              Хочешь стать амбассадором?
            </h3>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed mb-6 max-w-2xl mx-auto">
              Если ты готов активно помогать развивать White Network — напиши
              нам. Мы ищем единомышленников, которые разделяют наши ценности и
              хотят строить культурное пространство вместе
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://t.me/whiter_network"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-600/25 transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.643.135-.953l11.566-4.458c.538-.196 1.006.128.832.941z" />
                </svg>
                <span>Написать в Telegram</span>
              </a>
              <a
                href="#early-access"
                className="inline-flex items-center justify-center px-7 py-4 rounded-xl bg-white text-emerald-700 border-2 border-emerald-300 font-semibold transition-all hover:-translate-y-0.5 hover:bg-emerald-50"
              >
                Оставить заявку на ранний доступ
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* TELEGRAM */}
      <section
        className="py-24 md:py-28 bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50"
        aria-label="Telegram канал"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-1.5 rounded-full bg-sky-100 border border-sky-200 text-sky-700 text-xs font-bold uppercase tracking-wider mb-4">
                Новости и обновления
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-[-0.03em] mb-6 text-slate-900">
                Следите за развитием в Telegram
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                Подписывайтесь на наш канал, чтобы первыми узнавать о новых
                фичах, обновлениях и событиях в White Network. Делимся мыслями о
                культуре общения и показываем, как растёт наше сообщество.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="https://t.me/whiter_network"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 text-white font-semibold shadow-lg shadow-sky-500/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-500/30"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.643.135-.953l11.566-4.458c.538-.196 1.006.128.832.941z" />
                  </svg>
                  <span>Подписаться на канал</span>
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="p-8 rounded-3xl bg-white shadow-2xl border border-slate-200">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center shadow-lg">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="white"
                    >
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.643.135-.953l11.566-4.458c.538-.196 1.006.128.832.941z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-slate-900 mb-1">
                      White Network
                    </div>
                    <div className="text-sm text-slate-500">
                      @whiter_network
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-xs text-slate-500 mb-2">Сегодня</div>
                    <p className="text-sm text-slate-700 leading-relaxed m-0">
                      🚀 Запустили AI-редактор в тестовом режиме! Теперь система
                      автоматически предлагает синонимы вместо мата. Попробуйте
                      и поделитесь мнением.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-xs text-slate-500 mb-2">Вчера</div>
                    <p className="text-sm text-slate-700 leading-relaxed m-0">
                      💡 Новая фича: литературная карма. Очки за красивые слова
                      и аргументированные мысли. Топ участников недели уже в
                      профиле!
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-xs text-slate-500 mb-2">
                      3 дня назад
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed m-0">
                      📚 Книжный клуб: на этой неделе обсуждаем «Медитации»
                      Марка Аврелия. Присоединяйтесь к дискуссии!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BOOSTY */}
      <section
        className="py-24 md:py-28 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50"
        aria-label="Поддержать проект"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-block px-4 py-1.5 rounded-full bg-orange-100 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider mb-4">
              Поддержка проекта
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-[-0.03em] mb-6 text-slate-900">
              Помогите сделать White Network лучше
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              White Network — это независимый проект, созданный одним
              разработчиком. Ваша поддержка помогает оплачивать серверы,
              развивать новые фичи и делать интернет чище и культурнее.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="p-8 rounded-3xl bg-white border-2 border-slate-100 text-center transition-all hover:shadow-xl hover:-translate-y-1 hover:border-orange-200">
              <div className="text-4xl mb-4">☕</div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">
                Угостить кофе
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Небольшая поддержка, которая помогает держать проект на плаву
              </p>
              <div className="text-2xl font-extrabold text-orange-600 mb-4">
                $3
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 text-center transition-all hover:shadow-xl hover:-translate-y-1 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-orange-500 text-white text-xs font-bold">
                Популярно
              </div>
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">
                Поддержать разработку
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Помогает оплачивать серверы и развивать новые фичи
              </p>
              <div className="text-2xl font-extrabold text-orange-600 mb-4">
                $10
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white border-2 border-slate-100 text-center transition-all hover:shadow-xl hover:-translate-y-1 hover:border-orange-200">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">
                Стать спонсором
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Значительная поддержка для масштабирования проекта
              </p>
              <div className="text-2xl font-extrabold text-orange-600 mb-4">
                $15
              </div>
            </div>
          </div>

          <div className="text-center">
            <a
              href="https://boosty.to/whiter.net"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-lg shadow-xl shadow-orange-500/25 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/30"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span>Поддержать на Boosty</span>
            </a>
            <p className="text-sm text-slate-500 mt-4">
              Любая сумма имеет значение. Спасибо за вашу поддержку! ❤️
            </p>
          </div>
        </div>
      </section>

      {/* ROADMAP */}
      <section
        className="py-24 md:py-28 bg-slate-50"
        aria-label="Дорожная карта"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-block px-4 py-1.5 rounded-full bg-violet-100 border border-violet-200 text-violet-700 text-xs font-bold uppercase tracking-wider mb-4">
              План развития
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-[-0.03em] mb-4 text-slate-900">
              Дорожная карта
            </h2>
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
              Что нас ждёт в ближайшие месяцы
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-600 via-violet-600 to-slate-300 md:-translate-x-1/2" />

            <div className="space-y-12">
              {[
                {
                  phase: "Q2 2026",
                  title: "Сбор ядра сообщества",
                  status: "В процессе",
                  statusColor: "bg-emerald-500",
                  items: [
                    "Landing page и сбор email",
                    "Контент-кампания (VC, Habr, Telegram)",
                    "Первые 500+ заинтересованных",
                    "Формирование правил сообщества",
                  ],
                },
                {
                  phase: "Q3 2026",
                  title: "MVP и закрытая beta",
                  status: "Скоро",
                  statusColor: "bg-blue-500",
                  items: [
                    "Регистрация + лента постов (только текст)",
                    "AI-фильтр мата с предложением синонимов",
                    "Базовая система кармы",
                    "Первые 100 beta-тестеров",
                  ],
                },
                {
                  phase: "Q4 2026",
                  title: "Публичный запуск",
                  status: "Планируется",
                  statusColor: "bg-violet-500",
                  items: [
                    "Тематические клубы (книги, код, шахматы)",
                    "AI-анализатор фотографий",
                    "Система инвайтов",
                    "Мобильная PWA-версия",
                  ],
                },
                {
                  phase: "2027",
                  title: "Рост и масштабирование",
                  status: "Мечта",
                  statusColor: "bg-slate-400",
                  items: [
                    "Международная локализация (EN)",
                    "Мобильные приложения (iOS / Android)",
                    "Партнёрства с издательствами и школами",
                    "Медленные форматы: эссе, дебаты, AMA",
                  ],
                },
              ].map((item, i) => (
                <div
                  key={item.phase}
                  className={`relative grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 ${
                    i % 2 === 0 ? "" : "md:[direction:rtl]"
                  }`}
                >
                  <div className="absolute left-4 md:left-1/2 top-0 w-4 h-4 rounded-full bg-white border-4 border-blue-600 md:-translate-x-1/2 -translate-x-1/2 z-10" />

                  <div
                    className={`${
                      i % 2 === 0 ? "md:text-right" : "md:[direction:ltr]"
                    } md:col-start-1`}
                  >
                    <div className="inline-flex items-center gap-2 mb-2">
                      <span className="text-sm font-bold text-slate-500">
                        {item.phase}
                      </span>
                      <span
                        className={`${item.statusColor} text-white text-xs px-2 py-0.5 rounded-full font-semibold`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">
                      {item.title}
                    </h3>
                  </div>

                  <div className="md:col-start-2 md:[direction:ltr]">
                    <div className="p-6 rounded-2xl bg-white border-2 border-slate-100 shadow-sm">
                      <ul className="space-y-2 m-0 p-0 list-none">
                        {item.items.map((task) => (
                          <li
                            key={task}
                            className="flex items-start gap-2 text-sm text-slate-700"
                          >
                            <span className="text-blue-600 mt-0.5">✓</span>
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 md:py-28 bg-white" aria-label="Частые вопросы">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
              FAQ
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-[-0.03em] mb-4 text-slate-900">
              Частые вопросы
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Когда запуск?",
                a: "Закрытая beta — Q3 2026, публичный запуск — Q4 2026. Подпишитесь на email-лист, чтобы получить инвайт одним из первых.",
              },
              {
                q: "Это бесплатно?",
                a: "Базовый доступ — всегда бесплатный. В будущем возможна подписка за расширенные возможности (создание клубов, AI-аналитика речи и т.д.).",
              },
              {
                q: "Почему только текст на старте?",
                a: "Текст — основа культуры речи. Картинки и видео сложнее модерировать, они часто становятся источником токсичности. Сначала построим сильное текстовое ядро, потом добавим медиа.",
              },
              {
                q: "А если я не программист / не учёный?",
                a: "Не важно, кто ты по профессии. Важно, что ты уважаешь других, любишь думать и хочешь общаться культурно. У нас будут клубы по любым интересам: книги, кино, философия, спорт, путешествия.",
              },
              {
                q: "Как работает AI-фильтр? Это цензура?",
                a: "Нет. AI не банит — он предлагает литературные синонимы вместо мата. Решение всегда за тобой. Мы за осознанность, а не за запреты.",
              },
              {
                q: "Кто модерирует сообщество?",
                a: "На старте — я лично. Позже — команда активных участников-модераторов + AI-помощники. Прозрачные правила, никаких произвольных банов.",
              },
              {
                q: "Мои данные в безопасности?",
                a: "Да. Проект соответствует GDPR (мы в ЕС). Мы не продаём данные, не показываем таргетированную рекламу и никогда не будем. Твоя приватность — приоритет.",
              },
              {
                q: "Как я могу помочь проекту?",
                a: "Оставить email, подписаться на Telegram-канал, рассказать друзьям, поддержать на Boosty, предложить идею или стать амбассадором. Любая помощь ценна!",
              },
            ].map((item, i) => (
              <details
                key={i}
                className="group p-6 rounded-2xl bg-slate-50 border-2 border-slate-100 open:bg-white open:border-blue-200 open:shadow-lg transition-all"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="text-lg font-bold text-slate-900">
                    {item.q}
                  </span>
                  <span className="ml-4 text-2xl text-blue-600 group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-base text-slate-600 leading-relaxed m-0 pt-4 border-t border-slate-200">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center p-16 md:p-20 rounded-3xl bg-gradient-to-br from-blue-600 to-violet-600 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15),transparent_70%)]" />

            <h2 className="text-4xl md:text-6xl font-extrabold tracking-[-0.03em] mb-5 text-white relative">
              Готовы присоединиться?
            </h2>
            <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-10 relative">
              Станьте частью сообщества, где ценят культуру общения и
              интеллектуальное развитие
            </p>

            <div className="flex flex-wrap justify-center gap-4 relative">
              <a
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-blue-600 font-bold shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl text-base"
                href="#early-access"
              >
                Получить ранний доступ
              </a>
              <a
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white/10 text-white border-2 border-white/30 font-semibold transition-all hover:-translate-y-0.5 hover:bg-white/20 backdrop-blur-sm"
                href="https://boosty.to/whiter.net"
                target="_blank"
                rel="noopener noreferrer"
              >
                Поддержать на Boosty
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 bg-slate-900 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap justify-between items-center gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 flex items-center justify-center font-extrabold text-lg text-white">
                W
              </div>
              <div>
                <div className="text-lg font-bold text-white mb-1">
                  White Network
                </div>
                <div className="text-sm text-slate-400">
                  Социальная сеть без токсичности
                </div>
              </div>
            </div>

            <div className="flex gap-6">
              <a
                href="https://t.me/whiter_network"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-300 hover:text-sky-400 transition-colors font-medium"
              >
                Telegram
              </a>
              <a
                href="https://boosty.to/whiter.net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-300 hover:text-orange-400 transition-colors font-medium"
              >
                Boosty
              </a>
            </div>
          </div>

          {/* Юридические ссылки */}
          <div className="flex flex-wrap gap-4 md:gap-6 justify-center py-6 border-t border-slate-800 text-xs text-slate-500">
            <a
              href="/privacy"
              className="hover:text-slate-300 transition-colors"
            >
              Политика конфиденциальности
            </a>
            <a href="/terms" className="hover:text-slate-300 transition-colors">
              Условия использования
            </a>
            <a
              href="/cookies"
              className="hover:text-slate-300 transition-colors"
            >
              Cookies
            </a>
            <span className="hidden md:inline text-slate-700">·</span>
            <span className="text-slate-400">Соответствует GDPR (ЕС)</span>
          </div>

          <div className="pt-6 border-t border-slate-800 text-center text-sm text-slate-500">
            © 2026 White Network. Создано с ❤️ Аланом | maindeline
          </div>
        </div>
      </footer>
    </div>
  );
}
