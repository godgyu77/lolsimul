"use client";

import { Button } from "@/components/ui/button";
import {
  Home,
  Users,
  Trophy,
  Newspaper,
  Settings,
  BarChart3,
  ShoppingCart,
  X,
} from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { cn } from "@/lib/utils";

type MenuViewType =
  | "HOME"
  | "TEAM"
  | "MATCH"
  | "NEWS"
  | "STATS"
  | "FA"
  | "SETTINGS"
  | null;

interface GameMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems: Array<{
  view: MenuViewType;
  label: string;
  icon: typeof Home;
  description: string;
}> = [
  { view: "HOME", label: "홈", icon: Home, description: "대시보드 및 개요" },
  {
    view: "TEAM",
    label: "팀 관리",
    icon: Users,
    description: "로스터 및 코칭스태프 관리",
  },
  {
    view: "MATCH",
    label: "경기 일정",
    icon: Trophy,
    description: "경기 일정 및 결과 확인",
  },
  {
    view: "NEWS",
    label: "뉴스",
    icon: Newspaper,
    description: "최신 뉴스 및 소식",
  },
  {
    view: "STATS",
    label: "리그 통계",
    icon: BarChart3,
    description: "팀 및 선수 통계",
  },
  {
    view: "FA",
    label: "FA 명단",
    icon: ShoppingCart,
    description: "자유계약선수 시장",
  },
];

// 메뉴 항목별 명령어 매핑
const menuCommands: Record<MenuViewType, string> = {
  HOME: "대시보드 보여줘",
  TEAM: "팀 관리 보여줘",
  MATCH: "경기 일정 보여줘",
  NEWS: "뉴스 보여줘",
  STATS: "리그 통계 보여줘",
  FA: "FA 명단 보여줘",
  SETTINGS: "", // 설정은 별도 처리
  null: "",
};

export default function GameMenuModal({
  isOpen,
  onClose,
}: GameMenuModalProps) {
  const { gameMode, currentDate, getCurrentSeasonEvent, sendCommand } = useGameStore();

  if (!isOpen) return null;

  const handleMenuClick = async (view: MenuViewType) => {
    // 명령어 가져오기
    const command = menuCommands[view];
    if (command) {
      // 명령어 전송
      await sendCommand(command);
      // 모달 닫기
      onClose();
    }
  };

  // 게임 모드에 따른 안내 텍스트
  const getModeDescription = () => {
    if (gameMode === "MANAGER") {
      return "감독 모드: 팀 전체를 관리하고 전략을 수립합니다. 로스터 관리, 전술 수립, 자금 관리가 가능합니다.";
    } else if (gameMode === "PLAYER") {
      return "선수 커리어 모드: 개인 성장과 경기 출전에 집중합니다. 2군에서 시작하여 1군 콜업을 목표로 합니다.";
    }
    return "";
  };

  // 게임 모드에 따른 메뉴 항목 필터링 (선수 모드에서는 일부 메뉴 제한)
  const getFilteredMenuItems = () => {
    if (gameMode === "PLAYER") {
      // 선수 모드에서는 팀 관리 메뉴를 제한적으로 표시
      return menuItems.map((item) => {
        if (item.view === "TEAM") {
          return {
            ...item,
            description: "내 정보 및 팀 로스터 확인",
          };
        }
        return item;
      });
    }
    return menuItems;
  };

  // 날짜 포맷팅
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-lg w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent">
              게임 정보
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {getModeDescription()}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* 현재 날짜 및 이벤트 표시 */}
            <div className="text-sm text-muted-foreground flex flex-col items-end">
              <div>
                현재 날짜: <span className="font-semibold text-foreground">{formatDate(currentDate)}</span>
              </div>
              {getCurrentSeasonEvent() && (
                <div className="text-xs mt-1">
                  이벤트: <span className="font-semibold text-cyber-blue">{getCurrentSeasonEvent()}</span>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 메뉴 목록 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getFilteredMenuItems().map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.view}
                  onClick={() => handleMenuClick(item.view)}
                  className={cn(
                    "h-auto p-6 flex flex-col items-start gap-3 bg-gradient-to-br from-cyber-blue/10 to-cyber-purple/10 hover:from-cyber-blue/20 hover:to-cyber-purple/20 border-2 border-cyber-blue/30 hover:border-cyber-blue transition-all"
                  )}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-12 h-12 rounded-lg bg-cyber-blue/20 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-cyber-blue" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-lg font-bold text-foreground">
                        {item.label}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

