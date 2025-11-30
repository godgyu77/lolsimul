import { create } from "zustand";
import React from "react";
import { Player, Team, Match, NewsItem, Position, MatchInfo, TeamRank, PlayerInfo, StaffInfo, Tier, Division, PlayerSeasonStats, PlayerStats, PlayerDetailedStats } from "@/types";
import { initialTeams, initialPlayers } from "@/constants/initialData";
import { SimulationPhase, SimulationState, WinRateModifier, SimulationChoice } from "@/types/game";
import { advanceSimulationPhase as engineAdvanceSimulationPhase, submitDecision as engineSubmitDecision } from "@/lib/simulation/engine";

// 시즌 일정 타입
export type SeasonEvent =
  | "kespa"
  | "lck_cup"
  | "first_stand"
  | "msi"
  | "ewc" // Esports World Cup
  | "summer"
  | "summer_short" // 아시안게임 해의 단축 서머
  | "asian_games"
  | "worlds_prep" // 아시안게임 없는 해의 월즈 준비 기간
  | "worlds"
  | "off_season";

// 채팅 메시지 타입
export interface ChatMessage {
  id: string;
  type: "system" | "news" | "game" | "user";
  content: string;
  timestamp: Date;
}

// 선택지 옵션 타입
export interface Option {
  label: string;
  value: string;
}

interface GameState {
  // API 설정
  apiKey: string | null; // Gemini API 키
  
  // 채팅 메시지
  messages: ChatMessage[];
  
  // 게임 기본 정보
  currentDate: Date;
  currentTeamId: string; // 플레이어가 관리하는 팀 ID
  gameMode: "MANAGER" | "PLAYER" | null; // 게임 모드 (감독 모드 / 선수 커리어 모드)
  isPaused: boolean;
  season: number; // 현재 시즌 (2024, 2025 등)

  // 팀 및 선수 데이터
  teams: Team[];
  players: Player[];

  // 경기 및 일정
  matches: Match[];
  scheduledMatches: Match[]; // 예정된 경기들
  upcomingMatches: MatchInfo[]; // 다가오는 5경기 정보
  currentMatch: Match | null; // 현재 진행 중인 경기
  simulationMode: "one_set" | "match" | "tournament" | null; // 시뮬레이션 모드
  
  // 인터랙티브 시뮬레이션 상태 머신
  simulationState: SimulationState;

  // 뉴스
  news: NewsItem[]; // 최근 뉴스 (최대 50개)
  newsHistory: NewsItem[]; // 지금까지 누적된 모든 뉴스 리스트

  // 순위 데이터
  rankings: {
    kespaCup: TeamRank[];
    lckCup: TeamRank[];
    regularSeason: TeamRank[];
    summer: TeamRank[];
    playoff: TeamRank[];
    msi: TeamRank[];
    worlds: TeamRank[];
  };

  // FA 시장
  faList: PlayerInfo[]; // 현재 연도 FA 대상자 리스트

  // 로스터 관리
  rosters: {
    team1: PlayerInfo[]; // 1군
    team2: PlayerInfo[]; // 2군
    staff: StaffInfo[]; // 코칭스태프
  };

  // 로딩 상태
  isLoading: boolean; // AI 응답 처리 중 여부

  // 선택지 옵션
  currentOptions: Option[]; // 현재 표시할 선택지

  // 게임 액션 (선택지 모달용)
  availableActions: Array<{
    id: string;
    label: string;
    command: string;
    variant?: "default" | "outline" | "ghost" | "destructive";
    icon?: React.ReactNode;
  }>; // 현재 가능한 행동 목록

  // 선수별 시즌 통계
  playerSeasonStats: PlayerSeasonStats[]; // 선수별 누적 통계

  // 선수 커리어 모드: 유저 플레이어 캐릭터
  userPlayer: Player | null; // 플레이어가 생성한 캐릭터 (선수 모드 전용)
  userPlayerInitialTrait: string | null; // 유저 플레이어의 초기 특성 (선수 모드 전용)
  userPlayerRoleModelId: string | null; // 유저 플레이어의 롤모델 선수 ID (선수 모드 전용)

  // API 설정
  setApiKey: (key: string) => void;
  setGameMode: (mode: "MANAGER" | "PLAYER" | null) => void;
  createUserPlayer: (playerData: Omit<Player, "id" | "tier" | "stats" | "salary" | "contractEndsAt" | "teamId" | "division" | "transferOffers"> & { initialTrait: string; roleModelId?: string | null }) => void; // 캐릭터 생성
  
  // 채팅 관련
  addMessage: (message: ChatMessage) => void;
  sendCommand: (command: string) => Promise<void>;
  setCurrentOptions: (options: Option[]) => void;
  setAvailableActions: (actions: Array<{ id: string; label: string; command: string; variant?: "default" | "outline" | "ghost" | "destructive"; icon?: React.ReactNode }>) => void; // 게임 액션 설정
  
  // 게임 진행 제어
  togglePause: () => void;
  advanceDay: () => void;
  setCurrentTeam: (teamId: string) => void;

  // 경기 관련
  simulateMatch: (matchId: string) => void;
  simulateOneSet: (matchId: string) => void; // 1세트만 시뮬레이션
  simulateMatchUntilEnd: (matchId: string) => void; // 매치 종료까지 시뮬레이션
  simulateTournament: () => Promise<void>; // 대회 전체 진행
  scheduleMatch: (
    homeTeamId: string,
    awayTeamId: string,
    date: Date,
    matchType?: Match["matchType"]
  ) => string; // matchId 반환
  setCurrentMatch: (match: Match | null) => void;
  setSimulationMode: (mode: "one_set" | "match" | "tournament" | null) => void;
  
  // 인터랙티브 시뮬레이션 엔진 함수
  startInteractiveSimulation: (matchId: string) => void; // 인터랙티브 시뮬레이션 시작
  
  // 인터랙티브 시뮬레이션 엔진
  advanceSimulationPhase: () => void;
  submitDecision: (choiceId: string) => void;
  
  // 인터랙티브 시뮬레이션 상태 머신 액션
  setPhase: (phase: SimulationPhase | null) => void;
  addModifier: (modifier: WinRateModifier) => void;
  removeModifier: (source: string) => void;
  clearModifiers: () => void;
  setWaiting: (waiting: boolean) => void;
  setChoices: (choices: SimulationChoice[]) => void;
  addPhaseHistory: (phase: SimulationPhase, choiceId: string) => void;
  resetSimulationState: () => void;
  initializeSimulation: (matchId: string, currentSet: number) => void;

  // 경제 시스템
  processMonthlyExpenses: () => void;
  checkSalaryCap: (teamId: string) => { isOver: boolean; current: number; cap: number };
  updateTeamMoney: (teamId: string, newMoney: number) => void; // 자금 업데이트 전용 함수

  // 유틸리티
  getCurrentSeasonEvent: () => SeasonEvent;
  getTeamById: (teamId: string) => Team | undefined;
  getPlayerById: (playerId: string) => Player | undefined;

  // 새로운 상태 업데이트 액션
  setUpcomingMatches: (matches: MatchInfo[]) => void;
  addNewsToHistory: (news: NewsItem) => void;
  updateRankings: (tournament: keyof GameState["rankings"], ranks: TeamRank[]) => void;
  setFAList: (players: PlayerInfo[]) => void;
  updateRosters: (rosters: Partial<GameState["rosters"]>) => void;
  
  // 선수별 통계 업데이트
  updatePlayerSeasonStats: (playerId: string, stats: Partial<PlayerSeasonStats>) => void;
  getPlayerSeasonStats: (playerId: string, tournament?: string) => PlayerSeasonStats | undefined;
  resetSeasonStats: (season: number) => void; // 시즌 초기화
  
  // 선수 성장/노화 시스템
  applyPlayerAgingToAll: () => void; // 모든 선수에게 나이 증가 및 노화 적용
  
  // 저장/불러오기 시스템
  saveGame: (gameMode: "MANAGER" | "PLAYER") => boolean;
  loadGame: (gameMode: "MANAGER" | "PLAYER") => boolean;
  hasSavedGame: (gameMode: "MANAGER" | "PLAYER") => boolean;
  deleteSavedGame: (gameMode: "MANAGER" | "PLAYER") => void;
}

// 아시안게임 개최 여부 확인 (4년 주기: 2026, 2030, 2034...)
function isAsianGamesYear(year: number): boolean {
  return year % 4 === 2;
}

// 시즌 이벤트 판단 함수
export function getSeasonEvent(date: Date): SeasonEvent {
  const month = date.getMonth() + 1; // 1~12
  const day = date.getDate();
  const year = date.getFullYear();
  const isAGYear = isAsianGamesYear(year);

  if (month === 1) return "kespa";
  if (month >= 1 && month <= 3) return "lck_cup";
  if (month === 3 && day >= 15) return "first_stand";
  if (month === 5) return "msi";
  
  // 7월 1주차: EWC (Esports World Cup)
  if (month === 7 && day <= 7) return "ewc";
  
  // 6~8월: 서머 시즌
  if (month >= 6 && month <= 8) {
    // 아시안게임 해는 단축 서머, 아닌 해는 정상 서머
    return isAGYear ? "summer_short" : "summer";
  }
  
  // 9월: 아시안게임 또는 월즈 준비
  if (month === 9) {
    return isAGYear ? "asian_games" : "worlds_prep";
  }
  
  // 10월: 월즈
  if (month === 10) return "worlds";
  
  return "off_season";
}

// 팀의 라인별 전력 계산
function calculateTeamLineStrength(team: Team): {
  top: number;
  jgl: number;
  mid: number;
  adc: number;
  spt: number;
  overall: number;
} {
  const mainRoster = team.roster.filter((p) => p.division === "1군");
  
  const getPositionPlayer = (position: Position) =>
    mainRoster.find((p) => p.position === position);

  const top = getPositionPlayer("TOP");
  const jgl = getPositionPlayer("JGL");
  const mid = getPositionPlayer("MID");
  const adc = getPositionPlayer("ADC");
  const spt = getPositionPlayer("SPT");

  const calculateLinePower = (player: Player | undefined) => {
    if (!player) return 0;
    const { stats } = player;
    // 라인별로 중요 스탯 가중치 적용
    if (player.position === "TOP") {
      return (stats.라인전 * 0.4 + stats.피지컬 * 0.3 + stats.한타 * 0.2 + stats.운영 * 0.1);
    }
    if (player.position === "JGL") {
      return (stats.운영 * 0.4 + stats.한타 * 0.3 + stats.라인전 * 0.2 + stats.피지컬 * 0.1);
    }
    if (player.position === "MID") {
      return (stats.라인전 * 0.35 + stats.피지컬 * 0.3 + stats.한타 * 0.25 + stats.운영 * 0.1);
    }
    if (player.position === "ADC") {
      return (stats.한타 * 0.4 + stats.피지컬 * 0.3 + stats.라인전 * 0.2 + stats.운영 * 0.1);
    }
    if (player.position === "SPT") {
      return (stats.운영 * 0.4 + stats.멘탈 * 0.3 + stats.한타 * 0.2 + stats.라인전 * 0.1);
    }
    return 0;
  };

  const topPower = calculateLinePower(top);
  const jglPower = calculateLinePower(jgl);
  const midPower = calculateLinePower(mid);
  const adcPower = calculateLinePower(adc);
  const sptPower = calculateLinePower(spt);

  const overall = (topPower + jglPower + midPower + adcPower + sptPower) / 5;

  return { top: topPower, jgl: jglPower, mid: midPower, adc: adcPower, spt: sptPower, overall };
}

// 1세트 시뮬레이션 (단일 세트만)
function simulateOneSetLogic(
  homeTeam: Team,
  awayTeam: Team,
  matchType: Match["matchType"] = "regular"
): {
  winner: string;
  duration: number;
} {
  const homeStrength = calculateTeamLineStrength(homeTeam);
  const awayStrength = calculateTeamLineStrength(awayTeam);

  // 랜덤 변수 (컨디션) -10% ~ +10%
  const homeCondition = 1 + (Math.random() * 0.2 - 0.1);
  const awayCondition = 1 + (Math.random() * 0.2 - 0.1);

  const homePower = homeStrength.overall * homeCondition;
  const awayPower = awayStrength.overall * awayCondition;

  // 승률 계산
  const totalPower = homePower + awayPower;
  const homeWinProbability = homePower / totalPower;

  const setResult = Math.random() < homeWinProbability;
  const winner = setResult ? homeTeam.id : awayTeam.id;
  const duration = Math.floor(Math.random() * 20) + 25; // 25~45분

  return { winner, duration };
}

