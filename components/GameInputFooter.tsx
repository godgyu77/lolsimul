"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Command, Menu, X, ArrowRight, Newspaper, Settings } from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import GameMenuModal from "@/components/GameMenuModal";
import NewsModal from "@/components/NewsModal";
import SettingsModal from "@/components/SettingsModal";

export default function GameInputFooter() {
  const { apiKey, sendCommand, isLoading, availableActions } = useGameStore();
  const [input, setInput] = useState("");
  const [showActionModal, setShowActionModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = useCallback(async (command?: string) => {
    const commandToSend = command || input.trim();
    if (!commandToSend || isLoading || !apiKey) return;

    setInput("");
    try {
      await sendCommand(commandToSend);
    } catch (error) {
      console.error("명령 실행 오류:", error);
    }
  }, [input, isLoading, apiKey, sendCommand]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // 메인 화면 클릭 시 모달 닫기 이벤트 리스너
  useEffect(() => {
    const footer = document.querySelector('[data-footer-container]');
    const handleClose = () => {
      setShowActionModal(false);
    };
    if (footer) {
      footer.addEventListener('close-action-modal', handleClose);
      return () => {
        footer.removeEventListener('close-action-modal', handleClose);
      };
    }
  }, []);

  return (
    <>
      {/* 입력 영역 - Full-width footer */}
      <div 
        className="w-full flex-shrink-0 relative bg-card/95 backdrop-blur-sm border-t border-border z-10"
        data-footer-container
      >
        <div className="flex items-center justify-center">
          <div className="w-full max-w-[1200px] p-2 sm:p-3 md:p-4 relative">
            <div className="flex gap-1.5 sm:gap-2 items-end relative flex-wrap sm:flex-nowrap">
              {/* 작전지시 버튼 (항상 표시) */}
              <div className="relative">
                <Button
                  onClick={() => setShowActionModal((prev) => !prev)}
                  variant="outline"
                  size="icon"
                  className={cn(
                    "shrink-0 h-12 w-12 sm:h-11 sm:w-11 md:h-10 md:w-10 mb-0 touch-manipulation border-cyber-blue/50 hover:bg-cyber-blue/20 hover:border-cyber-blue transition-all duration-200 active:scale-95",
                    showActionModal && "bg-cyber-blue/30 border-cyber-blue"
                  )}
                  title="작전지시"
                >
                  <Command className="w-5 h-5 sm:w-4.5 sm:h-4.5 md:w-4 md:h-4 text-cyber-blue" />
                </Button>
                
                {/* 작전지시 모달 (버튼 바로 위에 표시) */}
                {showActionModal && (
                  <div data-action-modal data-open={showActionModal ? 'true' : 'false'}>
                    {/* 배경 오버레이 (외부 클릭 시 닫기) - 투명하게 처리하여 메인 화면 클릭 가능 */}
                    <div 
                      className="fixed inset-0 z-[100] bg-transparent transition-opacity duration-200"
                      onClick={() => setShowActionModal(false)}
                    />
                    {/* PC: 버튼 바로 위, 모바일: 화면 하단 중앙 */}
                    <div 
                      className={cn(
                        "fixed z-[101]",
                        // PC: 작전지시 버튼 바로 위에 배치
                        "lg:absolute lg:bottom-full lg:left-0 lg:mb-2",
                        "lg:w-[400px] lg:max-w-[calc(100vw-2rem)]",
                        // 모바일: 화면 하단 중앙
                        "bottom-0 left-0 right-0",
                        "max-h-[60vh] sm:max-h-[70vh] overflow-y-auto",
                        // 모바일에서 하단 탭 메뉴 높이만큼 여백 추가
                        "pb-16 lg:pb-0",
                        // 애니메이션
                        "lg:slide-down-enter slide-up-enter"
                      )}
                      onClick={(e) => {
                        // 모달 컨텐츠 클릭 시 이벤트 전파 방지
                        e.stopPropagation();
                      }}
                    >
                      <Card className="bg-card border-border shadow-2xl rounded-t-2xl lg:rounded-lg transition-all duration-200 hover:shadow-cyber-blue/20">
                        <CardContent className="p-4 sm:p-5">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent">
                              작전지시
                            </h3>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setShowActionModal(false)}
                              className="h-8 w-8 sm:h-9 sm:w-9"
                            >
                              <X className="w-5 h-5" />
                            </Button>
                          </div>
                          <div className="space-y-2 sm:space-y-3">
                            {/* 일정 진행 버튼 (항상 최상단에 고정 표시) */}
                            <Button
                              onClick={async () => {
                                setShowActionModal(false);
                                await sendCommand("일정 진행");
                              }}
                              className="w-full justify-start gap-2 sm:gap-3 h-auto py-3 sm:py-3.5 px-4 text-sm sm:text-base bg-orange-500/20 hover:bg-orange-500/30 border-2 border-orange-500/50 hover:border-orange-500 text-orange-300 font-semibold active:bg-orange-500/40 active:scale-[0.98] transition-all duration-200 touch-manipulation shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30"
                              disabled={isLoading}
                            >
                              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                              <span className="flex-1 text-left">일정 진행</span>
                            </Button>
                            
                            {/* 구분선 (다른 액션이 있을 때만 표시) */}
                            {availableActions.length > 0 && (
                              <div className="border-t-2 border-orange-500/30 my-3" />
                            )}
                            
                            {/* 나머지 액션 버튼들 (일정 진행 제외) */}
                            {availableActions
                              .filter((action) => 
                                !action.label.includes("일정 진행") && 
                                !action.label.includes("하루 진행") &&
                                !action.command.includes("일정 진행") &&
                                !action.command.includes("하루 진행")
                              )
                              .map((action) => (
                                <Button
                                  key={action.id}
                                  onClick={async () => {
                                    setShowActionModal(false);
                                    await sendCommand(action.command);
                                  }}
                                  variant="outline"
                                  className="w-full justify-start gap-1.5 sm:gap-2 md:gap-3 h-auto py-2.5 sm:py-3 md:py-3.5 px-3 sm:px-4 text-xs sm:text-sm md:text-base hover:bg-primary/20 hover:border-primary/50 active:bg-primary/30 active:scale-[0.98] transition-all duration-200 touch-manipulation"
                                  disabled={isLoading}
                                >
                                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                  <span className="flex-1 text-left">{action.label}</span>
                                </Button>
                              ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </div>
              
              {/* 게임 정보 버튼 (작전지시 버튼 우측 옆에 배치) */}
              <Button
                onClick={() => setShowMenuModal((prev) => !prev)}
                variant="outline"
                size="icon"
                className={cn(
                  "shrink-0 h-12 w-12 sm:h-11 sm:w-11 md:h-10 md:w-10 mb-0 touch-manipulation border-cyber-blue/50 hover:bg-cyber-blue/20 hover:border-cyber-blue transition-all duration-200 active:scale-95",
                  showMenuModal && "bg-cyber-blue/30 border-cyber-blue"
                )}
                title="게임 정보"
              >
                <Menu className="w-5 h-5 sm:w-4.5 sm:h-4.5 md:w-4 md:h-4 text-cyber-blue" />
              </Button>
              
              {/* 뉴스 버튼 (메뉴 버튼 우측 옆에 배치) */}
              <Button
                onClick={() => setShowNewsModal((prev) => !prev)}
                variant="outline"
                size="icon"
                className={cn(
                  "shrink-0 h-12 w-12 sm:h-11 sm:w-11 md:h-10 md:w-10 mb-0 touch-manipulation border-cyber-purple/50 hover:bg-cyber-purple/20 hover:border-cyber-purple transition-all duration-200 active:scale-95",
                  showNewsModal && "bg-cyber-purple/30 border-cyber-purple"
                )}
                title="뉴스"
              >
                <Newspaper className="w-5 h-5 sm:w-4.5 sm:h-4.5 md:w-4 md:h-4 text-cyber-purple" />
              </Button>
              
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="명령어 입력..."
                className="flex-1 min-w-0 px-2.5 sm:px-3 md:px-4 py-2.5 sm:py-2.5 md:py-2.5 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-blue/50 focus:border-cyber-blue text-sm sm:text-sm md:text-sm font-medium text-foreground placeholder:text-muted-foreground/60 touch-manipulation transition-all duration-200 hover:border-cyber-blue/30"
                disabled={isLoading || !apiKey}
              />
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading || !apiKey}
                size="icon"
                className="shrink-0 h-12 w-12 sm:h-11 sm:w-11 md:h-10 md:w-10 bg-gradient-to-r from-cyber-blue to-cyber-purple hover:from-cyber-blue/90 hover:to-cyber-purple/90 border-0 shadow-lg shadow-cyber-blue/20 touch-manipulation transition-all duration-200 active:scale-95 hover:shadow-cyber-blue/30"
              >
                <Send className="w-5 h-5 sm:w-4.5 sm:h-4.5 md:w-4 md:h-4" />
              </Button>
              
              {/* 설정 버튼 (전송 버튼 오른쪽 옆에 배치) */}
              <Button
                onClick={() => setShowSettingsModal((prev) => !prev)}
                variant="outline"
                size="icon"
                className={cn(
                  "shrink-0 h-12 w-12 sm:h-11 sm:w-11 md:h-10 md:w-10 mb-0 touch-manipulation border-cyber-green/50 hover:bg-cyber-green/20 hover:border-cyber-green transition-all duration-200 active:scale-95",
                  showSettingsModal && "bg-cyber-green/30 border-cyber-green"
                )}
                title="설정"
              >
                <Settings className="w-5 h-5 sm:w-4.5 sm:h-4.5 md:w-4 md:h-4 text-cyber-green" />
              </Button>
            </div>
            {!apiKey && (
              <p className="text-xs text-muted-foreground mt-2">
                API 키가 필요합니다.
              </p>
            )}
          </div>
        </div>
      </div>


      {/* 통합 메뉴 모달 */}
      <GameMenuModal
        isOpen={showMenuModal}
        onClose={() => setShowMenuModal(false)}
      />
      
      {/* 뉴스 모달 */}
      <NewsModal
        isOpen={showNewsModal}
        onClose={() => setShowNewsModal(false)}
      />
      
      {/* 설정 모달 */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </>
  );
}

