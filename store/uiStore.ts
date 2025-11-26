import { create } from "zustand";

export type ViewType = "HOME" | "TEAM" | "MATCH" | "NEWS" | "STATS" | "FA" | "SETTINGS";

interface UIState {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentView: "HOME",
  setCurrentView: (view) => set({ currentView: view }),
  isMobileMenuOpen: false,
  setIsMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  isChatOpen: false,
  setIsChatOpen: (open) => set({ isChatOpen: open }),
}));

