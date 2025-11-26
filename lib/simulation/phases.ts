// 각 페이즈별 선택지 정의

import { SimulationPhase, SimulationChoice, WinRateModifier } from "@/types/game";

// 밴픽 단계 선택지
export const DRAFT_CHOICES: SimulationChoice[] = [
  {
    id: "draft_engage",
    label: "돌진 조합",
    description: "강력한 이니시에이션과 한타 중심의 조합을 선택합니다.",
    phase: SimulationPhase.DRAFT,
    modifiers: [
      {
        team: "player", // 플레이어 팀
        value: 8, // 승률 +8%
        source: "DRAFT_ENGAGE",
        description: "한타 능력치 +10% 보정",
      },
      {
        team: "opponent",
        value: -3,
        source: "DRAFT_ENGAGE_OPPONENT",
        description: "상대방 운영 능력치 -5%",
      },
    ],
  },
  {
    id: "draft_poke",
    label: "포킹 조합",
    description: "원거리 딜링과 운영 중심의 조합을 선택합니다.",
    phase: SimulationPhase.DRAFT,
    modifiers: [
      {
        team: "player",
        value: 5,
        source: "DRAFT_POKE",
        description: "운영 능력치 +8% 보정",
      },
      {
        team: "opponent",
        value: -2,
        source: "DRAFT_POKE_OPPONENT",
        description: "상대방 한타 능력치 -3%",
      },
    ],
  },
  {
    id: "draft_scale",
    label: "스케일 조합",
    description: "후반 성장형 챔피언 중심의 조합을 선택합니다.",
    phase: SimulationPhase.DRAFT,
    modifiers: [
      {
        team: "player",
        value: -5, // 초반에는 불리
        source: "DRAFT_SCALE_EARLY",
        description: "라인전 능력치 -10% (초반 페널티)",
      },
      {
        team: "player",
        value: 12, // 후반에는 유리
        source: "DRAFT_SCALE_LATE",
        description: "후반 한타 능력치 +15% 보정",
      },
    ],
  },
];

// 라인전 단계 선택지
export const EARLY_CHOICES: SimulationChoice[] = [
  {
    id: "early_top_sitting",
    label: "탑 시팅",
    description: "정글러가 탑 라인을 집중적으로 지원합니다.",
    phase: SimulationPhase.EARLY,
    modifiers: [
      {
        team: "player",
        value: 6,
        source: "EARLY_TOP_SITTING",
        description: "탑 라이너 성장 기대치 상승",
      },
      {
        team: "opponent",
        value: -4,
        source: "EARLY_TOP_SITTING_OPPONENT",
        description: "바텀 라인전 확률 하락",
      },
    ],
  },
  {
    id: "early_bottom_dive",
    label: "바텀 다이브",
    description: "정글러가 바텀 라인 다이브를 시도합니다.",
    phase: SimulationPhase.EARLY,
    modifiers: [
      {
        team: "player",
        value: 7,
        source: "EARLY_BOTTOM_DIVE",
        description: "바텀 라인전 우위 확보",
      },
      {
        team: "opponent",
        value: -3,
        source: "EARLY_BOTTOM_DIVE_OPPONENT",
        description: "탑 라인 성장 기회 상실",
      },
    ],
  },
  {
    id: "early_mid_priority",
    label: "미드 우선",
    description: "미드 라인 우선권 확보에 집중합니다.",
    phase: SimulationPhase.EARLY,
    modifiers: [
      {
        team: "player",
        value: 5,
        source: "EARLY_MID_PRIORITY",
        description: "미드 라이너 영향력 상승",
      },
      {
        team: "opponent",
        value: -2,
        source: "EARLY_MID_PRIORITY_OPPONENT",
        description: "상대방 사이드 라인 압박 감소",
      },
    ],
  },
];

// 오브젝트 싸움 단계 선택지
export const MID_CHOICES: SimulationChoice[] = [
  {
    id: "mid_herald_fight",
    label: "전령 싸움",
    description: "첫 전령을 놓고 한타를 벌입니다.",
    phase: SimulationPhase.MID,
    modifiers: [
      {
        team: "player",
        value: 8,
        source: "MID_HERALD_FIGHT",
        description: "탑 타워 압박 우위 확보",
      },
      {
        team: "opponent",
        value: -5,
        source: "MID_HERALD_FIGHT_OPPONENT",
        description: "용 스택 쌓기 지연",
      },
    ],
  },
  {
    id: "mid_dragon_fight",
    label: "용 싸움",
    description: "첫 용을 놓고 한타를 벌입니다.",
    phase: SimulationPhase.MID,
    modifiers: [
      {
        team: "player",
        value: 6,
        source: "MID_DRAGON_FIGHT",
        description: "용 스택 쌓기 시작",
      },
      {
        team: "opponent",
        value: -3,
        source: "MID_DRAGON_FIGHT_OPPONENT",
        description: "탑 라인 압박 기회 상실",
      },
    ],
  },
  {
    id: "mid_split_push",
    label: "스플릿 푸시",
    description: "한타를 피하고 사이드 라인 압박에 집중합니다.",
    phase: SimulationPhase.MID,
    modifiers: [
      {
        team: "player",
        value: 4,
        source: "MID_SPLIT_PUSH",
        description: "운영 능력치 +6% 보정",
      },
      {
        team: "opponent",
        value: -2,
        source: "MID_SPLIT_PUSH_OPPONENT",
        description: "오브젝트 통제력 하락",
      },
    ],
  },
];

