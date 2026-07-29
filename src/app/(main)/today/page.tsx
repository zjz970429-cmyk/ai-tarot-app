import { tarotDeck } from "@/lib/tarot-data";

// 今日塔羅：從完整 78 張牌（Step 18）隨機抽一張，顯示牌面、正逆位與基本解釋
// 尚未串接 AI，僅使用 tarot-data 內建的正逆位解釋文字。
export default function TodayPage() {
  const card = tarotDeck[Math.floor(Math.random() * tarotDeck.length)];
  const isReversed = Math.random() < 0.5;
  const meaning = isReversed ? card.reversedMeaning : card.uprightMeaning;

  return (
    <main className="flex min-h-screen flex-col items-center bg-background px-6 py-16 sm:px-10">
      <div className="flex w-full max-w-sm flex-col items-center sm:max-w-md">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-white/40">
          今日塔羅
        </p>
        <h1 className="mb-8 text-center text-2xl font-semibold text-white sm:text-3xl">
          今天，你抽到的是
        </h1>

        {/* 牌面 */}
        <div className="mb-6 flex h-64 w-40 items-center justify-center overflow-hidden rounded-2xl border border-gold/30 bg-white/5 sm:h-72 sm:w-44">
          <img
            src={card.image}
            alt={card.name}
            className={`h-full w-full object-cover ${isReversed ? "rotate-180" : ""}`}
          />
        </div>

        {/* 牌名 */}
        <h2 className="mb-1 text-center text-xl font-semibold text-white sm:text-2xl">
          {card.name}
          <span className="ml-2 text-sm font-normal text-white/40">
            {card.englishName}
          </span>
        </h2>

        {/* 正位 / 逆位 */}
        <span
          className={`mb-4 rounded-full border px-3 py-1 text-xs font-medium ${
            isReversed
              ? "border-primary/40 text-primary-light"
              : "border-gold/40 text-gold"
          }`}
        >
          {isReversed ? "逆位" : "正位"}
        </span>

        {/* 關鍵字 */}
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {card.keywords.map((keyword) => (
            <span
              key={keyword}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60"
            >
              {keyword}
            </span>
          ))}
        </div>

        {/* 基本解釋 */}
        <p className="text-center text-sm leading-relaxed text-white/70 sm:text-base">
          {meaning}
        </p>
      </div>
    </main>
  );
}
