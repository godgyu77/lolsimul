import { create } from "zustand";
import { Player, Team, Match, NewsItem, Position, MatchInfo, TeamRank, PlayerInfo, StaffInfo, Tier, Division, PlayerSeasonStats, PlayerStats } from "@/types";
import { initialTeams, initialPlayers } from "@/constants/initialData";
import { SimulationPhase, SimulationState, WinRateModifier, SimulationChoice } from "@/types/game";
import { advanceSimulationPhase as engineAdvanceSimulationPhase, submitDecision as engineSubmitDecision } from "@/lib/simulation/engine";

// 시즌 일정 타입
export type SeasonEvent =
  | "kespa"
  | "lck_cup"
  | "first_stand"
  | "msi"
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
}

// 아시안게임 개최 여부 확인 (4년 주기: 2026, 2030, 2034...)
function isAsianGamesYear(year: number): boolean {
  return year % 4 === 2;
}

// 시즌 이벤트 판단 함수
function getSeasonEvent(date: Date): SeasonEvent {
  const month = date.getMonth() + 1; // 1~12
  const day = date.getDate();
  const year = date.getFullYear();
  const isAGYear = isAsianGamesYear(year);

  if (month === 1) return "kespa";
  if (month >= 1 && month <= 3) return "lck_cup";
  if (month === 3 && day >= 15) return "first_stand";
  if (month === 5) return "msi";
  
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
    updates.currentDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  
  // 자금 파싱 (선택적)
  const moneyMatch = response.match(/자금:\s*([\d.]+)\s*억\s*원/);
  if (moneyMatch && state.currentTeamId) {
    const moneyInBillions = parseFloat(moneyMatch[1]);
    const currentTeam = state.teams.find((t) => t.id === state.currentTeamId);
    if (currentTeam) {
      updates.teams = state.teams.map((team) =>
        team.id === state.currentTeamId
          ? { ...team, money: moneyInBillions * 100000000 }
          : team
      );
    }
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
            const name = cells[nameIdx]?.trim() || '';
            
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
  currentDate: new Date(2025, 11, 1), // 2025년 12월 1일부터 시작
  currentTeamId: "", // 초기값은 빈 문자열 (팀 선택 전)
  gameMode: null, // 초기값은 null (모드 선택 전)
  isPaused: true,
  season: 2025,
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

    // 로딩 상태 시작
    set({ isLoading: true });

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
      // API 호출
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: state.apiKey,
          command,
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
        throw new Error(`API 오류: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.response || "응답을 받지 못했습니다.";

      // 로딩 메시지 제거
      set((s) => ({
        messages: s.messages.filter((m) => m.id !== loadingId),
      }));

      // 응답 파싱하여 상태 업데이트 및 필터링
      const { updates, options, filteredContent } = parseAIResponse(aiResponse, get());
      
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

      if (Object.keys(updates).length > 0) {
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
          const { rosters, ...otherUpdates } = updates;
          if (Object.keys(otherUpdates).length > 0) {
            set(otherUpdates);
          }
        } else {
          set(updates);
        }
      }
      
      // 로딩 상태 종료
      set({ isLoading: false });
    } catch (error) {
      // 로딩 메시지 제거
      set((s) => ({
        messages: s.messages.filter((m) => m.id !== loadingId),
      }));

      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: "system",
        content: `오류가 발생했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`,
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
      const newState = { ...state, currentDate: newDate };

      // 월초(1일) 체크 - 경제 시스템 처리
      if (newDate.getDate() === 1) {
        // 모든 팀의 월간 지출 처리
        newState.teams = newState.teams.map((team) => {
          const monthlySalary = (calculateTeamSalary(team) * 100000000) / 12; // 억원 -> 원, 월별
          const operatingCost = 50000000; // 운영비 5천만원
          const totalExpense = monthlySalary + operatingCost;

          return {
            ...team,
            money: Math.max(0, team.money - totalExpense),
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
              content: `존경하는 롤모델 ${pogPlayer.nickname}(${pogPlayer.name}) 선수가 ${winnerTeam.name}의 승리에 기여하며 POG를 수상했습니다. 이번 경기를 통해 더 많은 영감을 받았습니다.`,
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
                content: `신인 ${state.userPlayer?.nickname}(${state.userPlayer?.name}) 선수가 롤모델 ${roleModel.nickname} 선수가 있는 경기에서 POG를 수상하며 주목받고 있습니다. "롤모델을 뛰어넘는 것이 목표였습니다"라고 소감을 밝혔습니다.`,
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
              content: `신인 ${state.userPlayer?.nickname}(${state.userPlayer?.name}) 선수가 롤모델 ${roleModel.nickname} 선수가 있는 경기에서 POG를 수상하며 주목받고 있습니다. "롤모델을 뛰어넘는 것이 목표였습니다"라고 소감을 밝혔습니다.`,
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

        return {
          ...team,
          money: Math.max(0, team.money - totalExpense),
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
      };
      
      updatedStats.averageDamage = updatedStats.totalGames > 0 
        ? updatedStats.totalDamage / updatedStats.totalGames 
        : 0;
      updatedStats.kda = updatedStats.totalDeaths > 0
        ? (updatedStats.totalKills + updatedStats.totalAssists) / updatedStats.totalDeaths
        : updatedStats.totalKills + updatedStats.totalAssists;
      updatedStats.winRate = (updatedStats.wins + updatedStats.losses) > 0
        ? (updatedStats.wins / (updatedStats.wins + updatedStats.losses)) * 100
        : 0;

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
}));
