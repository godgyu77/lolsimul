// 시뮬레이션 엔진 핵심 로직

import { SimulationPhase } from "@/types/game";
import { PHASE_CHOICES_MAP } from "./phases";
import { useGameStore } from "@/store/gameStore";

/**
 * 인터랙티브 시뮬레이션 시작
 * 시뮬레이션을 초기화하고 첫 페이즈(DRAFT)로 설정하여 유저 입력을 대기시킴
 */
export function startInteractiveSimulation(matchId: string) {
  const state = useGameStore.getState();
  const match = state.currentMatch || 
    state.scheduledMatches.find((m) => m.id === matchId);
  
  if (!match) {
    console.error("경기를 찾을 수 없습니다.");
    return;
  }

  // 현재 세트 번호 계산
  const currentSet = (match.currentSets?.length || 0) + 1;

  // 시뮬레이션 초기화
  state.initializeSimulation(matchId, currentSet);

  // 경기를 in_progress 상태로 설정
  const inProgressMatch: typeof match = {
    ...match,
    status: "in_progress",
    homeScore: match.homeScore || 0,
    awayScore: match.awayScore || 0,
    currentSets: match.currentSets || [],
  };
  state.setCurrentMatch(inProgressMatch);

  // 첫 페이즈(DRAFT)로 설정하고 유저 입력 대기
  state.setPhase(SimulationPhase.DRAFT);
  state.setWaiting(true);
  state.setChoices(PHASE_CHOICES_MAP[SimulationPhase.DRAFT]);

  // 시뮬레이션 시작 메시지
  state.addMessage({
    id: `simulation-start-${Date.now()}`,
    type: "game",
    content: `${currentSet}세트 시뮬레이션이 시작됩니다. 밴픽 단계로 진행합니다.`,
    timestamp: new Date(),
  });
}

/**
 * 다음 페이즈로 진행
 * 각 페이즈 진입 시 유저 입력을 기다리는 상태로 전환하고 선택지를 생성
 */
export function advanceSimulationPhase() {
  const state = useGameStore.getState();
  const { simulationState } = state;

  if (!simulationState.matchId) {
    console.error("시뮬레이션이 초기화되지 않았습니다.");
    return;
  }

  const currentPhase = simulationState.currentPhase;

  // 현재 페이즈가 없으면 DRAFT부터 시작
  if (!currentPhase) {
    useGameStore.getState().setPhase(SimulationPhase.DRAFT);
    useGameStore.getState().setWaiting(true);
    useGameStore.getState().setChoices(PHASE_CHOICES_MAP[SimulationPhase.DRAFT]);
    return;
  }

  // FEEDBACK 페이즈에서 다음 세트로 진행
  if (currentPhase === SimulationPhase.FEEDBACK) {
    // 다음 세트 시작 (DRAFT부터)
    // 피드백 보정치는 유지하고, 다음 세트로 진행
    const nextSet = simulationState.currentSet + 1;
    const feedbackModifiers = simulationState.winRateModifiers.filter(
      (m) => m.source.startsWith("FEEDBACK_")
    );
    
    // 시뮬레이션 상태 업데이트 (세트 번호만 증가, 보정치는 유지)
    useGameStore.setState((state) => ({
      simulationState: {
        ...state.simulationState,
        currentSet: nextSet,
        currentPhase: SimulationPhase.DRAFT,
        isWaitingForUser: true,
        currentChoices: PHASE_CHOICES_MAP[SimulationPhase.DRAFT],
        // 피드백 보정치는 유지
        winRateModifiers: feedbackModifiers,
      },
    }));
    
    // 다음 세트 시작 메시지
    useGameStore.getState().addMessage({
      id: `next-set-${Date.now()}`,
      type: "game",
      content: `${nextSet}세트가 시작됩니다.`,
      timestamp: new Date(),
    });
    
    return;
  }

  // 페이즈 진행 순서
  const phaseOrder: SimulationPhase[] = [
    SimulationPhase.DRAFT,
    SimulationPhase.EARLY,
    SimulationPhase.MID,
    SimulationPhase.LATE,
    SimulationPhase.END,
  ];

  const currentIndex = phaseOrder.indexOf(currentPhase);

  // 이미 END 페이즈면 더 이상 진행 불가
  if (currentPhase === SimulationPhase.END) {
    console.log("시뮬레이션이 이미 종료되었습니다.");
    return;
  }

  // 다음 페이즈로 이동
  const nextPhase = phaseOrder[currentIndex + 1];

  if (nextPhase) {
    useGameStore.getState().setPhase(nextPhase);

    // END 페이즈가 아니면 유저 입력 대기
    if (nextPhase !== SimulationPhase.END) {
      useGameStore.getState().setWaiting(true);
      useGameStore.getState().setChoices(PHASE_CHOICES_MAP[nextPhase]);
    } else {
      // END 페이즈면 시뮬레이션 결과 계산
      calculateSetResult();
    }
  }
}