// 경기 시뮬레이션
function simulateMatchLogic(
  homeTeam: Team,
  awayTeam: Team,
  matchType: Match["matchType"] = "regular"
): {
  homeScore: number;
  awayScore: number;
  winner: string;
  pog: { playerId: string; playerName: string; teamId: string };
  sets: Array<{ winner: string; duration: number }>;
} {
  const homeStrength = calculateTeamLineStrength(homeTeam);
  const awayStrength = calculateTeamLineStrength(awayTeam);

  // 랜덤 변수 (컨디션) -10% ~ +10%
  const homeCondition = 1 + (Math.random() * 0.2 - 0.1);
  const awayCondition = 1 + (Math.random() * 0.2 - 0.1);

  const homePower = homeStrength.overall * homeCondition;
  const awayPower = awayStrength.overall * awayCondition;

  // 승률 계산
  const totalPower = homePower + awayPower;
  const homeWinProbability = homePower / totalPower;

  // 경기 형식 결정
  const isBo5 = matchType === "lck_cup" || matchType === "playoff" || matchType === "msi" || matchType === "worlds";
  const setsToWin = isBo5 ? 3 : 2;
  const maxSets = isBo5 ? 5 : 3;

  let homeWins = 0;
  let awayWins = 0;
  const sets: Array<{ winner: string; duration: number }> = [];

  // 세트별 시뮬레이션
  while (homeWins < setsToWin && awayWins < setsToWin && homeWins + awayWins < maxSets) {
    const setResult = Math.random() < homeWinProbability;
    if (setResult) {
      homeWins++;
      sets.push({ winner: homeTeam.id, duration: Math.floor(Math.random() * 20) + 25 }); // 25~45분
    } else {
      awayWins++;
      sets.push({ winner: awayTeam.id, duration: Math.floor(Math.random() * 20) + 25 });
    }
  }

  const winner = homeWins > awayWins ? homeTeam.id : awayTeam.id;

  // POG 선정 (승리팀의 가장 뛰어난 선수)
  const winnerTeam = winner === homeTeam.id ? homeTeam : awayTeam;
  const winnerRoster = winnerTeam.roster.filter((p) => p.division === "1군");
  
  // 가장 높은 종합 스탯을 가진 선수
  const pogPlayer = winnerRoster.reduce((best, current) => {
    const bestTotal = Object.values(best.stats).reduce((a, b) => a + b, 0);
    const currentTotal = Object.values(current.stats).reduce((a, b) => a + b, 0);
    return currentTotal > bestTotal ? current : best;
  }, winnerRoster[0]);

  return {
    homeScore: homeWins,
    awayScore: awayWins,
    winner,
    pog: {
      playerId: pogPlayer.id,
      playerName: pogPlayer.nickname,
      teamId: winnerTeam.id,
    },
    sets,
  };
}

// 팀의 총 연봉 계산 (억원 단위)
function calculateTeamSalary(team: Team): number {
  return team.roster.reduce((sum, player) => sum + player.salary, 0);
}

// 날짜 역행 방지 검증 함수 (중앙화된 guard)
function validateDateUpdate(newDate: Date, currentDate: Date): Date {
  // 날짜가 유효하지 않으면 현재 날짜 반환
  if (!(newDate instanceof Date) || isNaN(newDate.getTime())) {
    console.warn(`날짜 검증 실패: 유효하지 않은 날짜입니다. 현재 날짜를 유지합니다.`);
    return currentDate;
  }
  
  // 날짜 역행 방지: 새 날짜가 현재 날짜보다 이전이면 현재 날짜 반환
  if (newDate < currentDate) {
    console.warn(`날짜 역행 방지: 새 날짜(${newDate.toISOString()})가 현재 날짜(${currentDate.toISOString()})보다 이전입니다. 현재 날짜를 유지합니다.`);
    return currentDate;
  }
  
  return newDate;
}

// 선수 성장/노화 시스템 (프롬프트 규칙: 24세까지 성장, 25세부터 노화)
function applyPlayerAging(player: Player): Player {
  const newAge = player.age + 1;
  let statMultiplier = 1.0;

  // 노화 커브 적용
  if (newAge <= 24) {
    // 24세까지: 성장 가능 (경험치에 따라 성장, 여기서는 기본 성장률 적용)
    statMultiplier = 1.0 + (24 - newAge) * 0.01; // 최대 1.0 (24세 기준)
  } else if (newAge === 25) {
    // 25세: 미세 하락
    statMultiplier = 0.98;
  } else if (newAge >= 26 && newAge <= 27) {
    // 26-27세: 미세 하락 지속
    statMultiplier = 0.96;
  } else if (newAge >= 28 && newAge <= 29) {
    // 28-29세: 눈에 띄는 하락
    statMultiplier = 0.92;
  } else if (newAge >= 30) {
    // 30세 이상: 급격한 하락
    const agePenalty = (newAge - 30) * 0.05; // 30세부터 매년 5% 추가 하락
    statMultiplier = Math.max(0.7, 0.85 - agePenalty);
  }

  // 스탯 조정
  const updatedStats: PlayerStats = {
    라인전: Math.max(1, Math.min(100, Math.round(player.stats.라인전 * statMultiplier))),
    한타: Math.max(1, Math.min(100, Math.round(player.stats.한타 * statMultiplier))),
    운영: Math.max(1, Math.min(100, Math.round(player.stats.운영 * statMultiplier))),
    피지컬: Math.max(1, Math.min(100, Math.round(player.stats.피지컬 * statMultiplier))),
    챔프폭: Math.max(1, Math.min(100, Math.round(player.stats.챔프폭 * statMultiplier))),
    멘탈: Math.max(1, Math.min(100, Math.round(player.stats.멘탈 * statMultiplier))),
  };

  // 세부 지표도 조정
  let updatedDetailedStats: PlayerDetailedStats | undefined = undefined;
  if (player.detailedStats) {
    updatedDetailedStats = {
      dpm: Math.max(100, Math.round(player.detailedStats.dpm * statMultiplier)),
      dmg_pct: Math.max(5, Math.min(35, player.detailedStats.dmg_pct * statMultiplier)),
      kda_per_min: Math.max(0.1, player.detailedStats.kda_per_min * statMultiplier),
      solo_kill: Math.max(0, Math.round(player.detailedStats.solo_kill * statMultiplier)),
      csd15: Math.round(player.detailedStats.csd15 * statMultiplier),
      gd15: Math.round(player.detailedStats.gd15 * statMultiplier),
      xpd15: Math.round(player.detailedStats.xpd15 * statMultiplier),
      fb_part: Math.max(0, Math.min(60, player.detailedStats.fb_part * statMultiplier)),
      fb_victim: Math.max(5, Math.min(40, player.detailedStats.fb_victim * (2 - statMultiplier))), // 피퍼블은 역방향 (낮을수록 좋음)
    };
  }

  // 등급 재계산
  const overall = Math.round(
    (updatedStats.라인전 + updatedStats.한타 + updatedStats.운영 + updatedStats.피지컬 + updatedStats.챔프폭 + updatedStats.멘탈) / 6
  );
  const getTier = (ovr: number): Tier => {
    if (ovr >= 95) return "S+";
    if (ovr >= 90) return "S";
    if (ovr >= 85) return "S-";
    if (ovr >= 80) return "A+";
    if (ovr >= 75) return "A";
    if (ovr >= 70) return "A-";
    if (ovr >= 65) return "B+";
    if (ovr >= 60) return "B";
    if (ovr >= 55) return "B-";
    if (ovr >= 50) return "C+";
    if (ovr >= 45) return "C";
    if (ovr >= 40) return "C-";
    return "D";
  };

  return {
    ...player,
    age: newAge,
    tier: getTier(overall),
    stats: updatedStats,
    detailedStats: updatedDetailedStats,
  };
}

// 경기 결과에 따른 선수별 세부 지표 계산 (ROSTER_DB 스타일)
function calculatePlayerMatchStats(
  player: Player,
  teamWon: boolean,
  matchDuration: number,
  position: Position
): PlayerDetailedStats {
  // 선수의 기본 스탯을 기반으로 세부 지표 생성
  const baseStats = player.detailedStats || {
    dpm: 400,
    dmg_pct: 20,
    kda_per_min: 0.35,
    solo_kill: 3,
    csd15: 0,
    gd15: 0,
    xpd15: 0,
    fb_part: 20,
    fb_victim: 20,
  };

  // 승리/패배에 따른 변동폭
  const winMultiplier = teamWon ? 1.1 : 0.9;
  const randomVariation = () => (Math.random() - 0.5) * 0.2; // -10% ~ +10%

  // 포지션별 기본 범위 조정
  const getPositionMultiplier = (pos: Position): { dpm: number; dmg_pct: number; kda: number } => {
    switch (pos) {
      case "TOP":
        return { dpm: 1.0, dmg_pct: 1.0, kda: 0.8 };
      case "JGL":
        return { dpm: 0.7, dmg_pct: 0.7, kda: 1.2 };
      case "MID":
        return { dpm: 1.1, dmg_pct: 1.1, kda: 1.0 };
      case "ADC":
        return { dpm: 1.2, dmg_pct: 1.2, kda: 0.9 };
      case "SPT":
        return { dpm: 0.4, dmg_pct: 0.4, kda: 1.3 };
    }
  };

  const posMult = getPositionMultiplier(position);
  const variation = randomVariation();

  // 선수 스탯 기반 보정 (라인전, 한타, 운영 등)
  const statBonus = (player.stats.라인전 + player.stats.한타 + player.stats.운영) / 300; // 0.5 ~ 1.0 범위

  return {
    dpm: Math.max(100, Math.round(baseStats.dpm * posMult.dpm * winMultiplier * (1 + variation) * (0.7 + statBonus * 0.3))),
    dmg_pct: Math.max(5, Math.min(35, baseStats.dmg_pct * posMult.dmg_pct * winMultiplier * (1 + variation * 0.5))),
    kda_per_min: Math.max(0.1, baseStats.kda_per_min * posMult.kda * winMultiplier * (1 + variation * 0.3)),
    solo_kill: teamWon ? Math.max(0, Math.round(baseStats.solo_kill * (1 + variation * 0.5))) : Math.max(0, Math.round(baseStats.solo_kill * 0.7)),
    csd15: Math.round(baseStats.csd15 * winMultiplier + (teamWon ? Math.random() * 5 : -Math.random() * 5)),
    gd15: Math.round(baseStats.gd15 * winMultiplier + (teamWon ? Math.random() * 100 : -Math.random() * 100)),
    xpd15: Math.round(baseStats.xpd15 * winMultiplier + (teamWon ? Math.random() * 50 : -Math.random() * 50)),
    fb_part: Math.max(0, Math.min(60, baseStats.fb_part * (1 + variation * 0.3))),
    fb_victim: Math.max(5, Math.min(40, baseStats.fb_victim * (teamWon ? 0.9 : 1.1) * (1 + variation * 0.2))),
  };
}

  // 응답 파싱 함수
