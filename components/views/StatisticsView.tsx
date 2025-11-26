"use client";

import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Team, PlayerSeasonStats } from "@/types";

type TournamentKey = "kespaCup" | "lckCup" | "regularSeason" | "summer" | "playoff" | "msi" | "worlds";

export default function StatisticsView() {
  const { 
    rankings, 
    teams, 
    currentTeamId, 
    getTeamById, 
    getCurrentSeasonEvent,
    playerSeasonStats,
    getPlayerById,
    season
  } = useGameStore();
  const [selectedTournament, setSelectedTournament] = useState<TournamentKey>("regularSeason");
  const [sortBy, setSortBy] = useState<"kda" | "averageDamage" | "winRate" | "totalGames">("kda");

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

  // 대회별 참가 팀 필터링
  const getParticipatingTeams = (tournament: TournamentKey): Team[] => {
    switch (tournament) {
      case "msi":
        // MSI: 상위 2팀만 (순위표에서 상위 2팀 추출)
        if (standings.length > 0) {
          const top2TeamIds = standings.slice(0, 2).map(s => s.teamId);
          return teams.filter(t => top2TeamIds.includes(t.id));
        }
        return teams.slice(0, 2); // 순위표가 없으면 임시로 처음 2팀
      case "worlds":
        // 월즈: 상위 3-4팀만
        if (standings.length > 0) {
          const top4TeamIds = standings.slice(0, 4).map(s => s.teamId);
          return teams.filter(t => top4TeamIds.includes(t.id));
        }
        return teams.slice(0, 4);
      case "kespaCup":
      case "lckCup":
      case "regularSeason":
      case "summer":
      case "playoff":
      default:
        // LCK 대회: 모든 팀 참가
        return teams;
    }
  };

  const participatingTeams = getParticipatingTeams(selectedTournament);

  // 선수별 통계 가져오기 (현재 시즌, 선택된 대회)
  const tournamentKeyMap: Record<TournamentKey, string> = {
    kespaCup: "kespaCup",
    lckCup: "lckCup",
    regularSeason: "regularSeason",
    summer: "summer",
    playoff: "playoff",
    msi: "msi",
    worlds: "worlds",
  };

  // 선수별 통계 가져오기 (현재 시즌, 선택된 대회)
  // playerSeasonStats가 undefined일 수 있으므로 기본값 설정
  const playerStats = (playerSeasonStats || [])
    .filter((s) => s.season === season && s.tournament === tournamentKeyMap[selectedTournament])
    .map((stat) => {
      const player = getPlayerById(stat.playerId);
      return {
        ...stat,
        player,
      };
    })
    .filter((s) => s.player !== undefined)
    .sort((a, b) => {
      switch (sortBy) {
        case "kda":
          return b.kda - a.kda;
        case "averageDamage":
          return b.averageDamage - a.averageDamage;
        case "winRate":
          return b.winRate - a.winRate;
        case "totalGames":
          return b.totalGames - a.totalGames;
        default:
          return 0;
      }
    });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent mb-2">
          선수 통계
        </h1>
        <p className="text-muted-foreground">
          선수별 개인 기록과 누적 통계를 확인하세요.
        </p>
      </div>

      {/* 참가 팀 리스트 (대회별 필터링) */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            참가 팀
          </CardTitle>
          <CardDescription>
            {tournamentLabels[selectedTournament]} 참가 팀 목록 ({participatingTeams.length}팀)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {participatingTeams.map((team) => (
              <div
                key={team.id}
                className={cn(
                  "p-3 rounded-lg border text-center transition-colors",
                  team.id === currentTeamId
                    ? "bg-primary/10 border-primary"
                    : "bg-muted/50 border-border"
                )}
              >
                <div className="font-semibold text-sm">{team.abbreviation}</div>
                <div className="text-xs text-muted-foreground mt-1">{team.name}</div>
                {team.id === currentTeamId && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    내 팀
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                선수별 통계
              </CardTitle>
              <CardDescription>대회별 선수 개인 기록</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-1.5 bg-background border border-border rounded-md text-sm"
              >
                <option value="kda">KDA 순</option>
                <option value="averageDamage">평균 딜량 순</option>
                <option value="winRate">승률 순</option>
                <option value="totalGames">경기 수 순</option>
              </select>
            </div>
          </div>
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
              {playerStats.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <Clock className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">통계 데이터가 없습니다</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    경기를 진행하면 선수별 통계가 표시됩니다.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          선수
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          포지션
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          경기 수
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          KDA
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          평균 딜량
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          승률
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          주요 챔피언
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {playerStats.map((stat, index) => {
                        const player = stat.player!;
                        const topChampions = stat.playedChampions
                          .sort((a, b) => b.count - a.count)
                          .slice(0, 3);

                        return (
                          <tr
                            key={stat.playerId}
                            className={cn(
                              "hover:bg-muted/30 transition-colors",
                              player.teamId === currentTeamId && "bg-primary/10 border-l-4 border-l-primary"
                            )}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{player.nickname}</span>
                                {player.teamId === currentTeamId && (
                                  <Badge variant="outline" className="text-xs">
                                    내 팀
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="outline">{player.position}</Badge>
                            </td>
                            <td className="px-4 py-3 text-center font-medium">
                              {stat.totalGames}
                            </td>
                            <td className="px-4 py-3 text-center font-semibold">
                              {stat.kda.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-center font-medium">
                              {stat.averageDamage.toFixed(0)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={cn(
                                "font-medium",
                                stat.winRate >= 60 ? "text-green-400" : stat.winRate >= 50 ? "text-yellow-400" : "text-red-400"
                              )}>
                                {stat.winRate.toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex flex-wrap gap-1 justify-center">
                                {topChampions.map((champ) => (
                                  <Badge key={champ.championName} variant="secondary" className="text-xs">
                                    {champ.championName} ({champ.count})
                                  </Badge>
                                ))}
                                {topChampions.length === 0 && (
                                  <span className="text-muted-foreground text-xs">-</span>
                                )}
                              </div>
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
