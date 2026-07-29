-- Step 24（第二版，更完整的規格）：全面啟用並驗證 Supabase Row Level Security
-- 這是一個新的 migration，取代/補齊上一版（20260729050000_enable_rls.sql）的 Policy：
--   - users：這次規格一樣只要求 SELECT / UPDATE，沿用上版額外補的 INSERT policy
--     （沒有它，首次登入時對 public.users 的 upsert 會被 RLS 擋下，整個占卜寫入流程
--     就會壞掉，等於無法通過本次「收藏 / History / Profile 正常」的驗證要求）。
--   - readings：SELECT / INSERT / UPDATE / DELETE，與上版相同。
--   - favorites：這次新增了 UPDATE policy（上版只有 SELECT / INSERT / DELETE，
--     因為當時應用程式沒有「修改收藏」的操作；這次規格明確列出 UPDATE，所以補上）。
--   - chat_messages：這次新增了 UPDATE / DELETE policy（上版只有 SELECT / INSERT，
--     因為應用程式目前沒有編輯或刪除單則訊息的功能；這次規格明確列出，所以補上，
--     判斷方式與 SELECT / INSERT 一致：該訊息所屬 reading 的 user_id = auth.uid()）。
--
-- 所有應用程式流程都是透過 anon / authenticated 角色（瀏覽器或 cookie-based session 的
-- Supabase client）存取資料庫，沒有使用 service_role 繞過 RLS，因此這裡的 Policy
-- 就是唯一的存取控管邊界。Policy 皆先 drop if exists 再 create，可重複套用。

-- ============================================================
-- 一、啟用 RLS（若上一版已啟用，這裡重複執行是安全的 no-op）
-- ============================================================
alter table public.users enable row level security;
alter table public.readings enable row level security;
alter table public.favorites enable row level security;
alter table public.chat_messages enable row level security;

-- ============================================================
-- 二、Policies
-- ============================================================

-- ---------- public.users ----------
-- SELECT：只有 auth.uid() = id 可以讀自己的資料。
drop policy if exists "users_select_own" on public.users;
create policy "users_select_own" on public.users
  for select
  using (auth.uid() = id);

-- UPDATE：只有 auth.uid() = id 可以修改自己的資料。
drop policy if exists "users_update_own" on public.users;
create policy "users_update_own" on public.users
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- INSERT：規格沒有列出，但前端在每次寫入占卜前都會對 public.users 做
-- upsert({ id: userId })，幫首次登入的使用者建立影子紀錄（供 readings.user_id
-- 外鍵使用）。沒有這條，全新使用者第一次占卜就會在寫入 Supabase 時被 RLS 擋下。
drop policy if exists "users_insert_own" on public.users;
create policy "users_insert_own" on public.users
  for insert
  with check (auth.uid() = id);

-- ---------- public.readings ----------
-- SELECT：允許 (1) auth.uid() = user_id（自己的占卜）或 (2) is_public = true
-- （公開分享）。兩條都是 permissive policy，Postgres 會以 OR 合併。
drop policy if exists "readings_select_own" on public.readings;
create policy "readings_select_own" on public.readings
  for select
  using (auth.uid() = user_id);

drop policy if exists "readings_select_public" on public.readings;
create policy "readings_select_public" on public.readings
  for select
  using (is_public = true);

-- INSERT：只允許 user_id = auth.uid()。
drop policy if exists "readings_insert_own" on public.readings;
create policy "readings_insert_own" on public.readings
  for insert
  with check (user_id = auth.uid());

-- UPDATE：只允許 auth.uid() = user_id。
drop policy if exists "readings_update_own" on public.readings;
create policy "readings_update_own" on public.readings
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- DELETE：只允許 auth.uid() = user_id。
drop policy if exists "readings_delete_own" on public.readings;
create policy "readings_delete_own" on public.readings
  for delete
  using (auth.uid() = user_id);

-- ---------- public.favorites ----------
-- SELECT：只能讀自己的收藏。
drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own" on public.favorites
  for select
  using (auth.uid() = user_id);

-- INSERT：只能新增 user_id = auth.uid() 的收藏。
drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own" on public.favorites
  for insert
  with check (user_id = auth.uid());

-- UPDATE：只能修改自己的收藏。
drop policy if exists "favorites_update_own" on public.favorites;
create policy "favorites_update_own" on public.favorites
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- DELETE：只能刪自己的收藏。
drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_delete_own" on public.favorites
  for delete
  using (auth.uid() = user_id);

-- ---------- public.chat_messages ----------
-- chat_messages 沒有 user_id 欄位，歸屬要透過 reading_id → readings.user_id 判斷。

-- SELECT：該 message 所屬 reading.user_id = auth.uid() 才能看到。
drop policy if exists "chat_messages_select_own" on public.chat_messages;
create policy "chat_messages_select_own" on public.chat_messages
  for select
  using (
    exists (
      select 1
      from public.readings r
      where r.id = chat_messages.reading_id
        and r.user_id = auth.uid()
    )
  );

-- INSERT：只能新增到自己的 reading。
drop policy if exists "chat_messages_insert_own" on public.chat_messages;
create policy "chat_messages_insert_own" on public.chat_messages
  for insert
  with check (
    exists (
      select 1
      from public.readings r
      where r.id = chat_messages.reading_id
        and r.user_id = auth.uid()
    )
  );

-- UPDATE：只能修改自己的 message（透過所屬 reading 判斷擁有者）。
drop policy if exists "chat_messages_update_own" on public.chat_messages;
create policy "chat_messages_update_own" on public.chat_messages
  for update
  using (
    exists (
      select 1
      from public.readings r
      where r.id = chat_messages.reading_id
        and r.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.readings r
      where r.id = chat_messages.reading_id
        and r.user_id = auth.uid()
    )
  );

-- DELETE：只能刪自己的 message（透過所屬 reading 判斷擁有者）。
drop policy if exists "chat_messages_delete_own" on public.chat_messages;
create policy "chat_messages_delete_own" on public.chat_messages
  for delete
  using (
    exists (
      select 1
      from public.readings r
      where r.id = chat_messages.reading_id
        and r.user_id = auth.uid()
    )
  );

-- ============================================================
-- 已知範圍外事項（本次刻意不處理，僅記錄）：
-- public.reading_cards 這次規格一樣沒有列在四張表之內，維持未啟用 RLS 的現狀。
-- readings 的隱私邊界因此沒有完全延伸到底下的抽牌內容，任何人仍可直接查詢
-- 任一 reading_id 的 reading_cards。若要補齊，需要額外幫 reading_cards 加上
-- 「擁有者本人或該 reading 已公開」的 SELECT policy，以及「僅能寫入自己 reading
-- 底下卡片」的 INSERT policy；這超出本次題目列出的四張表範圍，故不在此變更。
-- ============================================================