function parseAIResponse(response: string, state: GameState): { updates: Partial<GameState>; options: Option[]; filteredContent: string } {
  const updates: Partial<GameState> = {};
  let filteredContent = response;
  const options: Option[] = [];
  
  // [OPTIONS] 파싱: 선택지 추출
  const optionsMatch = response.match(/\[OPTIONS:\s*(\[.*?\])\]/s);
  if (optionsMatch) {
    try {
      const jsonStr = optionsMatch[1];
      const optionsData = JSON.parse(jsonStr);
      if (Array.isArray(optionsData)) {
        options.push(...optionsData.map((opt: any) => ({
          label: opt.label || opt.text || String(opt),
          value: opt.value || opt.command || String(opt),
        })));
      }
      // 선택지 텍스트 제거
      filteredContent = filteredContent.replace(/\[OPTIONS:\s*\[.*?\]\]/s, '');
    } catch (e) {
      console.error("선택지 파싱 오류:", e);
    }
  }
  
  // 시스템 메시지 필터링: [NEWS: {...}], [GUI_EVENT: {...}] 등 제거
  filteredContent = filteredContent.replace(/\[NEWS:\s*\{[^}]*\}\]/g, '');
  filteredContent = filteredContent.replace(/\[GUI_EVENT:\s*\{[^}]*\}\]/g, '');
  filteredContent = filteredContent.replace(/\[STATUS:\s*[^\]]*\]/g, '');
  filteredContent = filteredContent.replace(/\[UPCOMING_MATCHES:\s*\[.*?\]\]/s, '');
  filteredContent = filteredContent.replace(/\[RANKING:\s*\{.*?\}\]/s, '');
  filteredContent = filteredContent.replace(/\[FA_LIST:\s*\[.*?\]\]/s, '');
  filteredContent = filteredContent.replace(/\[ROSTER_UPDATE:\s*\{.*?\}\]/s, '');
  
  // [STATUS] 파싱: 날짜, 자금 등 업데이트
  // 형식: [STATUS] 날짜: YYYY/MM/DD (D-Day) | 자금: 000.0억 원 | 현재 일정: [스프링 1R / 스토브리그 / MSI 등]
  const statusMatch = response.match(/\[STATUS\]\s*날짜:\s*(\d{4})\/(\d{2})\/(\d{2})/);
  if (statusMatch) {
    const [, year, month, day] = statusMatch;
    const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const currentDate = state.currentDate;
    
    // 날짜 역행 방지 검증 함수 사용
    const validatedDate = validateDateUpdate(parsedDate, currentDate);
    if (validatedDate.getTime() === parsedDate.getTime()) {
      // 검증 통과: 날짜 업데이트
      updates.currentDate = validatedDate;
    } else {
      // 검증 실패: 날짜 업데이트하지 않음 (현재 날짜 유지)
      // validateDateUpdate가 이미 경고를 출력했으므로 여기서는 추가 로그 없음
    }
  }
  
  // 자금 파싱 (선택적)
  const moneyMatch = response.match(/자금:\s*([\d.]+)\s*억\s*원/);
  if (moneyMatch && state.currentTeamId) {
    const moneyInBillions = parseFloat(moneyMatch[1]);
    const moneyInWon = moneyInBillions * 100000000;
    // updateTeamMoney 함수를 통해 업데이트하도록 변경 (하지만 parseAIResponse 내부에서는 직접 업데이트)
    updates.teams = state.teams.map((team) =>
      team.id === state.currentTeamId
        ? { ...team, money: moneyInWon }
        : team
    );
  }
  
  // [NEWS] 파싱: 뉴스 추가
  // 형식: [NEWS: {"title": "...", "content": "...", "type": "...", "relatedTeamIds": [...]}]
  const newsMatches = Array.from(response.matchAll(/\[NEWS:\s*(\{[^}]+\})\]/g));
  const newNewsItems: NewsItem[] = [];
  
  for (const match of newsMatches) {
    try {
      const jsonStr = match[1];
      const newsData = JSON.parse(jsonStr);
      const newsItem: NewsItem = {
        id: `news-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: newsData.title || "뉴스",
        content: newsData.content || "",
        date: new Date(),
        type: (newsData.type as NewsItem["type"]) || "general",
        relatedTeamIds: newsData.relatedTeamIds || [],
      };
      newNewsItems.push(newsItem);
    } catch (e) {
      console.error("뉴스 파싱 오류:", e, match[0]);
    }
  }
  
  if (newNewsItems.length > 0) {
    updates.news = [...newNewsItems, ...state.news].slice(0, 50);
    // newsHistory에도 추가
    updates.newsHistory = [...newNewsItems, ...state.newsHistory];
  }

  // [UPCOMING_MATCHES] 파싱: 다가오는 경기 정보 업데이트
  // 형식: [UPCOMING_MATCHES: [{ date: "YYYY-MM-DD", opponent: "팀명", matchType: "regular", ... }, ...]]
  const upcomingMatchesMatch = response.match(/\[UPCOMING_MATCHES:\s*(\[.*?\])\]/s);
  if (upcomingMatchesMatch) {
    try {
      const jsonStr = upcomingMatchesMatch[1];
      const matchesData = JSON.parse(jsonStr);
      const upcomingMatches: MatchInfo[] = matchesData.map((match: any, index: number) => {
        // 팀 ID 찾기 (opponent 이름으로)
        const opponentTeam = state.teams.find(
          (t) => t.name === match.opponent || t.abbreviation === match.opponent
        );
        const homeTeamId = state.currentTeamId || state.teams[0]?.id || "";
        const awayTeamId = opponentTeam?.id || "";

        // 날짜 파싱 (문자열 또는 Date 객체)
        let matchDate: Date;
        if (match.date instanceof Date) {
          matchDate = match.date;
        } else if (typeof match.date === "string") {
          matchDate = new Date(match.date);
        } else {
          // 날짜가 없으면 업데이트된 currentDate 또는 현재 날짜 사용
          matchDate = updates.currentDate || state.currentDate || new Date();
        }

        return {
          id: `upcoming-${Date.now()}-${index}`,
          date: matchDate,
          homeTeamId: match.isHome !== false ? homeTeamId : awayTeamId,
          awayTeamId: match.isHome !== false ? awayTeamId : homeTeamId,
          matchType: (match.matchType as Match["matchType"]) || "regular",
          status: "scheduled" as const,
        };
      });
      updates.upcomingMatches = upcomingMatches;
    } catch (e) {
      console.error("다가오는 경기 파싱 오류:", e);
    }
  }

  // [RANKING] 파싱: 대회별 순위표 업데이트
  // 형식: [RANKING: { tournament: "LCK_CUP", data: [{ rank: 1, teamId: "...", wins: 5, losses: 2, ... }, ...] }]
  const rankingMatch = response.match(/\[RANKING:\s*(\{.*?\})\]/s);
  if (rankingMatch) {
    try {
      const jsonStr = rankingMatch[1];
      const rankingData = JSON.parse(jsonStr);
      const tournament = rankingData.tournament?.toLowerCase().replace("_", "") as keyof GameState["rankings"];
      
      if (tournament && rankingData.data) {
        const ranks: TeamRank[] = rankingData.data.map((rank: any) => {
          const team = state.teams.find((t) => t.id === rank.teamId || t.name === rank.teamName);
          const totalMatches = (rank.wins || 0) + (rank.losses || 0);
          const winRate = totalMatches > 0 ? ((rank.wins || 0) / totalMatches) * 100 : 0;

          return {
            rank: rank.rank || 0,
            teamId: team?.id || rank.teamId || "",
            teamName: team?.name || rank.teamName || "",
            abbreviation: team?.abbreviation || rank.abbreviation || "",
            wins: rank.wins || 0,
            losses: rank.losses || 0,
            points: rank.points || (rank.wins || 0) * 3,
            goalDifference: rank.goalDifference || 0,
            winRate,
          };
        });

        // rankings 업데이트는 직접 처리 (Partial 업데이트 불가)
        if (tournament in state.rankings) {
          updates.rankings = {
            ...state.rankings,
            [tournament]: ranks,
          };
        }
      }
    } catch (e) {
      console.error("순위표 파싱 오류:", e);
    }
  }

  // [FA_LIST] 파싱: FA 대상자 리스트 업데이트
  // 형식: [FA_LIST: [{ id: "...", name: "...", nickname: "...", position: "TOP", tier: "S", overall: 90, salary: 5.0, ... }, ...]]
  const faListMatch = response.match(/\[FA_LIST:\s*(\[.*?\])\]/s);
  if (faListMatch) {
    try {
      const jsonStr = faListMatch[1];
      const faData = JSON.parse(jsonStr);
      const faList: PlayerInfo[] = faData.map((player: any) => ({
        id: player.id || `fa-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: player.name || "",
        nickname: player.nickname || "",
        position: (player.position as Position) || "TOP",
        age: player.age || 20,
        tier: (player.tier as Tier) || "B",
        overall: player.overall || player.ovr || 70,
        salary: player.salary || 0,
        contractEndsAt: player.contractEndsAt || state.season,
        teamId: player.teamId, // FA는 teamId가 없을 수 있음
        division: player.division as Division | undefined,
      }));
      updates.faList = faList;
    } catch (e) {
      console.error("FA 리스트 파싱 오류:", e);
    }
  }

  // Markdown 테이블 파싱: 로스터 표 자동 감지 및 파싱
  // 형식: | 구분 | 라인 | 닉네임 | 이름 | 나이 | ... |
  const markdownTableMatch = response.match(/\|.*구분.*\|.*라인.*\|/);
  if (markdownTableMatch) {
    try {
      // 테이블 전체 추출 (헤더 + 구분선 + 데이터 행들)
      const tableRegex = /(\|.*구분.*\|[^\n]*\n\|[:\-| ]+\|\n(?:\|.*\|\n?)+)/;
      const fullTableMatch = response.match(tableRegex);
      if (fullTableMatch) {
        const tableText = fullTableMatch[1];
        const lines = tableText.split('\n').filter(line => line.trim().startsWith('|'));
        
        if (lines.length >= 2) {
          // 헤더 파싱
          const headerLine = lines[0];
          const headerCells = headerLine.split('|').map(c => c.trim()).filter(c => c);
          
          // 컬럼 인덱스 찾기
          const getColumnIndex = (name: string): number => {
            return headerCells.findIndex(h => h.includes(name) || name.includes(h));
          };
          
          const divisionIdx = getColumnIndex('구분');
          const lineIdx = getColumnIndex('라인') !== -1 ? getColumnIndex('라인') : getColumnIndex('포지션');
          const nicknameIdx = getColumnIndex('닉네임');
          const nameIdx = getColumnIndex('이름');
          const ageIdx = getColumnIndex('나이');
          const salaryIdx = getColumnIndex('연봉');
          const contractIdx = getColumnIndex('계약만료') !== -1 ? getColumnIndex('계약만료') : getColumnIndex('계약');
          
          // 스탯 컬럼 인덱스
          const laningIdx = getColumnIndex('라인전');
          const teamfightIdx = getColumnIndex('한타');
          const macroIdx = getColumnIndex('운영');
          const physicalIdx = getColumnIndex('피지컬');
          const champIdx = getColumnIndex('챔프폭');
          const mentalIdx = getColumnIndex('멘탈');
          const overallIdx = getColumnIndex('종합') !== -1 ? getColumnIndex('종합') : getColumnIndex('OVR');
          
          // 데이터 행 파싱 (헤더와 구분선 제외)
          const dataRows = lines.slice(2); // 헤더(0) + 구분선(1) 제외
          const parsedPlayers: PlayerInfo[] = [];
          const parsedStaff: StaffInfo[] = [];
          
          for (const row of dataRows) {
            const cells = row.split('|').map(c => c.trim()).filter(c => c);
            if (cells.length < 3) continue; // 최소 컬럼 수 확인
            
            const division = cells[divisionIdx]?.trim() || '';
            const position = cells[lineIdx]?.trim() || '';
            const nickname = cells[nicknameIdx]?.trim() || '';
            // 이름 컬럼은 제거되었으므로 nickname을 name으로도 사용
            const name = cells[nameIdx]?.trim() || nickname;
            
            // 구분이 '코칭' 또는 '스태프'인 경우
            if (division.includes('코칭') || division.includes('스태프') || division.includes('감독') || division.includes('코치')) {
              const roleIdx = getColumnIndex('역할') !== -1 ? getColumnIndex('역할') : getColumnIndex('직책');
              const skillIdx = getColumnIndex('능력') !== -1 ? getColumnIndex('능력') : getColumnIndex('스킬');
              
              const staffRole = cells[roleIdx]?.trim() || 'assistantCoach';
              const skillStr = cells[skillIdx]?.trim() || '70';
              const salaryStr = cells[salaryIdx]?.trim() || '0';
              const contractStr = cells[contractIdx]?.trim() || String(state.season);
              
              // 능력치 파싱 (등급 또는 숫자)
              let skill = 70;
              if (skillStr.match(/^\d+$/)) {
                skill = parseInt(skillStr);
              } else {
                // 등급을 숫자로 변환
                const tierMap: Record<string, number> = { 'S+': 95, 'S': 90, 'S-': 85, 'A+': 80, 'A': 75, 'A-': 70, 'B+': 65, 'B': 60, 'B-': 55, 'C+': 50, 'C': 45, 'C-': 40, 'D': 35 };
                skill = tierMap[skillStr] || 70;
              }
              
              // 연봉 파싱 (억 단위)
              const salary = parseFloat(salaryStr.replace(/[억원\s]/g, '')) || 0;
              const contractEndsAt = parseInt(contractStr) || state.season;
              
              parsedStaff.push({
                id: `staff-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: name || nickname,
                role: (staffRole as StaffInfo["role"]) || 'assistantCoach',
                skill: Math.max(1, Math.min(100, skill)),
                salary,
                contractEndsAt,
              });
              continue;
            }
            
            // 선수 데이터 파싱
            if (!position || !nickname) continue;
            
            const ageStr = cells[ageIdx]?.trim() || '20';
            const age = parseInt(ageStr.replace(/[세\s]/g, '')) || 20;
            
            // 스탯 파싱 (등급을 숫자로 변환)
            const tierToNumber = (tier: string): number => {
              const tierMap: Record<string, number> = { 'S+': 95, 'S': 90, 'S-': 85, 'A+': 80, 'A': 75, 'A-': 70, 'B+': 65, 'B': 60, 'B-': 55, 'C+': 50, 'C': 45, 'C-': 40, 'D': 35 };
              return tierMap[tier] || 70;
            };
            
            const laning = laningIdx !== -1 ? tierToNumber(cells[laningIdx]?.trim() || 'B') : 70;
            const teamfight = teamfightIdx !== -1 ? tierToNumber(cells[teamfightIdx]?.trim() || 'B') : 70;
            const macro = macroIdx !== -1 ? tierToNumber(cells[macroIdx]?.trim() || 'B') : 70;
            const physical = physicalIdx !== -1 ? tierToNumber(cells[physicalIdx]?.trim() || 'B') : 70;
            const champ = champIdx !== -1 ? tierToNumber(cells[champIdx]?.trim() || 'B') : 70;
            const mental = mentalIdx !== -1 ? tierToNumber(cells[mentalIdx]?.trim() || 'B') : 70;
            
            // 종합 능력치 계산
            const overall = overallIdx !== -1 && cells[overallIdx] 
              ? (cells[overallIdx].match(/\d+/) ? parseInt(cells[overallIdx]) : Math.round((laning + teamfight + macro + physical + champ + mental) / 6))
              : Math.round((laning + teamfight + macro + physical + champ + mental) / 6);
            
            // 등급 결정 (종합 능력치 기반)
            const getTier = (ovr: number): Tier => {
              if (ovr >= 95) return 'S+';
              if (ovr >= 90) return 'S';
              if (ovr >= 85) return 'S-';
              if (ovr >= 80) return 'A+';
              if (ovr >= 75) return 'A';
              if (ovr >= 70) return 'A-';
              if (ovr >= 65) return 'B+';
              if (ovr >= 60) return 'B';
              if (ovr >= 55) return 'B-';
              if (ovr >= 50) return 'C+';
              if (ovr >= 45) return 'C';
              if (ovr >= 40) return 'C-';
              return 'D';
            };
            
            // 연봉 파싱
            const salaryStr = cells[salaryIdx]?.trim() || '0';
            const salary = parseFloat(salaryStr.replace(/[억원\s]/g, '')) || 0;
            
            // 계약 만료 파싱
            const contractStr = cells[contractIdx]?.trim() || String(state.season);
            const contractEndsAt = parseInt(contractStr) || state.season;
            
            const playerInfo: PlayerInfo = {
              id: `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name,
              nickname,
              position: (position as Position) || 'TOP',
              age,
              tier: getTier(overall),
              overall,
              salary,
              contractEndsAt,
              teamId: state.currentTeamId,
              division: (division === '1군' ? '1군' : '2군') as Division,
            };
            
            parsedPlayers.push(playerInfo);
          }
          
          // 구분에 따라 team1, team2, staff로 분류
          const team1Players = parsedPlayers.filter(p => p.division === '1군');
          const team2Players = parsedPlayers.filter(p => p.division === '2군');
          
          if (team1Players.length > 0 || team2Players.length > 0 || parsedStaff.length > 0) {
            const updatedRosters: Partial<GameState["rosters"]> = {};
            if (team1Players.length > 0) {
              updatedRosters.team1 = team1Players;
              console.log("Markdown 테이블에서 1군 로스터 파싱:", team1Players.length, "명");
            }
            if (team2Players.length > 0) {
              updatedRosters.team2 = team2Players;
              console.log("Markdown 테이블에서 2군 로스터 파싱:", team2Players.length, "명");
            }
            if (parsedStaff.length > 0) {
              updatedRosters.staff = parsedStaff;
              console.log("Markdown 테이블에서 코칭스태프 파싱:", parsedStaff.length, "명");
            }
            
            if (Object.keys(updatedRosters).length > 0) {
              updates.rosters = {
                ...state.rosters,
                ...updatedRosters,
              };
            }
          }
        }
      }
    } catch (e) {
      console.error("Markdown 테이블 파싱 오류:", e);
    }
  }

  // [ROSTER_UPDATE] 파싱: 로스터 업데이트
  // 형식: [ROSTER_UPDATE: { team1: [...], team2: [...], staff: [...] }]
  const rosterUpdateMatch = response.match(/\[ROSTER_UPDATE:\s*(\{.*?\})\]/s);
  if (rosterUpdateMatch) {
    try {
      const jsonStr = rosterUpdateMatch[1];
      const rosterData = JSON.parse(jsonStr);
      const updatedRosters: Partial<GameState["rosters"]> = {};

      // team1 파싱
      if (rosterData.team1) {
        updatedRosters.team1 = rosterData.team1.map((player: any) => ({
          id: player.id || `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: player.name || "",
          nickname: player.nickname || "",
          position: (player.position as Position) || "TOP",
          age: player.age || 20,
          tier: (player.tier as Tier) || "B",
          overall: player.overall || player.ovr || 70,
          salary: player.salary || 0,
          contractEndsAt: player.contractEndsAt || state.season,
          teamId: player.teamId || state.currentTeamId,
          division: "1군" as Division,
        }));
      }

      // team2 파싱
      if (rosterData.team2) {
        updatedRosters.team2 = rosterData.team2.map((player: any) => ({
          id: player.id || `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: player.name || "",
          nickname: player.nickname || "",
          position: (player.position as Position) || "TOP",
          age: player.age || 20,
          tier: (player.tier as Tier) || "B",
          overall: player.overall || player.ovr || 70,
          salary: player.salary || 0,
          contractEndsAt: player.contractEndsAt || state.season,
          teamId: player.teamId || state.currentTeamId,
          division: (player.division as Division) || "2군", // AI가 division을 제공하면 사용, 없으면 기본값 "2군"
        }));
        console.log("2군 로스터 업데이트:", updatedRosters.team2?.length || 0, "명");
      }

      // staff 파싱
      if (rosterData.staff) {
        updatedRosters.staff = rosterData.staff.map((staff: any) => ({
          id: staff.id || `staff-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: staff.name || "",
          role: (staff.role as StaffInfo["role"]) || "assistantCoach",
          skill: staff.skill || 70,
          salary: staff.salary || 0,
          contractEndsAt: staff.contractEndsAt || state.season,
        }));
      }

      if (Object.keys(updatedRosters).length > 0) {
        updates.rosters = {
          ...state.rosters,
          ...updatedRosters,
        };
      }
    } catch (e) {
      console.error("로스터 업데이트 파싱 오류:", e);
    }
  }
  
  return { updates, options, filteredContent };
}

export const useGameStore = create<GameState>((set, get) => ({
  // 초기 상태
  apiKey: typeof window !== "undefined" ? localStorage.getItem("gemini_api_key") : null,
  messages: typeof window !== "undefined" ? [
    {
      id: "welcome",
      type: "system" as const,
      content: "LCK Manager Simulation에 오신 것을 환영합니다! 게임을 시작하려면 명령어를 입력하세요.",
      timestamp: new Date(),
    },
  ] : [],
  currentDate: new Date(2025, 10, 1), // 2025년 11월 1일부터 시작 (월은 0부터 시작: 10 = 11월)
  currentTeamId: "", // 초기값은 빈 문자열 (팀 선택 전)
  gameMode: null, // 초기값은 null (모드 선택 전)
  isPaused: true,
  season: 2026, // 2026년 시즌 시작 (프롬프트 기준: "2026년 시즌 시작")
  teams: initialTeams,
  players: initialPlayers,
  matches: [],
  scheduledMatches: [],
  upcomingMatches: [],
  currentMatch: null,
  simulationMode: null,
  simulationState: {
    currentPhase: null,
    isWaitingForUser: false,
    winRateModifiers: [],
    currentChoices: [],
    matchId: null,
    currentSet: 0,
    phaseHistory: [],
  },
  news: [],
  newsHistory: [],
  rankings: {
    kespaCup: [],
    lckCup: [],
    regularSeason: [],
    summer: [],
    playoff: [],
    msi: [],
    worlds: [],
  },
  faList: [],
  rosters: {
    team1: [],
    team2: [],
    staff: [],
  },
  isLoading: false,
  currentOptions: [],
  availableActions: [], // 게임 액션 초기값
  playerSeasonStats: [], // 선수별 시즌 통계 초기화

  userPlayer: null, // 선수 커리어 모드 캐릭터 초기값
  userPlayerInitialTrait: null, // 유저 플레이어의 초기 특성 초기값
  userPlayerRoleModelId: null, // 유저 플레이어의 롤모델 선수 ID 초기값

  // API 설정
  setApiKey: (key: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("gemini_api_key", key);
    }
    set({ apiKey: key, gameMode: null }); // API 키 설정 시 gameMode를 null로 초기화
  },

  setGameMode: (mode: "MANAGER" | "PLAYER" | null) => {
    set({ gameMode: mode });
  },

  createUserPlayer: (playerData) => {
    const { name, nickname, position, age, initialTrait, roleModelId } = playerData;
    
    // 초기 스탯 생성 (D~C등급 수준, 2군 신인)
    const baseStat = 60; // 기본 스탯
    const randomVariation = () => Math.floor(Math.random() * 15) - 7; // -7 ~ +7 랜덤 변동
    
    const stats: PlayerStats = {
      라인전: baseStat + randomVariation(),
      한타: baseStat + randomVariation(),
      운영: baseStat + randomVariation(),
      피지컬: baseStat + randomVariation(),
      챔프폭: baseStat + randomVariation(),
      멘탈: baseStat + randomVariation(),
    };
    
    // 스탯 범위 제한 (1~100)
    Object.keys(stats).forEach((key) => {
      const statKey = key as keyof PlayerStats;
      stats[statKey] = Math.max(1, Math.min(100, stats[statKey]));
    });
    
    // 종합 능력치 계산
    const overall = Math.round(
      (stats.라인전 + stats.한타 + stats.운영 + stats.피지컬 + stats.챔프폭 + stats.멘탈) / 6
    );
    
    // 등급 결정
    const getTier = (ovr: number): Tier => {
      if (ovr >= 95) return "S+";
      if (ovr >= 90) return "S";
      if (ovr >= 85) return "S-";
      if (ovr >= 80) return "A+";
      if (ovr >= 75) return "A";
      if (ovr >= 70) return "A-";
      if (ovr >= 65) return "B+";
      if (ovr >= 60) return "B";
      if (ovr >= 55) return "B-";
      if (ovr >= 50) return "C+";
      if (ovr >= 45) return "C";
      if (ovr >= 40) return "C-";
      return "D";
    };
    
    const tier = getTier(overall);
    
    // gol.gg 기반 세부 지표 생성 (ROSTER_DB 스타일, 2군 신인 기준)
    // 포지션별 기본값과 변동폭 설정
    const getDetailedStats = (pos: Position): PlayerDetailedStats => {
      const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
      const randomFloat = (min: number, max: number) => Math.random() * (max - min) + min;
      
      // 포지션별 기본 범위 (ROSTER_DB 2군 선수 데이터 기반)
      switch (pos) {
        case "TOP":
          return {
            dpm: random(320, 380),
            dmg_pct: randomFloat(20, 25),
            kda_per_min: randomFloat(0.20, 0.30),
            solo_kill: random(1, 4),
            csd15: random(-8, -3),
            gd15: random(-60, -30),
            xpd15: random(-40, -15),
            fb_part: random(10, 20),
            fb_victim: random(20, 30),
          };
        case "JGL":
          return {
            dpm: random(300, 360),
            dmg_pct: randomFloat(15, 20),
            kda_per_min: randomFloat(0.30, 0.40),
            solo_kill: random(0, 3),
            csd15: random(-5, 0),
            gd15: random(-40, -10),
            xpd15: random(-30, -5),
            fb_part: random(30, 45),
            fb_victim: random(15, 25),
          };
        case "MID":
          return {
            dpm: random(380, 450),
            dmg_pct: randomFloat(22, 28),
            kda_per_min: randomFloat(0.25, 0.35),
            solo_kill: random(0, 3),
            csd15: random(-5, 0),
            gd15: random(-30, -5),
            xpd15: random(-25, 0),
            fb_part: random(15, 30),
            fb_victim: random(12, 20),
          };
        case "ADC":
          return {
            dpm: random(350, 420),
            dmg_pct: randomFloat(24, 30),
            kda_per_min: randomFloat(0.25, 0.35),
            solo_kill: random(0, 3),
            csd15: random(-10, -5),
            gd15: random(-50, -20),
            xpd15: random(-30, -10),
            fb_part: random(8, 15),
            fb_victim: random(15, 25),
          };
        case "SPT":
          return {
            dpm: random(140, 200),
            dmg_pct: randomFloat(7, 12),
            kda_per_min: randomFloat(0.35, 0.50),
            solo_kill: 0,
            csd15: random(-6, -2),
            gd15: random(-40, -15),
            xpd15: random(-25, -10),
            fb_part: random(25, 40),
            fb_victim: random(18, 28),
          };
      }
    };
    
    const detailedStats = getDetailedStats(position);
    
    // 초기 연봉 (2군 신인 기준)
    const initialSalary = 0.5; // 0.5억원
    
    const newPlayer: Player = {
      id: `user-player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      nickname,
      position,
      age,
      tier,
      stats,
      detailedStats, // 세부 지표 추가
      salary: initialSalary,
      contractEndsAt: get().season + 2, // 2년 계약
      teamId: "", // 팀 선택 전까지는 빈 문자열
      division: "2군", // 2군으로 시작
      transferOffers: [], // 초기 이적 제안 없음
    };
    
    set({ 
      userPlayer: newPlayer, 
      userPlayerInitialTrait: initialTrait,
      userPlayerRoleModelId: roleModelId || null 
    });
    
    // players 배열에도 추가 (전역 선수 목록)
    set((state) => ({
      players: [...state.players, newPlayer],
    }));
  },

  // 채팅 관련
  addMessage: (message: ChatMessage) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  setCurrentOptions: (options: Option[]) => {
    set({ currentOptions: options });
  },

  setAvailableActions: (actions: Array<{ id: string; label: string; command: string; variant?: "default" | "outline" | "ghost" | "destructive"; icon?: React.ReactNode }>) => {
    set({ availableActions: actions });
  },

  sendCommand: async (command: string) => {
    const state = get();
    if (!state.apiKey) {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        type: "system",
        content: "API 키가 설정되지 않았습니다.",
        timestamp: new Date(),
      };
      set((s) => ({ messages: [...s.messages, errorMsg] }));
      return;
    }

    // "일정 진행" 관련 명령어 감지
    const isScheduleProgressCommand = 
      command.includes("일정 진행") || 
      command.includes("하루 진행") || 
      command.includes("다음 주로") ||
      command.includes("다음주로") ||
      command.includes("스토브리그 일정 진행");
    
    // 일정 진행 명령어인 경우, 이벤트 체크는 AI가 처리하도록 함
    // (로스터/스태프 필수 체크는 시스템 프롬프트에서 처리)

    // 로딩 상태 시작
    set({ isLoading: true });
    
    // 명령어 전송 시 availableActions 초기화 (새로운 응답을 기다림)
    get().setAvailableActions([]);

    // 사용자 메시지 추가
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: command,
      timestamp: new Date(),
    };
    set((s) => ({ messages: [...s.messages, userMessage] }));

    // 로딩 메시지
    const loadingId = `loading-${Date.now()}`;
    const loadingMessage: ChatMessage = {
      id: loadingId,
      type: "system",
      content: "처리 중...",
      timestamp: new Date(),
    };
    set((s) => ({ messages: [...s.messages, loadingMessage] }));

    try {
      // 메시지 히스토리 구성 (최근 20개 메시지, 시스템 메시지 제외)
      const messageHistory = state.messages
        .filter((msg) => msg.type !== "system" || msg.content.includes("저장") || msg.content.includes("불러오기"))
        .slice(-20)
        .map((msg) => ({
          role: msg.type === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        }));

      // API 호출
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: state.apiKey,
          command,
          messageHistory, // 대화 히스토리 전달
          gameState: {
            currentDate: state.currentDate.toISOString(),
            currentTeamId: state.currentTeamId,
            gameMode: state.gameMode,
            userPlayer: state.userPlayer ? {
              id: state.userPlayer.id,
              name: state.userPlayer.name,
              nickname: state.userPlayer.nickname,
              position: state.userPlayer.position,
              age: state.userPlayer.age,
              tier: state.userPlayer.tier,
              stats: state.userPlayer.stats,
              division: state.userPlayer.division,
              teamId: state.userPlayer.teamId,
            } : null,
            userPlayerInitialTrait: state.userPlayerInitialTrait,
            userPlayerRoleModelId: state.userPlayerRoleModelId,
            teams: state.teams.map((t) => ({
              id: t.id,
              name: t.name,
              money: t.money,
              roster: t.roster.map((p) => ({
                id: p.id,
                nickname: p.nickname,
                name: p.name,
                position: p.position,
                tier: p.tier,
              })),
            })),
            players: state.players.map((p) => ({
              id: p.id,
              nickname: p.nickname,
              name: p.name,
              position: p.position,
              tier: p.tier,
              teamId: p.teamId,
            })),
            news: state.news.slice(0, 10), // 최근 10개만
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API 오류: ${response.status}`);
      }

      const data = await response.json();
      
      // API에서 오류 응답이 온 경우
      if (data.error) {
        throw new Error(data.error);
      }
      
      const aiResponse = data.response || "응답을 받지 못했습니다.";

      // 로딩 메시지 제거
      set((s) => ({
        messages: s.messages.filter((m) => m.id !== loadingId),
      }));

      // 응답 파싱하여 상태 업데이트 및 필터링
      const { updates, options, filteredContent } = parseAIResponse(aiResponse, get());
      
      // "일정 진행" 명령어인데 날짜가 업데이트되지 않았다면 강제로 현재 날짜 유지
      // (이미 위에서 advanceDay를 호출했으므로)
      if (isScheduleProgressCommand && !updates.currentDate) {
        const currentState = get();
        // 검증: 현재 날짜가 이전 날짜보다 작지 않도록 보장
        updates.currentDate = validateDateUpdate(currentState.currentDate, state.currentDate);
      }
      
      // 필터링된 내용으로 메시지 추가
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        type: "game",
        content: filteredContent.trim(),
        timestamp: new Date(),
      };
      set((s) => ({ messages: [...s.messages, aiMessage] }));

      // 선택지 업데이트
      set({ currentOptions: options });
      
      // options를 availableActions로 변환
      if (options.length > 0) {
        const actions = options.map((opt, index) => ({
          id: `action-${Date.now()}-${index}`,
          label: opt.label,
          command: opt.value,
          variant: "outline" as const, // 모든 버튼을 동일한 variant로 설정 (호버 시에만 하이라이트)
        }));
        get().setAvailableActions(actions);
      } else {
        // options가 없으면 availableActions도 초기화
        get().setAvailableActions([]);
      }

      if (Object.keys(updates).length > 0) {
        // 날짜 보호: 업데이트 전 현재 날짜 저장
        const currentDateBeforeUpdate = state.currentDate;
        
        // rosters 업데이트가 있으면 별도로 처리하고 teams[].roster와 동기화
        if (updates.rosters) {
          set((s) => {
            const updatedRosters = {
              ...s.rosters,
              ...updates.rosters,
            };
            
            // teams 배열의 currentTeamId에 해당하는 팀의 roster도 동기화
            const updatedTeams = s.teams.map((team) => {
              if (team.id === s.currentTeamId) {
                // PlayerInfo[]를 Player[]로 변환 (기존 stats 유지)
                const allRosterPlayers: Player[] = [
                  ...(updatedRosters.team1 || []).map((playerInfo) => {
                    // 기존 Player 객체 찾기
                    const existingPlayer = team.roster.find((p) => p.id === playerInfo.id);
                    if (existingPlayer) {
                      // 기존 stats 유지하면서 다른 속성만 업데이트
                      return {
                        ...existingPlayer,
                        name: playerInfo.name,
                        nickname: playerInfo.nickname,
                        position: playerInfo.position,
                        age: playerInfo.age,
                        tier: playerInfo.tier,
                        salary: playerInfo.salary,
                        contractEndsAt: playerInfo.contractEndsAt,
                        division: playerInfo.division || existingPlayer.division,
                      };
                    } else {
                      // 새로운 선수: overall을 기반으로 stats 생성
                      const avgStat = playerInfo.overall;
                      return {
                        id: playerInfo.id,
                        name: playerInfo.name,
                        nickname: playerInfo.nickname,
                        position: playerInfo.position,
                        age: playerInfo.age,
                        tier: playerInfo.tier,
                        stats: {
                          라인전: avgStat,
                          한타: avgStat,
                          운영: avgStat,
                          피지컬: avgStat,
                          챔프폭: avgStat,
                          멘탈: avgStat,
                        },
                        salary: playerInfo.salary,
                        contractEndsAt: playerInfo.contractEndsAt,
                        teamId: s.currentTeamId,
                        division: playerInfo.division || "1군",
                      };
                    }
                  }),
                  ...(updatedRosters.team2 || []).map((playerInfo) => {
                    const existingPlayer = team.roster.find((p) => p.id === playerInfo.id);
                    if (existingPlayer) {
                      return {
                        ...existingPlayer,
                        name: playerInfo.name,
                        nickname: playerInfo.nickname,
                        position: playerInfo.position,
                        age: playerInfo.age,
                        tier: playerInfo.tier,
                        salary: playerInfo.salary,
                        contractEndsAt: playerInfo.contractEndsAt,
                        division: playerInfo.division || existingPlayer.division,
                      };
                    } else {
                      const avgStat = playerInfo.overall;
                      return {
                        id: playerInfo.id,
                        name: playerInfo.name,
                        nickname: playerInfo.nickname,
                        position: playerInfo.position,
                        age: playerInfo.age,
                        tier: playerInfo.tier,
                        stats: {
                          라인전: avgStat,
                          한타: avgStat,
                          운영: avgStat,
                          피지컬: avgStat,
                          챔프폭: avgStat,
                          멘탈: avgStat,
                        },
                        salary: playerInfo.salary,
                        contractEndsAt: playerInfo.contractEndsAt,
                        teamId: s.currentTeamId,
                        division: playerInfo.division || "2군",
                      };
                    }
                  }),
                ];
                
                return {
                  ...team,
                  roster: allRosterPlayers,
                };
              }
              return team;
            });
            
            return {
              rosters: updatedRosters,
              teams: updatedTeams,
            };
          });
          
          // rosters를 제외한 나머지 업데이트
          const { rosters, currentDate: updateDate, ...otherUpdates } = updates;
          
          // 날짜 업데이트가 있으면 보호 로직 적용
          if (updateDate) {
            set((s) => {
              // 날짜 역행 방지 검증 함수 사용
              const validatedDate = validateDateUpdate(updateDate, s.currentDate);
              if (validatedDate.getTime() === updateDate.getTime()) {
                // 검증 통과: 날짜 업데이트
                return { ...otherUpdates, currentDate: validatedDate };
              } else {
                // 검증 실패: 날짜 유지
                return otherUpdates;
              }
            });
          } else if (Object.keys(otherUpdates).length > 0) {
            set(otherUpdates);
          }
        } else {
          // rosters가 없는 경우: 날짜 보호 로직 적용
          const { currentDate: updateDate, ...otherUpdates } = updates;
          
          if (updateDate) {
            set((s) => {
              // 날짜 역행 방지 검증 함수 사용
              const validatedDate = validateDateUpdate(updateDate, s.currentDate);
              if (validatedDate.getTime() === updateDate.getTime()) {
                // 검증 통과: 날짜 업데이트
                return { ...otherUpdates, currentDate: validatedDate };
              } else {
                // 검증 실패: 날짜 유지
                return otherUpdates;
              }
            });
          } else if (Object.keys(otherUpdates).length > 0) {
            set(otherUpdates);
          }
        }
        
        // 최종 날짜 검증: 업데이트 후에도 날짜가 역행하지 않았는지 확인 (이중 보호)
        set((s) => {
          const validatedDate = validateDateUpdate(s.currentDate, currentDateBeforeUpdate);
          if (validatedDate.getTime() !== s.currentDate.getTime()) {
            console.error(`치명적 오류: 날짜가 역행했습니다. ${currentDateBeforeUpdate.toISOString()} -> ${s.currentDate.toISOString()}. 날짜를 복구합니다.`);
            return { currentDate: validatedDate };
          }
          return {};
        });
      }
      
      // 로딩 상태 종료
      set({ isLoading: false });
    } catch (error) {
      // 로딩 메시지 제거
      set((s) => ({
        messages: s.messages.filter((m) => m.id !== loadingId),
      }));

      // 사용자에게 오류 메시지 표시
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: "system",
        content: `❌ ${error instanceof Error ? error.message : "명령 실행 중 오류가 발생했습니다."}`,
        timestamp: new Date(),
      };
      set((s) => ({ messages: [...s.messages, errorMessage] }));
      
      // 로딩 상태 종료
      set({ isLoading: false });
    }
  },

  // 게임 진행 제어
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),

  advanceDay: () =>
    set((state) => {
      const newDate = new Date(state.currentDate);
      newDate.setDate(newDate.getDate() + 1);
      
      // 날짜 역행 방지 검증 (혹시 모를 역행 방지)
      const validatedDate = validateDateUpdate(newDate, state.currentDate);
      const newState = { ...state, currentDate: validatedDate };

      // 연도 변경 체크 (1월 1일) - 선수 노화 적용
      const oldYear = state.currentDate.getFullYear();
      const newYear = newDate.getFullYear();
      if (oldYear !== newYear && newDate.getMonth() === 0 && newDate.getDate() === 1) {
        // 모든 선수에게 나이 증가 및 노화 적용
        get().applyPlayerAgingToAll();
      }

      // 월초(1일) 체크 - 경제 시스템 처리
      if (newDate.getDate() === 1) {
        // 모든 팀의 월간 지출 처리
        newState.teams = newState.teams.map((team) => {
          const monthlySalary = (calculateTeamSalary(team) * 100000000) / 12; // 억원 -> 원, 월별
          const operatingCost = 50000000; // 운영비 5천만원
          const totalExpense = monthlySalary + operatingCost;
          const newMoney = Math.max(0, team.money - totalExpense);

          return {
            ...team,
            money: newMoney,
          };
        });

        // 샐러리캡 경고 체크 및 뉴스 생성
        newState.teams.forEach((team) => {
          const salaryCheck = get().checkSalaryCap(team.id);
          if (salaryCheck.isOver) {
            const news: NewsItem = {
              id: `salary-cap-${team.id}-${newDate.getTime()}`,
              title: `${team.name} 샐러리캡 초과 경고`,
              content: `${team.name}의 총 연봉이 샐러리캡(40억원)을 초과했습니다. 현재: ${(salaryCheck.current / 100000000).toFixed(1)}억원`,
              date: new Date(newDate),
              type: "general",
              relatedTeamIds: [team.id],
            };
            newState.news = [news, ...newState.news].slice(0, 50);
          }
        });
      }

      // 예정된 경기 체크 및 자동 시뮬레이션
      const todayMatches = newState.scheduledMatches.filter(
        (match) =>
          match.date.toDateString() === newDate.toDateString() &&
          match.status === "scheduled"
      );

      todayMatches.forEach((match) => {
        get().simulateMatch(match.id);
      });

      return newState;
    }),

  setCurrentTeam: (teamId: string) => set({ currentTeamId: teamId }),

  // 경기 관련
  scheduleMatch: (homeTeamId, awayTeamId, date, matchType = "regular") => {
    const matchId = `match-${homeTeamId}-${awayTeamId}-${date.getTime()}`;
    const match: Match = {
      id: matchId,
      date,
      homeTeamId,
      awayTeamId,
      status: "scheduled",
      matchType,
      points: matchType === "lck_cup" ? 2 : 1,
    };

    set((state) => ({
      scheduledMatches: [...state.scheduledMatches, match],
    }));

    return matchId;
  },

  setCurrentMatch: (match: Match | null) => set({ currentMatch: match }),
  setSimulationMode: (mode: "one_set" | "match" | "tournament" | null) => set({ simulationMode: mode }),

  // 1세트만 시뮬레이션
  simulateOneSet: (matchId: string) => {
    set((state) => {
      // scheduledMatches 또는 currentMatch에서 찾기
      let match = state.currentMatch;
      let matchIndex = -1;
      
      if (!match || match.id !== matchId) {
        matchIndex = state.scheduledMatches.findIndex((m) => m.id === matchId);
        if (matchIndex === -1) return state;
        match = state.scheduledMatches[matchIndex];
      }

      if (match.status === "completed") return state;

      const homeTeam = state.teams.find((t) => t.id === match.homeTeamId);
      const awayTeam = state.teams.find((t) => t.id === match.awayTeamId);

      if (!homeTeam || !awayTeam) return state;

      // 현재 세트 스코어 가져오기
      const currentHomeScore = match.homeScore || 0;
      const currentAwayScore = match.awayScore || 0;
      const currentSets = match.currentSets || [];

      // 1세트 시뮬레이션
      const setResult = simulateOneSetLogic(homeTeam, awayTeam, match.matchType);
      const newHomeScore = setResult.winner === homeTeam.id ? currentHomeScore + 1 : currentHomeScore;
      const newAwayScore = setResult.winner === awayTeam.id ? currentAwayScore + 1 : currentAwayScore;
      const newSets = [...currentSets, setResult];

      // 경기 형식 결정
      const isBo5 = match.matchType === "lck_cup" || match.matchType === "playoff" || match.matchType === "msi" || match.matchType === "worlds";
      const setsToWin = isBo5 ? 3 : 2;
      const isMatchComplete = newHomeScore >= setsToWin || newAwayScore >= setsToWin;

      // 경기 완료 여부 확인
      if (isMatchComplete) {
        const winner = newHomeScore > newAwayScore ? homeTeam.id : awayTeam.id;
        const winnerTeam = winner === homeTeam.id ? homeTeam : awayTeam;
        const winnerRoster = winnerTeam.roster.filter((p) => p.division === "1군");
        const pogPlayer = winnerRoster.reduce((best, current) => {
          const bestTotal = Object.values(best.stats).reduce((a, b) => a + b, 0);
          const currentTotal = Object.values(current.stats).reduce((a, b) => a + b, 0);
          return currentTotal > bestTotal ? current : best;
        }, winnerRoster[0]);

        const completedMatch: Match = {
          ...match,
          status: "completed",
          homeScore: newHomeScore,
          awayScore: newAwayScore,
          currentSets: newSets,
          result: {
            homeScore: newHomeScore,
            awayScore: newAwayScore,
            winner,
            pog: {
              playerId: pogPlayer.id,
              playerName: pogPlayer.nickname,
              teamId: winnerTeam.id,
            },
            sets: newSets,
          },
        };

        // 상태 가져오기
        const state = get();

        // 경기 결과를 matches에 추가
        const newMatches = [...state.matches, completedMatch];
        const newScheduledMatches = state.scheduledMatches.filter((m) => m.id !== matchId);

        // 선수별 세부 지표 업데이트 (각 세트마다)
        const tournament = match.matchType === "regular" ? "regularSeason" 
          : match.matchType === "lck_cup" ? "lckCup"
          : match.matchType === "playoff" ? "playoff"
          : match.matchType === "msi" ? "msi"
          : match.matchType === "worlds" ? "worlds"
          : "regularSeason";

        // 각 세트별로 선수 통계 업데이트
        newSets.forEach((set) => {
          const setWinner = set.winner === homeTeam.id ? homeTeam : awayTeam;
          const setLoser = set.winner === homeTeam.id ? awayTeam : homeTeam;
          
          // 승리팀 선수들 통계 업데이트
          setWinner.roster.filter((p) => p.division === "1군").forEach((player) => {
            const matchStats = calculatePlayerMatchStats(player, true, set.duration, player.position);
            state.updatePlayerSeasonStats(player.id, {
              tournament,
              wins: 1,
              totalDamage: matchStats.dpm * set.duration, // 총 데미지 = dpm * 경기 시간
              totalKills: Math.round(matchStats.kda_per_min * set.duration * 0.4), // 추정
              totalDeaths: Math.round(matchStats.kda_per_min * set.duration * 0.2), // 추정
              totalAssists: Math.round(matchStats.kda_per_min * set.duration * 0.4), // 추정
              totalDpm: matchStats.dpm,
              totalDmgPct: matchStats.dmg_pct,
              totalKdaPerMin: matchStats.kda_per_min,
              totalSoloKill: matchStats.solo_kill,
              totalCsd15: matchStats.csd15,
              totalGd15: matchStats.gd15,
              totalXpd15: matchStats.xpd15,
              totalFbPart: matchStats.fb_part,
              totalFbVictim: matchStats.fb_victim,
            });
          });

          // 패배팀 선수들 통계 업데이트
          setLoser.roster.filter((p) => p.division === "1군").forEach((player) => {
            const matchStats = calculatePlayerMatchStats(player, false, set.duration, player.position);
            state.updatePlayerSeasonStats(player.id, {
              tournament,
              losses: 1,
              totalDamage: matchStats.dpm * set.duration,
              totalKills: Math.round(matchStats.kda_per_min * set.duration * 0.3),
              totalDeaths: Math.round(matchStats.kda_per_min * set.duration * 0.3),
              totalAssists: Math.round(matchStats.kda_per_min * set.duration * 0.3),
              totalDpm: matchStats.dpm,
              totalDmgPct: matchStats.dmg_pct,
              totalKdaPerMin: matchStats.kda_per_min,
              totalSoloKill: matchStats.solo_kill,
              totalCsd15: matchStats.csd15,
              totalGd15: matchStats.gd15,
              totalXpd15: matchStats.xpd15,
              totalFbPart: matchStats.fb_part,
              totalFbVictim: matchStats.fb_victim,
            });
          });
        });

        // 뉴스 생성
        const loserTeam = winner === homeTeam.id ? awayTeam : homeTeam;
        const news: NewsItem = {
          id: `match-${matchId}-${Date.now()}`,
          title: `${winnerTeam.name} ${newHomeScore} - ${newAwayScore} ${loserTeam.name}`,
          content: `${winnerTeam.name}이(가) ${loserTeam.name}을(를) 상대로 승리했습니다. POG: ${pogPlayer.nickname} (${winnerTeam.name})`,
          date: new Date(match.date),
          type: "match",
          relatedTeamIds: [homeTeam.id, awayTeam.id],
        };

        // 롤모델 관련 뉴스 생성
        if (state.gameMode === "PLAYER" && state.userPlayerRoleModelId) {
          // 롤모델이 POG를 받은 경우
          if (pogPlayer.id === state.userPlayerRoleModelId) {
            const roleModelNews: NewsItem = {
              id: `rolemodel-pog-${Date.now()}`,
              title: `롤모델 ${pogPlayer.nickname} 선수, POG 수상!`,
              content: `존경하는 롤모델 ${pogPlayer.nickname} 선수가 ${winnerTeam.name}의 승리에 기여하며 POG를 수상했습니다. 이번 경기를 통해 더 많은 영감을 받았습니다.`,
              date: new Date(match.date),
              type: "general",
              relatedTeamIds: [winnerTeam.id],
            };
            return {
              matches: newMatches,
              scheduledMatches: newScheduledMatches,
              currentMatch: null,
              news: [roleModelNews, news, ...state.news].slice(0, 50),
            };
          }
          
          // 내가 POG를 받고 롤모델이 상대팀에 있었던 경우
          const isUserPlayerPOG = pogPlayer.id === state.userPlayer?.id;
          const isRoleModelInMatch = homeTeam.roster.some(p => p.id === state.userPlayerRoleModelId) ||
                                     awayTeam.roster.some(p => p.id === state.userPlayerRoleModelId);
          
          if (isUserPlayerPOG && isRoleModelInMatch) {
            const roleModel = state.players.find(p => p.id === state.userPlayerRoleModelId);
            if (roleModel) {
              const roleModelNews: NewsItem = {
                id: `rolemodel-outperformed-${Date.now()}`,
                title: `차세대 에이스의 등장! ${state.userPlayer?.nickname} 선수`,
                content: `신인 ${state.userPlayer?.nickname} 선수가 롤모델 ${roleModel.nickname} 선수가 있는 경기에서 POG를 수상하며 주목받고 있습니다. "롤모델을 뛰어넘는 것이 목표였습니다"라고 소감을 밝혔습니다.`,
                date: new Date(match.date),
                type: "general",
                relatedTeamIds: [homeTeam.id, awayTeam.id],
              };
              return {
                matches: newMatches,
                scheduledMatches: newScheduledMatches,
                currentMatch: null,
                news: [roleModelNews, news, ...state.news].slice(0, 50),
              };
            }
          }
        }

        return {
          matches: newMatches,
          scheduledMatches: newScheduledMatches,
          currentMatch: null,
          news: [news, ...state.news].slice(0, 50),
        };
      } else {
        // 경기 진행 중 상태로 업데이트
        const updatedMatch: Match = {
          ...match,
          status: "in_progress",
          homeScore: newHomeScore,
          awayScore: newAwayScore,
          currentSets: newSets,
        };

        if (matchIndex >= 0) {
          const newScheduledMatches = [...state.scheduledMatches];
          newScheduledMatches[matchIndex] = updatedMatch;
          return {
            scheduledMatches: newScheduledMatches,
            currentMatch: updatedMatch,
          };
        } else {
          return {
            currentMatch: updatedMatch,
          };
        }
      }
    });
  },

  // 매치 종료까지 시뮬레이션
  simulateMatchUntilEnd: (matchId: string) => {
    const state = get();
    let match = state.currentMatch;
    if (!match || match.id !== matchId) {
      const matchIndex = state.scheduledMatches.findIndex((m) => m.id === matchId);
      if (matchIndex === -1) return;
      match = state.scheduledMatches[matchIndex];
    }

    if (match.status === "completed") return;

    const homeTeam = state.teams.find((t) => t.id === match.homeTeamId);
    const awayTeam = state.teams.find((t) => t.id === match.awayTeamId);
    if (!homeTeam || !awayTeam) return;

    // 현재 세트 스코어 가져오기
    let currentHomeScore = match.homeScore || 0;
    let currentAwayScore = match.awayScore || 0;
    let currentSets = match.currentSets || [];

    // 경기 형식 결정
    const isBo5 = match.matchType === "lck_cup" || match.matchType === "playoff" || match.matchType === "msi" || match.matchType === "worlds";
    const setsToWin = isBo5 ? 3 : 2;

    // 매치가 끝날 때까지 세트 시뮬레이션
    while (currentHomeScore < setsToWin && currentAwayScore < setsToWin) {
      const setResult = simulateOneSetLogic(homeTeam, awayTeam, match.matchType);
      if (setResult.winner === homeTeam.id) {
        currentHomeScore++;
      } else {
        currentAwayScore++;
      }
      currentSets.push(setResult);
    }

    // 경기 완료 처리
    const winner = currentHomeScore > currentAwayScore ? homeTeam.id : awayTeam.id;
    const winnerTeam = winner === homeTeam.id ? homeTeam : awayTeam;
    const winnerRoster = winnerTeam.roster.filter((p) => p.division === "1군");
    const pogPlayer = winnerRoster.reduce((best, current) => {
      const bestTotal = Object.values(best.stats).reduce((a, b) => a + b, 0);
      const currentTotal = Object.values(current.stats).reduce((a, b) => a + b, 0);
      return currentTotal > bestTotal ? current : best;
    }, winnerRoster[0]);

    const completedMatch: Match = {
      ...match,
      status: "completed",
      homeScore: currentHomeScore,
      awayScore: currentAwayScore,
      currentSets: currentSets,
      result: {
        homeScore: currentHomeScore,
        awayScore: currentAwayScore,
        winner,
        pog: {
          playerId: pogPlayer.id,
          playerName: pogPlayer.nickname,
          teamId: winnerTeam.id,
        },
        sets: currentSets,
      },
    };

    set((state) => {
      const newMatches = [...state.matches, completedMatch];
      const newScheduledMatches = state.scheduledMatches.filter((m) => m.id !== matchId);

      // 뉴스 생성
      const loserTeam = winner === homeTeam.id ? awayTeam : homeTeam;
      const news: NewsItem = {
        id: `match-${matchId}-${Date.now()}`,
        title: `${winnerTeam.name} ${currentHomeScore} - ${currentAwayScore} ${loserTeam.name}`,
        content: `${winnerTeam.name}이(가) ${loserTeam.name}을(를) 상대로 승리했습니다. POG: ${pogPlayer.nickname} (${winnerTeam.name})`,
        date: new Date(match.date),
        type: "match",
        relatedTeamIds: [homeTeam.id, awayTeam.id],
      };

      // 롤모델 관련 뉴스 생성
      const roleModelNews: NewsItem[] = [];
      if (state.gameMode === "PLAYER" && state.userPlayerRoleModelId) {
        // 롤모델이 POG를 받은 경우
        if (pogPlayer.id === state.userPlayerRoleModelId) {
          roleModelNews.push({
            id: `rolemodel-pog-${Date.now()}`,
            title: `롤모델 ${pogPlayer.nickname} 선수, POG 수상!`,
            content: `존경하는 롤모델 ${pogPlayer.nickname}(${pogPlayer.name}) 선수가 ${winnerTeam.name}의 승리에 기여하며 POG를 수상했습니다. 이번 경기를 통해 더 많은 영감을 받았습니다.`,
            date: new Date(match.date),
            type: "general",
            relatedTeamIds: [winnerTeam.id],
          });
        }
        
        // 내가 POG를 받고 롤모델이 상대팀에 있었던 경우
        const isUserPlayerPOG = pogPlayer.id === state.userPlayer?.id;
        const isRoleModelInMatch = homeTeam.roster.some(p => p.id === state.userPlayerRoleModelId) ||
                                   awayTeam.roster.some(p => p.id === state.userPlayerRoleModelId);
        
        if (isUserPlayerPOG && isRoleModelInMatch) {
          const roleModel = state.players.find(p => p.id === state.userPlayerRoleModelId);
          if (roleModel) {
            roleModelNews.push({
              id: `rolemodel-outperformed-${Date.now()}`,
              title: `차세대 에이스의 등장! ${state.userPlayer?.nickname} 선수`,
              content: `신인 ${state.userPlayer?.nickname} 선수가 롤모델 ${roleModel.nickname} 선수가 있는 경기에서 POG를 수상하며 주목받고 있습니다. "롤모델을 뛰어넘는 것이 목표였습니다"라고 소감을 밝혔습니다.`,
              date: new Date(match.date),
              type: "general",
              relatedTeamIds: [homeTeam.id, awayTeam.id],
            });
          }
        }
      }

      return {
        matches: newMatches,
        scheduledMatches: newScheduledMatches,
        currentMatch: null,
        news: [...roleModelNews, news, ...state.news].slice(0, 50),
      };
    });
  },

  // 대회 전체 진행
  simulateTournament: async () => {
    const state = get();
    const today = new Date(state.currentDate);
    today.setHours(0, 0, 0, 0);

    // 오늘 예정된 경기들 찾기
    const todayMatches = state.scheduledMatches.filter((m) => {
      const matchDate = new Date(m.date);
      matchDate.setHours(0, 0, 0, 0);
      return m.status === "scheduled" && matchDate.getTime() === today.getTime();
    });

    // 모든 경기를 순차적으로 시뮬레이션
    for (const match of todayMatches) {
      get().simulateMatchUntilEnd(match.id);
      // 약간의 딜레이 (UI 업데이트를 위해)
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // 다음 날로 진행
    get().advanceDay();
  },

  simulateMatch: (matchId: string) => {
    // 기존 함수는 매치 종료까지 시뮬레이션하도록 변경
    get().simulateMatchUntilEnd(matchId);
  },

  // 경제 시스템
  processMonthlyExpenses: () => {
    set((state) => {
      const newTeams = state.teams.map((team) => {
        const monthlySalary = (calculateTeamSalary(team) * 100000000) / 12;
        const operatingCost = 50000000;
        const totalExpense = monthlySalary + operatingCost;
        const newMoney = Math.max(0, team.money - totalExpense);

        return {
          ...team,
          money: newMoney,
        };
      });

      return { teams: newTeams };
    });
  },

  checkSalaryCap: (teamId: string) => {
    const state = get();
    const team = state.teams.find((t) => t.id === teamId);
    if (!team) return { isOver: false, current: 0, cap: 4000000000 };

    const currentSalary = calculateTeamSalary(team) * 100000000; // 억원 -> 원
    const salaryCap = 4000000000; // 40억원

    return {
      isOver: currentSalary > salaryCap,
      current: currentSalary,
      cap: salaryCap,
    };
  },

  // 자금 업데이트 전용 함수 (단일 source of truth)
  updateTeamMoney: (teamId: string, newMoney: number) => {
    set((state) => ({
      teams: state.teams.map((team) =>
        team.id === teamId
          ? { ...team, money: Math.max(0, newMoney) } // 음수 방지
          : team
      ),
    }));
  },

  // 유틸리티
  getCurrentSeasonEvent: () => {
    const state = get();
    return getSeasonEvent(state.currentDate);
  },

  getTeamById: (teamId: string) => {
    const state = get();
    return state.teams.find((t) => t.id === teamId);
  },

  getPlayerById: (playerId: string) => {
    const state = get();
    return state.players.find((p) => p.id === playerId);
  },

  // 새로운 상태 업데이트 액션
  setUpcomingMatches: (matches: MatchInfo[]) => {
    set({ upcomingMatches: matches });
  },

  addNewsToHistory: (news: NewsItem) => {
    set((state) => ({
      newsHistory: [news, ...state.newsHistory],
    }));
  },

  updateRankings: (tournament: keyof GameState["rankings"], ranks: TeamRank[]) => {
    set((state) => ({
      rankings: {
        ...state.rankings,
        [tournament]: ranks,
      },
    }));
  },

  setFAList: (players: PlayerInfo[]) => {
    set({ faList: players });
  },

  updateRosters: (rosters: Partial<GameState["rosters"]>) => {
    set((state) => ({
      rosters: {
        ...state.rosters,
        ...rosters,
      },
    }));
  },

  // 인터랙티브 시뮬레이션 상태 머신 액션
  setPhase: (phase: SimulationPhase | null) => {
    set((state) => ({
      simulationState: {
        ...state.simulationState,
        currentPhase: phase,
      },
    }));
  },

  addModifier: (modifier: WinRateModifier) => {
    set((state) => ({
      simulationState: {
        ...state.simulationState,
        winRateModifiers: [...state.simulationState.winRateModifiers, modifier],
      },
    }));
  },

  removeModifier: (source: string) => {
    set((state) => ({
      simulationState: {
        ...state.simulationState,
        winRateModifiers: state.simulationState.winRateModifiers.filter(
          (m) => m.source !== source
        ),
      },
    }));
  },

  clearModifiers: () => {
    set((state) => ({
      simulationState: {
        ...state.simulationState,
        winRateModifiers: [],
      },
    }));
  },

  setWaiting: (waiting: boolean) => {
    set((state) => ({
      simulationState: {
        ...state.simulationState,
        isWaitingForUser: waiting,
      },
    }));
  },

  setChoices: (choices: SimulationChoice[]) => {
    set((state) => ({
      simulationState: {
        ...state.simulationState,
        currentChoices: choices,
      },
    }));
  },

  addPhaseHistory: (phase: SimulationPhase, choiceId: string) => {
    set((state) => ({
      simulationState: {
        ...state.simulationState,
        phaseHistory: [
          ...state.simulationState.phaseHistory,
          {
            phase,
            choiceId,
            timestamp: new Date(),
          },
        ],
      },
    }));
  },

  resetSimulationState: () => {
    set({
      simulationState: {
        currentPhase: null,
        isWaitingForUser: false,
        winRateModifiers: [],
        currentChoices: [],
        matchId: null,
        currentSet: 0,
        phaseHistory: [],
      },
    });
  },

  initializeSimulation: (matchId: string, currentSet: number) => {
    set({
      simulationState: {
        currentPhase: SimulationPhase.DRAFT,
        isWaitingForUser: false,
        winRateModifiers: [],
        currentChoices: [],
        matchId,
        currentSet,
        phaseHistory: [],
      },
    });
  },

  // 인터랙티브 시뮬레이션 시작
  startInteractiveSimulation: (matchId: string) => {
    const state = get();
    const match = state.currentMatch || 
      state.scheduledMatches.find((m) => m.id === matchId);
    
    if (!match) {
      console.error("경기를 찾을 수 없습니다.");
      return;
    }

    // 현재 세트 번호 계산
    const currentSet = (match.currentSets?.length || 0) + 1;

    // 시뮬레이션 초기화
    get().initializeSimulation(matchId, currentSet);

    // 경기를 in_progress 상태로 설정
    const inProgressMatch: Match = {
      ...match,
      status: "in_progress",
      homeScore: match.homeScore || 0,
      awayScore: match.awayScore || 0,
      currentSets: match.currentSets || [],
    };
    get().setCurrentMatch(inProgressMatch);

    // 첫 페이즈로 진행 (동적 import 사용)
    import("@/lib/simulation/engine").then((module) => {
      module.advanceSimulationPhase();
    });
  },

  // 인터랙티브 시뮬레이션 엔진 함수들
  advanceSimulationPhase: () => {
    engineAdvanceSimulationPhase();
  },

  submitDecision: (choiceId: string) => {
    engineSubmitDecision(choiceId);
  },

  // 선수별 통계 업데이트
  updatePlayerSeasonStats: (playerId: string, stats: Partial<PlayerSeasonStats>) => {
    const state = get();
    const existing = state.playerSeasonStats.find(
      (s) => s.playerId === playerId && s.season === state.season && s.tournament === stats.tournament
    );

    if (existing) {
      // 기존 통계 업데이트
      const updatedStats = {
        ...existing,
        ...stats,
        totalGames: stats.totalGames !== undefined ? stats.totalGames : existing.totalGames + 1,
        totalDamage: (stats.totalDamage || 0) + existing.totalDamage,
        totalKills: (stats.totalKills || 0) + existing.totalKills,
        totalDeaths: (stats.totalDeaths || 0) + existing.totalDeaths,
        totalAssists: (stats.totalAssists || 0) + existing.totalAssists,
        wins: (stats.wins || 0) + existing.wins,
        losses: (stats.losses || 0) + existing.losses,
        // 세부 지표 누적 업데이트
        totalDpm: (stats.totalDpm || 0) + (existing.totalDpm || 0),
        totalDmgPct: (stats.totalDmgPct || 0) + (existing.totalDmgPct || 0),
        totalKdaPerMin: (stats.totalKdaPerMin || 0) + (existing.totalKdaPerMin || 0),
        totalSoloKill: (stats.totalSoloKill || 0) + (existing.totalSoloKill || 0),
        totalCsd15: (stats.totalCsd15 || 0) + (existing.totalCsd15 || 0),
        totalGd15: (stats.totalGd15 || 0) + (existing.totalGd15 || 0),
        totalXpd15: (stats.totalXpd15 || 0) + (existing.totalXpd15 || 0),
        totalFbPart: (stats.totalFbPart || 0) + (existing.totalFbPart || 0),
        totalFbVictim: (stats.totalFbVictim || 0) + (existing.totalFbVictim || 0),
      };
      
      // 평균 계산
      updatedStats.averageDamage = updatedStats.totalGames > 0 
        ? updatedStats.totalDamage / updatedStats.totalGames 
        : 0;
      updatedStats.kda = updatedStats.totalDeaths > 0
        ? (updatedStats.totalKills + updatedStats.totalAssists) / updatedStats.totalDeaths
        : updatedStats.totalKills + updatedStats.totalAssists;
      updatedStats.winRate = (updatedStats.wins + updatedStats.losses) > 0
        ? (updatedStats.wins / (updatedStats.wins + updatedStats.losses)) * 100
        : 0;
      
      // 세부 지표 평균 계산
      updatedStats.averageDpm = updatedStats.totalGames > 0 && updatedStats.totalDpm
        ? updatedStats.totalDpm / updatedStats.totalGames
        : updatedStats.averageDpm;
      updatedStats.averageDmgPct = updatedStats.totalGames > 0 && updatedStats.totalDmgPct
        ? updatedStats.totalDmgPct / updatedStats.totalGames
        : updatedStats.averageDmgPct;
      updatedStats.averageKdaPerMin = updatedStats.totalGames > 0 && updatedStats.totalKdaPerMin
        ? updatedStats.totalKdaPerMin / updatedStats.totalGames
        : updatedStats.averageKdaPerMin;
      updatedStats.averageSoloKill = updatedStats.totalGames > 0 && updatedStats.totalSoloKill !== undefined
        ? updatedStats.totalSoloKill / updatedStats.totalGames
        : updatedStats.averageSoloKill;
      updatedStats.averageCsd15 = updatedStats.totalGames > 0 && updatedStats.totalCsd15 !== undefined
        ? updatedStats.totalCsd15 / updatedStats.totalGames
        : updatedStats.averageCsd15;
      updatedStats.averageGd15 = updatedStats.totalGames > 0 && updatedStats.totalGd15 !== undefined
        ? updatedStats.totalGd15 / updatedStats.totalGames
        : updatedStats.averageGd15;
      updatedStats.averageXpd15 = updatedStats.totalGames > 0 && updatedStats.totalXpd15 !== undefined
        ? updatedStats.totalXpd15 / updatedStats.totalGames
        : updatedStats.averageXpd15;
      updatedStats.averageFbPart = updatedStats.totalGames > 0 && updatedStats.totalFbPart !== undefined
        ? updatedStats.totalFbPart / updatedStats.totalGames
        : updatedStats.averageFbPart;
      updatedStats.averageFbVictim = updatedStats.totalGames > 0 && updatedStats.totalFbVictim !== undefined
        ? updatedStats.totalFbVictim / updatedStats.totalGames
        : updatedStats.averageFbVictim;

      set({
        playerSeasonStats: state.playerSeasonStats.map((s) =>
          s.playerId === playerId && s.season === state.season && s.tournament === stats.tournament
            ? updatedStats
            : s
        ),
      });
    } else {
      // 새 통계 생성
      const newStats: PlayerSeasonStats = {
        playerId,
        season: state.season,
        tournament: stats.tournament || "regularSeason",
        playedChampions: stats.playedChampions || [],
        totalDamage: stats.totalDamage || 0,
        totalGames: stats.totalGames || 1,
        averageDamage: stats.totalDamage ? stats.totalDamage / (stats.totalGames || 1) : 0,
        totalKills: stats.totalKills || 0,
        totalDeaths: stats.totalDeaths || 0,
        totalAssists: stats.totalAssists || 0,
        kda: stats.totalDeaths && stats.totalDeaths > 0
          ? ((stats.totalKills || 0) + (stats.totalAssists || 0)) / stats.totalDeaths
          : (stats.totalKills || 0) + (stats.totalAssists || 0),
        wins: stats.wins || 0,
        losses: stats.losses || 0,
        winRate: stats.wins !== undefined && stats.losses !== undefined
          ? (stats.wins / (stats.wins + stats.losses)) * 100
          : 0,
        // 세부 지표 초기화
        totalDpm: stats.totalDpm || 0,
        averageDpm: stats.averageDpm || (stats.totalDpm ? stats.totalDpm / (stats.totalGames || 1) : 0),
        totalDmgPct: stats.totalDmgPct || 0,
        averageDmgPct: stats.averageDmgPct || (stats.totalDmgPct ? stats.totalDmgPct / (stats.totalGames || 1) : 0),
        totalKdaPerMin: stats.totalKdaPerMin || 0,
        averageKdaPerMin: stats.averageKdaPerMin || (stats.totalKdaPerMin ? stats.totalKdaPerMin / (stats.totalGames || 1) : 0),
        totalSoloKill: stats.totalSoloKill || 0,
        averageSoloKill: stats.averageSoloKill || (stats.totalSoloKill ? stats.totalSoloKill / (stats.totalGames || 1) : 0),
        totalCsd15: stats.totalCsd15 || 0,
        averageCsd15: stats.averageCsd15 || (stats.totalCsd15 !== undefined ? stats.totalCsd15 / (stats.totalGames || 1) : 0),
        totalGd15: stats.totalGd15 || 0,
        averageGd15: stats.averageGd15 || (stats.totalGd15 !== undefined ? stats.totalGd15 / (stats.totalGames || 1) : 0),
        totalXpd15: stats.totalXpd15 || 0,
        averageXpd15: stats.averageXpd15 || (stats.totalXpd15 !== undefined ? stats.totalXpd15 / (stats.totalGames || 1) : 0),
        totalFbPart: stats.totalFbPart || 0,
        averageFbPart: stats.averageFbPart || (stats.totalFbPart !== undefined ? stats.totalFbPart / (stats.totalGames || 1) : 0),
        totalFbVictim: stats.totalFbVictim || 0,
        averageFbVictim: stats.averageFbVictim || (stats.totalFbVictim !== undefined ? stats.totalFbVictim / (stats.totalGames || 1) : 0),
      };
      set({
        playerSeasonStats: [...state.playerSeasonStats, newStats],
      });
    }
  },

  getPlayerSeasonStats: (playerId: string, tournament?: string) => {
    const state = get();
    return state.playerSeasonStats.find(
      (s) => s.playerId === playerId && s.season === state.season && (!tournament || s.tournament === tournament)
    );
  },

  resetSeasonStats: (season: number) => {
    // 특정 시즌의 통계를 아카이빙하거나 초기화
    set((state) => ({
      playerSeasonStats: state.playerSeasonStats.filter((s) => s.season !== season),
    }));
  },

  // 모든 선수에게 나이 증가 및 노화 적용 (시즌 종료 시 호출)
  applyPlayerAgingToAll: () => {
    set((state) => {
      // 모든 선수에게 노화 적용
      const updatedPlayers = state.players.map((player) => applyPlayerAging(player));
      
      // 팀 로스터도 업데이트
      const updatedTeams = state.teams.map((team) => ({
        ...team,
        roster: team.roster.map((player) => {
          const updatedPlayer = updatedPlayers.find((p) => p.id === player.id);
          return updatedPlayer || player;
        }),
      }));

      // userPlayer도 업데이트 (선수 커리어 모드)
      const updatedUserPlayer = state.userPlayer ? applyPlayerAging(state.userPlayer) : null;

      return {
        players: updatedPlayers,
        teams: updatedTeams,
        userPlayer: updatedUserPlayer,
      };
    });
  },

  // 저장/불러오기 시스템
  saveGame: (gameMode: "MANAGER" | "PLAYER") => {
    if (typeof window === "undefined") return false;
    
    const state = get();
    const saveData = {
      // 게임 기본 정보
      currentDate: state.currentDate.toISOString(),
      currentTeamId: state.currentTeamId,
      gameMode: state.gameMode,
      isPaused: state.isPaused,
      season: state.season,
      
      // 팀 및 선수 데이터
      teams: state.teams,
      players: state.players,
      
      // 경기 및 일정
      matches: state.matches,
      scheduledMatches: state.scheduledMatches,
      upcomingMatches: state.upcomingMatches,
      currentMatch: state.currentMatch,
      simulationMode: state.simulationMode,
      
      // 인터랙티브 시뮬레이션 상태
      simulationState: state.simulationState,
      
      // 뉴스
      news: state.news,
      newsHistory: state.newsHistory,
      
      // 순위 데이터
      rankings: state.rankings,
      
      // FA 시장
      faList: state.faList,
      
      // 로스터 관리
      rosters: state.rosters,
      
      // 선택지 옵션
      currentOptions: state.currentOptions,
      
      // 선수별 시즌 통계
      playerSeasonStats: state.playerSeasonStats,
      
      // 선수 커리어 모드
      userPlayer: state.userPlayer,
      userPlayerInitialTrait: state.userPlayerInitialTrait,
      userPlayerRoleModelId: state.userPlayerRoleModelId,
      
      // 채팅 메시지 (맥락 복원용)
      messages: state.messages,
      
      // 저장 시간
      savedAt: new Date().toISOString(),
    };
    
    // 모드별로 분리된 저장 키 사용
    const storageKey = gameMode === "MANAGER" ? "lck_save_manager" : "lck_save_career";
    localStorage.setItem(storageKey, JSON.stringify(saveData));
    
    // 저장 완료 메시지
    state.addMessage({
      id: `save-${Date.now()}`,
      type: "system",
      content: `게임이 저장되었습니다. (${new Date().toLocaleString("ko-KR")})`,
      timestamp: new Date(),
    });
    
    return true;
  },

  loadGame: (gameMode: "MANAGER" | "PLAYER") => {
    if (typeof window === "undefined") return false;
    
    // 모드별로 분리된 저장 키 사용
    const storageKey = gameMode === "MANAGER" ? "lck_save_manager" : "lck_save_career";
    const savedData = localStorage.getItem(storageKey);
    
    if (!savedData) return false;
    
    try {
      const data = JSON.parse(savedData);
      
      // Date 객체 복원
      const loadedDate = new Date(data.currentDate);
      const savedAt = data.savedAt ? new Date(data.savedAt) : new Date();
      
      // 날짜 역행 방지: 저장된 날짜가 현재 날짜보다 이전이면 현재 날짜 사용
      const currentState = get();
      const currentDate = validateDateUpdate(loadedDate, currentState.currentDate);
      
      // 메시지의 timestamp 복원
      const messages = data.messages?.map((msg: ChatMessage) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })) || [];
      
      // 경기 데이터의 날짜 복원
      const matches = data.matches?.map((match: any) => ({
        ...match,
        date: new Date(match.date),
      })) || [];
      
      const scheduledMatches = data.scheduledMatches?.map((match: any) => ({
        ...match,
        date: new Date(match.date),
      })) || [];
      
      const upcomingMatches = data.upcomingMatches?.map((match: MatchInfo) => ({
        ...match,
        date: new Date(match.date),
      })) || [];
      
      // 뉴스의 날짜 복원
      const news = data.news?.map((item: NewsItem) => ({
        ...item,
        date: new Date(item.date),
      })) || [];
      
      const newsHistory = data.newsHistory?.map((item: NewsItem) => ({
        ...item,
        date: new Date(item.date),
      })) || [];
      
      // 상태 복원 (날짜 검증 포함)
      // currentDate는 이미 위에서 검증되었으므로 그대로 사용
      set({
        currentDate,
        currentTeamId: data.currentTeamId || "",
        gameMode: data.gameMode || gameMode,
        isPaused: data.isPaused ?? true,
        season: data.season || 2026, // 기본값: 2026년 시즌 (프롬프트 기준)
        teams: data.teams || [],
        players: data.players || [],
        matches,
        scheduledMatches,
        upcomingMatches,
        currentMatch: data.currentMatch ? {
          ...data.currentMatch,
          date: new Date(data.currentMatch.date),
        } : null,
        simulationMode: data.simulationMode || null,
        simulationState: data.simulationState || {
          currentPhase: null,
          isWaitingForUser: false,
          winRateModifiers: [],
          currentChoices: [],
          matchId: null,
          currentSet: 0,
          phaseHistory: [],
        },
        news,
        newsHistory,
        rankings: data.rankings || {
          kespaCup: [],
          lckCup: [],
          regularSeason: [],
          summer: [],
          playoff: [],
          msi: [],
          worlds: [],
        },
        faList: data.faList || [],
        rosters: data.rosters || {
          team1: [],
          team2: [],
          staff: [],
        },
        currentOptions: data.currentOptions || [],
        playerSeasonStats: data.playerSeasonStats || [],
        userPlayer: data.userPlayer || null,
        userPlayerInitialTrait: data.userPlayerInitialTrait || null,
        userPlayerRoleModelId: data.userPlayerRoleModelId || null,
        messages: messages.length > 0 ? messages : [
          {
            id: "welcome",
            type: "system" as const,
            content: "LCK Manager Simulation에 오신 것을 환영합니다! 게임을 시작하려면 명령어를 입력하세요.",
            timestamp: new Date(),
          },
        ],
      });
      
      // 불러오기 완료 메시지 추가
      const state = get();
      state.addMessage({
        id: `load-${Date.now()}`,
        type: "system",
        content: `게임을 불러왔습니다. (저장 시간: ${savedAt.toLocaleString("ko-KR")})`,
        timestamp: new Date(),
      });
      
      // API 맥락 복원을 위한 시스템 메시지 전송 (비동기)
      setTimeout(async () => {
        const currentState = get();
        if (currentState.apiKey && currentState.currentTeamId) {
          const contextMessage = `게임을 다시 로드했습니다. 현재 상황은 다음과 같습니다:
- 날짜: ${currentDate.getFullYear()}/${String(currentDate.getMonth() + 1).padStart(2, "0")}/${String(currentDate.getDate()).padStart(2, "0")}
- 게임 모드: ${currentState.gameMode === "PLAYER" ? "선수 커리어 모드" : "감독 모드"}
- 선택된 팀: ${currentState.teams.find(t => t.id === currentState.currentTeamId)?.name || "없음"}
- 시즌: ${currentState.season}
- 현재 이벤트: ${getSeasonEvent(currentDate)}

이전 대화 맥락을 이어서 게임을 진행할 수 있도록 준비되었습니다.`;
          
          // 시스템 메시지로 추가 (사용자에게는 보이지 않게)
          try {
            await currentState.sendCommand(contextMessage);
          } catch (error) {
            console.error("맥락 복원 중 오류:", error);
          }
        }
      }, 1000);
      
      return true;
    } catch (error) {
      console.error("게임 불러오기 오류:", error);
      return false;
    }
  },

  hasSavedGame: (gameMode: "MANAGER" | "PLAYER") => {
    if (typeof window === "undefined") return false;
    // 모드별로 분리된 저장 키 사용
    const storageKey = gameMode === "MANAGER" ? "lck_save_manager" : "lck_save_career";
    return !!localStorage.getItem(storageKey);
  },

  deleteSavedGame: (gameMode: "MANAGER" | "PLAYER") => {
    if (typeof window === "undefined") return;
    // 모드별로 분리된 저장 키 사용
    const storageKey = gameMode === "MANAGER" ? "lck_save_manager" : "lck_save_career";
    localStorage.removeItem(storageKey);
  },
}));
