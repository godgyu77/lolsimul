"use client";

import { useGameStore } from "@/store/gameStore";
import { Calendar, DollarSign, Trophy } from "lucide-react";

export default function Header() {
  const { currentDate, currentTeamId, getTeamById, getCurrentSeasonEvent } = useGameStore();
  const currentTeam = getTeamById(currentTeamId);
  const seasonEvent = getCurrentSeasonEvent();

  const seasonEventNames: Record<ReturnType<typeof getCurrentSeasonEvent>, string> = {
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
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
      {/* 좌측: 팀 정보 */}
      <div className="flex items-center gap-6">
        <div>
          <h3 className="font-bold text-lg">{currentTeam?.name || "팀 선택 필요"}</h3>
        </div>
      </div>

      {/* 중앙: 날짜 정보 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-cyber-blue" />
          <span className="font-mono text-sm">
            {currentDate.toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-cyber-purple" />
          <span className="text-xs text-muted-foreground">
            {seasonEventNames[seasonEvent]}
          </span>
        </div>
      </div>

      {/* 우측: 상태 정보 */}
      <div className="flex items-center gap-6">
        {currentTeam && (
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-cyber-green" />
            <span className="font-mono font-semibold">
              {(currentTeam.money / 100000000).toFixed(1)}억원
            </span>
          </div>
        )}
      </div>
    </header>
  );
}

