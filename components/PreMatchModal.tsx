"use client";

import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { useUIStore } from "@/store/uiStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Users, Trophy, Calendar } from "lucide-react";
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
  } = useGameStore();
  const [rosterConfirmed, setRosterConfirmed] = useState(false);

  if (!pendingMatchId) return null;

  const match = scheduledMatches.find((m) => m.id === pendingMatchId);
  if (!match) {
    setPendingMatchId(null);
    setShowPreMatchModal(false);
    return null;
  }

  const homeTeam = getTeamById(match.homeTeamId);
  const awayTeam = getTeamById(match.awayTeamId);
  const isHome = match.homeTeamId === currentTeamId;
  const opponent = isHome ? awayTeam : homeTeam;
  const myTeam = isHome ? homeTeam : awayTeam;

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

