"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Play, Trash2, X } from "lucide-react";
import { useGameStore } from "@/store/gameStore";

interface LoadGameModalProps {
  gameMode: "MANAGER" | "PLAYER";
  onClose: () => void;
  onNewGame: () => void;
}

export default function LoadGameModal({ gameMode, onClose, onNewGame }: LoadGameModalProps) {
  const { loadGame, hasSavedGame, deleteSavedGame } = useGameStore();
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSave, setHasSave] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setHasSave(hasSavedGame(gameMode));
  }, [gameMode, hasSavedGame]);

  const handleLoadGame = async () => {
    setIsLoading(true);
    try {
      const success = loadGame(gameMode);
      if (success) {
        onClose();
      } else {
        alert("게임을 불러오는 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("게임 불러오기 오류:", error);
      alert("게임을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSave = () => {
    if (confirm("저장된 게임을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      deleteSavedGame(gameMode);
      setHasSave(false);
      onNewGame(); // 삭제 후 새 게임으로 진행
    }
  };

  if (!isMounted) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-lg w-full max-w-md p-6 space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent">
            게임 불러오기
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* 저장 데이터 확인 */}
        {hasSave ? (
          <div className="space-y-4">
            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Download className="w-5 h-5 text-cyber-blue" />
                <span className="font-semibold text-foreground">
                  저장된 게임이 있습니다
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                이전에 저장한 게임을 이어서 진행할 수 있습니다.
              </p>
            </div>

            {/* 버튼 그룹 */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleLoadGame}
                disabled={isLoading || !hasSave}
                className="w-full h-12 bg-gradient-to-r from-cyber-blue to-cyber-purple hover:from-cyber-blue/90 hover:to-cyber-purple/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5 mr-2" />
                {isLoading ? "불러오는 중..." : "이어하기 (Load Game)"}
              </Button>

              <Button
                onClick={onNewGame}
                variant="outline"
                className="w-full h-12"
              >
                <Play className="w-5 h-5 mr-2" />
                새로 시작 (New Game)
              </Button>

              <Button
                onClick={handleDeleteSave}
                variant="destructive"
                className="w-full h-12"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                저장 삭제
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Play className="w-5 h-5 text-muted-foreground" />
                <span className="font-semibold text-foreground">
                  저장된 게임이 없습니다
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                새로운 게임을 시작하세요.
              </p>
            </div>

            {/* 버튼 그룹 */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleLoadGame}
                disabled={true}
                className="w-full h-12 bg-gradient-to-r from-cyber-blue to-cyber-purple hover:from-cyber-blue/90 hover:to-cyber-purple/90 disabled:opacity-50 disabled:cursor-not-allowed"
                title="저장된 데이터가 없습니다"
              >
                <Download className="w-5 h-5 mr-2" />
                이어하기 (Load Game)
              </Button>

              <Button
                onClick={onNewGame}
                className="w-full h-12 bg-gradient-to-r from-cyber-blue to-cyber-purple hover:from-cyber-blue/90 hover:to-cyber-purple/90"
              >
                <Play className="w-5 h-5 mr-2" />
                새로 시작 (New Game)
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

