import type { SpreadPositionKey } from "@/lib/spreads";

// Supabase 資料表型別定義（對應 supabase/migrations/20260729000000_init_schema.sql、
// 20260729010000_add_chat_messages.sql、20260729020000_add_favorites.sql、
// 20260729030000_add_spreads.sql 與 20260729040000_add_sharing.sql）
//
// 每個 Table 都要有 Relationships 欄位（即使是空陣列）：
// @supabase/postgrest-js 的 GenericTable 型別要求這個欄位存在，缺少它會讓
// SupabaseClient<Database, ...> 的泛型解析失敗，導致 select() / upsert() 等
// 方法在某些呼叫點把 Row / Insert 型別收斂成 never（例如 profile 頁的
// readingRows 變成 never[]、result 頁 upsert({ id: userId }) 被判定為
// 「id 不存在於 never[] 型別」）。這是目前這一整批型別錯誤的根本原因。
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      readings: {
        Row: {
          id: string;
          user_id: string;
          spread_id: string | null;
          question: string | null;
          ai_interpretation: string | null;
          summary: string | null;
          share_id: string;
          is_public: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          spread_id?: string | null;
          question?: string | null;
          ai_interpretation?: string | null;
          summary?: string | null;
          share_id?: string;
          is_public?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          spread_id?: string | null;
          question?: string | null;
          ai_interpretation?: string | null;
          summary?: string | null;
          share_id?: string;
          is_public?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      reading_cards: {
        Row: {
          id: string;
          reading_id: string;
          position: SpreadPositionKey;
          card_id: string;
          card_name: string;
          is_reversed: boolean;
          upright_meaning: string | null;
          reversed_meaning: string | null;
        };
        Insert: {
          id?: string;
          reading_id: string;
          position: SpreadPositionKey;
          card_id: string;
          card_name: string;
          is_reversed?: boolean;
          upright_meaning?: string | null;
          reversed_meaning?: string | null;
        };
        Update: {
          id?: string;
          reading_id?: string;
          position?: SpreadPositionKey;
          card_id?: string;
          card_name?: string;
          is_reversed?: boolean;
          upright_meaning?: string | null;
          reversed_meaning?: string | null;
        };
        Relationships: [];
      };
      chat_messages: {
        Row: {
          id: string;
          reading_id: string;
          role: "user" | "assistant";
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          reading_id: string;
          role: "user" | "assistant";
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          reading_id?: string;
          role?: "user" | "assistant";
          content?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          reading_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          reading_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          reading_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
