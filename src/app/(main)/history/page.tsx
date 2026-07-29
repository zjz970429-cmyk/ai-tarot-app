"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import {
  addFavorite,
  fetchFavoritedReadingIds,
  removeFavorite,
} from "@/lib/supabase/favorites";
import { tarotDeck } from "@/lib/tarot-data";
import { POSITION_LABELS, POSITION_ORDER } from "@/lib/spreads";

// 我的紀錄（Step 13：改用 Supabase；Step 17：加入收藏 ⭐；Step 19：支援任意牌陣）
// 從 Supabase 的 readings + reading_cards 讀取資料，依 created_at 新到舊排序。
// UI 與互動（點卡片展開查看完整內容）維持原本樣式，無動畫。
// Step 24：查詢加上 .eq("user_id", user.id)。啟用 RLS 後 readings 的 SELECT policy
// 是「自己的 reading」OR「is_public = true」，如果查詢沒有明確過濾 user_id，
// 已登入使用者會連同「別人已公開分享」的占卜一起撈回來，混進「我的紀錄」；
// 加上這個過濾條件後只會撈自己的（渲染出來的畫面／文案完全不變，只是資料來源修正）。
interface ReadingCardRow {
  position: string;
  card_id: string;
  card_name: string;
  is_reversed: boolean;
  upright_meaning: string | null;
  reversed_meaning: string | null;
}

interface ReadingRow {
  id: string;
  question: string | null;
  ai_interpretation: string | null;
  summary: string | null;
  created_at: string;
  reading_cards: ReadingCardRow[];
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

export default function HistoryPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState<Status>("loading");
  const [entries, setEntries] = useState<ReadingRow[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchHistory() {
      // 未登入沒有自己的占卜可看；直接視為空清單，不打 Supabase
      // （沿用既有的空清單畫面，不新增任何文案或分支）。
      if (!user) {
        if (isMounted) {
          setEntries([]);
          setStatus("success");
        }
        return;
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("readings")
          .select(
            "id, question, ai_interpretation, summary, created_at, reading_cards(position, card_id, card_name, is_reversed, upright_meaning, reversed_meaning)"
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const rows = ((data ?? []) as unknown as ReadingRow[]).map((row) => ({
          ...row,
          reading_cards: [...row.reading_cards].sort(
            (a, b) =>
              (POSITION_ORDER[a.position] ?? 0) - (POSITION_ORDER[b.position] ?? 0)
          ),
        }));

        if (isMounted) {
          setEntries(rows);
          setStatus("success");
        }

        if (user && rows.length > 0) {
          const favorited = await fetchFavoritedReadingIds(
            supabase,
            user.id,
            rows.map((row) => row.id)
          );
          if (isMounted) setFavoritedIds(favorited);
        }
      } catch (err) {
        console.error("讀取占卜紀錄失敗：", err);
        if (isMounted) {
          setErrorMessage(
            err instanceof Error ? err.message : "讀取占卜紀錄失敗，請稍後再試"
          );
          setStatus("error");
        }
      }
    }

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleToggleFavorite = async (
    e: React.MouseEvent,
    readingId: string
  ) => {
    e.stopPropagation();
    if (!user || togglingId) return;

    const isFavorited = favoritedIds.has(readingId);
    setTogglingId(readingId);

    setFavoritedIds((prev) => {
      const next = new Set(prev);
      if (isFavorited) next.delete(readingId);
      else next.add(readingId);
      return next;
    });

    try {
      const supabase = createClient();
      if (isFavorited) {
        await removeFavorite(supabase, user.id, readingId);
      } else {
        await addFavorite(supabase, user.id, readingId);
      }
    } catch (err) {
      console.error("更新收藏狀態失敗：", err);
      setFavoritedIds((prev) => {
        const next = new Set(prev);
        if (isFavorited) next.add(readingId);
        else next.delete(readingId);
        return next;
      });
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-background px-6 py-16 sm:px-10">
      <div className="flex w-full max-w-sm flex-col items-center sm:max-w-md">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-white/40">
          我的紀錄
        </p>
        <h1 className="mb-8 text-center text-2xl font-semibold text-white sm:text-3xl">
          過往占卜紀錄
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
              目前還沒有任何占卜紀錄，完成一次 AI 解牌後會自動顯示在這裡。
            </p>
            <Link
              href="/reading"
              className="rounded-2xl border border-primary/30 bg-primary px-6 py-3 text-sm font-semibold text-white"
            >
              前往開始占卜
            </Link>
          </div>
        )}

        {status === "success" && entries.length > 0 && (
          <div className="flex w-full flex-col gap-4">
            {entries.map((entry) => {
              const isExpanded = expandedId === entry.id;
              const question = entry.question ?? "";
              const isFavorited = favoritedIds.has(entry.id);

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
                    {user && (
                      <button
                        type="button"
                        onClick={(e) => handleToggleFavorite(e, entry.id)}
                        aria-label={isFavorited ? "取消收藏" : "收藏"}
                        className={`text-lg leading-none ${
                          isFavorited ? "text-gold" : "text-white/30"
                        }`}
                      >
                        {isFavorited ? "★" : "☆"}
                      </button>
                    )}
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
