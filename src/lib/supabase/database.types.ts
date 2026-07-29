import type { SpreadPositionKey } from "@/lib/spreads";

// Supabase 資料表型別定義（對應 supabase/migrations/20260729000000_init_schema.sql、
// 20260729010000_add_chat_messages.sql、20260729020000_add_favorites.sql、
// 20260729030000_add_spreads.sql 與 20260729040000_add_sharing.sql）
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
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
