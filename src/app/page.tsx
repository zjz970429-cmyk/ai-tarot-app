import Link from "next/link";

// 首頁（Step 3：完善首頁）
// 全部內容直接寫在本檔案：無額外元件、無動畫，純 Tailwind + RWD。
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16 sm:px-10 md:px-16">
      <div className="flex w-full max-w-sm flex-col items-center sm:max-w-md md:max-w-lg">
        {/* App Logo */}
        <div className="mb-6 flex flex-col items-center gap-2 sm:mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 bg-white/5 sm:h-16 sm:w-16">
            <span className="text-xl sm:text-2xl">✦</span>
          </div>
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-white/50 sm:text-sm">
            Mystic AI Tarot
          </span>
        </div>

        {/* 主標題 */}
        <h1 className="mb-4 text-center text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl">
          探索命運，聆聽塔羅的指引
        </h1>

        {/* 簡短介紹 */}
        <p className="mb-10 max-w-xs text-center text-sm text-white/70 sm:max-w-sm sm:text-base md:max-w-md">
          透過 AI 塔羅為你解讀愛情、事業與財運，讓每一次占卜都成為一場深刻的自我對話。
        </p>

        {/* 開始占卜按鈕 */}
        <Link
          href="/reading"
          className="mb-10 w-full max-w-xs rounded-2xl border border-primary/30 bg-primary px-6 py-4 text-center text-lg font-semibold text-white sm:max-w-sm md:w-auto md:px-10"
        >
          開始占卜
        </Link>

        {/* 其他功能區 */}
        <div className="grid w-full grid-cols-2 gap-4">
          <Link
            href="/today"
            className="rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <p className="text-sm font-medium text-white sm:text-base">
              今日塔羅
            </p>
            <p className="mt-1 text-xs text-white/45">查看今天專屬於你的一張牌</p>
          </Link>

          <Link
            href="/history"
            className="rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <p className="text-sm font-medium text-white sm:text-base">
              我的紀錄
            </p>
            <p className="mt-1 text-xs text-white/45">過往占卜歷史</p>
          </Link>

          <Link
            href="/ai-teacher"
            className="rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <p className="text-sm font-medium text-white sm:text-base">
              AI 塔羅老師
            </p>
            <p className="mt-1 text-xs text-white/45">與 AI 深入對話</p>
          </Link>

          <Link
            href="/premium"
            className="rounded-2xl border border-gold/25 bg-gold/10 p-4"
          >
            <p className="text-sm font-medium text-gold sm:text-base">
              升級 Premium
            </p>
            <p className="mt-1 text-xs text-white/45">解鎖無限占卜與專屬牌陣解讀</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
