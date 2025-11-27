"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import HeaderStatus from "@/components/HeaderStatus";
import GameChatInterface from "@/components/GameChatInterface";
import { useGameStore } from "@/store/gameStore";
import { useUIStore } from "@/store/uiStore";
import DashboardView from "@/components/views/DashboardView";
import TeamManagementView from "@/components/views/TeamManagementView";
import MatchScheduleView from "@/components/views/MatchScheduleView";
import NewsArchiveView from "@/components/views/NewsArchiveView";
import StatisticsView from "@/components/views/StatisticsView";
import FAMarketView from "@/components/views/FAMarketView";
import SettingsView from "@/components/views/SettingsView";
import { Menu, MessageSquare, X, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import TournamentBriefingModal from "@/components/TournamentBriefingModal";
import SimulationPhaseIndicator from "@/components/SimulationPhaseIndicator";
import SimulationChoiceModal from "@/components/SimulationChoiceModal";
import LoadingProgressBar from "@/components/LoadingProgressBar";

// 채팅창 사이드바 컨테이너 (확장 기능 포함)
function ChatSidebarContainer() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Normal State: 기존 너비 유지 */}
      {!isExpanded && (
        <div className="flex flex-col w-[450px] flex-none h-full overflow-hidden border-l border-border">
          <GameChatInterface 
            isExpanded={isExpanded} 
            onToggleExpand={() => setIsExpanded(!isExpanded)} 
          />
        </div>
      )}
      
      {/* Expanded State: 오버레이로 전체 화면 덮기 */}
      {isExpanded && (
        <div className="absolute right-0 top-0 h-full w-[90%] z-50 bg-card border-l border-border shadow-2xl transition-all duration-300 ease-in-out">
          <GameChatInterface 
            isExpanded={isExpanded} 
            onToggleExpand={() => setIsExpanded(!isExpanded)} 
          />
        </div>
      )}
    </>
  );
}

// 모달 컴포넌트를 동적 임포트 (SSR 비활성화)
const ApiKeyModal = dynamic(() => import("@/components/ApiKeyModal"), {
  ssr: false,
});

const GameModeSelectionModal = dynamic(() => import("@/components/GameModeSelectionModal"), {
  ssr: false,
});

const CharacterCreationModal = dynamic(() => import("@/components/CharacterCreationModal"), {
  ssr: false,
});

const TeamSelectionModal = dynamic(() => import("@/components/TeamSelectionModal"), {
  ssr: false,
});

