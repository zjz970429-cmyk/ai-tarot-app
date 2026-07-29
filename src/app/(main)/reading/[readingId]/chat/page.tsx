"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { POSITION_LABELS, POSITION_ORDER } from "@/lib/spreads";

// AI 追問聊天（Step 15；Step 19：支援任意牌陣）
// 針對某次占卜（readingId）持續提問，AI 會保留原始問題／牌陣抽出的牌／正逆位／第一次解讀作為上下文（在 /api/ai/chat 組成）。
// 聊天紀錄存進 chat_messages，重新整理頁面時會重新從 Supabase 讀取，所以仍看得到歷史訊息。
// 不修改 /api/ai/interpret。
// Step 24：加入擁有者檢查。readings 的 SELECT RLS policy 是「自己的 OR is_public=true」，
// 單靠查得到這筆 reading 不代表目前訪客就是本人——任何人都能靠已公開分享的連結
// 直接打開這個聊天頁。這裡多比對 reading.user_id 是否等於目前登入者，不是就當成
// 「not-found」（沿用既有畫面與文案，不新增分支）。
type ChatRole = "user" | "assistant";

interface ChatMessage {
  id?: string;
  role: ChatRole;
  content: string;
}

interface ReadingCardRow {
  position: string;
  card_name: string;
  is_reversed: boolean;
}

interface ReadingSummary {
  id: string;
  user_id: string;
  question: string | null;
  reading_cards: ReadingCardRow[];
}

type LoadStatus = "loading" | "success" | "error" | "not-found";

export default function ReadingChatPage() {
  const params = useParams<{ readingId: string }>();
  const readingId = params.readingId;

  const [loadStatus, setLoadStatus] = useState<LoadStatus>("loading");
  const [reading, setReading] = useState<ReadingSummary | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        const { data: readingData, error: readingError } = await supabase
          .from("readings")
          .select(
            "id, user_id, question, reading_cards(position, card_name, is_reversed)"
          )
          .eq("id", readingId)
          .single();

        if (readingError || !readingData) {
          if (isMounted) setLoadStatus("not-found");
          return;
        }

        const typedReadingForAuthCheck = readingData as unknown as ReadingSummary;
        if (!user || typedReadingForAuthCheck.user_id !== user.id) {
          if (isMounted) setLoadStatus("not-found");
          return;
        }

        const { data: messageData, error: messageError } = await supabase
          .from("chat_messages")
          .select("id, role, content, created_at")
          .eq("reading_id", readingId)
          .order("created_at", { ascending: true });

        if (messageError) throw messageError;

        if (isMounted) {
          const typedReading = readingData as unknown as ReadingSummary;
          setReading({
            ...typedReading,
            reading_cards: [...typedReading.reading_cards].sort(
              (a, b) =>
                (POSITION_ORDER[a.position] ?? 0) - (POSITION_ORDER[b.position] ?? 0)
            ),
          });
          setMessages(
            ((messageData ?? []) as unknown as ChatMessage[]).map((m) => ({
              id: m.id,
              role: m.role,
              content: m.content,
            }))
          );
          setLoadStatus("success");
        }
      } catch (error) {
        console.error("載入占卜聊天失敗：", error);
        if (isMounted) setLoadStatus("error");
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [readingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || isSending) return;

    setIsSending(true);
    setSendError("");
    setMessages((prev) => [...prev, { role: "user", content }]);
    setInput("");

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ readingId, message: content }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("你在短時間內的追問次數已達上限，請稍後再試。");
        }
        throw new Error(data?.error || "AI 回覆失敗，請稍後再試");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply as string },
      ]);
    } catch (error) {
      setSendError(
        error instanceof Error ? error.message : "AI 回覆失敗，請稍後再試"
      );
    } finally {
      setIsSending(false);
    }
  };

  if (loadStatus === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-white/40">載入中…</p>
      </main>
    );
  }

  if (loadStatus === "not-found") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="text-white/50">
          找不到這次占卜紀錄，可能尚未登入同步，或連結有誤。
        </p>
        <Link
          href="/history"
          className="rounded-2xl border border-primary/30 bg-primary px-6 py-3 text-sm font-semibold text-white"
        >
          回到我的紀錄
        </Link>
      </main>
    );
  }

  if (loadStatus === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
        <p className="text-red-400">載入失敗，請稍後再試。</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col px-6 py-10 sm:max-w-md">
        <p className="mb-1 text-xs font-medium uppercase tracking-[0.3em] text-white/40">
          AI 追問
        </p>
        <h1 className="mb-2 text-xl font-semibold text-white sm:text-2xl">
          針對這次占卜繼續提問
        </h1>

        {reading?.question && (
          <p className="mb-4 text-sm text-white/50">
            原始問題：「{reading.question}」
          </p>
        )}

        <div className="mb-6 flex flex-wrap gap-2">
          {reading?.reading_cards.map((card) => (
            <span
              key={card.position}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60"
            >
              {POSITION_LABELS[card.position] ?? card.position}：
              {card.card_name}（{card.is_reversed ? "逆位" : "正位"}）
            </span>
          ))}
        </div>

        <div className="mb-4 flex flex-1 flex-col gap-3 overflow-y-auto">
          {messages.length === 0 && (
            <p className="text-sm text-white/40">
              還沒有追問，試著問問「可以更詳細說感情嗎？」
            </p>
          )}
          {messages.map((m, index) => (
            <div
              key={m.id ?? index}
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "user"
                  ? "self-end border border-primary/30 bg-primary text-white"
                  : "self-start border border-gold/25 bg-gold/10 text-white/85"
              }`}
            >
              {m.content}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {sendError && (
          <p className="mb-2 text-center text-sm text-red-400">{sendError}</p>
        )}

        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="輸入你想追問的問題…"
            rows={2}
            className="flex-1 resize-none rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white placeholder:text-white/30 focus:border-primary/40 focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={isSending || input.trim() === ""}
            className="rounded-2xl border border-primary/30 bg-primary px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isSending ? "傳送中…" : "傳送"}
          </button>
        </div>
      </div>
    </main>
  );
}
