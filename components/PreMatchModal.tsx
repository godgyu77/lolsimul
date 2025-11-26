"use client";

import { useState, useEffect } from "react";
import { useGameStore } from "@/store/gameStore";
import { useUIStore } from "@/store/uiStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Users, Trophy, Calendar, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { startInteractiveSimulation } from "@/lib/simulation/engine";

export default function PreMatchModal() {
  const { 
    pendingMatchId, 
    setPendingMatchId, 
    setShowPreMatchModal 
  } = useUIStore();
  const { 
    scheduledMatches, 
    getTeamById, 
    currentTeamId,
    userPlayer,
    userPlayerRoleModelId,
    players,
    addMessage,
  } = useGameStore();
  const [rosterConfirmed, setRosterConfirmed] = useState(false);
  const [roleModelMatchup, setRoleModelMatchup] = useState<{ player: any; isSamePosition: boolean } | null>(null);

  const match = pendingMatchId ? scheduledMatches.find((m) => m.id === pendingMatchId) : null;
  const homeTeam = match ? getTeamById(match.homeTeamId) : null;
  const awayTeam = match ? getTeamById(match.awayTeamId) : null;
  const isHome = match ? match.homeTeamId === currentTeamId : false;
  const opponent = isHome ? awayTeam : homeTeam;
  const myTeam = isHome ? homeTeam : awayTeam;

  // 롤모델 매치업 감지
  useEffect(() => {
    if (!pendingMatchId || !match || !userPlayer || !userPlayerRoleModelId || !opponent) {
      setRoleModelMatchup(null);
      return;
    }

    const roleModel = players.find((p) => p.id === userPlayerRoleModelId);
    if (!roleModel) {
      setRoleModelMatchup(null);
      return;
    }

    // 상대 팀에 롤모델이 있는지 확인
    const isRoleModelInOpponent = opponent.roster.some((p) => p.id === userPlayerRoleModelId);
    if (isRoleModelInOpponent) {
      const isSamePosition = roleModel.position === userPlayer.position;
      setRoleModelMatchup({
        player: roleModel,
        isSamePosition,
      });

      // 롤모델 매치업 뉴스 생성
      const roleModelTeam = getTeamById(roleModel.teamId);
      const matchupMessage = isSamePosition
        ? `🎯 **롤모델 매치업!**\n\n존경하는 ${roleModel.nickname}(${roleModel.name}) 선수와 같은 포지션(${roleModel.position})에서 맞대결하게 되었습니다. 이번 경기는 특별한 의미가 있습니다.\n\n"드디어 만나게 되었네요. 제가 배우고 싶었던 선수입니다."`
        : `⭐ **롤모델과의 경기**\n\n롤모델인 ${roleModel.nickname}(${roleModel.name}) 선수가 상대 팀(${roleModelTeam?.name})에 있습니다. 같은 경기장에서 플레이하게 되어 영광입니다.\n\n"${roleModel.nickname} 선수를 뛰어넘어 보겠습니다!"`;

      addMessage({
        id: `rolemodel-matchup-${Date.now()}`,
        type: "game",
        content: matchupMessage,
        timestamp: new Date(),
      });
    } else {
      setRoleModelMatchup(null);
    }
  }, [pendingMatchId, match, userPlayer, userPlayerRoleModelId, opponent, players, getTeamById, addMessage]);

  if (!pendingMatchId || !match) {
    return null;
  }

  if (!homeTeam || !awayTeam) {
    setPendingMatchId(null);
    setShowPreMatchModal(false);
    return null;
  }

  const matchTypeNames: Record<string, string> = {
    regular: "정규",
    lck_cup: "LCK CUP",
    playoff: "플레이오프",
    msi: "MSI",
    worlds: "월즈",
  };

  const handleRosterManagement = () => {
    // 팀 관리 뷰로 이동
    useUIStore.getState().setCurrentView("TEAM");
    setShowPreMatchModal(false);
  };

  const handleStartMatch = (mode: "one_set" | "match") => {
    if (!rosterConfirmed) {
      alert("로스터를 확인해주세요.");
      return;
    }

    // 인터랙티브 시뮬레이션 시작
    startInteractiveSimulation(match.id);

    setPendingMatchId(null);
    setShowPreMatchModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Trophy className="w-6 h-6 text-cyber-blue" />
              매치 프리뷰
            </CardTitle>
            <button
              onClick={() => {
                setPendingMatchId(null);
                setShowPreMatchModal(false);
              }}
              className="p-2 hover:bg-accent rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <CardDescription>경기 시작 전 로스터를 확인하고 준비하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 경기 정보 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border bg-muted/30">
              <div className="text-sm text-muted-foreground mb-1">내 팀</div>
              <div className="text-xl font-bold">{myTeam?.abbreviation || myTeam?.name}</div>
              <div className="text-sm text-muted-foreground">{myTeam?.name}</div>
            </div>
            <div className="p-4 rounded-lg border border-border bg-muted/30">
              <div className="text-sm text-muted-foreground mb-1">상대 팀</div>
              <div className="text-xl font-bold">{opponent?.abbreviation || opponent?.name}</div>
              <div className="text-sm text-muted-foreground">{opponent?.name}</div>
            </div>
          </div>

          {/* 경기 상세 정보 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{matchTypeNames[match.matchType] || match.matchType}</Badge>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {match.date.toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "short",
                })}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {match.matchType === "regular" ? "3전 2선승제 (Bo3)" : "5전 3선승제 (Bo5)"}
            </div>
          </div>

          {/* 롤모델 매치업 알림 */}
          {roleModelMatchup && (
            <div className="p-4 rounded-lg border-2 border-yellow-400/50 bg-yellow-400/10">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <h3 className="font-semibold text-yellow-400">롤모델 매치업!</h3>
              </div>
              <p className="text-sm text-white/90">
                {roleModelMatchup.isSamePosition
                  ? `같은 포지션(${roleModelMatchup.player.position})에서 롤모델 ${roleModelMatchup.player.nickname} 선수와 맞대결합니다!`
                  : `롤모델 ${roleModelMatchup.player.nickname} 선수가 상대 팀에 있습니다.`}
              </p>
            </div>
          )}

          {/* 로스터 확인 */}
          <div className="p-4 rounded-lg border border-border bg-muted/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-cyber-purple" />
                <h3 className="font-semibold">로스터 확인</h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRosterManagement}
              >
                로스터 관리
              </Button>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rosterConfirmed}
                  onChange={(e) => setRosterConfirmed(e.target.checked)}
                  className="w-4 h-4 rounded border-border"
                />
                <span className="text-sm">로스터를 확인했으며, 경기 준비가 완료되었습니다.</span>
              </label>
            </div>
          </div>

          {/* 시뮬레이션 옵션 */}
          <div className="space-y-3">
            <h3 className="font-semibold">시뮬레이션 옵션</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleStartMatch("one_set")}
                disabled={!rosterConfirmed}
                variant="default"
                className="h-auto py-4 flex flex-col items-center gap-2"
              >
                <div className="text-lg font-bold">1세트 진행</div>
                <div className="text-xs text-muted-foreground">현재 경기의 1세트만 시뮬레이션</div>
              </Button>
              <Button
                onClick={() => handleStartMatch("match")}
                disabled={!rosterConfirmed}
                variant="default"
                className="h-auto py-4 flex flex-col items-center gap-2"
              >
                <div className="text-lg font-bold">매치 종료까지</div>
                <div className="text-xs text-muted-foreground">경기가 끝날 때까지 연속 시뮬레이션</div>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

