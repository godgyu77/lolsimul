import { create } from "zustand";
import { Player, Team, Match, NewsItem, Position, MatchInfo, TeamRank, PlayerInfo, StaffInfo, Tier, Division } from "@/types";
import { initialTeams, initialPlayers } from "@/constants/initialData";

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

interface GameState {
  // API 설정
  apiKey: string | null; // Gemini API 키
  
  // 채팅 메시지
  messages: ChatMessage[];
  
  // 게임 기본 정보
  currentDate: Date;
  currentTeamId: string; // 플레이어가 관리하는 팀 ID
  isPaused: boolean;
  season: number; // 현재 시즌 (2024, 2025 등)

  // 팀 및 선수 데이터
  teams: Team[];
  players: Player[];

  // 경기 및 일정
  matches: Match[];
  scheduledMatches: Match[]; // 예정된 경기들
  upcomingMatches: MatchInfo[]; // 다가오는 5경기 정보

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

  // API 설정
  setApiKey: (key: string) => void;
  
  // 채팅 관련
  addMessage: (message: ChatMessage) => void;
  sendCommand: (command: string) => Promise<void>;
  
  // 게임 진행 제어
  togglePause: () => void;
  advanceDay: () => void;
  setCurrentTeam: (teamId: string) => void;

  // 경기 관련
  simulateMatch: (matchId: string) => void;
  scheduleMatch: (
    homeTeamId: string,
    awayTeamId: string,
    date: Date,
    matchType?: Match["matchType"]
  ) => string; // matchId 반환

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
function parseAIResponse(response: string, state: GameState): Partial<GameState> {
  const updates: Partial<GameState> = {};
  
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
  
  return updates;
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
  isPaused: true,
  season: 2025,
  teams: initialTeams,
  players: initialPlayers,
  matches: [],
  scheduledMatches: [],
  upcomingMatches: [],
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

  // API 설정
  setApiKey: (key: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("gemini_api_key", key);
    }
    set({ apiKey: key });
  },

  // 채팅 관련
  addMessage: (message: ChatMessage) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
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
            teams: state.teams.map((t) => ({
              id: t.id,
              name: t.name,
              money: t.money,
              roster: t.roster.map((p) => ({
                id: p.id,
                nickname: p.nickname,
                position: p.position,
                tier: p.tier,
              })),
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

      // AI 응답 메시지 추가
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        type: "game",
        content: aiResponse,
        timestamp: new Date(),
      };
      set((s) => ({ messages: [...s.messages, aiMessage] }));

      // 응답 파싱하여 상태 업데이트
      const updates = parseAIResponse(aiResponse, get());
      if (Object.keys(updates).length > 0) {
        // rosters 업데이트가 있으면 별도로 처리
        if (updates.rosters) {
          set((s) => ({
            rosters: {
              ...s.rosters,
              ...updates.rosters,
            },
          }));
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

  simulateMatch: (matchId: string) => {
    set((state) => {
      const matchIndex = state.scheduledMatches.findIndex((m) => m.id === matchId);
      if (matchIndex === -1) return state;

      const match = state.scheduledMatches[matchIndex];
      if (match.status !== "scheduled") return state;

      const homeTeam = state.teams.find((t) => t.id === match.homeTeamId);
      const awayTeam = state.teams.find((t) => t.id === match.awayTeamId);

      if (!homeTeam || !awayTeam) return state;

      const result = simulateMatchLogic(homeTeam, awayTeam, match.matchType);

      const completedMatch: Match = {
        ...match,
        status: "completed",
        result: {
          ...result,
          pog: result.pog,
        },
      };

      // 경기 결과를 matches에 추가
      const newMatches = [...state.matches, completedMatch];

      // scheduledMatches에서 제거
      const newScheduledMatches = state.scheduledMatches.filter((m) => m.id !== matchId);

      // 뉴스 생성
      const winnerTeam = result.winner === homeTeam.id ? homeTeam : awayTeam;
      const loserTeam = result.winner === homeTeam.id ? awayTeam : homeTeam;
      const news: NewsItem = {
        id: `match-${matchId}-${Date.now()}`,
        title: `${winnerTeam.name} ${result.homeScore > result.awayScore ? result.homeScore : result.awayScore} - ${result.homeScore < result.awayScore ? result.homeScore : result.awayScore} ${loserTeam.name}`,
        content: `${winnerTeam.name}이(가) ${loserTeam.name}을(를) 상대로 승리했습니다. POG: ${result.pog.playerName} (${winnerTeam.name})`,
        date: new Date(match.date),
        type: "match",
        relatedTeamIds: [homeTeam.id, awayTeam.id],
      };

      return {
        matches: newMatches,
        scheduledMatches: newScheduledMatches,
        news: [news, ...state.news].slice(0, 50),
      };
    });
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
}));
