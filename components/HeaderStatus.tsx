"use client";

import { useState, useMemo } from "react";
import { useGameStore } from "@/store/gameStore";
import { Calendar, DollarSign, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeaderStatus() {
  const { 
    currentDate, 
    currentTeamId, 
    scheduledMatches, 
    teams, // teams 배열을 직접 구독하여 자금 변경 시 자동 리렌더링
    getCurrentSeasonEvent,
    gameMode,
    userPlayer,
    userPlayerRoleModelId,
    players,
  } = useGameStore();
  // teams 배열에서 직접 찾아서 자동 업데이트 보장 (useMemo로 최적화)
  const currentTeam = useMemo(() => {
    return teams.find((t) => t.id === currentTeamId);
  }, [teams, currentTeamId]); // teams와 currentTeamId 변경 시 재계산
  const seasonEvent = getCurrentSeasonEvent();
  
  // 롤모델 정보 가져오기
  const roleModel = userPlayerRoleModelId 
    ? players.find((p) => p.id === userPlayerRoleModelId)
    : null;

  // 아시안게임 개최 여부 확인 (4년 주기)
  const isAsianGamesYear = (year: number): boolean => {
    return year % 4 === 2;
  };

  // D-Day 계산 (다음 주요 이벤트까지) - scheduledMatches에서 가장 가까운 경기 찾기
  const calculateDDay = (): { event: string; days: number } | null => {
    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);

    // 다가오는 경기 중 가장 가까운 경기 찾기
    const upcomingMatches = scheduledMatches
      .filter((m) => {
        const matchDate = new Date(m.date);
        matchDate.setHours(0, 0, 0, 0);
        return m.status === "scheduled" && matchDate >= today;
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (upcomingMatches.length > 0) {
      const nextMatch = upcomingMatches[0];
      const matchDate = new Date(nextMatch.date);
      matchDate.setHours(0, 0, 0, 0);
      const diffTime = matchDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const matchTypeNames: Record<string, string> = {
        regular: "정규시즌",
        lck_cup: "LCK CUP",
        playoff: "플레이오프",
        msi: "MSI",
        worlds: "월즈",
      };

      return {
        event: matchTypeNames[nextMatch.matchType] || "경기",
        days: diffDays,
      };
    }

    // 경기가 없으면 다음 주요 이벤트 계산
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    let nextEvent: { name: string; date: Date } | null = null;

    if (month < 1) {
      nextEvent = { name: "KeSPA Cup", date: new Date(year, 0, 1) };
    } else if (month <= 3) {
      nextEvent = { name: "LCK CUP", date: new Date(year, 2, 15) };
    } else if (month < 5) {
      nextEvent = { name: "MSI", date: new Date(year, 4, 1) };
    } else if (month < 9) {
      if (isAsianGamesYear(year)) {
        nextEvent = { name: "아시안게임", date: new Date(year, 8, 1) };
      } else {
        nextEvent = { name: "Worlds", date: new Date(year, 9, 1) };
      }
    } else if (month < 10) {
      nextEvent = { name: "Worlds", date: new Date(year, 9, 1) };
    } else {
      nextEvent = { name: "KeSPA Cup", date: new Date(year + 1, 0, 1) };
    }

    if (!nextEvent) return null;

    const diffTime = nextEvent.date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return { event: nextEvent.name, days: diffDays };
  };

  const dDay = calculateDDay();

  const seasonEventNames: Record<typeof seasonEvent, string> = {
    kespa: "KeSPA Cup",
    lck_cup: "LCK CUP",
    first_stand: "First Stand",
    msi: "MSI",
    ewc: "EWC",
    summer: "Summer",
    summer_short: "Summer (단축)",
    asian_games: "아시안게임",
    worlds_prep: "Worlds 준비",
    worlds: "Worlds",
    off_season: "오프시즌",
  };

  return (
    <div className="w-full sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="w-full px-2 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3">
        {/* 작은 화면 레이아웃 (768px 미만) */}
        <div className="md:hidden space-y-2">
          {/* 첫 번째 줄: 날짜와 시즌 */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Calendar className="w-3.5 h-3.5 text-cyber-blue flex-shrink-0" />
              <span className="font-mono text-xs truncate">
                {currentDate.getFullYear()}/{String(currentDate.getMonth() + 1).padStart(2, "0")}/{String(currentDate.getDate()).padStart(2, "0")}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div className="px-1.5 py-0.5 bg-primary/10 rounded-md border border-primary/20">
                <span className="text-xs font-medium text-primary whitespace-nowrap">
                  {seasonEventNames[seasonEvent]}
                </span>
              </div>
            </div>
          </div>
          
          {/* 두 번째 줄: D-Day와 자금 */}
          <div className="flex items-center justify-between gap-2">
            {dDay && (
              <div className="flex items-center gap-1 min-w-0">
                <Clock className="w-3 h-3 text-cyber-purple flex-shrink-0" />
                <span className="text-xs truncate">
                  <span className="text-muted-foreground">{dDay.event}</span>
                  <span className="ml-1 font-semibold whitespace-nowrap">
                    D-{dDay.days >= 0 ? dDay.days : `+${Math.abs(dDay.days)}`}
                  </span>
                </span>
              </div>
            )}
            {gameMode === "PLAYER" && userPlayer ? (
              <div className="flex items-center gap-1.5 text-xs min-w-0">
                <span className="text-muted-foreground truncate">{userPlayer.nickname}</span>
                <span className="text-muted-foreground whitespace-nowrap">({userPlayer.position})</span>
              </div>
            ) : currentTeam ? (
              <div className="flex items-center gap-1 flex-shrink-0">
                <DollarSign className="w-3 h-3 text-cyber-green" />
                <span className="font-mono text-xs font-semibold text-cyber-green whitespace-nowrap">
                  {(currentTeam.money / 100000000).toFixed(1)}억원
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {/* 작은 데스크톱 레이아웃 (768px 이상, 1024px 미만) - 메인 화면에 맞춤 */}
        <div className="hidden md:flex lg:hidden items-center justify-center">
          <div className="w-full max-w-[1200px] flex items-center justify-between gap-2">
            {/* 좌측: 날짜 및 D-Day + 자금 */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Calendar className="w-4 h-4 text-cyber-blue" />
                <span className="font-mono text-xs whitespace-nowrap">
                  {currentDate.getFullYear()}/{String(currentDate.getMonth() + 1).padStart(2, "0")}/{String(currentDate.getDate()).padStart(2, "0")}
                </span>
              </div>
              {dDay && (
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Clock className="w-3.5 h-3.5 text-cyber-purple" />
                  <span className="text-xs whitespace-nowrap">
                    <span className="text-muted-foreground">{dDay.event}</span>
                    <span className="ml-1 font-semibold">
                      D-{dDay.days >= 0 ? dDay.days : `+${Math.abs(dDay.days)}`}
                    </span>
                  </span>
                </div>
              )}
              {/* 자금을 좌측에 추가 */}
              {gameMode === "PLAYER" && userPlayer ? (
                <div className="flex items-center gap-2 min-w-0">
                  {roleModel && (
                    <div className="flex items-center gap-1.5 text-xs flex-shrink-0">
                      <Star className="w-3.5 h-3.5 text-yellow-400" />
                      <span className="text-muted-foreground whitespace-nowrap">롤모델:</span>
                      <span className="font-semibold truncate max-w-[80px]">{roleModel.nickname}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-xs min-w-0">
                    <span className="text-muted-foreground truncate">{userPlayer.nickname}</span>
                    <span className="text-muted-foreground whitespace-nowrap">({userPlayer.position})</span>
                  </div>
                </div>
              ) : currentTeam ? (
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <DollarSign className="w-3.5 h-3.5 text-cyber-green" />
                  <span className="font-mono text-xs font-semibold text-cyber-green whitespace-nowrap">
                    {(currentTeam.money / 100000000).toFixed(1)}억원
                  </span>
                </div>
              ) : null}
            </div>

            {/* 우측: 시즌 상태 + 아이콘들 */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="px-2 py-1 bg-primary/10 rounded-md border border-primary/20">
                <span className="text-xs font-medium text-primary whitespace-nowrap">
                  {seasonEventNames[seasonEvent]}
                </span>
              </div>
              {/* 아이콘들을 우측에 배치 */}
              <div className="flex items-center gap-1">
              </div>
            </div>
          </div>
        </div>

        {/* 큰 데스크톱 레이아웃 (1024px 이상) - 메인 화면에 맞춤 */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="w-full max-w-[1200px] flex items-center justify-between">
            {/* 좌측: 날짜 및 D-Day + 자금 */}
            <div className="flex items-center gap-4 xl:gap-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyber-blue" />
                <span className="font-mono text-sm">
                  {currentDate.getFullYear()}/{String(currentDate.getMonth() + 1).padStart(2, "0")}/{String(currentDate.getDate()).padStart(2, "0")}
                </span>
              </div>
              {dDay && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyber-purple" />
                  <span className="text-sm">
                    <span className="text-muted-foreground">{dDay.event}</span>
                    <span className="ml-2 font-semibold">
                      D-{dDay.days >= 0 ? dDay.days : `+${Math.abs(dDay.days)}`}
                    </span>
                  </span>
                </div>
              )}
              {/* 자금을 좌측에 추가 */}
              {gameMode === "PLAYER" && userPlayer ? (
                <div className="flex items-center gap-4">
                  {roleModel && (
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-muted-foreground">롤모델:</span>
                      <span className="font-semibold">{roleModel.nickname}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{userPlayer.nickname}</span>
                    <span className="text-xs text-muted-foreground">({userPlayer.position})</span>
                  </div>
                </div>
              ) : currentTeam ? (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-cyber-green" />
                  <span className="font-mono font-semibold text-cyber-green">
                    {(currentTeam.money / 100000000).toFixed(1)}억원
                  </span>
                </div>
              ) : null}
            </div>

            {/* 우측: 시즌 상태 + 아이콘들 */}
            <div className="flex items-center gap-4">
              <div className="px-3 py-1 bg-primary/10 rounded-md border border-primary/20">
                <span className="text-sm font-medium text-primary">
                  {seasonEventNames[seasonEvent]}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

