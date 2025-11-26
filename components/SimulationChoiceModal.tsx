"use client";

import { useGameStore } from "@/store/gameStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { submitDecision } from "@/lib/simulation/engine";

export default function SimulationChoiceModal() {
  const { simulationState, currentMatch, getTeamById } = useGameStore();

  // 유저 입력 대기 중이 아니거나 선택지가 없으면 모달 표시 안 함
  if (!simulationState.isWaitingForUser || simulationState.currentChoices.length === 0) {
    return null;
  }

  const phaseLabels: Record<string, string> = {
    DRAFT: "밴픽 단계",
    EARLY: "라인전 단계",
    MID: "오브젝트 싸움",
    LATE: "장로/바론 단계",
    FEEDBACK: "피드백 타임",
  };

  const currentPhase = simulationState.currentPhase;
  const phaseLabel = currentPhase ? phaseLabels[currentPhase] || "전략 선택" : "전략 선택";

  const handleChoiceClick = (choiceId: string) => {
    submitDecision(choiceId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <AlertCircle className="w-6 h-6 text-cyber-blue" />
            {phaseLabel} - 전략 선택
          </CardTitle>
          <CardDescription>
            다음 단계를 위한 전략을 선택하세요. 선택한 전략은 승률에 영향을 미칩니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {simulationState.currentChoices.map((choice) => (
            <Button
              key={choice.id}
              onClick={() => handleChoiceClick(choice.id)}
              variant="outline"
              className="w-full h-auto py-6 flex flex-col items-start gap-2 text-left hover:bg-primary/10 hover:border-primary transition-colors"
            >
              <div className="flex items-center justify-between w-full">
                <div className="font-semibold text-lg">{choice.label}</div>
                <div className="flex gap-2">
                  {choice.modifiers.map((modifier, idx) => (
                    <span
                      key={idx}
                      className={`text-xs px-2 py-1 rounded ${
                        modifier.value > 0
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {modifier.value > 0 ? "+" : ""}
                      {modifier.value}%
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">{choice.description}</div>
              <div className="text-xs text-muted-foreground mt-1">
                효과: {choice.modifiers.map((m) => m.description).join(", ")}
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

