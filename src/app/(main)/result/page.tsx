"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useReadingStore, type ReadingCardResult } from "@/stores/reading-store";
import { useHistoryStore } from "@/stores/history-store";
import { useUserStore } from "@/stores/user-store";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { addFavorite, removeFavorite } from "@/lib/supabase/favorites";
import { getSpreadById, POSITION_LABELS } from "@/lib/spreads";

// 占卜結果頁：顯示使用者問題（若有）＋過去／現在／未來三張牌與基本解釋
// 若 store 內沒有抽牌資料，自動導回 /reading。
// AI 解牌（呼叫 /api/ai/interpret，Step 8 已加入），含 Loading / 錯誤狀態。
// 每次 AI 解牌成功後：
//   1. 自動把本次占卜加入 history-store（Step 10，UI 不變）
//   2. 若已登入（Step 14 Supabase Auth）：新增 1 筆 readings + 3 筆 reading_cards，綁定 user_id
//      未登入時只留在本地（history-store），不同步到雲端。
//      寫入失敗不影響 AI 解牌顯示，只在 console 顯示錯誤。
// 資料來自 reading-store（Zustand，記憶體內狀態），不使用 localStorage。
// 不含聊天功能，無動畫，未修改 AI API。
const SUMMARY_MAX_LENGTH = 60;

function makeSummary(text: string) {
  const trimmed = text.trim();
  return trimmed.length > SUMMARY_MAX_LENGTH
    ? `${trimmed.slice(0, SUMMARY_MAX_LENGTH)}…`
    : trimmed;
}

// 已登入時才會呼叫：用登入者的 user.id 綁定這筆占卜。
// public.users 是獨立於 auth.users 的資料表，先 upsert 一筆同 id 的影子紀錄供外鍵使用。
async function saveReadingToSupabase(
  userId: string,
  spreadId: string,
  question: string,
  cards: ReadingCardResult[],
  interpretation: string,
  summary: string
): Promise<{ id: string; shareId: string | null } | null> {
  try {
    const supabase = createClient();

    // upsert() 在目前 npm 解析到的 @supabase/supabase-js 版本下，型別推斷會把
    // 第一個參數收斂成 never[]（即使 Database 型別本身已經補齊
    // CompositeTypes / Relationships），是 postgrest-js 這個方法本身泛型解析
    // 較脆弱的已知問題，不是我們 schema 定義錯誤。這裡只在呼叫這一行做最小範圍
    // 的型別跳脫，不影響檔案其他地方（insert / select / update）原本正常的型別檢查。
    const { error: userError } = await (
      supabase.from("users") as unknown as {
        upsert: (
          values: { id: string; created_at?: string },
          options?: { onConflict?: string }
        ) => Promise<{ error: { message: string } | null }>;
      }
    ).upsert({ id: userId }, { onConflict: "id" });

    if (userError) {
      throw userError;
    }

    const { data: readingRow, error: readingError } = await supabase
      .from("readings")
      .insert({
        user_id: userId,
        spread_id: spreadId,
        question,
        ai_interpretation: interpretation,
        summary,
      })
      .select("id, share_id")
      .single();

    if (readingError || !readingRow) {
      throw readingError ?? new Error("無法建立占卜紀錄");
    }

    const { error: cardsError } = await supabase.from("reading_cards").insert(
      cards.map(({ position, card, reversed }) => ({
        reading_id: readingRow.id,
        position,
        card_id: card.id,
        card_name: card.name,
        is_reversed: reversed,
        upright_meaning: card.uprightMeaning,
        reversed_meaning: card.reversedMeaning,
      }))
    );

    if (cardsError) {
      throw cardsError;
    }

    return { id: readingRow.id, shareId: readingRow.share_id ?? null };
  } catch (error) {
    console.error("寫入 Supabase 失敗：", error);
    return null;
  }
}

type AiStatus = "idle" | "loading" | "success" | "error";

