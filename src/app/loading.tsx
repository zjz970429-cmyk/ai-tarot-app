export default function Loading() {
  // TODO: 之後替換成星空 / 塔羅主題的載入動畫
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-10 w-10 animate-pulse-slow rounded-full border border-gold/40" />
    </div>
  );
}
