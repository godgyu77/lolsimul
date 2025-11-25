"use client";

import { useState, useEffect } from "react";
import { useGameStore } from "@/store/gameStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Users2, CheckCircle2, X, ArrowUp, ArrowDown } from "lucide-react";
import { PlayerInfo } from "@/types";
import { cn } from "@/lib/utils";

interface RosterConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  matchId?: string;
  matchType?: string;
}

export default function RosterConfirmationModal({
  isOpen,
  onConfirm,
  onCancel,
  matchId,
  matchType = "regular",
}: RosterConfirmationModalProps) {
  const { rosters, currentTeamId, getTeamById, updateRosters } = useGameStore();
  const [selectedTeam1, setSelectedTeam1] = useState<PlayerInfo[]>([]);
  const [selectedTeam2, setSelectedTeam2] = useState<PlayerInfo[]>([]);
  const [movedPlayers, setMovedPlayers] = useState<Set<string>>(new Set());

  const currentTeam = getTeamById(currentTeamId);

  useEffect(() => {
    if (isOpen && rosters) {
      setSelectedTeam1([...rosters.team1]);
      setSelectedTeam2([...rosters.team2]);
      setMovedPlayers(new Set());
    }
  }, [isOpen, rosters]);

  if (!isOpen || !currentTeam) return null;

  // 1군에서 2군으로 이동
  const moveToTeam2 = (player: PlayerInfo) => {
    setSelectedTeam1(selectedTeam1.filter((p) => p.id !== player.id));
    setSelectedTeam2([...selectedTeam2, { ...player, division: "2군" }]);
    setMovedPlayers(new Set([...movedPlayers, player.id]));
  };

  // 2군에서 1군으로 이동
  const moveToTeam1 = (player: PlayerInfo) => {
    setSelectedTeam2(selectedTeam2.filter((p) => p.id !== player.id));
    setSelectedTeam1([...selectedTeam1, { ...player, division: "1군" }]);
    setMovedPlayers(new Set([...movedPlayers, player.id]));
  };

  // 포지션별로 선수 그룹화
  const groupByPosition = (players: PlayerInfo[]) => {
    const grouped: Record<string, PlayerInfo[]> = {
      TOP: [],
      JGL: [],
      MID: [],
      ADC: [],
      SPT: [],
    };
    players.forEach((player) => {
      if (grouped[player.position]) {
        grouped[player.position].push(player);
      }
    });
    return grouped;
  };

  const team1Grouped = groupByPosition(selectedTeam1);
  const team2Grouped = groupByPosition(selectedTeam2);

  const handleConfirm = () => {
    // 로스터 업데이트
    updateRosters({
      team1: selectedTeam1,
      team2: selectedTeam2,
      staff: rosters.staff,
    });
    onConfirm();
  };

  const matchTypeNames: Record<string, string> = {
    regular: "정규 경기",
    lck_cup: "LCK CUP",
    playoff: "플레이오프",
    msi: "MSI",
    worlds: "월즈",
    kespa: "KeSPA Cup",
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="bg-card border-border w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">로스터 확정</CardTitle>
              <CardDescription>
                {matchTypeNames[matchType] || matchType} 경기 전 로스터를 확정하세요.
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1군 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-cyber-blue" />
                <h3 className="text-lg font-semibold">1군 로스터</h3>
                <Badge variant="outline">{selectedTeam1.length}명</Badge>
              </div>

              {Object.entries(team1Grouped).map(([position, players]) => (
                <div key={position} className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">{position}</div>
                  <div className="space-y-2">
                    {players.length > 0 ? (
                      players.map((player) => (
                        <div
                          key={player.id}
                          className={cn(
                            "p-3 rounded-lg border bg-card flex items-center justify-between",
                            movedPlayers.has(player.id) && "border-primary bg-primary/5"
                          )}
                        >
                          <div className="flex-1">
                            <div className="font-semibold">{player.nickname}</div>
                            <div className="text-xs text-muted-foreground">
                              {player.name} · OVR {player.overall}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveToTeam2(player)}
                            className="gap-1"
                          >
                            <ArrowDown className="w-4 h-4" />
                            2군
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground p-3 border border-dashed rounded-lg text-center">
                        등록된 선수가 없습니다
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 2군 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Users2 className="w-5 h-5 text-cyber-purple" />
                <h3 className="text-lg font-semibold">2군 로스터</h3>
                <Badge variant="outline">{selectedTeam2.length}명</Badge>
              </div>

              {Object.entries(team2Grouped).map(([position, players]) => (
                <div key={position} className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">{position}</div>
                  <div className="space-y-2">
                    {players.length > 0 ? (
                      players.map((player) => (
                        <div
                          key={player.id}
                          className={cn(
                            "p-3 rounded-lg border bg-card flex items-center justify-between",
                            movedPlayers.has(player.id) && "border-primary bg-primary/5"
                          )}
                        >
                          <div className="flex-1">
                            <div className="font-semibold">{player.nickname}</div>
                            <div className="text-xs text-muted-foreground">
                              {player.name} · OVR {player.overall}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveToTeam1(player)}
                            className="gap-1"
                          >
                            <ArrowUp className="w-4 h-4" />
                            1군
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground p-3 border border-dashed rounded-lg text-center">
                        등록된 선수가 없습니다
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>

        <div className="border-t border-border p-4 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            취소
          </Button>
          <Button onClick={handleConfirm} className="gap-2">
            <CheckCircle2 className="w-4 h-4" />
            이 로스터로 진행
          </Button>
        </div>
      </Card>
    </div>
  );
}

