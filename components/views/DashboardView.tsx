"use client";

import { useMemo } from "react";
import { useGameStore } from "@/store/gameStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Trophy, TrendingUp, Users, Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardView() {
  const {
    currentTeamId,
    currentDate,
    teams,
    matches,
    scheduledMatches,
    news,
    getTeamById,
    getCurrentSeasonEvent,
  } = useGameStore();

  const currentTeam = useMemo(() => 
    currentTeamId ? getTeamById(currentTeamId) : null,
    [currentTeamId, getTeamById]
  );
  const seasonEvent = getCurrentSeasonEvent();

  // 다음 경기 찾기 (useMemo로 최적화)
  const { nextMatch, nextMatchOpponent } = useMemo(() => {
    const next = scheduledMatches
      .filter((m) => m.status === "scheduled")
      .sort((a, b) => a.date.getTime() - b.date.getTime())[0];

    const opponent = next
      ? getTeamById(
          next.homeTeamId === currentTeamId
            ? next.awayTeamId
            : next.homeTeamId
        )
      : null;

    return { nextMatch: next, nextMatchOpponent: opponent };
  }, [scheduledMatches, currentTeamId, getTeamById]);

  // D-Day 계산 (currentDate 기준) (useCallback으로 메모이제이션)
  const getDDay = useMemo(() => (date: Date) => {
    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  }, [currentDate]);

  // 팀 현황 계산 (useMemo로 최적화)
  const { wins, losses, winRate, recentMatches } = useMemo(() => {
    const completed = matches.filter(
      (m) =>
        m.status === "completed" &&
        (m.homeTeamId === currentTeamId || m.awayTeamId === currentTeamId)
    );

    const winsCount = completed.filter(
      (m) => m.result?.winner === currentTeamId
    ).length;
    const lossesCount = completed.length - winsCount;
    const winRateValue = completed.length > 0 ? (winsCount / completed.length) * 100 : 0;

    const recent = completed
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5)
      .map((m) => m.result?.winner === currentTeamId);

    return {
      wins: winsCount,
      losses: lossesCount,
      winRate: winRateValue,
      recentMatches: recent,
    };
  }, [matches, currentTeamId]);

  // 1군 선발 5명 (포지션별로 정렬) (useMemo로 최적화)
  const mainRoster = useMemo(() => {
    if (!currentTeam) return [];
    
    const positionOrder: Record<string, number> = {
      TOP: 1,
      JGL: 2,
      MID: 3,
      ADC: 4,
      SPT: 5,
    };
    
    return currentTeam.roster
      .filter((p) => p.division === "1군")
      .sort((a, b) => positionOrder[a.position] - positionOrder[b.position])
      .slice(0, 5);
  }, [currentTeam]);

  // 최근 뉴스 3개 (useMemo로 최적화)
  const recentNews = useMemo(() => news.slice(0, 3), [news]);

  // 시즌 이벤트 이름 매핑
  const seasonEventNames: Record<string, string> = {
    kespa: "KeSPA Cup",
    lck_cup: "LCK CUP",
    first_stand: "First Stand",
    msi: "MSI",
    ewc: "EWC",
    summer: "LCK 서머",
    summer_short: "LCK 서머 (단축)",
    asian_games: "아시안게임",
    worlds_prep: "월즈 준비",
    worlds: "월즈",
    off_season: "스토브리그",
  };

  // 등급에 따른 스타일
  const getTierStyle = (tier: string) => {
    if (tier.startsWith("S")) {
      return "text-yellow-400 border-yellow-400";
    }
    if (tier.startsWith("A")) {
      return "text-blue-400 border-blue-400";
    }
    if (tier.startsWith("B")) {
      return "text-green-400 border-green-400";
    }
    return "text-gray-400 border-gray-400";
  };

  // 팀 사기 계산 (임시: 승률 기반)
  const morale = Math.min(100, Math.max(0, winRate + 20));

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* 상단 요약 카드 (3열 Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {/* 다음 경기 */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyber-blue" />
              다음 경기
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextMatch && nextMatchOpponent ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">D-{getDDay(nextMatch.date)}</span>
                  <Badge variant="outline" className="text-xs">
                    {seasonEventNames[seasonEvent] || seasonEvent}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-lg">
                      vs {nextMatchOpponent.abbreviation || nextMatchOpponent.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {nextMatch.date.toLocaleDateString("ko-KR", {
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">예정된 경기가 없습니다</p>
            )}
          </CardContent>
        </Card>

        {/* 팀 현황 */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-cyber-purple" />
              팀 현황
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">순위</span>
                <span className="text-2xl font-bold">-</span>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-2xl font-bold text-green-400">{wins}승</p>
                  <p className="text-sm text-muted-foreground">승리</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-400">{losses}패</p>
                  <p className="text-sm text-muted-foreground">패배</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">최근 5경기:</span>
                <div className="flex gap-1">
                  {recentMatches.map((isWin, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "w-3 h-3 rounded-full",
                        isWin ? "bg-green-400" : "bg-red-400"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 구단 상태 */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyber-blue" />
              구단 상태
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">팬덤 크기</span>
                  <span className="text-sm font-semibold">
                    {currentTeam?.fanbaseSize || 0}/100
                  </span>
                </div>
                <Progress value={currentTeam?.fanbaseSize || 0} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">팀 사기</span>
                  <span className="text-sm font-semibold">{Math.round(morale)}/100</span>
                </div>
                <Progress value={morale} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 주요 로스터 요약 */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-cyber-purple" />
            주요 로스터
          </CardTitle>
          <CardDescription>현재 1군 선발 5명</CardDescription>
        </CardHeader>
        <CardContent>
          {mainRoster.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {mainRoster.map((player) => {
                const isSTier = player.tier.startsWith("S");
                return (
                  <div
                    key={player.id}
                    className={cn(
                      "p-4 rounded-lg border transition-all",
                      isSTier
                        ? "border-yellow-400/50 bg-yellow-400/5"
                        : "border-border bg-card"
                    )}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className={cn("text-xs", getTierStyle(player.tier))}
                        >
                          {player.position}
                        </Badge>
                        {isSTier && (
                          <span className="text-yellow-400 text-xs">⭐</span>
                        )}
                      </div>
                      <p
                        className={cn(
                          "font-bold text-lg",
                          isSTier ? "text-yellow-400" : "text-foreground"
                        )}
                      >
                        {player.nickname}
                      </p>
                      <div className="pt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground">등급</p>
                        <p className="text-sm font-semibold">{player.tier}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">로스터 정보가 없습니다</p>
          )}
        </CardContent>
      </Card>

      {/* 최근 뉴스 피드 */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-cyber-blue" />
            최근 뉴스
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentNews.length > 0 ? (
            <div className="space-y-4">
              {recentNews.map((newsItem) => (
                <div
                  key={newsItem.id}
                  className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {newsItem.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {newsItem.date.toLocaleDateString("ko-KR")}
                        </span>
                      </div>
                      <h4 className="font-semibold mb-1">{newsItem.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {newsItem.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">뉴스가 없습니다</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
