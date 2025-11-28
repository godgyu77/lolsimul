"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import HeaderStatus from "@/components/HeaderStatus";
import GameChatInterface from "@/components/GameChatInterface";
import { useGameStore } from "@/store/gameStore";
import { useUIStore } from "@/store/uiStore";
import TournamentBriefingModal from "@/components/TournamentBriefingModal";
import SimulationPhaseIndicator from "@/components/SimulationPhaseIndicator";
import SimulationChoiceModal from "@/components/SimulationChoiceModal";
import LoadingProgressBar from "@/components/LoadingProgressBar";

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
  const { setShowTournamentBriefing } = useUIStore();
  const [isMounted, setIsMounted] = useState(false);
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


          {/* PC 레이아웃: 채팅 중심 (중앙 정렬, max-width) */}
          <div className="hidden lg:flex flex-1 h-full overflow-hidden min-w-0 relative">
            {/* 중앙 정렬 컨테이너 */}
            <div className="flex flex-col flex-1 h-full overflow-hidden items-center justify-center">
              {/* 채팅창 - 최대 너비 제한 및 중앙 정렬 */}
              <div className="flex flex-col w-full max-w-[1200px] h-full overflow-hidden">
                {/* 상단 상태 바 */}
                <HeaderStatus />
                
                {/* 채팅 인터페이스 */}
                <div className="flex-1 overflow-hidden">
                  <GameChatInterface />
                </div>
              </div>
            </div>
          </div>

          {/* 모바일 레이아웃: 채팅 중심 */}
          <div className="lg:hidden flex flex-col flex-1 h-full overflow-hidden pt-14">
            {/* 상단 상태 바 */}
            <HeaderStatus />
            
            {/* 채팅 인터페이스 - 전체 공간 사용 */}
            <div className="flex-1 overflow-hidden">
              <GameChatInterface />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

