// 主功能區共用 Layout（含底部導覽列 / Header）
// TODO: 加入 <Header /> 與 <BottomNav />，此檔案目前僅為架構佔位。
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
