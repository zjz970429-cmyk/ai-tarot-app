"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { tarotDeck, type TarotCardData } from "@/lib/tarot-data";
import { spreads, type Spread } from "@/lib/spreads";
import { useReadingStore } from "@/stores/reading-store";

// 開始占卜（Step 19：加入牌陣系統）
// 流程：選擇牌陣 → 輸入問題（可留空）→ 顯示一副牌 → 開始洗牌
// → 依牌陣張數從完整 78 張牌（Step 18）隨機抽出不重複的牌 → 查看解牌
// （牌陣＋問題＋結果存進 reading-store，導向 /result）
// 尚未串接 AI / Supabase，無動畫，UI 風格與原本一致。
interface DrawnCard {
  card: TarotCardData;
  reversed: boolean;
}

function drawCards(count: number): DrawnCard[] {
  const shuffled = [...tarotDeck].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((card) => ({
    card,
    reversed: Math.random() < 0.5,
  }));
}

export default function ReadingPage() {
  const [selectedSpread, setSelectedSpread] = useState<Spread | null>(null);
  const [question, setQuestion] = useState("");
  const [drawnCards, setDrawnCards] = useState<DrawnCard[] | null>(null);
  const setReading = useReadingStore((state) => state.setReading);
  const router = useRouter();

  const handleSelectSpread = (spread: Spread) => {
    setSelectedSpread(spread);
    setDrawnCards(null);
  };

  const handleShuffle = () => {
    if (!selectedSpread) return;
    setDrawnCards(drawCards(selectedSpread.cardCount));
  };

  const handleViewResult = () => {
    if (!selectedSpread || !drawnCards) return;
    setReading(
      selectedSpread.id,
      question.trim(),
      drawnCards.map((item, index) => ({
        position: selectedSpread.positions[index].key,
        card: item.card,
        reversed: item.reversed,
      }))
    );
    router.push("/result");
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-background px-6 py-16 sm:px-10">
      <div className="flex w-full max-w-sm flex-col items-center sm:max-w-md">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-white/40">
          開始占卜
        </p>
        <h1 className="mb-6 text-center text-2xl font-semibold text-white sm:text-3xl">
          靜下心，準備抽取你的塔羅牌
        </h1>

        {/* Step 1：選擇牌陣 */}
        <div className="mb-8 w-full">
          <p className="mb-3 text-xs font-medium text-white/50">選擇牌陣</p>
          <div className="flex flex-col gap-3">
            {spreads.map((spread) => (
              <button
                key={spread.id}
                type="button"
                onClick={() => handleSelectSpread(spread)}
                className={`rounded-2xl border p-4 text-left ${
                  selectedSpread?.id === spread.id
                    ? "border-primary/50 bg-primary/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <p className="text-sm font-medium text-white">
                  {spread.name}
                </p>
                <p className="mt-1 text-xs text-white/45">
                  {spread.cardCount} 張牌・
                  {spread.positions.map((p) => p.label).join(" / ")}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* 占卜問題（可留空） */}
        <div className="mb-8 w-full">
          <label
            htmlFor="reading-question"
            className="mb-2 block text-xs font-medium text-white/50"
          >
            你的問題（可留空）
          </label>
          <textarea
            id="reading-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="例如：我這段感情會如何發展？"
            rows={3}
            className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white placeholder:text-white/30 focus:border-primary/40 focus:outline-none"
          />
        </div>

        {/* 一副塔羅牌（牌背堆疊，靜態呈現） */}
        <div className="relative mb-10 h-48 w-32 sm:h-56 sm:w-36">
          <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-2xl border border-gold/20 bg-primary/30" />
          <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-2xl border border-gold/25 bg-primary/50" />
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl border border-gold/40 bg-primary">
            <span className="text-3xl text-white/70">✦</span>
          </div>
        </div>

        {!drawnCards && (
          <button
            onClick={handleShuffle}
            disabled={!selectedSpread}
            className="w-full max-w-xs rounded-2xl border border-primary/30 bg-primary px-6 py-4 text-center text-lg font-semibold text-white disabled:opacity-40"
          >
            開始洗牌
          </button>
        )}

        {drawnCards && selectedSpread && (
          <div className="flex w-full flex-col gap-3">
            {drawnCards.map(({ card, reversed }, index) => (
              <div
                key={card.id}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div>
                  <p className="text-xs text-white/40">
                    {selectedSpread.positions[index].label}
                  </p>
                  <p className="text-base font-medium text-white">
                    {card.name}
                  </p>
                </div>
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
            ))}

            <button
              onClick={handleViewResult}
              className="mt-4 w-full max-w-xs self-center rounded-2xl border border-primary/30 bg-primary px-6 py-4 text-center text-base font-semibold text-white"
            >
              查看解牌
            </button>

            <button
              onClick={handleShuffle}
              className="w-full max-w-xs self-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-center text-sm font-medium text-white/70"
            >
              重新洗牌
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
