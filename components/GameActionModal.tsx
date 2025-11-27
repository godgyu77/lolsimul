"use client";

import React, { useState, useEffect } from "react";
import { useGameStore } from "@/store/gameStore";
import { Button } from "@/components/ui/button";
import { X, Calendar, Users, ShoppingCart, Play, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface GameAction {
  id: string;
  label: string;
  command: string;
  icon?: React.ReactNode;
  variant?: "default" | "outline" | "ghost" | "destructive";
}

export default function GameActionModal() {
  const { availableActions, sendCommand, isLoading } = useGameStore();
  const [isOpen, setIsOpen] = useState(false);

  // 자동 표시 제거 - 사용자가 버튼을 눌러야만 표시됨

  const handleActionClick = async (action: GameAction) => {
    setIsOpen(false);
    await sendCommand(action.command);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // availableActions가 비어있으면 모달을 표시하지 않음
  if (availableActions.length === 0 || !isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <Card className="w-full max-w-[500px] mx-4 bg-card border-border shadow-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent">
              다음 행동을 선택하세요
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-2">
            {availableActions.map((action) => (
              <Button
                key={action.id}
                onClick={() => handleActionClick(action)}
                variant={action.variant || "outline"}
                className="w-full justify-start gap-3 h-auto py-3 px-4"
                disabled={isLoading}
              >
                {action.icon || <ArrowRight className="w-4 h-4" />}
                <span className="flex-1 text-left">{action.label}</span>
              </Button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              또는 우측 채팅창에 명령어를 직접 입력할 수 있습니다
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

