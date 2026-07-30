import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

// 伺服器端 Supabase client（用於 Server Components / Route Handlers）
//
// 同 lib/supabase/client.ts：不再傳入 <Database> 泛型，原因是新版
// @supabase/supabase-js 對 Insert/Update 的泛型解析在 insert()/upsert() 上
// 不穩定，會讓 build 卡在型別檢查而非真的邏輯錯誤。執行期行為不變。
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Server Component 呼叫 set 時可忽略（由 middleware 處理 session 刷新）
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // 同上
          }
        },
      },
    }
  );
}
