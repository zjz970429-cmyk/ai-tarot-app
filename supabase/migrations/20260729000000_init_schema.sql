-- Step 11：初版資料表 schema
-- 建立 users / readings / reading_cards 三張表，含 Foreign Key 與基本 Index。
-- 尚未串接登入（未連動 auth.users），前端與 API 皆未修改。

create extension if not exists pgcrypto;

-- ============================================================
-- users
-- ============================================================
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

-- ============================================================
-- readings
-- ============================================================
create table if not exists public.readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  question text,
  ai_interpretation text,
  summary text,
  created_at timestamptz not null default now()
);

create index if not exists idx_readings_user_id on public.readings (user_id);
create index if not exists idx_readings_created_at on public.readings (created_at desc);

-- ============================================================
-- reading_cards
-- ============================================================
create table if not exists public.reading_cards (
  id uuid primary key default gen_random_uuid(),
  reading_id uuid not null references public.readings (id) on delete cascade,
  position text not null check (position in ('past', 'present', 'future')),
  card_id text not null,
  card_name text not null,
  is_reversed boolean not null default false,
  upright_meaning text,
  reversed_meaning text
);

create index if not exists idx_reading_cards_reading_id on public.reading_cards (reading_id);
create index if not exists idx_reading_cards_card_id on public.reading_cards (card_id);
create unique index if not exists idx_reading_cards_reading_position
  on public.reading_cards (reading_id, position);
