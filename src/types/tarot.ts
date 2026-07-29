// 塔羅相關型別定義
export type Arcana = "major" | "minor";

export type Orientation = "upright" | "reversed";

export interface TarotCard {
  id: string;
  name: string;
  nameEn: string;
  arcana: Arcana;
  suit?: "wands" | "cups" | "swords" | "pentacles";
  imageUrl: string;
  uprightMeaning: string;
  reversedMeaning: string;
}

export interface DrawnCard {
  card: TarotCard;
  orientation: Orientation;
  position?: string;
}

// AI 解牌結構化結果
export interface TarotInterpretation {
  overall: string;
  love: string;
  career: string;
  wealth: string;
  todayReminder: string;
  luckyColor: string;
  luckyNumber: number;
  suggestedActions: string[];
  thingsToAvoid: string[];
}

export interface TarotReading {
  id: string;
  userId: string;
  question: string;
  cards: DrawnCard[];
  interpretation: TarotInterpretation;
  createdAt: string;
}
