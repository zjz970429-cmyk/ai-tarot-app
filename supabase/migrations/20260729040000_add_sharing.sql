-- Step 21：公開分享功能
-- readings 新增 share_id / is_public，讓使用者可以把某次占卜設為公開，
-- 並透過 /share/{share_id} 分享唯讀連結。

alter table public.readings
  add column if not exists share_id uuid not null default gen_random_uuid();

alter table public.readings
  add column if not exists is_public boolean not null default false;

create unique index if not exists idx_readings_share_id on public.readings (share_id);