export default function Home() {
  const { currentTeamId, apiKey, gameMode, userPlayer, isLoading, currentDate, getCurrentSeasonEvent } = useGameStore();
  const { currentView, isMobileMenuOpen, setIsMobileMenuOpen, setShowTournamentBriefing } = useUIStore();
  const [isInfoDrawerOpen, setIsInfoDrawerOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "dashboard">("chat");
  const lastEventRef = useRef<string | null>(null);

  // 클라이언트에서만 마운트 상태 확인
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 대회 시작 시 브리핑 모달 표시
  useEffect(() => {
    if (!isMounted || !currentTeamId) return;

    const currentEvent = getCurrentSeasonEvent();
    const shouldShowBriefing = 
      currentEvent === "kespa" || 
      currentEvent === "lck_cup" || 
      currentEvent === "msi" || 
      currentEvent === "worlds";

    // 이벤트가 변경되었고, 브리핑이 필요한 대회인 경우
    if (shouldShowBriefing && lastEventRef.current !== currentEvent) {
      lastEventRef.current = currentEvent;
      // 약간의 딜레이 후 모달 표시 (UI 렌더링 완료 후)
      setTimeout(() => {
        setShowTournamentBriefing(true);
      }, 500);
    }
  }, [currentDate, isMounted, currentTeamId, getCurrentSeasonEvent, setShowTournamentBriefing]);

  // 마운트 후에만 조건부 렌더링 결정
  // 단계 1: API 키 입력
  const showApiKeyModal = isMounted && !apiKey;
  // 단계 2: 게임 모드 선택 (API 키 있음 && gameMode 없음)
  const showGameModeSelection = isMounted && apiKey && gameMode === null;
  // 단계 3: 캐릭터 생성 (선수 모드일 때만, userPlayer 없음)
  const showCharacterCreation = isMounted && apiKey && gameMode === "PLAYER" && !userPlayer;
  // 단계 4: 팀 선택 (API 키 있음 && gameMode 있음 && (감독 모드이거나 선수 모드에서 캐릭터 생성 완료) && currentTeamId 없음)
  const showTeamSelection = isMounted && apiKey && gameMode !== null && (gameMode === "MANAGER" || (gameMode === "PLAYER" && userPlayer !== null)) && !currentTeamId;
  // 단계 5: 게임 화면 (API 키 있음 && gameMode 있음 && currentTeamId 있음)
  const showGame = isMounted && apiKey && gameMode !== null && currentTeamId;

  // 현재 뷰에 따라 컴포넌트 렌더링
  const renderView = () => {
    switch (currentView) {
      case "HOME":
        return <DashboardView />;
      case "TEAM":
        return <TeamManagementView />;
      case "MATCH":
        return <MatchScheduleView />;
      case "NEWS":
        return <NewsArchiveView />;
      case "STATS":
        return <StatisticsView />;
      case "FA":
        return <FAMarketView />;
      case "SETTINGS":
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <>
      {/* 1단계: API 키 입력 */}
      <ApiKeyModal />
      
      {/* 2단계: 게임 모드 선택 */}
      {!showApiKeyModal && <GameModeSelectionModal />}
      
      {/* 3단계: 캐릭터 생성 (선수 모드) */}
      {!showApiKeyModal && !showGameModeSelection && <CharacterCreationModal />}
      
      {/* 4단계: 팀 선택 */}
      {!showApiKeyModal && !showGameModeSelection && !showCharacterCreation && <TeamSelectionModal />}

      {/* 대회 브리핑 모달 */}
      <TournamentBriefingModal />
      
      {/* 게임 액션 모달 (선택지 모달) */}
      
      {/* 3단계: 게임 화면 */}
      {showGame && (
        <div className="flex flex-1 h-full overflow-hidden relative">
          {/* 로딩 진행 바 */}
          <LoadingProgressBar isLoading={isLoading} />
          
          {/* 시뮬레이션 페이즈 인디케이터 */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 w-full max-w-4xl px-4">
            <SimulationPhaseIndicator />
          </div>

          {/* 모바일 헤더 (햄버거 메뉴) */}
          <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent">
              LCK Manager
            </h1>
            <div className="w-10" /> {/* 공간 맞춤용 */}
          </div>

          {/* PC 레이아웃: 좌측(대시보드) + 우측(채팅) */}
          <div className="hidden lg:flex flex-1 h-full overflow-hidden min-w-0 relative">
            {/* 좌측 대시보드 - flex-1로 남은 공간 차지 */}
            <div className="flex flex-col flex-1 h-full overflow-hidden min-w-0">
              {/* 상단 상태 바 */}
              <HeaderStatus />

              {/* 대시보드 콘텐츠 - 스크롤 가능 (가로/세로 모두) */}
              <div className="flex-1 overflow-y-auto overflow-x-auto min-h-0">
                {/* 최소 너비를 가진 내부 컨테이너 */}
                <div className="min-w-[800px] w-full">
                  {renderView()}
                </div>
              </div>

            </div>

            {/* 우측 채팅창 - 확장 가능 (absolute 포지셔닝을 위한 relative 부모) */}
            <ChatSidebarContainer />
          </div>

          {/* 모바일 레이아웃: 탭 전환 방식 */}
          <div className="lg:hidden flex flex-col flex-1 h-full overflow-hidden pt-14 pb-16">
            {/* 채팅 탭 */}
            {activeTab === "chat" && (
              <div className="flex flex-col flex-1 h-full overflow-hidden">
                <GameChatInterface />
              </div>
            )}

            {/* 대시보드 탭 */}
            {activeTab === "dashboard" && (
              <div className="flex flex-col flex-1 h-full overflow-hidden">
                {/* 상단 상태 바 */}
                <HeaderStatus />

                {/* 대시보드 콘텐츠 - 스크롤 가능 */}
                <div className="flex-1 overflow-y-auto overflow-x-auto min-h-0">
                  <div className="min-w-[800px] w-full">
                    {renderView()}
                  </div>
                </div>

              </div>
            )}

            {/* 모바일 하단 탭 메뉴 */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border px-4 py-2 flex items-center justify-around">
              <Button
                variant={activeTab === "chat" ? "default" : "ghost"}
                onClick={() => setActiveTab("chat")}
                className="flex-1 flex flex-col items-center gap-1 h-auto py-2"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="text-xs">채팅</span>
              </Button>
              <Button
                variant={activeTab === "dashboard" ? "default" : "ghost"}
                onClick={() => setActiveTab("dashboard")}
                className="flex-1 flex flex-col items-center gap-1 h-auto py-2"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span className="text-xs">대시보드</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

