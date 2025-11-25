"use client";

import { useGameStore } from "@/store/gameStore";
import { Button } from "@/components/ui/button";
import { Calendar, Users, ShoppingCart } from "lucide-react";

export default function ActionFooter() {
  const { sendCommand } = useGameStore();

  const handleSchedule = () => {
    // 일정 진행 명령어 전송
    sendCommand("일정 진행해줘");
  };

  const handleRoster = () => {
    // 로스터 관리 명령어 전송
    sendCommand("로스터 변경할래");
  };

  const handleFAMarket = () => {
    // FA 시장 명령어 전송
    sendCommand("FA 시장 보여줘");
  };

  return (
    <div className="sticky bottom-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSchedule}
            variant="default"
            className="gap-2"
          >
            <Calendar className="w-4 h-4" />
            일정 진행
          </Button>
          <Button
            onClick={handleRoster}
            variant="outline"
            className="gap-2"
          >
            <Users className="w-4 h-4" />
            로스터 관리
          </Button>
          <Button
            onClick={handleFAMarket}
            variant="outline"
            className="gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            FA 시장
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">
          하단 액션 바
        </div>
      </div>
    </div>
  );
}

