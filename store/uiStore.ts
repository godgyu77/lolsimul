import { create } from "zustand";

export type ViewType = "HOME" | "TEAM" | "MATCH" | "NEWS" | "STATS" | "FA" | "SETTINGS";

interface UIState {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentView: "HOME",
  setCurrentView: (view) => set({ currentView: view }),
}));

