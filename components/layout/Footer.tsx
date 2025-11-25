"use client";

import { Play, Pause, SkipForward } from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { Button } from "@/components/ui/button";

export default function Footer() {
  const { isPaused, togglePause, advanceDay } = useGameStore();

  return (
    <footer className="h-20 bg-card border-t border-border px-6 flex items-center justify-between">
      {/* 좌측: 게임 속도/상태 */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">게임 속도</span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={togglePause}
            className="gap-2"
          >
            {isPaused ? (
              <>
                <Play className="w-4 h-4" />
                재개
              </>
            ) : (
              <>
                <Pause className="w-4 h-4" />
                일시정지
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={advanceDay}
            className="gap-2"
          >
            <SkipForward className="w-4 h-4" />
            하루 진행
          </Button>
        </div>
      </div>

      {/* 우측: 추가 액션 버튼들 (추후 확장) */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          추가 액션 버튼 영역
        </span>
      </div>
    </footer>
  );
}

