"use client";

import { useGameStore } from "@/store/gameStore";
import { Calendar, DollarSign, Clock } from "lucide-react";

export default function HeaderStatus() {
  const { currentDate, currentTeamId, getTeamById, getCurrentSeasonEvent } = useGameStore();
  const currentTeam = getTeamById(currentTeamId);
  const seasonEvent = getCurrentSeasonEvent();

  // 아시안게임 개최 여부 확인 (4년 주기)
  const isAsianGamesYear = (year: number): boolean => {
    return year % 4 === 2;
  };

  // D-Day 계산 (다음 주요 이벤트까지)
  const calculateDDay = (): { event: string; days: number } | null => {
    const today = new Date(currentDate);
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    // 다음 주요 이벤트 찾기
    let nextEvent: { name: string; date: Date } | null = null;

    if (month < 1) {
      nextEvent = { name: "KeSPA Cup", date: new Date(year, 0, 1) };
    } else if (month <= 3) {
      nextEvent = { name: "LCK CUP", date: new Date(year, 2, 15) };
    } else if (month < 5) {
      nextEvent = { name: "MSI", date: new Date(year, 4, 1) };
    } else if (month < 9) {
      // 아시안게임 해인지 확인
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
    summer: "Summer",
    summer_short: "Summer (단축)",
    asian_games: "아시안게임",
    worlds_prep: "Worlds 준비",
    worlds: "Worlds",
    off_season: "오프시즌",
  };

  return (
    <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="px-3 sm:px-6 py-2 sm:py-3">
        {/* 데스크톱 레이아웃 */}
        <div className="hidden md:flex items-center justify-between">
          {/* 좌측: 날짜 및 D-Day */}
          <div className="flex items-center gap-4 lg:gap-6">
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
          </div>

          {/* 중앙: 시즌 상태 */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-primary/10 rounded-md border border-primary/20">
              <span className="text-sm font-medium text-primary">
                {seasonEventNames[seasonEvent]}
              </span>
            </div>
          </div>

          {/* 우측: 보유 자금 */}
          {currentTeam && (
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-cyber-green" />
              <span className="font-mono font-semibold text-cyber-green">
                {(currentTeam.money / 100000000).toFixed(1)}억원
              </span>
            </div>
          )}
        </div>

        {/* 모바일 레이아웃 */}
        <div className="md:hidden space-y-2">
          {/* 첫 번째 줄: 날짜와 시즌 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyber-blue" />
              <span className="font-mono text-xs">
                {currentDate.getFullYear()}/{String(currentDate.getMonth() + 1).padStart(2, "0")}/{String(currentDate.getDate()).padStart(2, "0")}
              </span>
            </div>
            <div className="px-2 py-1 bg-primary/10 rounded-md border border-primary/20">
              <span className="text-xs font-medium text-primary">
                {seasonEventNames[seasonEvent]}
              </span>
            </div>
          </div>
          
          {/* 두 번째 줄: D-Day와 자금 */}
          <div className="flex items-center justify-between">
            {dDay && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyber-purple" />
                <span className="text-xs">
                  <span className="text-muted-foreground">{dDay.event}</span>
                  <span className="ml-1 font-semibold">
                    D-{dDay.days >= 0 ? dDay.days : `+${Math.abs(dDay.days)}`}
                  </span>
                </span>
              </div>
            )}
            {currentTeam && (
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-cyber-green" />
                <span className="font-mono text-xs font-semibold text-cyber-green">
                  {(currentTeam.money / 100000000).toFixed(1)}억원
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

