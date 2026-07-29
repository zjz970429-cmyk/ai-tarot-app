import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// 共用資料查詢（從 page.tsx 抽出）：
// Next.js App Router 對 page.tsx 的具名匯出有嚴格限制（只能是 generateMetadata、
// generateStaticParams、dynamic 等固定欄位），多出一個 getSharedReading 具名匯出
// 會被判定為「不是有效的頁面匯出欄位」而建置失敗。
// 因此把這份查詢邏輯移到獨立檔案，page.tsx 與 opengraph-image.tsx 都改成從這裡 import，
// 邏輯與行為完全不變（仍用 React cache() 讓同一次請求共用同一筆查詢結果）。
export interface ReadingCardRow {
  position: string;
  card_id: string;
  card_name: string;
  is_reversed: boolean;
  upright_meaning: string | null;
  reversed_meaning: string | null;
}

export interface SharedReading {
  question: string | null;
  ai_interpretation: string | null;
  spread_id: string | null;
  is_public: boolean;
  created_at: string;
  reading_cards: ReadingCardRow[];
}

export const getSharedReading = cache(
  async (shareId: string): Promise<SharedReading | null> => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("readings")
      .select(
        "question, ai_interpretation, spread_id, is_public, created_at, reading_cards(position, card_id, card_name, is_reversed, upright_meaning, reversed_meaning)"
      )
      .eq("share_id", shareId)
      .single();

    if (error || !data || !data.is_public) {
      return null;
    }

    return data as unknown as SharedReading;
  }
);
