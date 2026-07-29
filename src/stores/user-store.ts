import { create } from "zustand";
import type { User } from "@supabase/supabase-js";

// 使用者登入狀態（由 useAuth 透過 Supabase onAuthStateChange 同步）與 Premium 狀態管理
interface UserState {
  user: User | null;
  isLoading: boolean;
  isPremium: boolean;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: true,
  isPremium: false,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
}));
