"use client";

import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { useUIStore } from "@/store/uiStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Trophy, Play, FastForward, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import PreMatchModal from "@/components/PreMatchModal";
import { startInteractiveSimulation } from "@/lib/simulation/engine";

export default function MatchScheduleView() {
  const { 
    currentTeamId, 
    currentDate, 
    scheduledMatches, 
    upcomingMatches: storeUpcomingMatches, 
    getTeamById,
    currentMatch,
    simulateOneSet,
    simulateMatchUntilEnd,
    simulateTournament,
    setCurrentMatch,
  } = useGameStore();
  const { setPendingMatchId: setUIPendingMatchId, setShowPreMatchModal: setUIShowPreMatchModal } = useUIStore();
  const [selectedDate, setSelectedDate] = useState(currentDate);

  // 다가오는 경기 (gameStore.upcomingMatches 우선, 없으면 scheduledMatches에서 필터링)
  // currentDate 이후의 경기만 표시
  const today = new Date(currentDate);
  today.setHours(0, 0, 0, 0);
  
  const upcomingMatches = storeUpcomingMatches.length > 0
    ? storeUpcomingMatches
        .filter((m) => {
          const matchDate = new Date(m.date);
          matchDate.setHours(0, 0, 0, 0);
          return m.status === "scheduled" && matchDate >= today;
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, 10)
    : scheduledMatches
        .filter((m) => {
          const matchDate = new Date(m.date);
          matchDate.setHours(0, 0, 0, 0);
          return m.status === "scheduled" && matchDate >= today;
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, 10);

  // 달력 관련 함수들
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const monthNames = [
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월"
  ];

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  // 날짜에 경기가 있는지 확인 (scheduledMatches와 upcomingMatches 모두 확인)
  const hasMatchOnDate = (day: number) => {
    const date = new Date(year, month, day);
    const allMatches = [...scheduledMatches, ...storeUpcomingMatches];
    return allMatches.some((m) => {
      const matchDate = new Date(m.date);
      return (
        matchDate.getFullYear() === date.getFullYear() &&
        matchDate.getMonth() === date.getMonth() &&
        matchDate.getDate() === date.getDate()
      );
    });
  };

  // 이전/다음 달 이동
  const goToPreviousMonth = () => {
    setSelectedDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setSelectedDate(new Date(year, month + 1, 1));
  };

  // D-Day 계산 (currentDate 기준)
  const getDDay = (date: Date) => {
    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // 경기 타입 이름
  const matchTypeNames: Record<string, string> = {
    regular: "정규",
    lck_cup: "LCK CUP",
    playoff: "플레이오프",
    msi: "MSI",
    worlds: "월즈",
  };

  // 현재 진행 중인 경기
  const isMatchInProgress = currentMatch && currentMatch.status === "in_progress";

  const handleSimulationControl = (mode: "one_set" | "match" | "tournament") => {
    if (!currentMatch) return;

    if (mode === "one_set") {
      simulateOneSet(currentMatch.id);
    } else if (mode === "match") {
      simulateMatchUntilEnd(currentMatch.id);
    } else {
      simulateTournament();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent mb-2">
          경기 일정
        </h1>
        <p className="text-muted-foreground">
          다가오는 경기 일정을 확인하세요.
        </p>
      </div>

      {/* 현재 진행 중인 경기 */}
      {isMatchInProgress && currentMatch && (
        <Card className="bg-card border-border border-2 border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-cyber-blue animate-pulse" />
              경기 진행 중
            </CardTitle>
            <CardDescription>현재 경기의 시뮬레이션을 제어할 수 있습니다</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 경기 정보 */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
                <div>
                  <div className="font-semibold text-lg">
                    {getTeamById(currentMatch.homeTeamId)?.abbreviation} vs{" "}
                    {getTeamById(currentMatch.awayTeamId)?.abbreviation}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {currentMatch.homeScore || 0} - {currentMatch.awayScore || 0}
                  </div>
                </div>
                <Badge variant="outline">
                  {matchTypeNames[currentMatch.matchType] || currentMatch.matchType}
                </Badge>
              </div>

              {/* 시뮬레이션 제어 버튼 */}
              <div className="grid grid-cols-3 gap-3">
                <Button
                  onClick={() => handleSimulationControl("one_set")}
                  variant="default"
                  className="h-auto py-4 flex flex-col items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  <div className="font-semibold">1세트 진행</div>
                  <div className="text-xs text-muted-foreground">1세트만 시뮬레이션</div>
                </Button>
                <Button
                  onClick={() => handleSimulationControl("match")}
                  variant="default"
                  className="h-auto py-4 flex flex-col items-center gap-2"
                >
                  <FastForward className="w-5 h-5" />
                  <div className="font-semibold">매치 종료까지</div>
                  <div className="text-xs text-muted-foreground">경기 끝까지 진행</div>
                </Button>
                <Button
                  onClick={() => handleSimulationControl("tournament")}
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2"
                >
                  <SkipForward className="w-5 h-5" />
                  <div className="font-semibold">대회 전체 진행</div>
                  <div className="text-xs text-muted-foreground">고속 진행</div>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PreMatchModal */}
      <PreMatchModal />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 달력 */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyber-blue" />
                {year}년 {monthNames[month]}
              </CardTitle>
              <div className="flex gap-2">
                <button
                  onClick={goToPreviousMonth}
                  className="px-3 py-1 rounded hover:bg-muted transition-colors"
                >
                  ←
                </button>
                <button
                  onClick={goToNextMonth}
                  className="px-3 py-1 rounded hover:bg-muted transition-colors"
                >
                  →
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {/* 요일 헤더 */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-semibold text-muted-foreground py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* 날짜 그리드 */}
              <div className="grid grid-cols-7 gap-1">
                {/* 빈 칸 (첫 주 시작 전) */}
                {Array.from({ length: startingDayOfWeek }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="aspect-square" />
                ))}

                {/* 날짜 칸 */}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const day = idx + 1;
                  const date = new Date(year, month, day);
                  const isToday =
                    date.toDateString() === currentDate.toDateString();
                  const hasMatch = hasMatchOnDate(day);

                  return (
                    <button
                      key={day}
                      className={cn(
                        "aspect-square rounded border transition-colors text-sm",
                        isToday
                          ? "bg-primary text-primary-foreground border-primary"
                          : hasMatch
                          ? "bg-cyber-blue/20 border-cyber-blue hover:bg-cyber-blue/30"
                          : "border-border hover:bg-muted",
                        "flex flex-col items-center justify-center"
                      )}
                    >
                      <span className={cn(isToday && "font-bold")}>
                        {day}
                      </span>
                      {hasMatch && (
                        <span className="text-[8px] text-cyber-blue">●</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 다가오는 경기 리스트 */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-cyber-purple" />
              다가오는 경기
            </CardTitle>
            <CardDescription>예정된 경기 일정</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingMatches.length > 0 ? (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {upcomingMatches.map((match) => {
                  const homeTeam = getTeamById(match.homeTeamId);
                  const awayTeam = getTeamById(match.awayTeamId);
                  const isHome = match.homeTeamId === currentTeamId;
                  const opponent = isHome ? awayTeam : homeTeam;
                  const dDay = getDDay(match.date);

                  return (
                    <div
                      key={match.id}
                      className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {matchTypeNames[match.matchType] || match.matchType}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              D-{dDay > 0 ? dDay : "Day"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex-1">
                              <p className="font-semibold text-lg">
                                {isHome ? "홈" : "원정"} vs{" "}
                                {opponent?.abbreviation || opponent?.name || "TBD"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>
                              {match.date.toLocaleDateString("ko-KR", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                weekday: "short",
                              })}
                            </span>
                          </div>
                          {/* 경기 시작 버튼 (내 팀 경기만) */}
                          {(match.homeTeamId === currentTeamId || match.awayTeamId === currentTeamId) && (
                            <Button
                              onClick={() => {
                                setUIPendingMatchId(match.id);
                                setUIShowPreMatchModal(true);
                              }}
                              size="sm"
                              variant="default"
                              className="mt-2"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              경기 시작
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                예정된 경기가 없습니다
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