/**
 * 유저의 선택지를 제출하고 승률 보정치를 적용
 */
export function submitDecision(choiceId: string) {
  const state = useGameStore.getState();
  const { simulationState } = state;

  if (!simulationState.isWaitingForUser) {
    console.error("유저 입력 대기 상태가 아닙니다.");
    return;
  }

  // 선택지 찾기
  const choice = simulationState.currentChoices.find((c) => c.id === choiceId);
  if (!choice) {
    console.error(`선택지를 찾을 수 없습니다: ${choiceId}`);
    return;
  }

  // 현재 매치 정보 가져오기
  const match = state.currentMatch || 
    state.scheduledMatches.find((m) => m.id === simulationState.matchId);
  
  if (!match) {
    console.error("경기를 찾을 수 없습니다.");
    return;
  }

  const homeTeam = state.teams.find((t) => t.id === match.homeTeamId);
  const awayTeam = state.teams.find((t) => t.id === match.awayTeamId);
  const currentTeamId = state.currentTeamId;

  if (!homeTeam || !awayTeam || !currentTeamId) {
    console.error("팀 정보를 찾을 수 없습니다.");
    return;
  }

  // 플레이어 팀이 홈인지 원정인지 확인
  const isHome = match.homeTeamId === currentTeamId;
  const playerTeam = isHome ? homeTeam : awayTeam;
  const opponentTeam = isHome ? awayTeam : homeTeam;

  // 승률 보정치 적용
  choice.modifiers.forEach((modifier) => {
    // modifier.team이 "player"면 플레이어 팀, "opponent"면 상대 팀
    const targetTeamId = modifier.team === "player" 
      ? playerTeam.id 
      : opponentTeam.id;

    const appliedModifier = {
      ...modifier,
      team: targetTeamId,
    };

    useGameStore.getState().addModifier(appliedModifier);

    // 로그 메시지 생성
    const teamName = modifier.team === "player" 
      ? playerTeam.abbreviation || playerTeam.name
      : opponentTeam.abbreviation || opponentTeam.name;

    const message = modifier.team === "player"
      ? `감독님의 지시로 ${modifier.description} (승률 ${modifier.value > 0 ? '+' : ''}${modifier.value}%)`
      : `${teamName}의 ${modifier.description} (승률 ${modifier.value > 0 ? '+' : ''}${modifier.value}%)`;

    // 채팅 메시지 추가
    useGameStore.getState().addMessage({
      id: `simulation-${Date.now()}-${Math.random()}`,
      type: "game",
      content: message,
      timestamp: new Date(),
    });
  });

  // 페이즈 이력 추가
  if (simulationState.currentPhase) {
    useGameStore.getState().addPhaseHistory(
      simulationState.currentPhase,
      choiceId
    );
  }

  // FEEDBACK 페이즈의 경우 특별한 메시지 추가
  if (simulationState.currentPhase === SimulationPhase.FEEDBACK) {
    const feedbackMessage = choiceId === "feedback_criticize"
      ? "선수를 질책했습니다. 다음 세트에서 각성 효과가 적용됩니다."
      : choiceId === "feedback_encourage"
      ? "선수를 격려했습니다. 다음 세트에서 안정적인 성능을 기대할 수 있습니다."
      : "전술을 변경했습니다. 다음 세트에서 적응력이 상승합니다.";
    
    useGameStore.getState().addMessage({
      id: `feedback-result-${Date.now()}`,
      type: "game",
      content: feedbackMessage,
      timestamp: new Date(),
    });
  }

  // 선택지 초기화 및 대기 상태 해제
  useGameStore.getState().setChoices([]);
  useGameStore.getState().setWaiting(false);

  // 다음 페이즈로 자동 진행
  advanceSimulationPhase();
}

/**
 * 세트 결과 계산
 * 모든 페이즈가 끝나고 승률 보정치를 반영하여 최종 결과 결정
 */
