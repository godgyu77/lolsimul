"use client";

import { useState, useEffect } from "react";
import { useGameStore } from "@/store/gameStore";
import { initialTeams } from "@/constants/initialData";
import { Button } from "@/components/ui/button";
import { X, Users, DollarSign, Trophy } from "lucide-react";
import { Team, Player } from "@/types";
import { cn } from "@/lib/utils";

export default function TeamSelectionModal() {
  const { setCurrentTeam, currentTeamId, apiKey, sendCommand } = useGameStore();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // 클라이언트에서만 마운트 상태 확인
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // API 키와 팀 선택 상태에 따라 모달 열기/닫기
  useEffect(() => {
    if (isMounted) {
      setIsOpen(!!apiKey && !currentTeamId);
    }
  }, [isMounted, apiKey, currentTeamId]);

  // 종합 스탯 계산
  const calculateOverall = (player: Player): number => {
    const stats = player.stats;
    return Math.round(
      (stats.라인전 +
        stats.한타 +
        stats.운영 +
        stats.피지컬 +
        stats.챔프폭 +
        stats.멘탈) /
        6
    );
  };

  // 팀의 평균 종합 스탯 계산
  const getTeamAverageOverall = (team: Team): number => {
    const mainRoster = team.roster.filter((p) => p.division === "1군");
    if (mainRoster.length === 0) return 0;
    const total = mainRoster.reduce(
      (sum, player) => sum + calculateOverall(player),
      0
    );
    return Math.round(total / mainRoster.length);
  };

  // 주요 선수 5명 가져오기 (1군 우선)
  const getMainPlayers = (team: Team): Player[] => {
    const mainRoster = team.roster.filter((p) => p.division === "1군");
    const positionOrder: Record<string, number> = {
      TOP: 1,
      JGL: 2,
      MID: 3,
      ADC: 4,
      SPT: 5,
    };
    return mainRoster
      .sort((a, b) => positionOrder[a.position] - positionOrder[b.position])
      .slice(0, 5);
  };

  const handleSelectTeam = (teamId: string) => {
    setSelectedTeamId(teamId);
  };

  const handleConfirm = async () => {
    if (selectedTeamId) {
      const selectedTeam = initialTeams.find(t => t.id === selectedTeamId);
      if (selectedTeam) {
        // 팀 선택
        setCurrentTeam(selectedTeamId);
        setIsOpen(false);
        
        // AI에게 해당 팀으로 시작한다는 명령어 전송
        const command = `${selectedTeam.name}로 게임을 시작합니다.`;
        await sendCommand(command);
      }
    }
  };

  // 서버 사이드 렌더링 시 또는 마운트 전에는 렌더링하지 않음
  if (!isMounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent">
              팀 선택
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              관리할 팀을 선택하세요
            </p>
          </div>
          {currentTeamId && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* 팀 목록 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {initialTeams.map((team) => {
              const isSelected = selectedTeamId === team.id;
              const avgOverall = getTeamAverageOverall(team);
              const mainPlayers = getMainPlayers(team);

              return (
                <div
                  key={team.id}
                  onClick={() => handleSelectTeam(team.id)}
                  className={cn(
                    "p-4 border-2 rounded-lg cursor-pointer transition-all",
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 hover:bg-muted/30"
                  )}
                >
                  {/* 팀 헤더 */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold">{team.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {team.abbreviation}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm font-semibold text-cyber-green">
                        <DollarSign className="w-4 h-4" />
                        {(team.money / 100000000).toFixed(0)}억원
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Trophy className="w-3 h-3" />
                        평균 {avgOverall}
                      </div>
                    </div>
                  </div>

                  {/* 주요 선수 목록 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Users className="w-3 h-3" />
                      <span>주요 선수</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {mainPlayers.map((player) => {
                        const overall = calculateOverall(player);
                        const isSTier =
                          player.tier === "S+" || player.tier === "S";

                        return (
                          <div
                            key={player.id}
                            className="text-center p-2 bg-muted/50 rounded"
                          >
                            <div
                              className={cn(
                                "text-xs font-semibold mb-1",
                                isSTier && "text-yellow-400"
                              )}
                            >
                              {player.nickname}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {player.position}
                            </div>
                            <div className="text-[10px] font-medium mt-0.5">
                              {overall}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 하단 액션 */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
          <Button
            onClick={handleConfirm}
            disabled={!selectedTeamId}
            className="gap-2"
          >
            선택 완료
          </Button>
        </div>
      </div>
    </div>
  );
}

