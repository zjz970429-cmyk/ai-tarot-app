-- Step 26：補齊 reading_cards 的 RLS
-- Step 24 兩版都把 RLS 只開在 users / readings / favorites / chat_messages 四張表，
-- reading_cards 一直維持未啟用狀態：任何人都能直接查詢任一 reading_id 底下的抽牌內容，
-- readings 的隱私邊界沒有完全延伸到底下的卡片資料。這裡補上等同 readings 的規則：
--   - SELECT：該卡片所屬 reading 是自己的，或者該 reading 已公開分享（is_public = true）。
--   - INSERT：只能新增到自己的 reading 底下。
-- 沒有 UPDATE / DELETE policy：應用程式從來不會修改或刪除已寫入的 reading_cards，
-- 維持預設拒絕即可。

alter table public.reading_cards enable row level security;

drop policy if exists "reading_cards_select_own_or_public" on public.reading_cards;
create policy "reading_cards_select_own_or_public" on public.reading_cards
  for select
  using (
    exists (
      select 1
      from public.readings r
      where r.id = reading_cards.reading_id
        and (r.user_id = auth.uid() or r.is_public = true)
    )
  );

drop policy if exists "reading_cards_insert_own" on public.reading_cards;
create policy "reading_cards_insert_own" on public.reading_cards
  for insert
  with check (
    exists (
      select 1
      from public.readings r
      where r.id = reading_cards.reading_id
        and r.user_id = auth.uid()
    )
  );
