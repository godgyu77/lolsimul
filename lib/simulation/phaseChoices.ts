// 각 페이즈별 선택지 정의

import { SimulationChoice, SimulationPhase, WinRateModifier } from "@/types/game";

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
        value: 8,
        source: "DRAFT_ENGAGE",
        description: "한타 능력치 +8%",
      },
      {
        team: "player",
        value: -3,
        source: "DRAFT_ENGAGE_PENALTY",
        description: "라인전 능력치 -3%",
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
        description: "운영 능력치 +5%",
      },
      {
        team: "player",
        value: -2,
        source: "DRAFT_POKE_PENALTY",
        description: "한타 능력치 -2%",
      },
    ],
  },
  {
    id: "draft_scale",
    label: "성장형 조합",
    description: "후반 캐리력을 중시한 조합을 선택합니다.",
    phase: SimulationPhase.DRAFT,
    modifiers: [
      {
        team: "player",
        value: -5,
        source: "DRAFT_SCALE_EARLY",
        description: "초반 능력치 -5%",
      },
      {
        team: "player",
        value: 10,
        source: "DRAFT_SCALE_LATE",
        description: "후반 능력치 +10%",
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
        value: 7,
        source: "EARLY_TOP_SITTING",
        description: "탑 라인전 능력치 +7%",
      },
      {
        team: "player",
        value: -4,
        source: "EARLY_TOP_SITTING_PENALTY",
        description: "바텀 라인전 능력치 -4%",
      },
    ],
  },
  {
    id: "early_bottom_dive",
    label: "바텀 다이브",
    description: "정글러가 바텀 라인을 집중적으로 지원합니다.",
    phase: SimulationPhase.EARLY,
    modifiers: [
      {
        team: "player",
        value: 6,
        source: "EARLY_BOTTOM_DIVE",
        description: "바텀 라인전 능력치 +6%",
      },
      {
        team: "player",
        value: -3,
        source: "EARLY_BOTTOM_DIVE_PENALTY",
        description: "탑 라인전 능력치 -3%",
      },
    ],
  },
  {
    id: "early_mid_priority",
    label: "미드 우선순위",
    description: "정글러가 미드 라인을 집중적으로 지원합니다.",
    phase: SimulationPhase.EARLY,
    modifiers: [
      {
        team: "player",
        value: 5,
        source: "EARLY_MID_PRIORITY",
        description: "미드 라인전 능력치 +5%",
      },
      {
        team: "player",
        value: 4,
        source: "EARLY_MID_PRIORITY_BONUS",
        description: "오브젝트 제어 능력치 +4%",
      },
    ],
  },
];

// 오브젝트 싸움 단계 선택지
export const MID_CHOICES: SimulationChoice[] = [
  {
    id: "mid_herald_fight",
    label: "전령 한타",
    description: "첫 전령을 놓고 한타를 벌입니다.",
    phase: SimulationPhase.MID,
    modifiers: [
      {
        team: "player",
        value: 8,
        source: "MID_HERALD_FIGHT",
        description: "한타 능력치 +8%",
      },
      {
        team: "player",
        value: -2,
        source: "MID_HERALD_FIGHT_PENALTY",
        description: "용 제어 능력치 -2%",
      },
    ],
  },
  {
    id: "mid_dragon_fight",
    label: "용 한타",
    description: "첫 용을 놓고 한타를 벌입니다.",
    phase: SimulationPhase.MID,
    modifiers: [
      {
        team: "player",
        value: 6,
        source: "MID_DRAGON_FIGHT",
        description: "용 제어 능력치 +6%",
      },
      {
        team: "player",
        value: -3,
        source: "MID_DRAGON_FIGHT_PENALTY",
        description: "전령 제어 능력치 -3%",
      },
    ],
  },
  {
    id: "mid_split_push",
    label: "사이드 운영",
    description: "한타를 피하고 사이드 운영에 집중합니다.",
    phase: SimulationPhase.MID,
    modifiers: [
      {
        team: "player",
        value: 7,
        source: "MID_SPLIT_PUSH",
        description: "운영 능력치 +7%",
      },
      {
        team: "player",
        value: -5,
        source: "MID_SPLIT_PUSH_PENALTY",
        description: "한타 능력치 -5%",
      },
    ],
  },
];

// 장로/바론 단계 선택지
export const LATE_CHOICES: SimulationChoice[] = [
  {
    id: "late_backdoor",
    label: "백도어",
    description: "정면 한타를 피하고 백도어를 시도합니다.",
    phase: SimulationPhase.LATE,
    modifiers: [
      {
        team: "player",
        value: 10,
        source: "LATE_BACKDOOR",
        description: "운영 능력치 +10%",
      },
      {
        team: "player",
        value: -8,
        source: "LATE_BACKDOOR_PENALTY",
        description: "한타 능력치 -8%",
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
        value: 9,
        source: "LATE_FRONTAL_FIGHT",
        description: "한타 능력치 +9%",
      },
      {
        team: "player",
        value: -4,
        source: "LATE_FRONTAL_FIGHT_PENALTY",
        description: "운영 능력치 -4%",
      },
    ],
  },
  {
    id: "late_pick_off",
    label: "픽오프",
    description: "적의 실수를 노려 픽오프를 시도합니다.",
    phase: SimulationPhase.LATE,
    modifiers: [
      {
        team: "player",
        value: 6,
        source: "LATE_PICK_OFF",
        description: "운영 능력치 +6%",
      },
      {
        team: "player",
        value: 5,
        source: "LATE_PICK_OFF_BONUS",
        description: "한타 능력치 +5%",
      },
    ],
  },
];

// 페이즈별 선택지 반환 함수
export function getChoicesForPhase(phase: SimulationPhase): SimulationChoice[] {
  switch (phase) {
    case SimulationPhase.DRAFT:
      return DRAFT_CHOICES;
    case SimulationPhase.EARLY:
      return EARLY_CHOICES;
    case SimulationPhase.MID:
      return MID_CHOICES;
    case SimulationPhase.LATE:
      return LATE_CHOICES;
    default:
      return [];
  }
}

