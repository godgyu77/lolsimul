import { create } from "zustand";

export type ViewType = "HOME" | "TEAM" | "MATCH" | "NEWS" | "STATS" | "FA" | "SETTINGS";

interface UIState {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  // 경기 전 준비 단계
  showTournamentBriefing: boolean;
  setShowTournamentBriefing: (show: boolean) => void;
  showPreMatchModal: boolean;
  setShowPreMatchModal: (show: boolean) => void;
  pendingMatchId: string | null; // 프리뷰 대기 중인 경기 ID
  setPendingMatchId: (matchId: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentView: "HOME",
  setCurrentView: (view) => set({ currentView: view }),
  isMobileMenuOpen: false,
  setIsMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  showTournamentBriefing: false,
  setShowTournamentBriefing: (show) => set({ showTournamentBriefing: show }),
  showPreMatchModal: false,
  setShowPreMatchModal: (show) => set({ showPreMatchModal: show }),
  pendingMatchId: null,
  setPendingMatchId: (matchId) => set({ pendingMatchId: matchId }),
}));

