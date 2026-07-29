-- Step 15：AI 追問聊天紀錄
-- 讓使用者可以針對某一次占卜（readings）持續追問，AI 回覆時保留原始占卜上下文。

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  reading_id uuid not null references public.readings (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_chat_messages_reading_id on public.chat_messages (reading_id);
create index if not exists idx_chat_messages_reading_id_created_at
  on public.chat_messages (reading_id, created_at);
