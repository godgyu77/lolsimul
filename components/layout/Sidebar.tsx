"use client";

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
import { cn } from "@/lib/utils";
import { useUIStore, ViewType } from "@/store/uiStore";

const menuItems: Array<{ view: ViewType; label: string; icon: typeof Home }> = [
  { view: "HOME", label: "홈", icon: Home },
  { view: "TEAM", label: "팀 관리", icon: Users },
  { view: "MATCH", label: "경기", icon: Trophy },
  { view: "NEWS", label: "뉴스", icon: Newspaper },
  { view: "STATS", label: "통계", icon: BarChart3 },
  { view: "FA", label: "FA 명단", icon: ShoppingCart },
  { view: "SETTINGS", label: "설정", icon: Settings },
];

export default function Sidebar() {
  const { currentView, setCurrentView, isMobileMenuOpen, setIsMobileMenuOpen } = useUIStore();

  const handleMenuClick = (view: ViewType) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* 모바일 오버레이 */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 lg:flex-shrink-0 bg-card border-r border-border flex flex-col transform transition-transform duration-300 ease-in-out",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* 로고/제목 영역 */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent">
            LCK Manager
          </h2>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-2 hover:bg-accent rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 메뉴 네비게이션 */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.view;

            return (
              <button
                key={item.view}
                onClick={() => handleMenuClick(item.view)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* 뉴스/알림 영역 (추후 확장) */}
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground">
            최신 뉴스가 여기에 표시됩니다
          </div>
        </div>
      </aside>
    </>
  );
}

