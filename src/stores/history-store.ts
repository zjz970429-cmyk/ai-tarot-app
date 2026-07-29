import { create } from "zustand";
import type { ReadingPosition } from "@/stores/reading-store";

// 占卜歷史紀錄狀態管理（本地版本）
// 使用 Zustand（記憶體內狀態），不使用 Supabase / localStorage。
export interface HistoryEntryCard {
  position: ReadingPosition;
  name: string;
  englishName: string;
  reversed: boolean;
  meaning: string;
}

export interface HistoryEntry {
  id: string;
  createdAt: string;
  question: string;
  cards: HistoryEntryCard[];
  interpretation: string;
  summary: string;
}

interface HistoryState {
  entries: HistoryEntry[];
  addEntry: (entry: HistoryEntry) => void;
  clearEntries: () => void;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  entries: [],
  addEntry: (entry) =>
    set((state) => ({ entries: [entry, ...state.entries] })),
  clearEntries: () => set({ entries: [] }),
}));
