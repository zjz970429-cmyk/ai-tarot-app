import { create } from "zustand";
import type { TarotCardData } from "@/lib/tarot-data";
import type { SpreadPositionKey } from "@/lib/spreads";

// 占卜流程狀態管理：保存本次選擇的牌陣、問題與抽牌結果（Step 19：支援多種牌陣）
// 使用 Zustand（記憶體內狀態），不使用 localStorage。
export type ReadingPosition = SpreadPositionKey;

export interface ReadingCardResult {
  position: ReadingPosition;
  card: TarotCardData;
  reversed: boolean;
}

interface ReadingState {
  spreadId: string;
  question: string;
  cards: ReadingCardResult[];
  setReading: (
    spreadId: string,
    question: string,
    cards: ReadingCardResult[]
  ) => void;
  clearReading: () => void;
}

export const useReadingStore = create<ReadingState>((set) => ({
  spreadId: "",
  question: "",
  cards: [],
  setReading: (spreadId, question, cards) =>
    set({ spreadId, question, cards }),
  clearReading: () => set({ spreadId: "", question: "", cards: [] }),
}));
