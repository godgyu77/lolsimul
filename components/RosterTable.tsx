"use client";

import { useMemo, useCallback } from "react";
import { useGameStore } from "@/store/gameStore";
import { Player, Tier } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface RosterTableProps {
  onPlayerClick?: (playerId: string) => void;
}

export default function RosterTable({ onPlayerClick }: RosterTableProps) {
  const { currentTeamId, getTeamById, currentDate } = useGameStore();
  const currentTeam = useMemo(() => getTeamById(currentTeamId), [currentTeamId, getTeamById]);

  // 선수 목록 정렬 (1군 우선, 포지션 순서) (useMemo로 최적화)
  const sortedRoster = useMemo(() => {
    if (!currentTeam) return [];
    
    const positionOrder: Record<string, number> = {
      TOP: 1,
      JGL: 2,
      MID: 3,
      ADC: 4,
      SPT: 5,
    };

    return [...currentTeam.roster].sort((a, b) => {
      // 1군 우선
      if (a.division !== b.division) {
        return a.division === "1군" ? -1 : 1;
      }
      // 포지션 순서
      return positionOrder[a.position] - positionOrder[b.position];
    });
  }, [currentTeam]);

  if (!currentTeam) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        팀을 선택해주세요.
      </div>
    );
  }

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

  // S급 선수 판단 (S+ 또는 S)
  const isSTier = (tier: Tier): boolean => {
    return tier === "S+" || tier === "S";
  };

  // 계약 만료가 당해년도인지 확인
  const isContractExpiring = (contractEndsAt: number): boolean => {
    return contractEndsAt === currentDate.getFullYear();
  };

  // 컨디션 계산 (임시: 멘탈 스탯 기반)
  const getCondition = (player: Player): { value: number; label: string; color: string } => {
    const mental = player.stats.멘탈;
    if (mental >= 90) {
      return { value: mental, label: "최상", color: "text-green-400" };
    } else if (mental >= 80) {
      return { value: mental, label: "양호", color: "text-blue-400" };
    } else if (mental >= 70) {
      return { value: mental, label: "보통", color: "text-yellow-400" };
    } else if (mental >= 60) {
      return { value: mental, label: "저조", color: "text-orange-400" };
    } else {
      return { value: mental, label: "나쁨", color: "text-red-400" };
    }
  };

  // OVR 색상 결정
  const getOVRColor = (ovr: number): string => {
    if (ovr >= 90) return "text-yellow-400 font-bold";
    if (ovr >= 80) return "text-blue-400";
    if (ovr >= 70) return "text-green-400";
    if (ovr >= 60) return "text-yellow-500";
    return "text-orange-400";
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col h-full max-h-[calc(100vh-300px)]">
      <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-border flex-shrink-0">
        <h2 className="text-base sm:text-lg md:text-xl font-bold">로스터</h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          {currentTeam.name} 선수 명단
        </p>
      </div>
      <div className="overflow-auto flex-1">
        <table className="w-full">
          <thead className="bg-muted/50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                구분
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                라인
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                닉네임
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                나이
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                종합능력치(OVR)
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                컨디션
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                연봉
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                계약기간
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedRoster.map((player) => {
              const overall = calculateOverall(player);
              const isS = isSTier(player.tier);
              const isExpiring = isContractExpiring(player.contractEndsAt);
              const condition = getCondition(player);

              return (
                <tr
                  key={player.id}
                  className={cn(
                    "hover:bg-muted/30 transition-colors cursor-pointer",
                    onPlayerClick && "hover:bg-muted/50"
                  )}
                  onClick={() => onPlayerClick?.(player.id)}
                >
                  <td className="px-4 py-3 text-sm">
                    <Badge
                      variant={player.division === "1군" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {player.division}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {player.position}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={cn(
                        "font-semibold",
                        isS && "text-yellow-400"
                      )}
                    >
                      {player.nickname}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{player.age}세</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className={cn("font-semibold", getOVRColor(overall))}>
                        {overall}
                      </span>
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full transition-all",
                            overall >= 90
                              ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                              : overall >= 80
                              ? "bg-blue-400"
                              : overall >= 70
                              ? "bg-green-400"
                              : overall >= 60
                              ? "bg-yellow-500"
                              : "bg-orange-500"
                          )}
                          style={{ width: `${overall}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={cn("font-medium", condition.color)}>
                      {condition.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {player.salary.toFixed(1)}억원
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={cn(
                        isExpiring && "text-red-400 font-semibold"
                      )}
                    >
                      ~{player.contractEndsAt}년
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {sortedRoster.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          등록된 선수가 없습니다.
        </div>
      )}
    </div>
  );
}

