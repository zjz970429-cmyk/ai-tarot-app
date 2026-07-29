"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { removeFavorite } from "@/lib/supabase/favorites";
import { tarotDeck } from "@/lib/tarot-data";
import { POSITION_LABELS, POSITION_ORDER } from "@/lib/spreads";

// 我的收藏（Step 17；Step 19：支援任意牌陣）
// 顯示所有已收藏的占卜，資料來自 Supabase favorites join readings。
// UI 風格與「我的紀錄」頁一致，點卡片展開查看完整內容，星星點擊可取消收藏並從列表移除。
interface ReadingCardRow {
  position: string;
  card_id: string;
  card_name: string;
  is_reversed: boolean;
  upright_meaning: string | null;
  reversed_meaning: string | null;
}

interface FavoriteReadingRow {
  reading_id: string;
  readings: {
    id: string;
    question: string | null;
    ai_interpretation: string | null;
    summary: string | null;
    created_at: string;
    reading_cards: ReadingCardRow[];
  } | null;
}

const ENGLISH_NAME_BY_ID: Record<string, string> = Object.fromEntries(
  tarotDeck.map((card) => [card.id, card.englishName])
);

function formatDateTime(iso: string) {
  const date = new Date(iso);
  return date.toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Status = "loading" | "success" | "error";

export default function FavoritesPage() {
  const { user, isLoading: isAuthLoading } = useAuth();

  const [status, setStatus] = useState<Status>("loading");
  const [entries, setEntries] = useState<FavoriteReadingRow["readings"][]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      setStatus("success");
      setEntries([]);
      return;
    }

    let isMounted = true;

    async function fetchFavorites() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("favorites")
          .select(
            "reading_id, readings(id, question, ai_interpretation, summary, created_at, reading_cards(position, card_id, card_name, is_reversed, upright_meaning, reversed_meaning))"
          )
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const rows = (data ?? []) as unknown as FavoriteReadingRow[];
        const readings = rows
          .map((row) => row.readings)
          .filter((r): r is NonNullable<typeof r> => r !== null)
          .map((r) => ({
            ...r,
            reading_cards: [...r.reading_cards].sort(
              (a, b) =>
                (POSITION_ORDER[a.position] ?? 0) - (POSITION_ORDER[b.position] ?? 0)
            ),
          }));

        if (isMounted) {
          setEntries(readings);
          setStatus("success");
        }
      } catch (err) {
        console.error("讀取收藏失敗：", err);
        if (isMounted) {
          setErrorMessage(
            err instanceof Error ? err.message : "讀取收藏失敗，請稍後再試"
          );
          setStatus("error");
        }
      }
    }

    fetchFavorites();

    return () => {
      isMounted = false;
    };
  }, [user, isAuthLoading]);

  const handleRemoveFavorite = async (
    e: React.MouseEvent,
    readingId: string
  ) => {
    e.stopPropagation();
    if (!user || removingId) return;

    setRemovingId(readingId);
    try {
      const supabase = createClient();
      await removeFavorite(supabase, user.id, readingId);
      setEntries((prev) => prev.filter((entry) => entry?.id !== readingId));
    } catch (err) {
      console.error("取消收藏失敗：", err);
    } finally {
      setRemovingId(null);
    }
  };

  if (isAuthLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-white/40">載入中…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="text-white/50">登入後即可查看你收藏的占卜。</p>
        <Link
          href="/login"
          className="rounded-2xl border border-primary/30 bg-primary px-6 py-3 text-sm font-semibold text-white"
        >
          前往登入
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-background px-6 py-16 sm:px-10">
      <div className="flex w-full max-w-sm flex-col items-center sm:max-w-md">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-white/40">
          我的收藏
        </p>
        <h1 className="mb-8 text-center text-2xl font-semibold text-white sm:text-3xl">
          收藏的占卜
        </h1>

        {status === "loading" && (
          <p className="text-sm text-white/40">載入中…</p>
        )}

        {status === "error" && (
          <div className="flex w-full flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-sm text-red-400">{errorMessage}</p>
          </div>
        )}

        {status === "success" && entries.length === 0 && (
          <div className="flex w-full flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-sm text-white/50">
              還沒有收藏任何占卜，去「我的紀錄」點 ☆ 收藏喜歡的解讀吧。
            </p>
            <Link
              href="/history"
              className="rounded-2xl border border-primary/30 bg-primary px-6 py-3 text-sm font-semibold text-white"
            >
              前往我的紀錄
            </Link>
          </div>
        )}

        {status === "success" && entries.length > 0 && (
          <div className="flex w-full flex-col gap-4">
            {entries.map((entry) => {
              if (!entry) return null;
              const isExpanded = expandedId === entry.id;
              const question = entry.question ?? "";

              return (
                <div
                  key={entry.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setExpandedId(isExpanded ? null : entry.id);
                    }
                  }}
                  className="w-full cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-4 text-left"
                >
                  <div className="mb-1 flex items-start justify-between">
                    <p className="text-xs text-white/40">
                      {formatDateTime(entry.created_at)}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveFavorite(e, entry.id)}
                      aria-label="取消收藏"
                      className="text-lg leading-none text-gold"
                    >
                      ★
                    </button>
                  </div>
                  <p className="mb-3 text-sm font-medium text-white">
                    {question.trim() !== ""
                      ? `「${question}」`
                      : "（未輸入問題）"}
                  </p>

                  <div className="mb-3 flex flex-wrap gap-2">
                    {entry.reading_cards.map((card) => (
                      <span
                        key={card.position}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60"
                      >
                        {POSITION_LABELS[card.position] ?? card.position}：
                        {card.card_name}（{card.is_reversed ? "逆位" : "正位"}）
                      </span>
                    ))}
                  </div>

                  <p className="text-xs leading-relaxed text-white/50">
                    {isExpanded
                      ? entry.ai_interpretation ?? "（無 AI 解讀內容）"
                      : entry.summary ?? "（無摘要）"}
                  </p>

                  {isExpanded && (
                    <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4">
                      {entry.reading_cards.map((card) => (
                        <div key={card.position}>
                          <p className="text-xs font-medium uppercase tracking-[0.3em] text-gold">
                            {POSITION_LABELS[card.position] ?? card.position}
                          </p>
                          <p className="text-sm font-medium text-white">
                            {card.card_name}
                            <span className="ml-2 text-xs font-normal text-white/40">
                              {ENGLISH_NAME_BY_ID[card.card_id] ?? ""}
                            </span>
                            <span className="ml-2 text-xs text-white/40">
                              {card.is_reversed ? "逆位" : "正位"}
                            </span>
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-white/60">
                            {card.is_reversed
                              ? card.reversed_meaning
                              : card.upright_meaning}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="mt-3 text-xs font-medium text-primary-light">
                    {isExpanded ? "收合" : "點擊查看完整內容"}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
