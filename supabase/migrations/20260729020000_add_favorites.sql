-- Step 17：收藏功能
-- 讓使用者可以收藏某次占卜（readings），user_id + reading_id 不可重複。

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  reading_id uuid not null references public.readings (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, reading_id)
);

create index if not exists idx_favorites_user_id on public.favorites (user_id);
create index if not exists idx_favorites_reading_id on public.favorites (reading_id);
