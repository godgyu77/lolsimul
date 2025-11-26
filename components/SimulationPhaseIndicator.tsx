"use client";

import { useGameStore } from "@/store/gameStore";
import { SimulationPhase } from "@/types/game";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Clock, Target, Trophy } from "lucide-react";

export default function SimulationPhaseIndicator() {
  const { simulationState, currentMatch, getTeamById } = useGameStore();

  if (!simulationState.matchId || !currentMatch) return null;

  const phaseLabels: Record<SimulationPhase, string> = {
    [SimulationPhase.DRAFT]: "밴픽 단계",
    [SimulationPhase.EARLY]: "라인전 단계",
    [SimulationPhase.MID]: "오브젝트 싸움",
    [SimulationPhase.LATE]: "장로/바론 단계",
    [SimulationPhase.END]: "세트 종료",
    [SimulationPhase.FEEDBACK]: "피드백 타임",
  };

  const phaseIcons: Record<SimulationPhase, typeof Play> = {
    [SimulationPhase.DRAFT]: Play,
    [SimulationPhase.EARLY]: Clock,
    [SimulationPhase.MID]: Target,
    [SimulationPhase.LATE]: Trophy,
    [SimulationPhase.END]: Trophy,
    [SimulationPhase.FEEDBACK]: Play,
  };

  const currentPhase = simulationState.currentPhase;
  if (!currentPhase || currentPhase === SimulationPhase.END) return null;

  const homeTeam = getTeamById(currentMatch.homeTeamId);
  const awayTeam = getTeamById(currentMatch.awayTeamId);
  const Icon = phaseIcons[currentPhase];

  return (
    <Card className="bg-card border-border border-2 border-primary/30 pointer-events-auto">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-cyber-blue animate-pulse" />
            <div>
              <div className="text-sm text-muted-foreground">현재 진행 중</div>
              <div className="font-semibold text-lg">
                {phaseLabels[currentPhase]}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-muted-foreground">세트 {simulationState.currentSet}</div>
              <div className="font-semibold">
                {homeTeam?.abbreviation || "HOME"} {currentMatch.homeScore || 0} - {currentMatch.awayScore || 0} {awayTeam?.abbreviation || "AWAY"}
              </div>
            </div>
            {simulationState.isWaitingForUser && (
              <Badge variant="outline" className="animate-pulse">
                선택 대기 중...
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

