"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import HeaderStatus from "@/components/HeaderStatus";
import RosterTable from "@/components/RosterTable";
import GameChatInterface from "@/components/GameChatInterface";
import ActionFooter from "@/components/ActionFooter";
import { useGameStore } from "@/store/gameStore";
import { useUIStore } from "@/store/uiStore";
import DashboardView from "@/components/views/DashboardView";
import TeamManagementView from "@/components/views/TeamManagementView";
import MatchScheduleView from "@/components/views/MatchScheduleView";
import NewsArchiveView from "@/components/views/NewsArchiveView";
import StatisticsView from "@/components/views/StatisticsView";
import FAMarketView from "@/components/views/FAMarketView";
import SettingsView from "@/components/views/SettingsView";

// 모달 컴포넌트를 동적 임포트 (SSR 비활성화)
const ApiKeyModal = dynamic(() => import("@/components/ApiKeyModal"), {
  ssr: false,
});

const TeamSelectionModal = dynamic(() => import("@/components/TeamSelectionModal"), {
  ssr: false,
});

export default function Home() {
  const { currentTeamId, apiKey, isLoading } = useGameStore();
  const { currentView } = useUIStore();
  const [isMounted, setIsMounted] = useState(false);

  // 클라이언트에서만 마운트 상태 확인
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 마운트 후에만 조건부 렌더링 결정
  const showApiKeyModal = isMounted && !apiKey;
  const showTeamSelection = isMounted && apiKey && !currentTeamId;
  const showGame = isMounted && apiKey && currentTeamId;

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
      
      {/* 2단계: 팀 선택 */}
      {!showApiKeyModal && <TeamSelectionModal />}
      
      {/* 3단계: 게임 화면 */}
      {showGame && (
        <div className="flex flex-col h-full relative">
          {/* 로딩 오버레이 */}
          {isLoading && (
            <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-card border border-border rounded-lg p-8 flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <div className="text-lg font-semibold bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent">
                  AI 응답 처리 중...
                </div>
                <div className="text-sm text-muted-foreground">
                  잠시만 기다려주세요
                </div>
              </div>
            </div>
          )}
          
          {/* 상단 상태 바 */}
          <HeaderStatus />

          {/* 메인 콘텐츠 영역 */}
          <div className="flex flex-1 overflow-hidden min-h-0">
            {/* 좌측: 대시보드 (70%) */}
            <div className="flex-[0.7] overflow-y-auto border-r border-border">
              {renderView()}
            </div>

            {/* 우측: 게임 채팅 인터페이스 (30%) */}
            <div className="flex-[0.3] min-w-0">
              <GameChatInterface />
            </div>
          </div>

          {/* 하단 액션 바 */}
          <ActionFooter />
        </div>
      )}
    </>
  );
}