export default function ResultPage() {
  const router = useRouter();
  const spreadId = useReadingStore((state) => state.spreadId);
  const question = useReadingStore((state) => state.question);
  const cards = useReadingStore((state) => state.cards);
  const addHistoryEntry = useHistoryStore((state) => state.addEntry);
  const spread = getSpreadById(spreadId);

  // 啟動 Supabase Auth 監聽（登入後自動取得 user，同步進 user-store）
  useAuth();
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    if (cards.length === 0) {
      router.replace("/reading");
    }
  }, [cards, router]);

  const [aiStatus, setAiStatus] = useState<AiStatus>("idle");
  const [aiText, setAiText] = useState("");
  const [aiError, setAiError] = useState("");
  const [savedReadingId, setSavedReadingId] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<
    "idle" | "sharing" | "copied" | "error"
  >("idle");
  const [shareError, setShareError] = useState("");

  const handleAiInterpret = async () => {
    setAiStatus("loading");
    setAiError("");

    try {
      const response = await fetch("/api/ai/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          cards: cards.map(({ position, card, reversed }) => ({
            position,
            name: card.name,
            englishName: card.englishName,
            reversed,
            meaning: reversed ? card.reversedMeaning : card.uprightMeaning,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("你在短時間內的 AI 解牌次數已達上限，請稍後再試。");
        }
        throw new Error(data?.error || "AI 解牌失敗，請稍後再試");
      }

      const interpretation = data.interpretation as string;
      setAiText(interpretation);
      setAiStatus("success");

      addHistoryEntry({
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        question,
        cards: cards.map(({ position, card, reversed }) => ({
          position,
          name: card.name,
          englishName: card.englishName,
          reversed,
          meaning: reversed ? card.reversedMeaning : card.uprightMeaning,
        })),
        interpretation,
        summary: makeSummary(interpretation),
      });

      // 已登入才同步到 Supabase；未登入僅保留在本地 history-store，不上傳雲端。
      // 內部已自行 try/catch 並在失敗時輸出 console 錯誤，不影響 AI 解牌顯示。
      if (user) {
        const saved = await saveReadingToSupabase(
          user.id,
          spreadId,
          question,
          cards,
          interpretation,
          makeSummary(interpretation)
        );
        if (saved) {
          setSavedReadingId(saved.id);
          setShareId(saved.shareId);
        }
      }
    } catch (error) {
      setAiError(
        error instanceof Error ? error.message : "AI 解牌失敗，請稍後再試"
      );
      setAiStatus("error");
    }
  };

  const handleToggleFavorite = async () => {
    if (!user || !savedReadingId || isTogglingFavorite) return;

    const next = !isFavorited;
    setIsTogglingFavorite(true);
    setIsFavorited(next);

    try {
      const supabase = createClient();
      if (next) {
        await addFavorite(supabase, user.id, savedReadingId);
      } else {
        await removeFavorite(supabase, user.id, savedReadingId);
      }
    } catch (error) {
      console.error("更新收藏狀態失敗：", error);
      setIsFavorited(!next);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  // 分享占卜：第一次點擊時將 is_public 設為 true，若 share_id 尚未產生則一併補上，
  // 之後把 /share/{share_id} 的完整連結複製到剪貼簿。
  const handleShare = async () => {
    if (!savedReadingId || shareStatus === "sharing") return;

    setShareStatus("sharing");
    setShareError("");

    try {
      const supabase = createClient();
      const nextShareId = shareId ?? crypto.randomUUID();

      const { error } = await supabase
        .from("readings")
        .update({ is_public: true, share_id: nextShareId })
        .eq("id", savedReadingId);

      if (error) throw error;

      setShareId(nextShareId);

      const shareUrl = `${window.location.origin}/share/${nextShareId}`;
      await navigator.clipboard.writeText(shareUrl);
      setShareStatus("copied");
    } catch (error) {
      console.error("分享占卜失敗：", error);
      setShareError("分享失敗，請稍後再試");
      setShareStatus("error");
    }
  };

  if (cards.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16 text-center">
        <p className="text-white/40">尚未有占卜結果，正在返回占卜頁面…</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-background px-6 py-16 sm:px-10">
      <div className="flex w-full max-w-sm flex-col items-center sm:max-w-md">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-white/40">
          占卜結果
        </p>
        <h1 className="mb-6 text-center text-2xl font-semibold text-white sm:text-3xl">
          {spread
            ? spread.positions.map((p) => p.label).join("・")
            : "占卜結果"}
        </h1>

        {/* 使用者問題（可能為空） */}
        {question.trim() !== "" && (
          <div className="mb-8 w-full rounded-2xl border border-gold/25 bg-gold/10 p-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-[0.3em] text-gold">
              你的問題
            </p>
            <p className="text-sm text-white/80">「{question}」</p>
          </div>
        )}

        {/* 三張牌 + 基本解釋（tarot-data） */}
        <div className="flex w-full flex-col gap-6">
          {cards.map(({ position, card, reversed }) => (
            <div
              key={position}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-gold">
                {POSITION_LABELS[position] ?? position}
              </p>

              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  {card.name}
                  <span className="ml-2 text-sm font-normal text-white/40">
                    {card.englishName}
                  </span>
                </h2>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${
                    reversed
                      ? "border-primary/40 text-primary-light"
                      : "border-gold/40 text-gold"
                  }`}
                >
                  {reversed ? "逆位" : "正位"}
                </span>
              </div>

              <p className="text-sm leading-relaxed text-white/70">
                {reversed ? card.reversedMeaning : card.uprightMeaning}
              </p>
            </div>
          ))}
        </div>

        {/* AI 解牌 */}
        <div className="mt-8 w-full">
          {aiStatus !== "success" && (
            <button
              onClick={handleAiInterpret}
              disabled={aiStatus === "loading"}
              className="w-full rounded-2xl border border-gold/30 bg-gold/10 px-6 py-4 text-center text-base font-semibold text-gold disabled:opacity-50"
            >
              {aiStatus === "loading" ? "AI 解讀中…" : "AI 解牌"}
            </button>
          )}

          {aiStatus === "error" && (
            <p className="mt-3 text-center text-sm text-red-400">{aiError}</p>
          )}

          {aiStatus === "success" && (
            <div className="rounded-2xl border border-gold/25 bg-gold/10 p-5">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-[0.3em] text-gold">
                  AI 塔羅解讀
                </p>
                {user && savedReadingId && (
                  <button
                    type="button"
                    onClick={handleToggleFavorite}
                    aria-label={isFavorited ? "取消收藏" : "收藏"}
                    className={`text-lg leading-none ${
                      isFavorited ? "text-gold" : "text-white/30"
                    }`}
                  >
                    {isFavorited ? "★" : "☆"}
                  </button>
                )}
              </div>
              <p className="whitespace-pre-line text-sm leading-relaxed text-white/80">
                {aiText}
              </p>
            </div>
          )}

          {aiStatus === "success" && user && savedReadingId && (
            <>
              <button
                type="button"
                onClick={handleShare}
                disabled={shareStatus === "sharing"}
                className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-center text-sm font-medium text-white/70 disabled:opacity-50"
              >
                {shareStatus === "copied"
                  ? "連結已複製！"
                  : shareStatus === "sharing"
                    ? "分享中…"
                    : "分享占卜"}
              </button>
              {shareStatus === "error" && (
                <p className="mt-2 text-center text-sm text-red-400">
                  {shareError}
                </p>
              )}
            </>
          )}
        </div>

        <Link
          href="/reading"
          className="mt-10 w-full max-w-xs rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-center text-sm font-medium text-white/70"
        >
          重新占卜
        </Link>
      </div>
    </main>
  );
}
