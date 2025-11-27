// 포지션 타입
export type Position = "TOP" | "JGL" | "MID" | "ADC" | "SPT";

// 등급 타입
export type Tier = "S+" | "S" | "S-" | "A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D";

// 구분 타입 (1군/2군)
export type Division = "1군" | "2군";

// 선수 세부 스탯
export interface PlayerStats {
  라인전: number; // 1~100
  한타: number; // 1~100
  운영: number; // 1~100
  피지컬: number; // 1~100
  챔프폭: number; // 1~100
  멘탈: number; // 1~100
}

// gol.gg 기반 세부 지표 (ROSTER_DB 스타일)
export interface PlayerDetailedStats {
  dpm: number; // 분당 데미지
  dmg_pct: number; // 팀 내 데미지 비중 (%)
  kda_per_min: number; // 분당 킬+어시
  solo_kill: number; // 솔로킬 횟수
  csd15: number; // 15분 CS 격차
  gd15: number; // 15분 골드 격차
  xpd15: number; // 15분 경험치 격차
  fb_part: number; // 퍼블 관여율 (%)
  fb_victim: number; // 피퍼블 확률 (%)
}

// 이적 제안 인터페이스
export interface TransferOffer {
  id: string; // 제안 ID
  fromTeamId: string; // 제안한 팀 ID
  toTeamId: string; // 이적할 팀 ID (현재는 player의 teamId와 동일)
  salary: number; // 제안 연봉
  contractYears: number; // 계약 기간 (년)
  offerDate: Date; // 제안 날짜
  expiresAt: Date; // 제안 만료일
  status: "pending" | "accepted" | "rejected" | "expired"; // 제안 상태
}

// 선수 인터페이스
export interface Player {
  id: string; // 고유 ID
  name: string; // 이름
  nickname: string; // 닉네임
  position: Position; // 포지션
  age: number; // 나이
  tier: Tier; // 등급
  stats: PlayerStats; // 세부 스탯
  detailedStats?: PlayerDetailedStats; // gol.gg 기반 세부 지표 (선택적, ROSTER_DB 스타일)
  salary: number; // 연봉 (단위: 억원)
  contractEndsAt: number; // 계약만료년도
  teamId: string; // 소속팀 ID (가변 - 이적 가능)
  division: Division; // 구분 (1군/2군)
  transferOffers?: TransferOffer[]; // 이적 제안 목록 (선택적)
}

// 팀 인터페이스
export interface Team {
  id: string; // 고유 ID
  name: string; // 팀명
  abbreviation: string; // 약어 (T1, GEN 등)
  money: number; // 자금 (단위: 원)
  fanbaseSize: number; // 팬덤 크기 (1~100)
  roster: Player[]; // 로스터 (Player 배열)
}

// 경기 결과 인터페이스
export interface MatchResult {
  homeScore: number;
  awayScore: number;
  winner: string; // 팀 ID
  pog?: {
    playerId: string;
    playerName: string;
    teamId: string;
  }; // Player of the Game
  sets: Array<{
    winner: string; // 팀 ID
    duration: number; // 경기 시간 (분)
  }>;
}

// 경기 인터페이스
export interface Match {
  id: string;
  date: Date;
  homeTeamId: string;
  awayTeamId: string;
  result?: MatchResult;
  status: "scheduled" | "completed" | "live" | "in_progress"; // in_progress: 세트별 진행 중
  matchType: "regular" | "lck_cup" | "playoff" | "msi" | "worlds"; // 경기 유형
  points?: number; // 승점 (LCK CUP은 2배)
  currentSets?: Array<{ winner: string; duration: number }>; // 현재까지 진행된 세트들
  homeScore?: number; // 현재 홈팀 세트 스코어
  awayScore?: number; // 현재 원정팀 세트 스코어
}

// 뉴스 인터페이스
export interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: Date;
  type: "transfer" | "match" | "general" | "contract";
  relatedTeamIds?: string[]; // 관련 팀 ID들
}

// 경기 정보 인터페이스 (간소화된 버전)
export interface MatchInfo {
  id: string;
  date: Date;
  homeTeamId: string;
  awayTeamId: string;
  matchType: Match["matchType"];
  status: Match["status"] | "in_progress";
}

// 선수별 누적 통계 인터페이스
export interface PlayerSeasonStats {
  playerId: string;
  season: number; // 시즌 년도
  tournament: string; // 대회 종류 (kespaCup, regularSeason, msi, worlds 등)
  
  // 챔피언 사용 기록
  playedChampions: Array<{
    championName: string;
    count: number; // 사용 횟수
    wins: number; // 승리 횟수
    losses: number; // 패배 횟수
  }>;
  
  // 누적 스탯
  totalDamage: number; // 총 딜량
  totalGames: number; // 총 경기 수
  averageDamage: number; // 평균 딜량 (totalDamage / totalGames)
  
  // KDA 누적
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
  kda: number; // (K + A) / D (D가 0이면 K + A)
  
  // 추가 통계
  wins: number;
  losses: number;
  winRate: number; // wins / (wins + losses) * 100
  
  // gol.gg 기반 세부 지표 누적 (경기 시뮬레이션 결과)
  totalDpm?: number; // 총 분당 데미지 (누적)
  averageDpm?: number; // 평균 분당 데미지
  totalDmgPct?: number; // 총 팀 내 데미지 비중 (누적)
  averageDmgPct?: number; // 평균 팀 내 데미지 비중
  totalKdaPerMin?: number; // 총 분당 KDA (누적)
  averageKdaPerMin?: number; // 평균 분당 KDA
  totalSoloKill?: number; // 총 솔로킬 횟수
  averageSoloKill?: number; // 평균 솔로킬
  totalCsd15?: number; // 총 15분 CS 격차 (누적)
  averageCsd15?: number; // 평균 15분 CS 격차
  totalGd15?: number; // 총 15분 골드 격차 (누적)
  averageGd15?: number; // 평균 15분 골드 격차
  totalXpd15?: number; // 총 15분 경험치 격차 (누적)
  averageXpd15?: number; // 평균 15분 경험치 격차
  totalFbPart?: number; // 총 퍼블 관여율 (누적)
  averageFbPart?: number; // 평균 퍼블 관여율
  totalFbVictim?: number; // 총 피퍼블 확률 (누적)
  averageFbVictim?: number; // 평균 피퍼블 확률
}

// 팀 순위 인터페이스
export interface TeamRank {
  rank: number;
  teamId: string;
  teamName: string;
  abbreviation: string;
  wins: number;
  losses: number;
  points: number;
  goalDifference: number;
  winRate: number;
}

// 선수 정보 인터페이스 (FA 리스트용)
export interface PlayerInfo {
  id: string;
  name: string;
  nickname: string;
  position: Position;
  age: number;
  tier: Tier;
  overall: number; // 종합 능력치
  salary: number;
  contractEndsAt: number;
  teamId?: string; // FA는 teamId가 없을 수 있음
  division?: Division;
}

// 코칭스태프 인터페이스
export interface StaffInfo {
  id: string;
  name: string;
  role: "headCoach" | "assistantCoach" | "analyst" | "manager";
  skill: number; // 1~100
  salary: number;
  contractEndsAt: number;
}

