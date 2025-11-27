"use client";

import { useState, useMemo } from "react";
import { useGameStore } from "@/store/gameStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Team, PlayerSeasonStats } from "@/types";

type TournamentKey = "all" | "kespaCup" | "lckCup" | "firstStand" | "regularSeason" | "summer" | "playoff" | "msi" | "ewc" | "worlds";

// 선수별 통계 가져오기 (현재 시즌, 선택된 대회) - 상수이므로 컴포넌트 외부로 이동
const TOURNAMENT_KEY_MAP: Record<TournamentKey, string> = {
  all: "all", // 전체는 필터링에서 제외
  kespaCup: "kespaCup",
  lckCup: "lckCup",
  firstStand: "firstStand",
  regularSeason: "regularSeason",
  summer: "summer",
  playoff: "playoff",
  msi: "msi",
  ewc: "ewc",
  worlds: "worlds",
};

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
  const [selectedTournament, setSelectedTournament] = useState<TournamentKey>("all");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"kda" | "averageDamage" | "winRate" | "totalGames">("kda");

  // 대회별 라벨 매핑
  const tournamentLabels: Record<TournamentKey, string> = {
    all: "전체",
    kespaCup: "KeSPA Cup",
    lckCup: "LCK CUP",
    firstStand: "First Stand",
    regularSeason: "정규 시즌",
    summer: "서머",
    playoff: "플레이오프",
    msi: "MSI",
    ewc: "EWC",
    worlds: "Worlds",
  };

  // 현재 시즌 이벤트 확인
  const currentEvent = getCurrentSeasonEvent();
  
  // 항상 표시할 기본 대회 목록 (시즌 진행 순서대로)
  const defaultTournaments: Array<{ key: TournamentKey; label: string }> = [
    { key: "all", label: "전체" },
    { key: "kespaCup", label: "KeSPA Cup" },
    { key: "firstStand", label: "First Stand" },
    { key: "regularSeason", label: "정규 시즌" },
    { key: "msi", label: "MSI" },
    { key: "ewc", label: "EWC" },
    { key: "worlds", label: "Worlds" },
  ];
  
  // 데이터가 있거나 진행 중인 대회 확인 (필터링용)
  const availableTournaments: Array<{ key: TournamentKey; label: string }> = [];
  
  // 각 대회별로 데이터가 있거나 진행 중인지 확인
  defaultTournaments.forEach(({ key, label }) => {
    const tournamentKey = key as TournamentKey;
    
    // "all"은 rankings에 없으므로 건너뛰기
    if (tournamentKey === "all") {
      availableTournaments.push({ key: tournamentKey, label });
      return;
    }
    
    const tournamentData = rankings[tournamentKey as keyof typeof rankings];
    
    // 데이터가 있거나 (순위표에 실제 데이터가 있음)
    const hasData = tournamentData && tournamentData.length > 0 && 
                    tournamentData.some(r => r.wins > 0 || r.losses > 0);
    
    // 현재 시즌 이벤트에 따라 진행 중인 대회 판단
    const isActive = 
      (currentEvent === "kespa" && tournamentKey === "kespaCup") ||
      (currentEvent === "lck_cup" && tournamentKey === "lckCup") ||
      (currentEvent === "first_stand" && tournamentKey === "firstStand") ||
      ((currentEvent === "summer" || currentEvent === "summer_short") && tournamentKey === "regularSeason") ||
      (currentEvent === "msi" && tournamentKey === "msi") ||
      (currentEvent === "ewc" && tournamentKey === "ewc") ||
      (currentEvent === "worlds" && tournamentKey === "worlds") ||
      (tournamentKey === "regularSeason" && (currentEvent === "summer" || currentEvent === "summer_short" || currentEvent === "off_season"));
    
    // 항상 표시 (데이터가 없어도 UI는 보여야 함)
    availableTournaments.push({
      key: tournamentKey,
      label,
    });
  });

  // 선택된 대회가 사용 가능한 대회 목록에 없으면 첫 번째 대회로 변경
  if (!availableTournaments.some(t => t.key === selectedTournament)) {
    if (availableTournaments.length > 0) {
      setSelectedTournament(availableTournaments[0].key);
    }
  }

  // 선택된 대회의 순위표 가져오기 (전체는 빈 배열)
  const standings = selectedTournament === "all" ? [] : (rankings[selectedTournament as keyof typeof rankings] || []);

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
      case "firstStand":
        // First Stand: 국제전 (8팀)
        if (standings.length > 0) {
          const top8TeamIds = standings.slice(0, 8).map(s => s.teamId);
          return teams.filter(t => top8TeamIds.includes(t.id));
        }
        return teams.slice(0, 8);
      case "ewc":
        // EWC: 국제전 (다양한 리그 참가)
        if (standings.length > 0) {
          const topTeamIds = standings.slice(0, 10).map(s => s.teamId);
          return teams.filter(t => topTeamIds.includes(t.id));
        }
        return teams.slice(0, 10);
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

  // 선수별 통계 가져오기 (playerSeasonStats만 사용 - 실제 경기 시뮬레이션 결과)
  const playerStats = useMemo(() => {
    // playerSeasonStats에서 선택된 대회의 통계만 필터링
    // "전체"는 모든 대회 통계 합산
    const filteredStats = (playerSeasonStats || [])
      .filter((s) => {
        if (selectedTournament === "all") {
          // 전체: 모든 대회 포함
          return s.season === season;
        } else {
          // 특정 대회만 필터링
          return s.season === season && s.tournament === TOURNAMENT_KEY_MAP[selectedTournament];
        }
      })
      .map((stat) => {
        const player = getPlayerById(stat.playerId);
        return {
          ...stat,
          player,
        };
      })
      .filter((s) => s.player !== undefined);

    // 선택된 팀이 있으면 해당 팀 선수만 필터링
    if (selectedTeamId) {
      return filteredStats
        .filter((s) => s.player?.teamId === selectedTeamId)
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
    }

    // 전체 선수 통계
    return filteredStats.sort((a, b) => {
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
  }, [selectedTeamId, playerSeasonStats, season, selectedTournament, sortBy, getPlayerById]);

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

      {/* 참가 팀 리스트 (클릭 가능) */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            참가 팀
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {participatingTeams.map((team) => (
              <button
                key={team.id}
                onClick={() => setSelectedTeamId(selectedTeamId === team.id ? null : team.id)}
                className={cn(
                  "p-3 rounded-lg border text-center transition-colors",
                  selectedTeamId === team.id
                    ? "bg-primary/20 border-primary"
                    : team.id === currentTeamId
                    ? "bg-primary/10 border-primary/50"
                    : "bg-muted/50 border-border hover:bg-muted",
                  "cursor-pointer"
                )}
              >
                <div className="font-semibold text-sm">{team.abbreviation}</div>
                <div className="text-xs text-muted-foreground mt-1">{team.name}</div>
                {team.id === currentTeamId && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    내 팀
                  </Badge>
                )}
              </button>
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
              <CardDescription>대회별 선수 개인 기록 (실제 경기 시뮬레이션 결과)</CardDescription>
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
          {/* 대회 필터 탭 (선수별 통계 테이블 바로 위로 이동) */}
          <Tabs value={selectedTournament} onValueChange={(value) => setSelectedTournament(value as TournamentKey)}>
            <TabsList className={cn(
              "grid w-full mb-6",
              availableTournaments.length === 1 && "grid-cols-1",
              availableTournaments.length === 2 && "grid-cols-2",
              availableTournaments.length === 3 && "grid-cols-3",
              availableTournaments.length === 4 && "grid-cols-4",
              availableTournaments.length === 5 && "grid-cols-5",
              availableTournaments.length === 6 && "grid-cols-6",
              availableTournaments.length === 7 && "grid-cols-7",
              availableTournaments.length === 8 && "grid-cols-8",
              availableTournaments.length >= 9 && "grid-cols-9"
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
                  <h3 className="text-xl font-semibold mb-2">
                    {selectedTeamId ? "해당 팀의 경기 기록이 없습니다" : "통계 데이터가 없습니다"}
                  </h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    {selectedTeamId 
                      ? "경기를 진행하면 선수별 통계가 표시됩니다."
                      : "경기를 진행하면 선수별 통계가 표시됩니다."}
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
                      {playerStats.map((stat: any) => {
                        const player = stat.player!;
                        const topChampions = stat.playedChampions
                          ? stat.playedChampions.sort((a: any, b: any) => b.count - a.count).slice(0, 3)
                          : [];

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
                              {stat.totalGames || 0}
                            </td>
                            <td className="px-4 py-3 text-center font-semibold">
                              {stat.kda ? stat.kda.toFixed(2) : "0.00"}
                            </td>
                            <td className="px-4 py-3 text-center font-medium">
                              {stat.averageDamage ? stat.averageDamage.toFixed(0) : "0"}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={cn(
                                "font-medium",
                                stat.winRate >= 60 ? "text-green-400" : stat.winRate >= 50 ? "text-yellow-400" : "text-red-400"
                              )}>
                                {stat.winRate ? stat.winRate.toFixed(1) : "0.0"}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex flex-wrap gap-1 justify-center">
                                {topChampions.map((champ: any) => (
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
