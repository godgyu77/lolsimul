"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Save, Download, Key, RotateCcw, AlertTriangle } from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
}: SettingsModalProps) {
  const {
    apiKey,
    setApiKey,
    gameMode,
    saveGame,
    loadGame,
    hasSavedGame,
    currentDate,
  } = useGameStore();
  const [newApiKey, setNewApiKey] = useState(apiKey || "");
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  if (!isOpen) return null;

  const handleSaveGame = () => {
    if (!gameMode) {
      setSaveStatus({
        type: "error",
        message: "게임 모드가 선택되지 않았습니다.",
      });
      return;
    }

    const success = saveGame(gameMode);
    if (success) {
      setSaveStatus({
        type: "success",
        message: "게임이 성공적으로 저장되었습니다.",
      });
      setTimeout(() => setSaveStatus({ type: null, message: "" }), 3000);
    } else {
      setSaveStatus({
        type: "error",
        message: "게임 저장에 실패했습니다.",
      });
      setTimeout(() => setSaveStatus({ type: null, message: "" }), 3000);
    }
  };

  const handleLoadGame = () => {
    if (!gameMode) {
      setSaveStatus({
        type: "error",
        message: "게임 모드가 선택되지 않았습니다.",
      });
      return;
    }

    const success = loadGame(gameMode);
    if (success) {
      setSaveStatus({
        type: "success",
        message: "게임이 성공적으로 불러와졌습니다.",
      });
      setTimeout(() => {
        setSaveStatus({ type: null, message: "" });
        onClose();
      }, 2000);
    } else {
      setSaveStatus({
        type: "error",
        message: "저장된 게임이 없습니다.",
      });
      setTimeout(() => setSaveStatus({ type: null, message: "" }), 3000);
    }
  };

  const handleUpdateApiKey = () => {
    if (newApiKey.trim()) {
      setApiKey(newApiKey.trim());
      localStorage.setItem("gemini_api_key", newApiKey.trim());
      setSaveStatus({
        type: "success",
        message: "API 키가 업데이트되었습니다.",
      });
      setTimeout(() => setSaveStatus({ type: null, message: "" }), 3000);
    } else {
      setSaveStatus({
        type: "error",
        message: "API 키를 입력해주세요.",
      });
      setTimeout(() => setSaveStatus({ type: null, message: "" }), 3000);
    }
  };

  const handleResetGame = () => {
    // localStorage 초기화
    if (typeof window !== "undefined") {
      localStorage.removeItem("lck_save_manager");
      localStorage.removeItem("lck_save_career");
      localStorage.removeItem("gemini_api_key");
    }

    // 페이지 새로고침으로 전체 State 초기화
    window.location.reload();
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center h-screen bg-black/80 backdrop-blur-sm p-4"
        onClick={(e) => {
          // backdrop 클릭 시 모달 닫기
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div 
          className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl m-4 sm:m-0"
          onClick={(e) => {
            // 모달 내부 클릭 시 이벤트 전파 방지
            e.stopPropagation();
          }}
        >
          {/* 헤더 */}
          <div className="flex justify-between items-center p-4 sm:p-6 border-b border-border flex-shrink-0">
            <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent">
              설정
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-10 w-10 sm:h-8 sm:w-8 shrink-0 touch-manipulation"
            >
              <X className="w-5 h-5 sm:w-4 sm:h-4" />
            </Button>
          </div>

          {/* 본문 내용 */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* 현재 날짜 표시 */}
            <div className="bg-muted/50 border border-border rounded-lg p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-muted-foreground">
                현재 게임 날짜:{" "}
                <span className="font-semibold text-foreground">
                  {formatDate(currentDate)}
                </span>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                게임 모드:{" "}
                <span className="font-semibold text-foreground">
                  {gameMode === "MANAGER"
                    ? "감독 모드"
                    : gameMode === "PLAYER"
                    ? "선수 커리어 모드"
                    : "미선택"}
                </span>
              </div>
            </div>

          {/* 저장/불러오기 */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2">
              <Save className="w-4 h-4 sm:w-5 sm:h-5 text-cyber-blue shrink-0" />
              <h3 className="text-base sm:text-lg font-semibold">게임 저장/불러오기</h3>
            </div>

            <div className="flex flex-col gap-2 sm:gap-3">
              <Button
                onClick={handleSaveGame}
                className="w-full h-11 sm:h-10 bg-gradient-to-r from-cyber-blue to-cyber-purple hover:from-cyber-blue/90 hover:to-cyber-purple/90 touch-manipulation text-sm sm:text-base"
              >
                <Save className="w-4 h-4 mr-2" />
                저장하기 (Save Game)
              </Button>

              <Button
                onClick={handleLoadGame}
                variant="outline"
                disabled={!gameMode || !hasSavedGame(gameMode!)}
                className="w-full h-11 sm:h-10 touch-manipulation text-sm sm:text-base"
              >
                <Download className="w-4 h-4 mr-2" />
                불러오기 (Load Game)
                {!gameMode || !hasSavedGame(gameMode!) ? (
                  <span className="ml-2 text-xs text-muted-foreground">
                    (저장된 게임 없음)
                  </span>
                ) : null}
              </Button>
            </div>
          </div>

          {/* API 키 변경 */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 sm:w-5 sm:h-5 text-cyber-purple shrink-0" />
              <h3 className="text-base sm:text-lg font-semibold">API 키 설정</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey" className="text-sm">Gemini API 키</Label>
              <Input
                id="apiKey"
                type="password"
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                placeholder="API 키를 입력하세요"
                className="h-11 sm:h-10 text-sm sm:text-base"
              />
              <Button
                onClick={handleUpdateApiKey}
                variant="outline"
                className="w-full h-11 sm:h-10 touch-manipulation text-sm sm:text-base"
              >
                <Key className="w-4 h-4 mr-2" />
                API 키 변경
              </Button>
            </div>
          </div>

          {/* 게임 초기화 */}
          <div className="space-y-3 sm:space-y-4 border-t border-border pt-3 sm:pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-destructive shrink-0" />
              <h3 className="text-base sm:text-lg font-semibold text-destructive">
                위험한 작업
              </h3>
            </div>

            <Button
              onClick={() => setShowResetDialog(true)}
              variant="destructive"
              className="w-full h-11 sm:h-10 touch-manipulation text-sm sm:text-base"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              게임 초기화
            </Button>
            <p className="text-xs text-muted-foreground">
              모든 게임 데이터와 설정이 삭제되며 되돌릴 수 없습니다.
            </p>
          </div>

            {/* 상태 메시지 */}
            {saveStatus.type && (
              <div
                className={`p-3 rounded-lg ${
                  saveStatus.type === "success"
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}
              >
                {saveStatus.message}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 초기화 확인 다이얼로그 */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>게임 초기화 확인</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 게임을 초기화하시겠습니까?
              <br />
              <br />
              이 작업은 다음을 삭제합니다:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>모든 게임 진행 데이터</li>
                <li>저장된 게임 파일</li>
                <li>API 키 설정</li>
              </ul>
              <br />
              <strong className="text-destructive">
                이 작업은 되돌릴 수 없습니다!
              </strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetGame}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              초기화
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

