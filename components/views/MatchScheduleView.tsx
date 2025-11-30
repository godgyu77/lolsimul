"use client";

import { useState, useEffect } from "react";
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
    currentDate, // Zustand store에서 직접 구독하여 자동 업데이트 보장
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
  const [clickedDate, setClickedDate] = useState<Date | null>(null);
  
  // currentDate가 변경되면 selectedDate도 동기화 (사용자가 직접 선택한 경우는 제외)
  // 단, 같은 월/년도이면 selectedDate를 유지 (사용자가 다른 달을 보고 있을 수 있음)
  useEffect(() => {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = selectedDate.getMonth();
    
    // currentDate와 selectedDate가 다른 월/년도이면 currentDate로 동기화
    // (사용자가 이전 달을 보고 있지 않은 경우)
    if (currentYear !== selectedYear || currentMonth !== selectedMonth) {
      // 현재 달력이 표시하는 달이 currentDate와 다르면 동기화
      setSelectedDate(new Date(currentDate));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]); // currentDate가 변경될 때마다 실행 (selectedDate는 의존성에서 제외하여 무한 루프 방지)

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

  // 미래 일정 생성 (12월 전지훈련, 1월 LCK Cup)
  const generateFutureEvents = () => {
    const events: Array<{ date: Date; type: string; label: string }> = [];
    const currentYear = currentDate.getFullYear();
    
    // 12월: 전지훈련 (Bootcamp)
    if (year === currentYear && month === 11) {
      events.push({
        date: new Date(currentYear, 11, 15),
        type: "bootcamp",
        label: "전지훈련 (Bootcamp)"
      });
    }
    
    // 1월: LCK Cup (Winter) - 랜덤 대진표 생성
    if (year === currentYear + 1 && month === 0) {
      // 1월 첫 주부터 매주 경기 생성
      for (let week = 0; week < 4; week++) {
        const matchDate = new Date(currentYear + 1, 0, 7 + week * 7);
        events.push({
          date: matchDate,
          type: "lck_cup",
          label: "LCK CUP (Winter)"
        });
      }
    }
    
    return events;
  };

  const futureEvents = generateFutureEvents();

  // 날짜에 경기가 있는지 확인 (scheduledMatches, upcomingMatches, futureEvents 모두 확인)
  const hasMatchOnDate = (day: number) => {
    const date = new Date(year, month, day);
    const allMatches = [...scheduledMatches, ...storeUpcomingMatches];
    const hasScheduledMatch = allMatches.some((m) => {
      const matchDate = new Date(m.date);
      return (
        matchDate.getFullYear() === date.getFullYear() &&
        matchDate.getMonth() === date.getMonth() &&
        matchDate.getDate() === date.getDate()
      );
    });
    
    const hasFutureEvent = futureEvents.some((e) => {
      return (
        e.date.getFullYear() === date.getFullYear() &&
        e.date.getMonth() === date.getMonth() &&
        e.date.getDate() === date.getDate()
      );
    });
    
    return hasScheduledMatch || hasFutureEvent;
  };

  // 선택된 날짜의 경기 목록 가져오기
  const getMatchesOnDate = (day: number) => {
    const date = new Date(year, month, day);
    const allMatches = [...scheduledMatches, ...storeUpcomingMatches].filter((m) => {
      const matchDate = new Date(m.date);
      return (
        matchDate.getFullYear() === date.getFullYear() &&
        matchDate.getMonth() === date.getMonth() &&
        matchDate.getDate() === date.getDate()
      );
    });
    
    const eventsOnDate = futureEvents.filter((e) => {
      return (
        e.date.getFullYear() === date.getFullYear() &&
        e.date.getMonth() === date.getMonth() &&
        e.date.getDate() === date.getDate()
      );
    });
    
    return { matches: allMatches, events: eventsOnDate };
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
                  const isClicked = clickedDate && date.toDateString() === clickedDate.toDateString();

                  return (
                    <button
                      key={day}
                      onClick={() => hasMatch && setClickedDate(date)}
                      className={cn(
                        "aspect-square rounded border transition-colors text-sm",
                        isToday
                          ? "bg-primary text-primary-foreground border-primary"
                          : isClicked
                          ? "bg-cyber-purple/30 border-cyber-purple"
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

        {/* 다가오는 경기 리스트 / 선택된 날짜의 경기 */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-cyber-purple" />
              {clickedDate ? "선택된 날짜의 경기" : "다가오는 경기"}
            </CardTitle>
            <CardDescription>
              {clickedDate 
                ? clickedDate.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })
                : "예정된 경기 일정"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              // 클릭된 날짜가 있으면 해당 날짜의 경기만 표시
              const displayMatches = clickedDate 
                ? getMatchesOnDate(clickedDate.getDate()).matches
                : upcomingMatches;
              
              const displayEvents = clickedDate
                ? getMatchesOnDate(clickedDate.getDate()).events
                : [];

              if (displayMatches.length === 0 && displayEvents.length === 0) {
                return (
                  <div className="text-center py-8 text-muted-foreground">
                    {clickedDate ? "해당 날짜에 예정된 경기가 없습니다." : "예정된 경기가 없습니다"}
                  </div>
                );
              }

              return (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {/* 이벤트 표시 */}
                  {displayEvents.map((event, idx) => (
                    <div
                      key={`event-${idx}`}
                      className="p-4 rounded-lg border border-cyber-blue bg-cyber-blue/10"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs border-cyber-blue text-cyber-blue">
                          {event.type === "bootcamp" ? "전지훈련" : "LCK CUP"}
                        </Badge>
                      </div>
                      <div className="font-semibold text-lg">{event.label}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {event.date.toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          weekday: "short",
                        })}
                      </div>
                    </div>
                  ))}
                  
                  {/* 경기 표시 */}
                  {displayMatches.map((match) => {
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
              );
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
