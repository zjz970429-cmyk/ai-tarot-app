// 牌陣系統（Step 19）
// 定義內建牌陣：單張牌／三張牌／愛情牌陣／事業牌陣。
// 所有牌陣的 position key 全域唯一，供 Reading／Result／History／Favorites／AI API 共用。

export type SpreadPositionKey =
  | "guidance"
  | "past"
  | "present"
  | "future"
  | "self"
  | "partner"
  | "relationship"
  | "obstacle"
  | "advice"
  | "situation"
  | "strength"
  | "challenge"
  | "opportunity"
  | "nextStep";

export interface SpreadPosition {
  key: SpreadPositionKey;
  label: string;
}

export interface Spread {
  id: string;
  name: string;
  englishName: string;
  cardCount: number;
  positions: SpreadPosition[];
}

export const spreads: Spread[] = [
  {
    id: "single",
    name: "單張牌",
    englishName: "Single Card",
    cardCount: 1,
    positions: [{ key: "guidance", label: "今日建議" }],
  },
  {
    id: "three-card",
    name: "三張牌",
    englishName: "Three Card",
    cardCount: 3,
    positions: [
      { key: "past", label: "過去" },
      { key: "present", label: "現在" },
      { key: "future", label: "未來" },
    ],
  },
  {
    id: "love",
    name: "愛情牌陣",
    englishName: "Love Spread",
    cardCount: 5,
    positions: [
      { key: "self", label: "自己" },
      { key: "partner", label: "對方" },
      { key: "relationship", label: "關係現況" },
      { key: "obstacle", label: "阻礙" },
      { key: "advice", label: "建議" },
    ],
  },
  {
    id: "career",
    name: "事業牌陣",
    englishName: "Career Spread",
    cardCount: 5,
    positions: [
      { key: "situation", label: "現況" },
      { key: "strength", label: "優勢" },
      { key: "challenge", label: "挑戰" },
      { key: "opportunity", label: "機會" },
      { key: "nextStep", label: "下一步" },
    ],
  },
];

export function getSpreadById(id: string): Spread | undefined {
  return spreads.find((spread) => spread.id === id);
}

// 所有牌陣位置 key → 中文顯示名稱，供 Result／History／Favorites／AI API 共用查找。
export const POSITION_LABELS: Record<string, string> = Object.fromEntries(
  spreads.flatMap((spread) => spread.positions.map((p) => [p.key, p.label]))
);

// 所有牌陣位置 key → 排序索引（同一牌陣內的 key 依原本順序遞增），
// 供 History／Favorites／AI 追問聊天在顯示前依牌陣原始順序排序 reading_cards。
// 因為每個 key 在所有牌陣中全域唯一，單一 reading 內的卡片用這份表排序即可還原牌陣順序。
export const POSITION_ORDER: Record<string, number> = Object.fromEntries(
  spreads.flatMap((spread) => spread.positions.map((p, index) => [p.key, index]))
);
