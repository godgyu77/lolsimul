"use client";

import { useMemo } from "react";
import { useGameStore } from "@/store/gameStore";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Player } from "@/types";
import { TRAIT_LIBRARY, ROSTER_DB } from "@/constants/systemPrompt";
import { cn } from "@/lib/utils";

interface PlayerDetailModalProps {
  playerId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PlayerDetailModal({ playerId, isOpen, onClose }: PlayerDetailModalProps) {
  const { players, getTeamById, currentDate } = useGameStore();

  const player = useMemo(() => {
    if (!playerId) return null;
    return players.find((p) => p.id === playerId);
  }, [playerId, players]);

  const team = useMemo(() => {
    if (!player?.teamId) return null;
    return getTeamById(player.teamId);
  }, [player?.teamId, getTeamById]);

  if (!player) return null;

  const stats = player.stats;
  const overall = Math.round(
    (stats.라인전 + stats.한타 + stats.운영 + stats.피지컬 + stats.챔프폭 + stats.멘탈) / 6
  );

  const isContractExpiring = player.contractEndsAt === currentDate.getFullYear();

  // 스탯 색상 결정
  const getStatColor = (value: number): string => {
    if (value >= 90) return "text-yellow-400";
    if (value >= 80) return "text-blue-400";
    if (value >= 70) return "text-green-400";
    if (value >= 60) return "text-yellow-500";
    return "text-orange-400";
  };

  // 스탯 바 색상 결정
  const getStatBarColor = (value: number): string => {
    if (value >= 90) return "bg-gradient-to-r from-yellow-400 to-yellow-500";
    if (value >= 80) return "bg-blue-400";
    if (value >= 70) return "bg-green-400";
    if (value >= 60) return "bg-yellow-500";
    return "bg-orange-500";
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

  // 특성 정보 가져오기
  const getTraitInfo = (traitKey: string) => {
    return TRAIT_LIBRARY[traitKey as keyof typeof TRAIT_LIBRARY] || null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
          <h2 className="text-2xl font-bold">선수 상세 정보</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* 내용 */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          <div className="space-y-6">
          {/* 기본 정보 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">닉네임</div>
              <div className="text-lg font-bold">{player.nickname}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">포지션</div>
              <div className="text-lg font-medium">{player.position}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">나이</div>
              <div className="text-lg">{player.age}세</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">등급</div>
              <Badge
                variant="outline"
                className={cn("text-xs", getTierStyle(player.tier))}
              >
                {player.tier}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">소속</div>
              <div className="text-lg">
                <Badge variant={player.division === "1군" ? "default" : "secondary"}>
                  {player.division || "1군"}
                </Badge>
                {team && <span className="ml-2">{team.name}</span>}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">연봉</div>
              <div className="text-lg font-medium">{player.salary.toFixed(1)}억원</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">계약 기간</div>
              <div
                className={cn(
                  "text-lg font-medium",
                  isContractExpiring && "text-red-400 font-semibold"
                )}
              >
                ~{player.contractEndsAt}년
                {isContractExpiring && <span className="ml-2 text-xs">(만료 예정)</span>}
              </div>
            </div>
          </div>

          {/* 능력치 상세 (ROSTER_DB 기반, 1~20 스케일) */}
          <div className="border-t border-border pt-4">
            <h3 className="text-lg font-bold mb-4">능력치 상세</h3>
            {(() => {
              // ROSTER_DB에서 선수 정보 가져오기
              // ROSTER_DB의 'name' 필드는 게임 닉네임입니다
              // Player 객체의 'nickname'과 매칭해야 합니다
              const teamRoster = player.teamId ? ROSTER_DB[player.teamId as keyof typeof ROSTER_DB] : null;
              
              if (!teamRoster) {
                return (
                  <div className="text-center py-8 text-muted-foreground">
                    팀 로스터 데이터를 찾을 수 없습니다.
                  </div>
                );
              }
              
              // 매칭 로직: ROSTER_DB의 name(게임 닉네임)과 Player의 nickname 또는 name 매칭
              const rosterPlayer = teamRoster.roster.find(
                (p: any) => {
                  // ROSTER_DB의 name은 게임 닉네임
                  const nameMatch = p.name === player.nickname || p.name === player.name;
                  const positionMatch = p.role === player.position;
                  // SUB는 제외
                  return nameMatch && positionMatch && p.role !== "SUB";
                }
              );
              
              const golStats = rosterPlayer?.stats || {};
              
              // stats 객체가 있고 실제 스탯 키가 있는지 확인
              const hasStats = golStats && typeof golStats === 'object' && (
                ('dpm' in golStats && golStats.dpm !== undefined && golStats.dpm !== null) ||
                ('dmg_pct' in golStats && golStats.dmg_pct !== undefined && golStats.dmg_pct !== null) ||
                ('kda_per_min' in golStats && golStats.kda_per_min !== undefined && golStats.kda_per_min !== null) ||
                ('solo_kill' in golStats && golStats.solo_kill !== undefined && golStats.solo_kill !== null) ||
                ('csd15' in golStats && golStats.csd15 !== undefined && golStats.csd15 !== null) ||
                ('gd15' in golStats && golStats.gd15 !== undefined && golStats.gd15 !== null) ||
                ('xpd15' in golStats && golStats.xpd15 !== undefined && golStats.xpd15 !== null) ||
                ('fb_part' in golStats && golStats.fb_part !== undefined && golStats.fb_part !== null) ||
                ('fb_victim' in golStats && golStats.fb_victim !== undefined && golStats.fb_victim !== null)
              );

              // 1~20 스케일 변환 함수
              const scaleTo20 = (value: number, min: number, max: number, reverse: boolean = false): number => {
                if (reverse) {
                  // 낮을수록 좋은 지표 (fb_victim)
                  const normalized = (max - value) / (max - min);
                  return Math.max(1, Math.min(20, Math.round(normalized * 19 + 1)));
                } else {
                  // 높을수록 좋은 지표
                  const normalized = (value - min) / (max - min);
                  return Math.max(1, Math.min(20, Math.round(normalized * 19 + 1)));
                }
              };

              // 각 지표별 최소/최대값 정의
              const statRanges: Record<string, { min: number; max: number; reverse?: boolean }> = {
                dpm: { min: 200, max: 900 },
                dmg_pct: { min: 0, max: 35 },
                kda_per_min: { min: 0, max: 1.0 },
                solo_kill: { min: 0, max: 30 },
                csd15: { min: -20, max: 20 },
                gd15: { min: -500, max: 500 },
                xpd15: { min: -500, max: 500 },
                fb_part: { min: 0, max: 100 },
                fb_victim: { min: 0, max: 100, reverse: true }, // 낮을수록 좋음
              };

              // 카테고리별 지표 분류
              const attackStats = ['dpm', 'dmg_pct', 'kda_per_min', 'solo_kill'];
              const laneStats = ['csd15', 'gd15', 'xpd15'];
              const variableStats = ['fb_part', 'fb_victim'];

              const statLabels: Record<string, string> = {
                dpm: "분당 데미지 (DPM)",
                dmg_pct: "팀 내 데미지 비중 (%)",
                kda_per_min: "분당 KDA",
                solo_kill: "솔로킬",
                csd15: "CS 격차 @15분",
                gd15: "골드 격차 @15분",
                xpd15: "경험치 격차 @15분",
                fb_part: "퍼블 관여율 (%)",
                fb_victim: "피퍼블 확률 (%)",
              };

              if (!rosterPlayer) {
                return (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>ROSTER_DB에서 해당 선수를 찾을 수 없습니다.</p>
                    <p className="text-xs mt-2">선수: {player.nickname}, 포지션: {player.position}</p>
                  </div>
                );
              }
              
              if (!hasStats) {
                return (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>상세 스탯 데이터가 없습니다.</p>
                    <p className="text-xs mt-2">선수: {rosterPlayer.name}, 포지션: {rosterPlayer.role}</p>
                  </div>
                );
              }

              // 스케일 점수에 따른 색상
              const getScaleColor = (score: number): string => {
                if (score >= 17) return "text-yellow-400";
                if (score >= 14) return "text-blue-400";
                if (score >= 11) return "text-green-400";
                if (score >= 8) return "text-yellow-500";
                return "text-orange-400";
              };

              const getScaleBarColor = (score: number): string => {
                if (score >= 17) return "bg-gradient-to-r from-yellow-400 to-yellow-500";
                if (score >= 14) return "bg-blue-400";
                if (score >= 11) return "bg-green-400";
                if (score >= 8) return "bg-yellow-500";
                return "bg-orange-500";
              };

              const renderStatCategory = (title: string, keys: string[]) => {
                const stats = keys
                  .map(key => {
                    const value = golStats[key as keyof typeof golStats];
                    if (value === undefined || value === null || typeof value !== 'number') return null;
                    const range = statRanges[key];
                    const score = scaleTo20(value, range.min, range.max, range.reverse);
                    return { key, value: value as number, score, label: statLabels[key] };
                  })
                  .filter((stat): stat is { key: string; value: number; score: number; label: string } => stat !== null);

                if (stats.length === 0) return null;

                return (
                  <div key={title} className="space-y-4">
                    <h4 className="text-md font-semibold text-foreground border-b border-border pb-2">
                      {title}
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {stats.map(({ key, value, score, label }) => {
                        const isPercentage = key.includes("_pct") || key.includes("part") || key.includes("victim");
                        const isGap = key.includes("d15") || key.includes("gd15") || key.includes("xpd15");
                        const displayValue = isPercentage 
                          ? `${value}%` 
                          : isGap 
                          ? `${value > 0 ? '+' : ''}${value}`
                          : typeof value === 'number' && value % 1 !== 0
                          ? value.toFixed(2)
                          : value;

                        return (
                          <div key={key} className="p-3 border border-border rounded-lg space-y-2">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-muted-foreground">
                                {label}
                              </span>
                              <div className="flex items-center gap-3">
                                <span className={cn("text-xs text-muted-foreground")}>
                                  {displayValue}
                                </span>
                                <span className={cn("text-lg font-bold", getScaleColor(score))}>
                                  {score}
                                </span>
                              </div>
                            </div>
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={cn("h-full transition-all", getScaleBarColor(score))}
                                style={{ width: `${(score / 20) * 100}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              };

              return (
                <div className="space-y-6">
                  {renderStatCategory("공격 지표", attackStats)}
                  {renderStatCategory("라인전/운영 지표", laneStats)}
                  {renderStatCategory("변수 창출", variableStats)}
                </div>
              );
            })()}
          </div>

          {/* 특성 */}
          {(() => {
            // ROSTER_DB에서 선수 정보 가져오기
            const teamRoster = player.teamId ? ROSTER_DB[player.teamId as keyof typeof ROSTER_DB] : null;
            
            if (!teamRoster) {
              return null;
            }
            
            // 매칭 로직: ROSTER_DB의 name(게임 닉네임)과 Player의 nickname 또는 name 매칭
            const rosterPlayer = teamRoster.roster.find(
              (p: any) => {
                const nameMatch = p.name === player.nickname || p.name === player.name;
                const positionMatch = p.role === player.position;
                return nameMatch && positionMatch && p.role !== "SUB";
              }
            );
            
            const traits = rosterPlayer?.traits || [];
            
            if (traits.length === 0) {
              return null;
            }
            
            return (
              <div className="border-t border-border pt-4">
                <h3 className="text-lg font-bold mb-4">특성</h3>
                <div className="flex flex-wrap gap-2">
                  {traits.map((traitKey: string) => {
                    const traitInfo = getTraitInfo(traitKey);
                    if (!traitInfo) return null;
                    
                    const isNegative = traitInfo.tier === "NEG";
                    const isS = traitInfo.tier === "S";
                    
                    return (
                      <Badge
                        key={traitKey}
                        variant="outline"
                        className={cn(
                          "text-xs",
                          isNegative && "border-red-400 text-red-400",
                          isS && "border-yellow-400 text-yellow-400",
                          !isNegative && !isS && "border-blue-400 text-blue-400"
                        )}
                        title={traitInfo.desc}
                      >
                        {traitInfo.name} ({traitInfo.tier})
                      </Badge>
                    );
                  })}
                </div>
                {/* 특성 설명 */}
                <div className="mt-4 space-y-2">
                  {traits.map((traitKey: string) => {
                    const traitInfo = getTraitInfo(traitKey);
                    if (!traitInfo) return null;
                    
                    return (
                      <div key={traitKey} className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{traitInfo.name}:</span> {traitInfo.desc}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
          </div>
        </div>
      </div>
    </div>
  );
}

