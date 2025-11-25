"use client";

import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, TrendingDown, Minus, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { TeamRank } from "@/types";

type TournamentKey = "kespaCup" | "lckCup" | "regularSeason" | "summer" | "playoff" | "msi" | "worlds";

export default function StatisticsView() {
  const { rankings, teams, currentTeamId, getTeamById, matches, currentDate, getCurrentSeasonEvent } = useGameStore();
  const [selectedTournament, setSelectedTournament] = useState<TournamentKey>("regularSeason");

  // 대회별 라벨 매핑
  const tournamentLabels: Record<TournamentKey, string> = {
    kespaCup: "KeSPA Cup",
    lckCup: "LCK CUP",
    regularSeason: "정규 시즌",
    summer: "서머",
    playoff: "플레이오프",
    msi: "MSI",
    worlds: "월즈",
  };

  // 현재 시즌 이벤트 확인
  const currentEvent = getCurrentSeasonEvent();
  
  // 데이터가 있거나 진행 중인 대회만 표시
  const availableTournaments: Array<{ key: TournamentKey; label: string }> = [];
  
  // 각 대회별로 데이터가 있거나 진행 중인지 확인
  Object.keys(rankings).forEach((key) => {
    const tournamentKey = key as TournamentKey;
    const tournamentData = rankings[tournamentKey];
    
    // 데이터가 있거나 (순위표에 실제 데이터가 있음)
    // 또는 현재 진행 중인 대회인지 확인
    const hasData = tournamentData && tournamentData.length > 0 && 
                    tournamentData.some(r => r.wins > 0 || r.losses > 0);
    
    // 현재 시즌 이벤트에 따라 진행 중인 대회 판단
    const isActive = 
      (currentEvent === "kespa" && tournamentKey === "kespaCup") ||
      (currentEvent === "lck_cup" && tournamentKey === "lckCup") ||
      ((currentEvent === "summer" || currentEvent === "summer_short") && tournamentKey === "regularSeason") ||
      (currentEvent === "msi" && tournamentKey === "msi") ||
      (currentEvent === "worlds" && tournamentKey === "worlds") ||
      (tournamentKey === "regularSeason" && (currentEvent === "summer" || currentEvent === "summer_short" || currentEvent === "off_season"));
    
    if (hasData || isActive) {
      availableTournaments.push({
        key: tournamentKey,
        label: tournamentLabels[tournamentKey],
      });
    }
  });

  // 정규시즌은 항상 표시 (데이터가 없어도)
  if (!availableTournaments.some(t => t.key === "regularSeason")) {
    availableTournaments.push({
      key: "regularSeason",
      label: "정규 시즌",
    });
  }

  // 선택된 대회가 사용 가능한 대회 목록에 없으면 첫 번째 대회로 변경
  if (!availableTournaments.some(t => t.key === selectedTournament)) {
    if (availableTournaments.length > 0) {
      setSelectedTournament(availableTournaments[0].key);
    }
  }

  // 선택된 대회의 순위표 가져오기
  const standings = rankings[selectedTournament] || [];

  // 경기 시작 여부 확인: matches 배열에 완료된 경기가 있는지 확인
  const hasMatchesStarted = matches.length > 0 && matches.some(m => m.status === "completed");
  
  // 또는 순위표에 실제 경기 데이터가 있는지 확인 (모든 팀이 0승 0패가 아닌 경우)
  const hasRankingData = standings.length > 0 && standings.some(s => s.wins > 0 || s.losses > 0);
  
  const isSeasonStarted = hasMatchesStarted || hasRankingData;

  // 데이터가 없으면 빈 순위표 생성 (모든 팀을 0으로)
  const displayStandings: TeamRank[] = standings.length > 0
    ? standings
    : teams.map((team, index) => ({
        rank: index + 1,
        teamId: team.id,
        teamName: team.name,
        abbreviation: team.abbreviation,
        wins: 0,
        losses: 0,
        points: 0,
        goalDifference: 0,
        winRate: 0,
      }));

  // 순위 변동 아이콘 (더미)
  const getRankChangeIcon = (rank: number) => {
    if (rank <= 3) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (rank >= 8) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  // 순위 색상
  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-400";
    if (rank === 2) return "text-gray-300";
    if (rank === 3) return "text-orange-400";
    return "text-foreground";
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent mb-2">
          통계
        </h1>
        <p className="text-muted-foreground">
          대회별 순위표와 팀 통계를 확인하세요.
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            순위표
          </CardTitle>
          <CardDescription>대회별 팀 순위</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTournament} onValueChange={(value) => setSelectedTournament(value as TournamentKey)}>
            <TabsList className={cn(
              "grid w-full mb-6",
              availableTournaments.length === 1 && "grid-cols-1",
              availableTournaments.length === 2 && "grid-cols-2",
              availableTournaments.length === 3 && "grid-cols-3",
              availableTournaments.length === 4 && "grid-cols-4",
              availableTournaments.length === 5 && "grid-cols-5",
              availableTournaments.length === 6 && "grid-cols-6",
              availableTournaments.length >= 7 && "grid-cols-7"
            )}>
              {availableTournaments.map((tournament) => (
                <TabsTrigger key={tournament.key} value={tournament.key} className="text-sm">
                  {tournament.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedTournament} className="mt-0">
              {!isSeasonStarted ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <Clock className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">경기가 아직 진행되지 않았습니다</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    정규 시즌이 시작되면 순위표가 표시됩니다.
                    <br />
                    게임을 진행하여 경기 결과를 확인하세요.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        순위
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        팀명
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        승
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        패
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        승점
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        득실차
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        승률
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                        {displayStandings.map((standing) => {
                      const isCurrentTeam = standing.teamId === currentTeamId;
                      const totalMatches = standing.wins + standing.losses;

                      return (
                        <tr
                          key={standing.teamId}
                          className={cn(
                            "hover:bg-muted/30 transition-colors",
                            isCurrentTeam && "bg-primary/10 border-l-4 border-l-primary"
                          )}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "font-bold text-lg",
                                  getRankColor(standing.rank)
                                )}
                              >
                                {standing.rank}
                              </span>
                              {getRankChangeIcon(standing.rank)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "font-semibold",
                                  isCurrentTeam && "text-primary"
                                )}
                              >
                                {standing.abbreviation || standing.teamName}
                              </span>
                              {isCurrentTeam && (
                                <Badge variant="outline" className="text-xs">
                                  내 팀
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center font-semibold text-green-400">
                            {standing.wins}
                          </td>
                          <td className="px-4 py-3 text-center font-semibold text-red-400">
                            {standing.losses}
                          </td>
                          <td className="px-4 py-3 text-center font-semibold">
                            {standing.points}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={cn(
                                "font-medium",
                                standing.goalDifference > 0
                                  ? "text-green-400"
                                  : standing.goalDifference < 0
                                  ? "text-red-400"
                                  : "text-muted-foreground"
                              )}
                            >
                              {standing.goalDifference > 0 ? "+" : ""}
                              {standing.goalDifference}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="font-medium">
                              {totalMatches > 0
                                ? standing.winRate.toFixed(1)
                                : "0.0"}
                              %
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
