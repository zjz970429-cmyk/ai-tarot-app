-- Step 19：牌陣系統
-- 1. readings 新增 spread_id，記錄這次占卜使用的牌陣（single / three-card / love / career）。
-- 2. reading_cards.position 原本只允許 past/present/future，擴充為支援所有內建牌陣的位置 key。

alter table public.readings add column if not exists spread_id text;

alter table public.reading_cards drop constraint if exists reading_cards_position_check;

alter table public.reading_cards add constraint reading_cards_position_check
  check (
    position in (
      'guidance',
      'past', 'present', 'future',
      'self', 'partner', 'relationship', 'obstacle', 'advice',
      'situation', 'strength', 'challenge', 'opportunity', 'nextStep'
    )
  );
