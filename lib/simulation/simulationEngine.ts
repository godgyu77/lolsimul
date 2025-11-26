// 시뮬레이션 엔진 핵심 로직

import { SimulationPhase, WinRateModifier } from "@/types/game";
import { getChoicesForPhase } from "./phaseChoices";

// 다음 페이즈로 진행
export function getNextPhase(currentPhase: SimulationPhase | null): SimulationPhase | null {
  if (!currentPhase) {
    return SimulationPhase.DRAFT;
  }

  switch (currentPhase) {
    case SimulationPhase.DRAFT:
      return SimulationPhase.EARLY;
    case SimulationPhase.EARLY:
      return SimulationPhase.MID;
    case SimulationPhase.MID:
      return SimulationPhase.LATE;
    case SimulationPhase.LATE:
      return SimulationPhase.END;
    case SimulationPhase.END:
      return null; // 시뮬레이션 종료
    default:
      return null;
  }
}

// 선택지 ID로 선택지 찾기
export function findChoiceById(
  choices: import("@/types/game").SimulationChoice[],
  choiceId: string
): import("@/types/game").SimulationChoice | null {
  return choices.find((choice) => choice.id === choiceId) || null;
}

// 선택지에 따른 피드백 메시지 생성
export function generateFeedbackMessage(
  choice: import("@/types/game").SimulationChoice,
  phase: SimulationPhase
): string {
  const phaseNames: Record<SimulationPhase, string> = {
    [SimulationPhase.DRAFT]: "밴픽",
    [SimulationPhase.EARLY]: "라인전",
    [SimulationPhase.MID]: "오브젝트 싸움",
    [SimulationPhase.LATE]: "장로/바론",
    [SimulationPhase.FEEDBACK]: "피드백 타임",
    [SimulationPhase.END]: "결과",
  };

  const phaseName = phaseNames[phase];
  const totalModifier = choice.modifiers.reduce((sum, mod) => sum + mod.value, 0);

  if (totalModifier > 0) {
    return `감독님의 지시로 ${choice.label} 전략이 채택되었습니다! (${phaseName} 단계 승률 +${totalModifier}%)`;
  } else if (totalModifier < 0) {
    return `감독님의 지시로 ${choice.label} 전략이 채택되었습니다. (${phaseName} 단계 승률 ${totalModifier}%)`;
  } else {
    return `감독님의 지시로 ${choice.label} 전략이 채택되었습니다.`;
  }
}

// 승률 계산 (기본 승률 + 보정치)
export function calculateWinRate(
  baseWinRate: number,
  modifiers: WinRateModifier[],
  playerTeamId: string
): number {
  let totalModifier = 0;

  // 플레이어 팀의 보정치만 합산
  modifiers.forEach((modifier) => {
    if (modifier.team === "player" || modifier.team === playerTeamId) {
      totalModifier += modifier.value;
    }
  });

  // 승률 계산 (0~100% 범위로 제한)
  const finalWinRate = baseWinRate + totalModifier;
  return Math.max(0, Math.min(100, finalWinRate));
}

// 세트 결과 결정 (승률 기반)
export function determineSetResult(
  homeTeamId: string,
  awayTeamId: string,
  playerTeamId: string,
  homeWinRate: number
): { winner: string; duration: number } {
  const random = Math.random() * 100;
  const winner = random < homeWinRate ? homeTeamId : awayTeamId;
  const duration = Math.floor(Math.random() * 20) + 25; // 25~45분

  return { winner, duration };
}

