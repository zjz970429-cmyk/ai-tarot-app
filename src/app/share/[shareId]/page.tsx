import type { Metadata } from "next";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getSpreadById, POSITION_LABELS, POSITION_ORDER } from "@/lib/spreads";
import { siteConfig } from "@/config/site";

// 公開分享頁（Step 21 建立；Step 22 補上 SEO 與分享預覽 metadata）
// 依 share_id 查詢 readings，若 is_public = true 則顯示唯讀的占卜內容：
// 問題／牌陣／每張牌／AI 解牌／建立日期。
// 不顯示 Email／user_id／收藏資訊／聊天紀錄（查詢時就不 select 這些欄位）。
// 若查無資料或 is_public = false，顯示「此占卜尚未公開」。
// 伺服器元件（Server Component），供動態 metadata 與 /opengraph-image 共用同一份查詢。
interface ReadingCardRow {
  position: string;
  card_id: string;
  card_name: string;
  is_reversed: boolean;
  upright_meaning: string | null;
  reversed_meaning: string | null;
}

interface SharedReading {
  question: string | null;
  ai_interpretation: string | null;
  spread_id: string | null;
  is_public: boolean;
  created_at: string;
  reading_cards: ReadingCardRow[];
}

// 用 React cache() 包起來，同一次請求內 generateMetadata() 與頁面本身共用同一筆查詢結果。
export const getSharedReading = cache(
  async (shareId: string): Promise<SharedReading | null> => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("readings")
      .select(
        "question, ai_interpretation, spread_id, is_public, created_at, reading_cards(position, card_id, card_name, is_reversed, upright_meaning, reversed_meaning)"
      )
      .eq("share_id", shareId)
      .single();

    if (error || !data || !data.is_public) {
      return null;
    }

    return data as unknown as SharedReading;
  }
);

export async function generateMetadata({
  params,
}: {
  params: { shareId: string };
}): Promise<Metadata> {
  const reading = await getSharedReading(params.shareId);
  const url = `${siteConfig.url}/share/${params.shareId}`;

  if (!reading) {
    return {
      title: "此占卜尚未公開 | AI Tarot",
      description: "這個分享連結尚未公開，或連結有誤。",
      alternates: { canonical: url },
      robots: { index: false, follow: false },
    };
  }

  const spread = reading.spread_id ? getSpreadById(reading.spread_id) : undefined;
  const question = reading.question?.trim();
  const spreadName = spread?.name ?? "塔羅牌陣";

  const title = question
    ? `${question} | AI Tarot Reading`
    : `AI Tarot Reading | ${spreadName}`;
  const description = question
    ? `查看這次 AI 塔羅占卜：「${question}」（${spreadName}）。`
    : `查看這次 AI 塔羅占卜（${spreadName}）。`;
  const keywords = [
    "AI 塔羅",
    "塔羅占卜",
    "Tarot",
    "AI Tarot",
    "Mystic AI Tarot",
    spreadName,
  ];

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function formatDate(iso: string) {
  const date = new Date(iso);
  return date.toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function NotPublic() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center">
      <p className="text-white/50">此占卜尚未公開</p>
    </main>
  );
}

export default async function SharePage({
  params,
}: {
  params: { shareId: string };
}) {
  const reading = await getSharedReading(params.shareId);

  if (!reading) {
    return <NotPublic />;
  }

  const spread = reading.spread_id ? getSpreadById(reading.spread_id) : undefined;
  const sortedCards = [...reading.reading_cards].sort(
    (a, b) => (POSITION_ORDER[a.position] ?? 0) - (POSITION_ORDER[b.position] ?? 0)
  );

  return (
    <main className="flex min-h-screen flex-col items-center bg-background px-6 py-16 sm:px-10">
      <div className="flex w-full max-w-sm flex-col items-center sm:max-w-md">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-white/40">
          分享的占卜
        </p>
        <h1 className="mb-2 text-center text-2xl font-semibold text-white sm:text-3xl">
          {spread ? spread.positions.map((p) => p.label).join("・") : "占卜結果"}
        </h1>
        <p className="mb-6 text-xs text-white/40">
          {formatDate(reading.created_at)}
        </p>

        {reading.question && reading.question.trim() !== "" && (
          <div className="mb-8 w-full rounded-2xl border border-gold/25 bg-gold/10 p-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-[0.3em] text-gold">
              問題
            </p>
            <p className="text-sm text-white/80">「{reading.question}」</p>
          </div>
        )}

        <div className="flex w-full flex-col gap-6">
          {sortedCards.map((card) => (
            <div
              key={card.position}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-gold">
                {POSITION_LABELS[card.position] ?? card.position}
              </p>

              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  {card.card_name}
                </h2>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${
                    card.is_reversed
                      ? "border-primary/40 text-primary-light"
                      : "border-gold/40 text-gold"
                  }`}
                >
                  {card.is_reversed ? "逆位" : "正位"}
                </span>
              </div>

              <p className="text-sm leading-relaxed text-white/70">
                {card.is_reversed ? card.reversed_meaning : card.upright_meaning}
              </p>
            </div>
          ))}
        </div>

        {reading.ai_interpretation && (
          <div className="mt-8 w-full rounded-2xl border border-gold/25 bg-gold/10 p-5">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-gold">
              AI 塔羅解讀
            </p>
            <p className="whitespace-pre-line text-sm leading-relaxed text-white/80">
              {reading.ai_interpretation}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
