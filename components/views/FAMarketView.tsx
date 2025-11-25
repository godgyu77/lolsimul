"use client";

import { useGameStore } from "@/store/gameStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, User, Calendar, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FAMarketView() {
  const { faList, season, getTeamById } = useGameStore();

  // 현재 연도에 계약이 만료되는 선수 필터링
  const currentYearFAs = faList.filter(
    (player) => player.contractEndsAt === season
  );

  // 포지션별 정렬
  const positionOrder: Record<string, number> = {
    TOP: 1,
    JGL: 2,
    MID: 3,
    ADC: 4,
    SPT: 5,
  };

  const sortedFAs = [...currentYearFAs].sort((a, b) => {
    // 포지션 순서
    if (positionOrder[a.position] !== positionOrder[b.position]) {
      return positionOrder[a.position] - positionOrder[b.position];
    }
    // OVR 내림차순
    return b.overall - a.overall;
  });

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

  // OVR 색상 결정
  const getOVRColor = (ovr: number): string => {
    if (ovr >= 90) return "text-yellow-400 font-bold";
    if (ovr >= 80) return "text-blue-400";
    if (ovr >= 70) return "text-green-400";
    if (ovr >= 60) return "text-yellow-500";
    return "text-orange-400";
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent mb-2">
          FA 명단
        </h1>
        <p className="text-muted-foreground">
          {season}년 계약 만료 선수 목록
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-cyber-blue" />
            자유계약선수 (FA) 시장
          </CardTitle>
          <CardDescription>
            총 {sortedFAs.length}명의 선수가 FA 시장에 나와 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedFAs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      포지션
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      닉네임
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      이름
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      현재 팀
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      나이
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      종합능력치(OVR)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      등급
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      예상 연봉
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      계약만료
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sortedFAs.map((player) => {
                    const currentTeam = player.teamId ? getTeamById(player.teamId) : null;
                    const isSTier = player.tier.startsWith("S");

                    return (
                      <tr
                        key={player.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm font-medium">
                          {player.position}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={cn(
                              "font-semibold",
                              isSTier && "text-yellow-400"
                            )}
                          >
                            {player.nickname}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {player.name}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {currentTeam ? (
                            <Badge variant="outline" className="text-xs">
                              {currentTeam.abbreviation || currentTeam.name}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">무소속</span>
                          )}
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
                          <Badge
                            variant="outline"
                            className={cn("text-xs", getTierStyle(player.tier))}
                          >
                            {player.tier}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-1 text-cyber-green">
                            <DollarSign className="w-3 h-3" />
                            <span className="font-medium">
                              {player.salary.toFixed(1)}억원
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="text-red-400 font-semibold">
                            {player.contractEndsAt}년
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>현재 FA 시장에 나온 선수가 없습니다.</p>
              <p className="text-sm mt-2">
                스토브리그 기간(11월~12월)에 FA 시장이 개장됩니다.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

