import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// 收藏功能共用的 Supabase 操作（Step 17）
// 給 History / Result / Favorites 頁共用，避免重複寫查詢邏輯。
type Client = SupabaseClient<Database>;

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
