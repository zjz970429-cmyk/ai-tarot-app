import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// 於每個請求刷新 Supabase session
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

// Step 27：middleware 效能優化
// updateSession() 每次都會呼叫 supabase.auth.getUser()，對 Supabase Auth 伺服器
// 發一次網路請求。/share/** 底下的頁面（含 /share/[shareId]/opengraph-image）
// 完全公開、不依賴登入狀態渲染（RLS 的 is_public = true 規則跟 auth.uid() 無關），
// 卻恰好是最容易被外部大量匿名流量（社群分享、爬蟲抓 OG 圖）打到的路徑，
// 排除它可以省掉這些請求不必要的 Auth 往返延遲。其餘頁面（含 /reading、/result、
// /history 等需要知道登入狀態的頁面）維持不變，仍會刷新 session。
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|share|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
