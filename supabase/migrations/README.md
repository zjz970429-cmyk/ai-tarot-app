# Migrations

## 20260729000000_init_schema.sql

初版資料表 schema（Step 11）：

- `users`：`id (uuid, pk)`、`created_at`
- `readings`：`id (uuid, pk)`、`user_id → users.id`、`question`、`ai_interpretation`、`summary`、`created_at`
- `reading_cards`：`id (uuid, pk)`、`reading_id → readings.id`、`position (past/present/future)`、`card_id`、`card_name`、`is_reversed`、`upright_meaning`、`reversed_meaning`

含 Foreign Key（`user_id`、`reading_id`，皆 `on delete cascade`）與基本 Index
（`readings.user_id`、`readings.created_at`、`reading_cards.reading_id`、`reading_cards.card_id`，
以及 `reading_cards (reading_id, position)` 唯一索引，確保同一次占卜每個位置只會有一張牌）。

Step 11 當時尚未串接登入，Step 14 已加入 Supabase Auth（`readings.user_id` 綁定登入者的
`auth.users.id`，並在寫入前於 `public.users` upsert 一筆同 id 的影子紀錄供外鍵使用）。

還沒有 RLS 政策、subscriptions 等後續資料表。

## 20260729010000_add_chat_messages.sql

Step 15：AI 追問聊天紀錄。

- `chat_messages`：`id (uuid, pk)`、`reading_id → readings.id (on delete cascade)`、
  `role (user/assistant)`、`content`、`created_at`

Index：`chat_messages.reading_id`、`chat_messages (reading_id, created_at)`（依時間排序聊天紀錄用）。

套用方式：`supabase db push` 或 `supabase migration up`（需先 `supabase link` 到專案）。