function calculateSetResult() {
  const state = useGameStore.getState();
  const { simulationState } = state;

  if (!simulationState.matchId) {
    console.error("시뮬레이션이 초기화되지 않았습니다.");
    return;
  }

  const match = state.currentMatch || 
    state.scheduledMatches.find((m) => m.id === simulationState.matchId);
  
  if (!match) {
    console.error("경기를 찾을 수 없습니다.");
    return;
  }

  const homeTeam = state.teams.find((t) => t.id === match.homeTeamId);
  const awayTeam = state.teams.find((t) => t.id === match.awayTeamId);
  const currentTeamId = state.currentTeamId;

  if (!homeTeam || !awayTeam || !currentTeamId) {
    console.error("팀 정보를 찾을 수 없습니다.");
    return;
  }

  const isHome = match.homeTeamId === currentTeamId;
  const playerTeam = isHome ? homeTeam : awayTeam;
  const opponentTeam = isHome ? awayTeam : homeTeam;

  // 기본 전력 계산
  const homeStrength = calculateTeamLineStrength(homeTeam);
  const awayStrength = calculateTeamLineStrength(awayTeam);

  // 랜덤 변수 (컨디션) -10% ~ +10%
  const homeCondition = 1 + (Math.random() * 0.2 - 0.1);
  const awayCondition = 1 + (Math.random() * 0.2 - 0.1);

  let homePower = homeStrength.overall * homeCondition;
  let awayPower = awayStrength.overall * awayCondition;

  // 승률 보정치 적용
  simulationState.winRateModifiers.forEach((modifier) => {
    if (modifier.team === homeTeam.id) {
      homePower *= (1 + modifier.value / 100);
    } else if (modifier.team === awayTeam.id) {
      awayPower *= (1 + modifier.value / 100);
    }
  });

  // 승률 계산
  const totalPower = homePower + awayPower;
  const homeWinProbability = homePower / totalPower;

  // 세트 결과 결정
  const setResult = Math.random() < homeWinProbability;
  const winner = setResult ? homeTeam.id : awayTeam.id;
  const duration = Math.floor(Math.random() * 20) + 25; // 25~45분

  // 현재 세트 스코어 업데이트
  const currentHomeScore = match.homeScore || 0;
  const currentAwayScore = match.awayScore || 0;
  const currentSets = match.currentSets || [];

  const newHomeScore = winner === homeTeam.id ? currentHomeScore + 1 : currentHomeScore;
  const newAwayScore = winner === awayTeam.id ? currentAwayScore + 1 : currentAwayScore;
  const newSets = [...currentSets, { winner, duration }];

  // 경기 형식 결정
  const isBo5 = match.matchType === "lck_cup" || match.matchType === "playoff" || 
                match.matchType === "msi" || match.matchType === "worlds";
  const setsToWin = isBo5 ? 3 : 2;
  const isMatchComplete = newHomeScore >= setsToWin || newAwayScore >= setsToWin;

  // 결과 로그 추가
  const winnerTeam = winner === homeTeam.id ? homeTeam : awayTeam;
  const loserTeam = winner === homeTeam.id ? awayTeam : homeTeam;
  
  useGameStore.getState().addMessage({
    id: `set-result-${Date.now()}`,
    type: "game",
    content: `${winnerTeam.abbreviation || winnerTeam.name}가 ${loserTeam.abbreviation || loserTeam.name}를 상대로 ${simulationState.currentSet}세트에서 승리했습니다! (${duration}분)`,
    timestamp: new Date(),
  });

  if (isMatchComplete) {
    // 경기 완료 처리
    const finalWinner = newHomeScore > newAwayScore ? homeTeam.id : awayTeam.id;
    const finalWinnerTeam = finalWinner === homeTeam.id ? homeTeam : awayTeam;
    const finalLoserTeam = finalWinner === homeTeam.id ? awayTeam : homeTeam;
    const winnerRoster = finalWinnerTeam.roster.filter((p) => p.division === "1군");
    
    const pogPlayer = winnerRoster.reduce((best, current) => {
      const bestTotal = Object.values(best.stats).reduce((a, b) => a + b, 0);
      const currentTotal = Object.values(current.stats).reduce((a, b) => a + b, 0);
      return currentTotal > bestTotal ? current : best;
    }, winnerRoster[0]);

    const completedMatch: typeof match = {
      ...match,
      status: "completed",
      homeScore: newHomeScore,
      awayScore: newAwayScore,
      currentSets: newSets,
      result: {
        homeScore: newHomeScore,
        awayScore: newAwayScore,
        winner: finalWinner,
        pog: {
          playerId: pogPlayer.id,
          playerName: pogPlayer.nickname,
          teamId: finalWinnerTeam.id,
        },
        sets: newSets,
      },
    };

    // 경기 결과를 matches에 추가
    useGameStore.setState((state) => {
      const newMatches = [...state.matches, completedMatch];
      const newScheduledMatches = state.scheduledMatches.filter((m) => m.id !== match.id);

      // 뉴스 생성
      const news = {
        id: `match-${match.id}-${Date.now()}`,
        title: `${finalWinnerTeam.name} ${newHomeScore} - ${newAwayScore} ${finalLoserTeam.name}`,
        content: `${finalWinnerTeam.name}이(가) ${finalLoserTeam.name}을(를) 상대로 승리했습니다. POG: ${pogPlayer.nickname} (${finalWinnerTeam.name})`,
        date: new Date(match.date),
        type: "match" as const,
        relatedTeamIds: [homeTeam.id, awayTeam.id],
      };

      return {
        matches: newMatches,
        scheduledMatches: newScheduledMatches,
        currentMatch: null,
        news: [news, ...state.news].slice(0, 50),
      };
    });

    // 시뮬레이션 상태 초기화
    useGameStore.getState().resetSimulationState();
  } else {
    // 경기 계속 진행 (피드백 타임으로 이동)
    const updatedMatch: typeof match = {
      ...match,
      status: "in_progress",
      homeScore: newHomeScore,
      awayScore: newAwayScore,
      currentSets: newSets,
    };

    useGameStore.getState().setCurrentMatch(updatedMatch);
    
    // 현재 세트의 모든 보정치 제거 (일반 보정치 + 이전 세트의 피드백 보정치)
    // 새로운 피드백 보정치는 다음 세트에만 적용되도록 함
    useGameStore.getState().clearModifiers();
    
    // 피드백 타임으로 진행
    useGameStore.getState().setPhase(SimulationPhase.FEEDBACK);
    useGameStore.getState().setWaiting(true);
    useGameStore.getState().setChoices(PHASE_CHOICES_MAP[SimulationPhase.FEEDBACK]);
    
    // 피드백 타임 안내 메시지
    useGameStore.getState().addMessage({
      id: `feedback-time-${Date.now()}`,
      type: "game",
      content: `세트가 끝났습니다. 다음 세트를 위한 피드백을 선택하세요. (현재 스코어: ${newHomeScore} - ${newAwayScore})`,
      timestamp: new Date(),
    });
  }
}