// 장로/바론 단계 선택지
export const LATE_CHOICES: SimulationChoice[] = [
  {
    id: "late_backdoor",
    label: "백도어",
    description: "정면 한타를 피하고 넥서스 직접 공격을 시도합니다.",
    phase: SimulationPhase.LATE,
    modifiers: [
      {
        team: "player",
        value: 10, // 성공하면 큰 이득
        source: "LATE_BACKDOOR",
        description: "넥서스 직접 공격 시도",
      },
      {
        team: "opponent",
        value: -8,
        source: "LATE_BACKDOOR_OPPONENT",
        description: "방어 실패 시 게임 종료",
      },
    ],
  },
  {
    id: "late_frontal_fight",
    label: "정면 한타",
    description: "바론 앞에서 정면 한타를 벌입니다.",
    phase: SimulationPhase.LATE,
    modifiers: [
      {
        team: "player",
        value: 7,
        source: "LATE_FRONTAL_FIGHT",
        description: "한타 능력치 +10% 보정",
      },
      {
        team: "opponent",
        value: -4,
        source: "LATE_FRONTAL_FIGHT_OPPONENT",
        description: "상대방 운영 능력치 -5%",
      },
    ],
  },
  {
    id: "late_pick_off",
    label: "픽오프",
    description: "상대방의 실수를 노려 단독 킬을 노립니다.",
    phase: SimulationPhase.LATE,
    modifiers: [
      {
        team: "player",
        value: 5,
        source: "LATE_PICK_OFF",
        description: "운영 능력치 +8% 보정",
      },
      {
        team: "opponent",
        value: -3,
        source: "LATE_PICK_OFF_OPPONENT",
        description: "상대방 멘탈 스탯 -5%",
      },
    ],
  },
];

// 세트 간 피드백 타임 선택지
export const FEEDBACK_CHOICES: SimulationChoice[] = [
  {
    id: "feedback_criticize",
    label: "선수 질책",
    description: "부진한 선수를 질책하여 각성시킵니다. 멘탈은 하락하지만 스탯이 일시적으로 상승합니다.",
    phase: SimulationPhase.FEEDBACK,
    modifiers: [
      {
        team: "player",
        value: 8, // 다음 세트 초기 승률 +8%
        source: "FEEDBACK_CRITICIZE",
        description: "선수 각성으로 인한 일시적 스탯 상승",
      },
      {
        team: "player",
        value: -3, // 멘탈 하락으로 인한 페널티
        source: "FEEDBACK_CRITICIZE_MENTAL",
        description: "멘탈 스탯 -5% (다음 세트에만 적용)",
      },
    ],
  },
  {
    id: "feedback_encourage",
    label: "선수 격려",
    description: "선수들을 격려하여 멘탈을 회복시킵니다. 안정적인 성능을 기대할 수 있습니다.",
    phase: SimulationPhase.FEEDBACK,
    modifiers: [
      {
        team: "player",
        value: 5, // 다음 세트 초기 승률 +5%
        source: "FEEDBACK_ENCOURAGE",
        description: "멘탈 회복으로 인한 안정적 성능",
      },
    ],
  },
  {
    id: "feedback_tactical_change",
    label: "전술 변경",
    description: "다음 세트를 위한 전술을 변경합니다. 공격적 또는 수비적 전술을 선택할 수 있습니다.",
    phase: SimulationPhase.FEEDBACK,
    modifiers: [
      {
        team: "player",
        value: 6, // 다음 세트 초기 승률 +6%
        source: "FEEDBACK_TACTICAL_CHANGE",
        description: "전술 변경으로 인한 적응력 상승",
      },
      {
        team: "opponent",
        value: -2,
        source: "FEEDBACK_TACTICAL_CHANGE_OPPONENT",
        description: "상대방 전술 예측 어려움",
      },
    ],
  },
];

// 페이즈별 선택지 맵
export const PHASE_CHOICES_MAP: Record<SimulationPhase, SimulationChoice[]> = {
  [SimulationPhase.DRAFT]: DRAFT_CHOICES,
  [SimulationPhase.EARLY]: EARLY_CHOICES,
  [SimulationPhase.MID]: MID_CHOICES,
  [SimulationPhase.LATE]: LATE_CHOICES,
  [SimulationPhase.END]: [], // END 페이즈는 선택지 없음
  [SimulationPhase.FEEDBACK]: FEEDBACK_CHOICES,
};

