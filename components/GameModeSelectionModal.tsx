"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Users, User, Briefcase, Trophy } from "lucide-react";
import { useGameStore } from "@/store/gameStore";

const LoadGameModal = dynamic(() => import("@/components/LoadGameModal"), {
  ssr: false,
});

export default function GameModeSelectionModal() {
  const { setGameMode, apiKey, gameMode, hasSavedGame } = useGameStore();
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [selectedMode, setSelectedMode] = useState<"MANAGER" | "PLAYER" | null>(null);

  // 클라이언트에서만 마운트 상태 확인
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // API 키가 있고 gameMode가 null일 때 모달 열기
  useEffect(() => {
    if (isMounted) {
      setIsOpen(!!apiKey && gameMode === null);
    }
  }, [isMounted, apiKey, gameMode]);

  const handleSelectMode = (mode: "MANAGER" | "PLAYER") => {
    // 항상 모달을 표시 (저장 데이터 유무와 관계없이)
    setSelectedMode(mode);
    setShowLoadModal(true);
  };

  const handleLoadModalClose = () => {
    setShowLoadModal(false);
    setSelectedMode(null);
  };

  const handleNewGame = () => {
    if (selectedMode) {
      setGameMode(selectedMode);
      setIsOpen(false);
      setShowLoadModal(false);
      setSelectedMode(null);
    }
  };

  // 서버 사이드 렌더링 시 또는 마운트 전에는 렌더링하지 않음
  if (!isMounted || !isOpen) return null;

  return (
    <>
      {/* 게임 불러오기 모달 */}
      {showLoadModal && selectedMode && (
        <LoadGameModal
          gameMode={selectedMode}
          onClose={handleLoadModalClose}
          onNewGame={handleNewGame}
        />
      )}

      {/* 게임 모드 선택 모달 - 불러오기 모달이 열려있을 때는 숨김 */}
      {!showLoadModal && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="bg-card border border-border rounded-lg w-full max-w-2xl p-8 space-y-8">
        {/* 헤더 */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent">
            게임 모드 선택
          </h2>
          <p className="text-sm text-muted-foreground">
            플레이할 모드를 선택하세요
          </p>
        </div>

        {/* 모드 선택 버튼 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 감독 모드 */}
          <div className="group">
            <Button
              onClick={() => handleSelectMode("MANAGER")}
              className="w-full h-auto p-6 flex flex-col items-center gap-4 bg-gradient-to-br from-cyber-blue/20 to-cyber-purple/20 hover:from-cyber-blue/30 hover:to-cyber-purple/30 border-2 border-cyber-blue/50 hover:border-cyber-blue transition-all"
            >
              <div className="w-16 h-16 rounded-full bg-cyber-blue/20 flex items-center justify-center group-hover:bg-cyber-blue/30 transition-colors">
                <Briefcase className="w-8 h-8 text-cyber-blue" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-foreground">
                  감독 모드
                </h3>
                <p className="text-sm text-muted-foreground">
                  팀 전체를 관리하고 전략을 수립합니다
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>로스터 관리, 전술 수립, 자금 관리</span>
              </div>
            </Button>
          </div>

          {/* 선수 커리어 모드 */}
          <div className="group">
            <Button
              onClick={() => handleSelectMode("PLAYER")}
              className="w-full h-auto p-6 flex flex-col items-center gap-4 bg-gradient-to-br from-cyber-purple/20 to-cyber-blue/20 hover:from-cyber-purple/30 hover:to-cyber-blue/30 border-2 border-cyber-purple/50 hover:border-cyber-purple transition-all"
            >
              <div className="w-16 h-16 rounded-full bg-cyber-purple/20 flex items-center justify-center group-hover:bg-cyber-purple/30 transition-colors">
                <User className="w-8 h-8 text-cyber-purple" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-foreground">
                  선수 커리어 모드
                </h3>
                <p className="text-sm text-muted-foreground">
                  2군에서 시작하여 1군 콜업을 목표로 합니다
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Trophy className="w-4 h-4" />
                <span>개인 성장, 경기 출전, 레전드 달성</span>
              </div>
            </Button>
          </div>
        </div>

        {/* 안내 */}
        <div className="bg-muted/50 border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground text-center">
            모드는 게임 시작 후 변경할 수 없습니다. 신중하게 선택해주세요.
          </p>
        </div>
        </div>
      </div>
      )}
    </>
  );
}

