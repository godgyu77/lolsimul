// 시뮬레이션 페이즈 Enum
export enum SimulationPhase {
  DRAFT = "DRAFT",        // 밴픽 단계
  EARLY = "EARLY",        // 라인전 단계
  MID = "MID",            // 오브젝트 싸움 (중반)
  LATE = "LATE",          // 장로/바론 단계 (후반)
  END = "END",            // 세트 결과
  FEEDBACK = "FEEDBACK",  // 세트 간 피드백 타임
}

// 승률 보정치 인터페이스
export interface WinRateModifier {
  team: string;           // 팀 ID
  value: number;          // 보정치 (-50 ~ +50)
  source: string;         // 보정치 출처 (예: "DRAFT_ENGAGE", "EARLY_TOP_SITTING")
  description: string;    // 보정치 설명
}

// 선택지 인터페이스
export interface SimulationChoice {
  id: string;             // 선택지 고유 ID
  label: string;          // 선택지 라벨
  description: string;    // 선택지 설명
  phase: SimulationPhase; // 해당 페이즈
  modifiers: WinRateModifier[]; // 이 선택지가 적용하는 보정치들
}

// 시뮬레이션 상태 인터페이스
export interface SimulationState {
  currentPhase: SimulationPhase | null;  // 현재 페이즈
  isWaitingForUser: boolean;             // 유저 입력 대기 중인지
  winRateModifiers: WinRateModifier[];    // 현재 적용된 승률 보정치 목록
  currentChoices: SimulationChoice[];     // 현재 선택 가능한 선택지 목록
  matchId: string | null;                 // 현재 시뮬레이션 중인 경기 ID
  currentSet: number;                     // 현재 세트 번호 (1부터 시작)
  phaseHistory: Array<{                   // 페이즈별 선택 이력
    phase: SimulationPhase;
    choiceId: string;
    timestamp: Date;
  }>;
}