/**
 * 팀의 라인별 전력 계산 (기존 함수 재사용)
 */
function calculateTeamLineStrength(team: any): {
  top: number;
  jgl: number;
  mid: number;
  adc: number;
  spt: number;
  overall: number;
} {
  // 기존 gameStore의 calculateTeamLineStrength 함수와 동일한 로직
  // 여기서는 간단히 구현 (실제로는 gameStore에서 import해야 함)
  const roster = team.roster.filter((p: any) => p.division === "1군");
  
  const top = roster.find((p: any) => p.position === "TOP");
  const jgl = roster.find((p: any) => p.position === "JGL");
  const mid = roster.find((p: any) => p.position === "MID");
  const adc = roster.find((p: any) => p.position === "ADC");
  const spt = roster.find((p: any) => p.position === "SPT");

  const calculateLinePower = (player: any) => {
    if (!player) return 0;
    const stats = player.stats;
    return (
      stats.라인전 * 0.2 +
      stats.한타 * 0.25 +
      stats.운영 * 0.2 +
      stats.피지컬 * 0.15 +
      stats.챔프폭 * 0.1 +
      stats.멘탈 * 0.1
    );
  };

  const topPower = calculateLinePower(top);
  const jglPower = calculateLinePower(jgl);
  const midPower = calculateLinePower(mid);
  const adcPower = calculateLinePower(adc);
  const sptPower = calculateLinePower(spt);

  const overall = (topPower + jglPower + midPower + adcPower + sptPower) / 5;

  return { top: topPower, jgl: jglPower, mid: midPower, adc: adcPower, spt: sptPower, overall };
}

