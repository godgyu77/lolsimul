"use client";

import { useState, useEffect } from "react";
import { useGameStore } from "@/store/gameStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Key, AlertCircle, RotateCcw, Trash2, Save, Check } from "lucide-react";
import { initialTeams, initialPlayers } from "@/constants/initialData";

export default function SettingsView() {
  const { apiKey, setApiKey, gameMode, saveGame } = useGameStore();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [inputKey, setInputKey] = useState("");
  const [error, setError] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (apiKey) {
      setInputKey(apiKey);
    }
  }, [apiKey]);

  const handleApiKeySubmit = () => {
    if (!inputKey.trim()) {
      setError("API 키를 입력해주세요.");
      return;
    }

    if (inputKey.length < 20) {
      setError("올바른 API 키 형식이 아닙니다.");
      return;
    }

    // API key 저장
    if (typeof window !== "undefined") {
      localStorage.setItem("gemini_api_key", inputKey);
    }
    setApiKey(inputKey);
    setError("");
  };

  const handleReset = () => {
    if (!showResetConfirm) {
      setShowResetConfirm(true);
      return;
    }

    // 게임 데이터 리셋
    if (typeof window !== "undefined") {
      // localStorage 초기화
      localStorage.removeItem("gemini_api_key");
      
      // 페이지 새로고침으로 상태 초기화
      window.location.reload();
    }
  };

  const handleCancelReset = () => {
    setShowResetConfirm(false);
  };

  const handleSaveGame = () => {
    if (gameMode) {
      saveGame(gameMode);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent mb-2">
          설정
        </h1>
        <p className="text-muted-foreground">
          API 키 관리 및 게임 설정을 변경하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 게임 저장 */}
        {gameMode && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Save className="w-5 h-5 text-cyber-blue" />
                게임 저장
              </CardTitle>
              <CardDescription>
                현재 게임 진행 상황을 저장합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm text-muted-foreground">
                  게임을 저장하면 다음 정보가 저장됩니다:
                </p>
                <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>게임 진행 상태 및 날짜</li>
                  <li>팀 및 선수 데이터</li>
                  <li>경기 기록 및 일정</li>
                  <li>뉴스 및 순위 정보</li>
                  <li>채팅 메시지 기록</li>
                </ul>
              </div>
              <Button
                onClick={handleSaveGame}
                className="w-full gap-2 bg-gradient-to-r from-cyber-blue to-cyber-purple hover:from-cyber-blue/90 hover:to-cyber-purple/90"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    저장 완료!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    게임 저장
                  </>
                )}
              </Button>
              {saveSuccess && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-sm text-green-400 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    게임이 성공적으로 저장되었습니다.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* API Key 설정 */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-cyber-blue" />
              Gemini API 키
            </CardTitle>
            <CardDescription>
              게임을 진행하기 위해 Gemini API 키가 필요합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                API 키
              </label>
              <input
                type="password"
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value);
                  setError("");
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleApiKeySubmit();
                  }
                }}
                placeholder="AIzaSy..."
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
              />
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                API 키는 브라우저에 안전하게 저장되며, 서버로 전송되지 않습니다.
              </p>
            </div>

            <Button
              onClick={handleApiKeySubmit}
              className="w-full gap-2"
              disabled={!inputKey.trim()}
            >
              <Key className="w-4 h-4" />
              API 키 저장
            </Button>

            {apiKey && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-green-400 flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  API 키가 설정되어 있습니다.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 게임 초기화 */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-red-400" />
              게임 초기화
            </CardTitle>
            <CardDescription>
              모든 게임 데이터를 초기화하고 처음부터 시작합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showResetConfirm ? (
              <>
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-sm text-muted-foreground">
                    게임을 초기화하면 다음 데이터가 삭제됩니다:
                  </p>
                  <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>저장된 API 키</li>
                    <li>게임 진행 상태</li>
                    <li>경기 기록</li>
                    <li>뉴스 기록</li>
                  </ul>
                </div>
                <Button
                  onClick={handleReset}
                  variant="destructive"
                  className="w-full gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  게임 초기화
                </Button>
              </>
            ) : (
              <>
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-400 mb-1">
                        정말 초기화하시겠습니까?
                      </p>
                      <p className="text-xs text-muted-foreground">
                        이 작업은 되돌릴 수 없습니다. 모든 데이터가 삭제됩니다.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleReset}
                    variant="destructive"
                    className="flex-1 gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    확인
                  </Button>
                  <Button
                    onClick={handleCancelReset}
                    variant="outline"
                    className="flex-1"
                  >
                    취소
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 안내 섹션 */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>API 키 발급 방법</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
            <li>Google AI Studio (https://aistudio.google.com/)에 접속</li>
            <li>좌측 메뉴에서 &quot;API 키&quot; 선택</li>
            <li>&quot;API 키 만들기&quot; 버튼 클릭</li>
            <li>생성된 API 키를 복사하여 위 입력란에 붙여넣기</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
