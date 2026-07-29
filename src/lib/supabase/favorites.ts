import type { createClient } from "./client";

// 收藏功能共用的 Supabase 操作（Step 17）
// 給 History / Result / Favorites 頁共用，避免重複寫查詢邏輯。
// Client 型別直接取自瀏覽器端 createClient() 的回傳型別（而不是自己重新組
// SupabaseClient<Database>），避免 @supabase/ssr 與 @supabase/supabase-js
// 之間的泛型參數解析差異，導致 build 時出現
// 「Type '{...}' is not assignable to type '"public"'」這類型別不匹配錯誤。
type Client = ReturnType<typeof createClient>;

export async function fetchFavoritedReadingIds(
  supabase: Client,
  userId: string,
  readingIds: string[]
): Promise<Set<string>> {
  if (readingIds.length === 0) return new Set();

  const { data, error } = await supabase
    .from("favorites")
    .select("reading_id")
    .eq("user_id", userId)
    .in("reading_id", readingIds);

  if (error) {
    console.error("讀取收藏狀態失敗：", error);
    return new Set();
  }

  return new Set((data ?? []).map((row) => row.reading_id));
}

export async function addFavorite(
  supabase: Client,
  userId: string,
  readingId: string
) {
  const { error } = await supabase
    .from("favorites")
    .insert({ user_id: userId, reading_id: readingId });

  if (error) throw error;
}

export async function removeFavorite(
  supabase: Client,
  userId: string,
  readingId: string
) {
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("reading_id", readingId);

  if (error) throw error;
}
