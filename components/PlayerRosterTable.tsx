"use client";

import { PlayerInfo } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useGameStore } from "@/store/gameStore";

interface PlayerRosterTableProps {
  players: PlayerInfo[];
  onPlayerClick?: (playerId: string) => void;
}

export default function PlayerRosterTable({ players, onPlayerClick }: PlayerRosterTableProps) {
  const { currentDate } = useGameStore();

  // 포지션 순서
  const positionOrder: Record<string, number> = {
    TOP: 1,
    JGL: 2,
    MID: 3,
    ADC: 4,
    SPT: 5,
  };

  const sortedPlayers = [...players].sort((a, b) => {
    return positionOrder[a.position] - positionOrder[b.position];
  });

  // 계약 만료가 당해년도인지 확인
  const isContractExpiring = (contractEndsAt: number): boolean => {
    return contractEndsAt === currentDate.getFullYear();
  };

  // 컨디션 계산 (임시: overall 기반)
  const getCondition = (overall: number): { value: number; label: string; color: string } => {
    if (overall >= 90) {
      return { value: overall, label: "최상", color: "text-green-400" };
    } else if (overall >= 80) {
      return { value: overall, label: "양호", color: "text-blue-400" };
    } else if (overall >= 70) {
      return { value: overall, label: "보통", color: "text-yellow-400" };
    } else if (overall >= 60) {
      return { value: overall, label: "저조", color: "text-orange-400" };
    } else {
      return { value: overall, label: "나쁨", color: "text-red-400" };
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

  if (sortedPlayers.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        등록된 선수가 없습니다.
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col h-full max-h-[calc(100vh-300px)]">
      <div className="px-6 py-4 border-b border-border flex-shrink-0">
        <h2 className="text-xl font-bold">로스터</h2>
        <p className="text-sm text-muted-foreground mt-1">
          총 {sortedPlayers.length}명
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
                이름
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
            {sortedPlayers.map((player) => {
              const isS = player.tier.startsWith("S");
              const isExpiring = isContractExpiring(player.contractEndsAt);
              const condition = getCondition(player.overall);

              return (
                <tr
                  key={player.id}
                  className={cn(
                    "hover:bg-muted/30 transition-colors",
                    onPlayerClick && "cursor-pointer hover:bg-muted/50"
                  )}
                  onClick={() => onPlayerClick?.(player.id)}
                >
                  <td className="px-4 py-3 text-sm">
                    <Badge
                      variant={player.division === "1군" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {player.division || "1군"}
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
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {player.name}
                  </td>
                  <td className="px-4 py-3 text-sm">{player.age}세</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className={cn("font-semibold", getOVRColor(player.overall))}>
                        {player.overall}
                      </span>
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full transition-all",
                            player.overall >= 90
                              ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                              : player.overall >= 80
                              ? "bg-blue-400"
                              : player.overall >= 70
                              ? "bg-green-400"
                              : player.overall >= 60
                              ? "bg-yellow-500"
                              : "bg-orange-500"
                          )}
                          style={{ width: `${player.overall}%` }}
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
    </div>
  );
}

