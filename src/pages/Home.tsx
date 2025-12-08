import { useState, useEffect, useRef, lazy, Suspense } from "react";
import HeaderStatus from "@/components/HeaderStatus";
import GameChatInterface from "@/components/GameChatInterface";
import GameInputFooter from "@/components/GameInputFooter";
import { useGameStore } from "@/store/gameStore";
import { useUIStore } from "@/store/uiStore";
import TournamentBriefingModal from "@/components/TournamentBriefingModal";
import SimulationPhaseIndicator from "@/components/SimulationPhaseIndicator";
import SimulationChoiceModal from "@/components/SimulationChoiceModal";
import LoadingProgressBar from "@/components/LoadingProgressBar";

// 모달 컴포넌트를 동적 임포트 (React.lazy 사용)
const ApiKeyModal = lazy(() => import("@/components/ApiKeyModal"));
const GameModeSelectionModal = lazy(() => import("@/components/GameModeSelectionModal"));
const CharacterCreationModal = lazy(() => import("@/components/CharacterCreationModal"));
const TeamSelectionModal = lazy(() => import("@/components/TeamSelectionModal"));

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
      <Suspense fallback={null}>
        <ApiKeyModal />
      </Suspense>
      
      {/* 2단계: 게임 모드 선택 */}
      {!showApiKeyModal && (
        <Suspense fallback={null}>
          <GameModeSelectionModal />
        </Suspense>
      )}
      
      {/* 3단계: 캐릭터 생성 (선수 모드) */}
      {!showApiKeyModal && !showGameModeSelection && (
        <Suspense fallback={null}>
          <CharacterCreationModal />
        </Suspense>
      )}
      
      {/* 4단계: 팀 선택 */}
      {!showApiKeyModal && !showGameModeSelection && !showCharacterCreation && (
        <Suspense fallback={null}>
          <TeamSelectionModal />
        </Suspense>
      )}

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


          {/* 작은 화면 레이아웃 (1024px 미만) */}
          <div className="lg:hidden flex flex-col flex-1 h-full overflow-hidden min-w-0">
            {/* 상단 헤더 - Full-width 고정 */}
            <div className="w-full flex-shrink-0">
              <HeaderStatus />
            </div>
            
            {/* 채팅 인터페이스 - 전체 공간 사용 */}
            <div 
              className="flex-1 overflow-hidden min-h-0"
              onClick={(e) => {
                // 메인 화면 클릭 시 작전지시 모달 닫기
                const footer = document.querySelector('[data-footer-container]');
                if (footer) {
                  const actionModal = footer.querySelector('[data-action-modal]');
                  if (actionModal && actionModal.getAttribute('data-open') === 'true') {
                    const closeEvent = new Event('close-action-modal');
                    footer.dispatchEvent(closeEvent);
                  }
                }
              }}
            >
              <GameChatInterface hideHeader={true} hideInput={true} />
            </div>
            
            {/* 하단 입력 영역 - Full-width footer */}
            <div className="w-full flex-shrink-0">
              <GameInputFooter />
            </div>
          </div>

          {/* 큰 화면 레이아웃 (1024px 이상): 리포트 형식 (중앙 정렬, max-width) */}
          <div className="hidden lg:flex flex-col flex-1 h-full overflow-hidden min-w-0 relative">
            {/* 상단 헤더 - Full-width 고정 */}
            <div className="w-full flex-shrink-0">
              <HeaderStatus />
            </div>
            
            {/* 메인 콘텐츠 영역 - 중앙 정렬 및 폭 제한 */}
            <div 
              className="flex-1 overflow-hidden min-h-0 flex items-center justify-center"
              onClick={(e) => {
                // 메인 화면 클릭 시 작전지시 모달 닫기
                const footer = document.querySelector('[data-footer-container]');
                if (footer) {
                  const actionModal = footer.querySelector('[data-action-modal]');
                  if (actionModal && actionModal.getAttribute('data-open') === 'true') {
                    // 모달이 열려있으면 닫기 이벤트 트리거
                    const closeEvent = new Event('close-action-modal');
                    footer.dispatchEvent(closeEvent);
                  }
                }
              }}
            >
              <div className="w-full max-w-[1200px] h-full flex flex-col overflow-hidden">
                {/* 채팅 인터페이스 (헤더 및 입력창 제거) */}
                <div className="flex-1 overflow-hidden min-h-0">
                  <GameChatInterface hideHeader={true} hideInput={true} />
                </div>
              </div>
            </div>
            
            {/* 하단 입력 영역 - Full-width footer */}
            <div className="w-full flex-shrink-0">
              <GameInputFooter />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

