-- Step 24：全面啟用並驗證 Supabase RLS
-- 針對 public.users / readings / favorites / chat_messages 啟用 Row Level Security，
-- 並建立對應 Policy。所有應用程式流程（result/history/favorites/chat/share 頁與
-- /api/ai/interpret、/api/ai/chat）皆透過 anon / authenticated 角色（瀏覽器或 cookie-based
-- session 的 Supabase client）存取資料庫，沒有使用 service role 繞過 RLS，
-- 所以這裡的 Policy 就是唯一的存取控管邊界。
--
-- Policy 前皆先 drop if exists，讓這個 migration 可以重複套用（idempotent）。

-- ============================================================
-- public.users
-- 規則：使用者只能 SELECT / UPDATE 自己的資料。
-- ============================================================
alter table public.users enable row level security;

drop policy if exists "users_select_own" on public.users;
create policy "users_select_own" on public.users
  for select
  using (auth.uid() = id);

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own" on public.users
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 未在題目要求內，但為必要的最小補充：
-- 前端在每次寫入占卜前會對 public.users 做 upsert({ id: userId })，
-- 幫首次登入的使用者建立影子紀錄（供 readings.user_id 外鍵使用）。
-- 若沒有 INSERT policy，全新使用者第一次占卜寫入 Supabase 會直接被 RLS 擋下，
-- 違反本次「驗證：收藏與聊天功能正常」的要求，因此加入這條，範圍仍限定本人：
drop policy if exists "users_insert_own" on public.users;
create policy "users_insert_own" on public.users
  for insert
  with check (auth.uid() = id);

-- ============================================================
-- public.readings
-- 規則：
--   - 使用者只能 SELECT 自己的 reading。
--   - 公開分享頁只能 SELECT：is_public = true。
--     （兩條 SELECT policy 皆為 permissive，Postgres 會以 OR 合併：
--      本人可看到自己全部的 reading，任何人都能看到已公開的 reading。）
--   - 使用者只能 INSERT user_id = auth.uid()。
--   - 使用者只能 UPDATE / DELETE 自己的 reading。
-- ============================================================
alter table public.readings enable row level security;

drop policy if exists "readings_select_own" on public.readings;
create policy "readings_select_own" on public.readings
  for select
  using (auth.uid() = user_id);

drop policy if exists "readings_select_public" on public.readings;
create policy "readings_select_public" on public.readings
  for select
  using (is_public = true);

drop policy if exists "readings_insert_own" on public.readings;
create policy "readings_insert_own" on public.readings
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "readings_update_own" on public.readings;
create policy "readings_update_own" on public.readings
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "readings_delete_own" on public.readings;
create policy "readings_delete_own" on public.readings
  for delete
  using (auth.uid() = user_id);

-- ============================================================
-- public.favorites
-- 規則：使用者只能操作（SELECT / INSERT / DELETE）自己的收藏。
-- favorites 沒有 UPDATE 流程（只會新增或刪除），所以不建立 UPDATE policy。
-- ============================================================
alter table public.favorites enable row level security;

drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own" on public.favorites
  for select
  using (auth.uid() = user_id);

drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own" on public.favorites
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_delete_own" on public.favorites
  for delete
  using (auth.uid() = user_id);

-- ============================================================
-- public.chat_messages
-- 規則：使用者只能存取自己 reading 底下的聊天紀錄。
-- chat_messages 沒有 user_id 欄位，歸屬要透過 reading_id → readings.user_id 判斷；
-- 沒有 UPDATE / DELETE 流程，所以只建立 SELECT / INSERT policy。
-- ============================================================
alter table public.chat_messages enable row level security;

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

-- ============================================================
-- 已知範圍外事項（本次刻意不處理，僅記錄）：
--
-- 1. public.reading_cards 這次沒有被要求啟用 RLS，維持現狀（未啟用）。
--    因為 readings 已經是隱私邊界，reading_cards 目前仍對 anon / authenticated
--    角色開放讀寫，等於任何人都能直接查詢任一 reading_id 底下的抽牌內容。
--    如果要完整補齊，需要再對 reading_cards 加上等同 readings 的
--    「擁有者本人或該 reading 已公開」SELECT policy，以及「僅能寫入自己 reading
--    底下卡片」的 INSERT policy；這超出本次題目列出的四張表範圍，故不在此變更。
--
-- 2. src/app/(main)/history/page.tsx 與 favorites/page.tsx 目前查詢 readings 時
--    沒有加上 .eq("user_id", user.id) 過濾條件，過去在沒有 RLS 的情況下會讀到
--    「所有使用者」的 readings（更嚴重的資料外洩）；套用這個 migration 後，
--    改為讀到「自己的 reading」以及「所有人已公開（is_public = true）的
--    reading」的聯集 —— 也就是說已登入使用者的「我的紀錄」頁，理論上有可能混入
--    別人公開分享的占卜。這是 RLS 的 SELECT policy（own OR public）套用到一個
--    沒有明確 user_id 過濾條件的既有查詢後，必然會出現的行為。
--    本次題目要求「不要修改 UI」，所以沒有一併調整這兩個頁面的查詢條件；
--    若要徹底修正，建議另開一個 Step，在這兩個頁面的查詢加上
--    .eq("user_id", user.id)。
-- ============================================================
