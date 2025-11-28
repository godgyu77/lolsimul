"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGameStore } from "@/store/gameStore";
import PlayerRosterTable from "@/components/PlayerRosterTable";
import StaffTable from "@/components/StaffTable";
import PlayerDetailModal from "@/components/PlayerDetailModal";
import { Users, Users2, Briefcase } from "lucide-react";
import { Player, PlayerInfo } from "@/types";

export default function TeamManagementView() {
  const { rosters, currentTeamId, getTeamById, currentDate } = useGameStore();
  
  // 날짜 동기화: currentDate가 변경되면 자동으로 리렌더링되어 최신 데이터 표시
  // currentDate를 의존성으로 사용하여 날짜 변경 시 자동 업데이트
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  const currentTeam = getTeamById(currentTeamId);

  // Player를 PlayerInfo로 변환하는 함수
  const convertPlayerToPlayerInfo = (player: Player): PlayerInfo => {
    // 종합 능력치 계산
    const stats = player.stats;
    const overall = Math.round(
      (stats.라인전 +
        stats.한타 +
        stats.운영 +
        stats.피지컬 +
        stats.챔프폭 +
        stats.멘탈) /
        6
    );

    return {
      id: player.id,
      name: player.name,
      nickname: player.nickname,
      position: player.position,
      age: player.age,
      tier: player.tier,
      overall,
      salary: player.salary,
      contractEndsAt: player.contractEndsAt,
      teamId: player.teamId,
      division: player.division,
    };
  };

  // 현재 팀의 로스터를 1군/2군으로 분리
  const { team1Players, team2Players } = useMemo(() => {
    if (!currentTeam) {
      return { team1Players: [], team2Players: [] };
    }

    const team1 = currentTeam.roster
      .filter((p) => p.division === "1군")
      .map(convertPlayerToPlayerInfo);
    
    const team2 = currentTeam.roster
      .filter((p) => p.division === "2군")
      .map(convertPlayerToPlayerInfo);

    return {
      team1Players: team1,
      team2Players: team2,
    };
  }, [currentTeam]);

  // rosters에 데이터가 있으면 우선 사용, 없으면 currentTeam에서 가져온 데이터 사용
  // 2군은 division 필터를 추가로 적용하여 확실하게 2군만 표시
  const displayTeam1 = rosters.team1.length > 0 
    ? rosters.team1.filter(p => p.division === "1군" || !p.division)
    : team1Players;
  const displayTeam2 = rosters.team2.length > 0 
    ? rosters.team2.filter(p => p.division === "2군")
    : team2Players;

  const handlePlayerClick = (playerId: string) => {
    setSelectedPlayerId(playerId);
  };

  const handleStaffClick = (staffId: string) => {
    setSelectedStaffId(staffId);
    console.log("스태프 클릭:", staffId);
    // TODO: StaffDetailModal 열기
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent mb-2">
          팀 관리
        </h1>
        <p className="text-muted-foreground">
          로스터와 코칭스태프를 관리하세요.
        </p>
      </div>

      <Tabs defaultValue="team1" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="team1" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            1군
          </TabsTrigger>
          <TabsTrigger value="team2" className="flex items-center gap-2">
            <Users2 className="w-4 h-4" />
            2군
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            코칭스태프
          </TabsTrigger>
        </TabsList>

        <TabsContent value="team1" className="mt-6">
          {currentTeam ? (
            <PlayerRosterTable
              players={displayTeam1}
              onPlayerClick={handlePlayerClick}
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              팀을 선택해주세요.
            </div>
          )}
        </TabsContent>

        <TabsContent value="team2" className="mt-6">
          {currentTeam ? (
            <PlayerRosterTable
              players={displayTeam2}
              onPlayerClick={handlePlayerClick}
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              팀을 선택해주세요.
            </div>
          )}
        </TabsContent>

        <TabsContent value="staff" className="mt-6">
          <StaffTable
            staff={rosters.staff}
            onStaffClick={handleStaffClick}
          />
        </TabsContent>
      </Tabs>

      {/* 선수 상세 모달 */}
      <PlayerDetailModal
        playerId={selectedPlayerId}
        isOpen={!!selectedPlayerId}
        onClose={() => setSelectedPlayerId(null)}
      />
    </div>
  );
}
