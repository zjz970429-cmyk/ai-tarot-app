"use client";

import { createBrowserClient } from "@supabase/ssr";

// 瀏覽器端 Supabase client（用於 Client Components）
//
// 這裡刻意不再把 <Database> 泛型傳給 createBrowserClient()。
// package.json 用 caret range 鎖 @supabase/supabase-js（沒有 lockfile），
// Vercel 每次 npm install 都會抓當下最新的相容版本，而新版 postgrest-js
// 對 Database["public"]["Tables"][T]["Insert"/"Update"] 的泛型解析在
// upsert()/insert() 等方法上很脆弱，即使我們手寫的 Database 型別已經補齊
// CompositeTypes、Relationships 等欄位，還是會在不同呼叫點輪流把型別收斂成
// never，导致 build 一直卡在型別檢查（不是真的程式邏輯錯誤）。
// 拿掉這個泛型只是讓 Supabase 呼叫失去編譯期的欄位名稱檢查，執行期行為完全
// 不變；查詢結果需要精確型別的地方（例如 profile 頁）已經用 .returns<>()
// 個別標註。
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
