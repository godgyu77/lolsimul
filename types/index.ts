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

// 선수 인터페이스
export interface Player {
  id: string; // 고유 ID
  name: string; // 이름
  nickname: string; // 닉네임
  position: Position; // 포지션
  age: number; // 나이
  tier: Tier; // 등급
  stats: PlayerStats; // 세부 스탯
  salary: number; // 연봉 (단위: 억원)
  contractEndsAt: number; // 계약만료년도
  teamId: string; // 소속팀 ID
  division: Division; // 구분 (1군/2군)
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
  status: "scheduled" | "completed" | "live";
  matchType: "regular" | "lck_cup" | "playoff" | "msi" | "worlds"; // 경기 유형
  points?: number; // 승점 (LCK CUP은 2배)
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
  status: Match["status"];
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

