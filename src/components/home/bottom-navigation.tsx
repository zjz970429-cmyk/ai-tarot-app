import ActionCard from "./action-card";

// 首頁下方區塊：我的紀錄／AI 塔羅老師／Premium
export default function BottomNavigation() {
  return (
    <>
      <div className="mb-4 grid grid-cols-2 gap-4">
        <ActionCard
          href="/history"
          title="我的紀錄"
          subtitle="過往占卜歷史"
          className="rounded-2xl border border-white/10 bg-white/5 p-4"
          titleClassName="text-sm font-medium text-white"
          subtitleClassName="mt-1 text-xs text-white/45"
        />
        <ActionCard
          href="/ai-teacher"
          title="AI 塔羅老師"
          subtitle="與 AI 深入對話"
          className="rounded-2xl border border-white/10 bg-white/5 p-4"
          titleClassName="text-sm font-medium text-white"
          subtitleClassName="mt-1 text-xs text-white/45"
        />
      </div>

      <ActionCard
        href="/premium"
        title="升級 Premium"
        subtitle="解鎖無限占卜與專屬牌陣解讀"
        className="flex items-center justify-between rounded-2xl border border-gold/25 bg-gold/10 p-4"
        titleClassName="text-[15px] font-medium text-gold"
        subtitleClassName="text-xs text-white/45"
        arrow="›"
        arrowClassName="text-gold/60"
      />
    </>
  );
}
