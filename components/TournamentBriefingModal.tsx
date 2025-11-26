"use client";

import { useGameStore } from "@/store/gameStore";
import { useUIStore } from "@/store/uiStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Trophy, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TournamentBriefingModal() {
  const { showTournamentBriefing, setShowTournamentBriefing } = useUIStore();
  const { teams, getCurrentSeasonEvent, currentTeamId, getTeamById } = useGameStore();

  if (!showTournamentBriefing) return null;

  const currentEvent = getCurrentSeasonEvent();
  const currentTeam = getTeamById(currentTeamId);

  // 대회별 참가 팀 필터링
  const getParticipatingTeams = () => {
    switch (currentEvent) {
      case "kespa":
        return teams; // KeSPA Cup: 모든 팀
      case "lck_cup":
        return teams; // LCK CUP: 모든 팀
      case "msi":
        // MSI: 상위 2팀만 (임시로 모든 팀 표시, 실제로는 순위 기반)
        return teams.slice(0, 2);
      case "worlds":
        // 월즈: 상위 3-4팀만 (임시로 모든 팀 표시)
        return teams.slice(0, 4);
      default:
        return teams; // 정규 시즌: 모든 팀
    }
  };

  const participatingTeams = getParticipatingTeams();

  const tournamentNames: Record<string, string> = {
    kespa: "KeSPA Cup",
    lck_cup: "LCK CUP",
    first_stand: "First Stand",
    msi: "MSI",
    summer: "LCK 정규 시즌",
    summer_short: "LCK 정규 시즌 (단축)",
    asian_games: "아시안게임",
    worlds_prep: "월즈 준비",
    worlds: "월즈",
    off_season: "스토브리그",
  };

  const tournamentDescriptions: Record<string, string> = {
    kespa: "프리시즌 오픈 토너먼트로 전력 점검의 무대입니다.",
    lck_cup: "피어리스 드래프트가 적용되는 별도 컵 대회입니다.",
    msi: "전 세계 각 지역 상위 팀들의 대결입니다.",
    worlds: "한 해를 마무리하는 최고 권위의 대회입니다.",
    summer: "1년 단위의 긴 호흡으로 진행되는 정규 시즌입니다.",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-3xl bg-card border-border max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Trophy className="w-6 h-6 text-yellow-400" />
              {tournamentNames[currentEvent] || "대회"} 시작
            </CardTitle>
            <button
              onClick={() => setShowTournamentBriefing(false)}
              className="p-2 hover:bg-accent rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <CardDescription>
            {tournamentDescriptions[currentEvent] || "새로운 대회가 시작됩니다."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 참가 팀 목록 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-cyber-blue" />
              <h3 className="font-semibold text-lg">참가 팀</h3>
              <Badge variant="outline" className="ml-auto">
                {participatingTeams.length}팀
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {participatingTeams.map((team) => (
                <div
                  key={team.id}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    team.id === currentTeamId
                      ? "bg-primary/10 border-primary"
                      : "bg-muted/50 border-border"
                  }`}
                >
                  <div className="font-semibold text-sm">{team.abbreviation}</div>
                  <div className="text-xs text-muted-foreground mt-1">{team.name}</div>
                  {team.id === currentTeamId && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      내 팀
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 대회 규칙 */}
          <div className="p-4 rounded-lg border border-border bg-muted/20">
            <h3 className="font-semibold mb-2">대회 규칙</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {currentEvent === "lck_cup" && (
                <li>• 피어리스 드래프트: 이전 세트에 사용한 챔피언은 다시 사용할 수 없습니다</li>
              )}
              {currentEvent === "first_stand" || currentEvent === "summer" || currentEvent === "summer_short" ? (
                <li>• 3전 2선승제 (Bo3)로 진행됩니다</li>
              ) : (
                <li>• 5전 3선승제 (Bo5)로 진행됩니다</li>
              )}
              {currentEvent === "msi" && (
                <li>• 우승 팀은 월즈 직행 티켓을 획득합니다</li>
              )}
            </ul>
          </div>

          <Button
            onClick={() => setShowTournamentBriefing(false)}
            className="w-full"
            size="lg"
          >
            대회 시작하기
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

